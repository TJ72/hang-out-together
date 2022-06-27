/* eslint-disable jsx-a11y/media-has-caption */
import React, { useState, useRef } from 'react';
import {
  collection,
  doc,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '../utils/firebase';

const servers = {
  iceServers: [
    {
      urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'],
    },
  ],
  iceCandidatePoolSize: 10,
};
// Global State
const pc = new RTCPeerConnection(servers);
function Stream() {
  let localStream: MediaStream | null = null;
  let remoteStream: MediaStream | null = null;

  // Control Elements by DOM
  const localVideo = useRef<HTMLVideoElement>(null);
  const remoteVideo = useRef<HTMLVideoElement>(null);
  const [callId, setCallId] = useState('');

  const openWebCam = async () => {
    localStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    remoteStream = new MediaStream();

    // Push tracks from local stream to peer connection
    localStream.getTracks().forEach((track) => {
      pc.addTrack(track, localStream!);
    });
    // Pull tracks from remote stream, add to video stream
    // ontrack??
    pc.ontrack = (event) => {
      event.streams[0].getTracks().forEach((track) => {
        remoteStream?.addTrack(track);
      });
    };
    // Show stream in HTML video
    localVideo.current!.srcObject = localStream;
    remoteVideo.current!.srcObject = remoteStream;
  };

  // Create an offer
  const createOffer = async () => {
    const callDoc = doc(collection(db, 'calls'));
    const offerCandidates = collection(
      db,
      'calls',
      callDoc.id,
      'offerCandidates',
    );
    const answerCandidates = collection(
      db,
      'calls',
      callDoc.id,
      'answerCandidates',
    );
    setCallId(callDoc.id);

    // Get candidates for caller, save to db
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        addDoc(offerCandidates, event.candidate.toJSON());
      }
    };
    // Create offer
    const offerDescription = await pc.createOffer();
    await pc.setLocalDescription(offerDescription);
    const offer = {
      sdp: offerDescription.sdp,
      type: offerDescription.type,
    };
    await setDoc(callDoc, { offer });

    // Listen for remote answer
    onSnapshot(callDoc, (snapshot) => {
      const data = snapshot.data();
      if (!pc.currentRemoteDescription && data!.answer) {
        const answerDescription = new RTCSessionDescription(data!.answer);
        pc.setRemoteDescription(answerDescription);
      }
    });

    // Listen for remote ICE candidates
    onSnapshot(answerCandidates, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const candidate = new RTCIceCandidate(change.doc.data());
          pc.addIceCandidate(candidate);
        }
      });
    });
  };

  const answerCall = async () => {
    const callDoc = doc(db, 'calls', callId);
    const offerCandidates = collection(callDoc, 'offerCandidates');
    const answerCandidates = collection(callDoc, 'answerCandidates');

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        addDoc(answerCandidates, event.candidate.toJSON());
      }
    };

    // Fetch data, then set the offer & answer
    const callData = (await getDoc(callDoc)).data();
    const offerDescription = callData!.offer;
    await pc.setRemoteDescription(new RTCSessionDescription(offerDescription));

    const answerDescription = await pc.createAnswer();
    await pc.setLocalDescription(answerDescription);

    const answer = {
      type: answerDescription.type,
      sdp: answerDescription.sdp,
    };
    await updateDoc(callDoc, { answer });

    onSnapshot(offerCandidates, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const candidate = new RTCIceCandidate(change.doc.data());
          pc.addIceCandidate(candidate);
        }
      });
    });
  };

  return (
    <>
      <h1>New Build!!</h1>
      <h2>1. Start your Webcam</h2>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span>
          <h3>Local Stream</h3>
          <video
            style={{
              width: '40vw',
              height: '30vw',
              margin: '2rem',
              background: '#2c3e50',
            }}
            id="webcamVideo"
            autoPlay
            playsInline
            ref={localVideo}
          />
        </span>
        <span>
          <h3>Remote Stream</h3>
          <video
            style={{
              width: '40vw',
              height: '30vw',
              margin: '2rem',
              background: '#2c3e50',
            }}
            id="remoteVideo"
            autoPlay
            playsInline
            ref={remoteVideo}
          />
        </span>
      </div>
      <button type="button" id="webcamButton" onClick={openWebCam}>
        Start webcam
      </button>
      <h2>2. Create a new Call</h2>
      <button type="button" id="callButton" onClick={createOffer}>
        Create Call (offer)
      </button>
      <h2>3. Join a Call</h2>
      <p>Answer the call from a different browser window or device</p>

      <input
        id="callInput"
        value={callId}
        onChange={(e) => setCallId(e.target.value)}
      />
      <button type="button" id="answerButton" onClick={answerCall}>
        Answer
      </button>
      <h2>4. Hangup</h2>

      <button type="button" id="hangupButton">
        Hangup
      </button>
    </>
  );
}

export default Stream;

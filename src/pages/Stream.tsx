/* eslint-disable jsx-a11y/media-has-caption */
// @ts-nocheck
import React, { useEffect, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import styled, { css } from 'styled-components';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '../utils/firebase';
import Hangup from '../components/svg/Hangup';

const Wrapper = styled.div`
  width: 100%;
  height: calc(100vh - 85px);
  background-color: #212020;
  margin-top: 85px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const VideoWrapper = styled.div`
  margin-top: 40px;
  margin-bottom: 30px;
  display: flex;
  gap: 5%;
  align-items: center;
  justify-content: center;
`;

const VideoContainer = styled.video`
  width: 40vw;
  height: 30vw;
  background: #666161;
  border-radius: 15px;
  border: 1px solid #c2bcbc;
  @media (max-width: 500px) {
    ${(props) =>
      props.local &&
      css`
        width: 23%;
        height: 15vh;
        position: fixed;
        right: 30px;
        bottom: 120px;
        border-radius: 3px;
      `}
    ${(props) =>
      props.remote &&
      css`
        width: 80%;
        height: 60vh;
        border-radius: 3px;
      `}
  }
`;

const servers = {
  iceServers: [
    {
      urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'],
    },
  ],
  iceCandidatePoolSize: 10,
};
const pc = new RTCPeerConnection(servers);

function Stream() {
  let localStream: MediaStream | null = null;
  let remoteStream: MediaStream | null = null;
  const navigate = useNavigate();
  const { id } = useParams();
  const { search } = useLocation();
  const query = new URLSearchParams(search);

  // Control Elements by DOM
  const localVideo = useRef<HTMLVideoElement>(null);
  const remoteVideo = useRef<HTMLVideoElement>(null);

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
    const callDoc = doc(db, 'calls', id!);
    const offerCandidates = collection(db, 'calls', id!, 'offerCandidates');
    const answerCandidates = collection(db, 'calls', id!, 'answerCandidates');
    // setCallId(callDoc.id);

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
    const callDoc = doc(db, 'calls', id!);
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

  const hangup = async () => {
    if (id) {
      const roomRef = doc(db, 'call', id!);
      await getDocs(collection(roomRef, 'answerCandidates')).then(
        (querySnapshot) => {
          querySnapshot.forEach((answerDoc) => {
            deleteDoc(answerDoc.ref);
          });
        },
      );
      await getDocs(collection(roomRef, 'offerCandidates')).then(
        (querySnapshot) => {
          querySnapshot.forEach((offerDoc) => {
            deleteDoc(offerDoc.ref);
          });
        },
      );
      await deleteDoc(roomRef);
    }
    localVideo.current
      .srcObject!.getTracks()
      .forEach((track: MediaStreamTrack) => {
        track.stop();
      });
    remoteVideo.current
      .srcObject!.getTracks()
      .forEach((track: MediaStreamTrack) => {
        track.stop();
      });

    localVideo.current!.srcObject = null;
    remoteVideo.current!.srcObject = null;

    pc.ontrack = null;
    pc.onicecandidate = null;
    pc.close();
    navigate('/messages', { replace: false });
  };

  useEffect(() => {
    if (!query.has('answer')) {
      openWebCam().then(() => createOffer());
    } else {
      openWebCam().then(() => answerCall());
    }
  }, []);

  return (
    <Wrapper>
      <VideoWrapper>
        <VideoContainer
          id="webcamVideo"
          local
          autoPlay
          playsInline
          ref={localVideo}
        />
        <VideoContainer
          id="remoteVideo"
          remote
          autoPlay
          playsInline
          ref={remoteVideo}
        />
      </VideoWrapper>
      <button
        type="button"
        style={{
          width: '56px',
          height: '40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f54545',
          borderRadius: '100px',
          cursor: 'pointer',
          border: 'none',
        }}
        onClick={() => hangup()}
      >
        <Hangup />
      </button>
    </Wrapper>
  );
}

export default Stream;

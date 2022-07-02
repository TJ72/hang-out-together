/* eslint-disable no-restricted-syntax */
/* eslint-disable jsx-a11y/media-has-caption */
/* eslint-disable @typescript-eslint/no-unused-vars */
// @ts-nocheck
import React, { useRef } from 'react';
import { useParams } from 'react-router-dom';
import {
  ref,
  child,
  update,
  onDisconnect,
  DataSnapshot,
  onValue,
} from 'firebase/database';
import { rtcFireSession } from '../utils/rtcfire';
import { database } from '../utils/firebase';

// function Video({ videoStream }) {
//   const videoRef = useRef<HTMLVideoElement>(null);
//   videoRef.current!.srcObject = videoStream;
//   return <video autoPlay playsInline ref={videoRef} />;
// }
function GroupVideo() {
  const myId = String(Math.floor(Math.random() * 9999));
  const { topic } = useParams();
  // const localVideo = useRef<HTMLVideoElement>(null);

  interface IVideoStreams {
    pid: MediaStream;
  }
  function updatePeers(participants: string[], videoStreams: IVideoStreams) {
    // eslint-disable-next-line no-param-reassign
    participants = new Set(participants.filter((pid: string) => pid !== myId));
    const parent = document.querySelector('#peers');

    // new and existing peers
    for (const pid of participants) {
      let node = parent!.querySelector(`li[data-pid="${pid}"]`);
      if (!node) {
        node = document.createElement('li');
        node.setAttribute('data-pid', pid);
        node.innerHTML = '<video autoplay playsinline>';
        parent!.appendChild(node);
      }

      const video = node.querySelector('video');
      video!.srcObject = videoStreams[pid];
    }

    // removed peers
    for (const existing of parent.querySelectorAll('li')) {
      if (!participants.has(existing.getAttribute('data-pid'))) {
        parent!.removeChild(existing);
      }
    }

    // zero state
    const zero = participants.size === 0;
    document.querySelector('#peers-header')!.style.display = zero
      ? 'none'
      : 'block';
    document.querySelector('#zero-state').style.display = zero
      ? 'block'
      : 'none';
  }

  function setupVideo() {
    const participantsRef = ref(database, `${topic}/participants`);
    const videoStreams: any = {};

    const meRef = child(participantsRef, myId);
    update(meRef, { joined: true });
    onDisconnect(meRef).set(null);

    const rtcSession = rtcFireSession({
      myId,
      negotiationRef: ref(database, `${topic}/participants`),
      onMyStream: (stream) => {
        const video: HTMLVideoElement = document.querySelector(
          '#my-video',
        ) as HTMLVideoElement;
        video.srcObject = stream;
      },
      onParticipantStream: (pid, stream) => {
        videoStreams[pid] = stream;
        updatePeers(rtcSession.participants, videoStreams);
      },
    });

    onValue(participantsRef, (snap: DataSnapshot) => {
      const participants = Object.keys(snap.val() || {});
      rtcSession.participants = participants;
      updatePeers(participants, videoStreams);
    });
  }
  setupVideo();

  return (
    <>
      <h1>Multi Peer Video Chat</h1>
      <video
        id="my-video"
        muted
        autoPlay
        playsInline
        style={{ width: '300px', height: '200px' }}
      />
      <h3 id="peers-header">Other participants</h3>
      <ul id="peers" />
      <div id="zero-state">
        Share the URL with a friend, or open it in another tab!
      </div>
    </>
  );
}

export default GroupVideo;

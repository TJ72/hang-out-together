/* eslint-disable jsx-a11y/media-has-caption */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import {
  ref,
  child,
  update,
  onDisconnect,
  DataSnapshot,
  onValue,
} from 'firebase/database';
import { rtcFireSession } from '../utils/rtcfire';
import { database, auth, getEventDoc } from '../utils/firebase';
import type { Event } from '../types/event';

interface IVideoStreams {
  [key: string]: MediaStream;
  pid: MediaStream;
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

function Video({ videoStream }: { videoStream: MediaStream }) {
  const refVideo = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!refVideo.current) return;
    refVideo.current.srcObject = videoStream;
  }, [videoStream]);

  return <video ref={refVideo} autoPlay playsInline />;
}

// const myId = String(Math.floor(Math.random() * 9999));

function GroupVideo() {
  const myId = auth.currentUser?.uid;
  const [peersStreams, setPeersStream] = useState<
    { pid: string; video: MediaStream }[]
  >([]);
  const [event, setEvent] = useState<Event>();
  const { topic } = useParams();

  useEffect(() => {
    getEventDoc(topic!).then((res) => setEvent(res));
  }, []);

  useEffect(() => {
    function updatePeers(participants: string[], videoStreams: IVideoStreams) {
      setPeersStream(
        participants
          .filter((pid: string) => pid !== myId)
          .map((pid) => ({
            pid,
            video: videoStreams[pid],
          })),
      );
    }
    function setupVideo() {
      if (!myId) return;
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
  }, [myId]);

  return (
    <Wrapper>
      <h1>Multi Peers Video Chat</h1>
      <div id="peers">
        <video id="my-video" muted autoPlay playsInline />
        {peersStreams.map((stream: { pid: string; video: MediaStream }) => (
          <Video key={stream.pid} videoStream={stream.video} />
        ))}
      </div>
    </Wrapper>
  );
}

export default GroupVideo;

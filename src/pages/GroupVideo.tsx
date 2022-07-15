/* eslint-disable jsx-a11y/media-has-caption */
/* eslint-disable @typescript-eslint/no-unused-vars */
// @ts-nocheck
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
import { Timestamp } from 'firebase/firestore';
import { rtcFireSession } from '../utils/rtcfire';
import { database, auth, getEventDoc } from '../utils/firebase';
import type { Event } from '../types/event';
import Hangup from '../components/svg/Hangup';
import Microphone from '../components/svg/Microphone';
import Microphoneoff from '../components/svg/Microphoneoff';

interface IVideoStreams {
  [key: string]: MediaStream;
  pid: MediaStream;
}

const Wrapper = styled.div`
  width: 100%;
  min-height: calc(100vh - 85px);
  margin-top: 85px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  background-color: #212020;
`;

const VideoWrapper = styled.div`
  width: 100%;
  min-height: calc(100% - 60px);
  margin-bottom: 10px;
  video {
    min-width: 25%;
    min-height: calc(100% / 3);
    border-radius: 7px;
  }
`;

const ButtonWrapper = styled.div`
  width: 100%;
  margin-bottom: 10px;
  display: flex;
  justify-content: center;
  gap: 20px;
`;

function Video({ videoStream }: { videoStream: MediaStream }) {
  const refVideo = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!refVideo.current) return;
    refVideo.current.srcObject = videoStream;
  }, [videoStream]);

  return <video ref={refVideo} autoPlay playsInline />;
}

function GroupVideo() {
  const myId = auth.currentUser?.uid;
  const [peersStreams, setPeersStream] = useState<
    { pid: string; video: MediaStream }[]
  >([]);
  const [event, setEvent] = useState<Event>();
  const [status, setStatus] = useState('');
  const [muted, setMuted] = useState(false);
  const [close, setClose] = useState(false);
  const rtcSessionRef = useRef(null);

  const { topic } = useParams();
  // Check the conditions of online events
  useEffect(() => {
    getEventDoc(topic!).then((res) => {
      if (!res) {
        // if not get the res, return no event exists
        setStatus('活動不存在');
        return null;
      }
      // check the user is one of the attendees of the event
      let isAttendee = false;
      res.members.forEach((member) => {
        if (member.uid === myId) {
          isAttendee = true;
        }
      });
      if (!isAttendee) {
        setStatus('非活動參加者');
        return null;
      }
      // check the event has happened or not
      if (res.date > Timestamp.fromDate(new Date())) {
        setStatus('活動尚未開始');
        return null;
      }
      setEvent(res);
      return null;
    });
  }, [topic, myId]);

  // if (!event) return null;

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
      if (!myId) return () => {};
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
          if (!video) return;
          video.srcObject = stream;
        },
        onParticipantStream: (pid, stream) => {
          videoStreams[pid] = stream;
          updatePeers(rtcSession.participants, videoStreams);
        },
      });

      rtcSessionRef.current = rtcSession;

      onValue(participantsRef, (snap: DataSnapshot) => {
        const participants = Object.keys(snap.val() || {});
        rtcSession.participants = participants;
        updatePeers(participants, videoStreams);
      });
      return rtcSessionRef.current.close;
    }

    const closeConnection = setupVideo();
    return () => {
      closeConnection();
    };
  }, [myId]);

  useEffect(() => {
    rtcSessionRef.current.close();
  }, [close]);

  useEffect(() => {
    rtcSessionRef.current.muted = muted;
  }, [muted]);

  // useEffect(() => {
  //   console.log('rtcSessionRef.current', rtcSessionRef.current);
  //   return rtcSessionRef.current.close;
  // }, []);

  return (
    <Wrapper>
      <VideoWrapper>
        <video id="my-video" muted autoPlay playsInline />
        {peersStreams.map((stream: { pid: string; video: MediaStream }) => (
          <Video key={stream.pid} videoStream={stream.video} />
        ))}
      </VideoWrapper>
      <ButtonWrapper>
        <button
          type="button"
          style={{
            padding: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: muted ? '#f54545' : '#3c4043',
            borderRadius: '50%',
            cursor: 'pointer',
            border: 'none',
          }}
          onClick={() => {
            setMuted(!muted);
          }}
        >
          {muted ? <Microphoneoff /> : <Microphone />}
        </button>
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
          onClick={() => {
            setClose(!close);
          }}
        >
          <Hangup />
        </button>
      </ButtonWrapper>
    </Wrapper>
  );
}

export default GroupVideo;

/* eslint-disable jsx-a11y/media-has-caption */
/* eslint-disable @typescript-eslint/no-unused-vars */
// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled, { css } from 'styled-components';
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
  height: calc(100vh - 85px);
  margin-top: 85px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  background-color: #212020;
`;

const VideosContainer = styled.div`
  width: 100%;
  height: calc(100% - 60px);
  margin-bottom: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
`;

const VideoWrapper = styled.div<{ currentUsers: Number }>`
  display: flex;
  justify-content: center;
  border-radius: 15px;
  ${(props) =>
    props.currentUsers === 1 &&
    css`
      width: 60%;
      height: 90%;
    `}
  ${(props) =>
    props.currentUsers === 2 &&
    css`
      width: 50%;
      height: 90%;
    `}
    ${(props) =>
    props.currentUsers > 2 &&
    props.currentUsers <= 4 &&
    css`
      width: 40%;
      height: 50%;
    `}
  ${(props) =>
    props.currentUsers > 4 &&
    props.currentUsers <= 6 &&
    css`
      width: calc(100% / 3);
      height: 50%;
    `}
    ${(props) =>
    props.currentUsers > 6 &&
    props.currentUsers <= 9 &&
    css`
      width: calc(100% / 3);
      height: calc(100% / 3);
    `}
  ${(props) =>
    props.currentUsers > 9 &&
    props.currentUsers <= 16 &&
    css`
      width: 25%;
      height: 25%;
    `}
  video {
    width: 95%;
    border-radius: 8px;
    object-fit: cover;
  }
`;

const ButtonWrapper = styled.div`
  width: 100%;
  margin-bottom: 10px;
  display: flex;
  justify-content: center;
  gap: 15px;
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
  const navigate = useNavigate();

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

  return (
    <Wrapper>
      <VideosContainer>
        <VideoWrapper currentUsers={peersStreams.length + 1}>
          <video id="my-video" muted autoPlay playsInline />
        </VideoWrapper>
        {peersStreams.map((stream: { pid: string; video: MediaStream }) => (
          <VideoWrapper currentUsers={peersStreams.length + 1}>
            <Video key={stream.pid} videoStream={stream.video} />
          </VideoWrapper>
        ))}
      </VideosContainer>
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
            navigate('../', { replace: true });
          }}
        >
          <Hangup />
        </button>
      </ButtonWrapper>
    </Wrapper>
  );
}

export default GroupVideo;

import React, { useEffect, useRef } from 'react';
import Moment from 'react-moment';
import { Timestamp } from 'firebase/firestore';

interface Message {
  createdAt: Timestamp;
  from: string;
  to: string;
  text: string;
  media?: string;
}

function Text({ msg, user1 }: { msg: Message; user1: string }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msg]);
  return (
    <div
      className={`message_wrapper ${msg.from === user1 ? 'own' : ''}`}
      ref={scrollRef}
    >
      <p className={msg.from === user1 ? 'me' : 'friend'}>
        {msg.media ? <img src={msg.media} alt={msg.text} /> : null}
        {msg.text}
        <br />
        <small>
          <Moment fromNow>{msg.createdAt.toDate()}</Moment>
        </small>
      </p>
    </div>
  );
}

export default Text;

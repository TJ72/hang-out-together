import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Moment from 'react-moment';
import { Timestamp } from 'firebase/firestore';
import Phone from './svg/Phone';

interface Message {
  createdAt: Timestamp;
  from: string;
  to: string;
  text: string;
  media?: string;
  video?: boolean;
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
        {!msg?.video && msg.text}
        {msg?.video && (
          <Link
            to={msg.text}
            style={{ display: 'flex', textDecoration: 'none' }}
          >
            <Phone /> <span style={{ marginLeft: '8px' }}>Join</span>
          </Link>
        )}
        <br />
        <small>
          <Moment fromNow>{msg.createdAt.toDate()}</Moment>
        </small>
      </p>
    </div>
  );
}

export default Text;

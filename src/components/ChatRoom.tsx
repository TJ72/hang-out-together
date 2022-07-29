import React, { useState, useEffect } from 'react';
import { onSnapshot, doc, Timestamp } from 'firebase/firestore';
import { db } from '../utils/firebase';
import Img from '../assets/avatar.png';

interface User {
  createdAt: Date;
  email: string;
  follows: string[];
  isOnline: boolean;
  joins: string[];
  name: string;
  uid: string;
  avatar?: string;
  avatarPath?: string;
}

interface Message {
  createdAt: Timestamp;
  from: string;
  to: string;
  text: string;
  media?: string;
  unread: boolean;
}

type RoomProps = {
  user1: string;
  chat: User;
  user: User;
  handleSelection: Function;
};

function ChatRoom({ chat, user1, user, handleSelection }: RoomProps) {
  const user2 = user.uid;
  const [data, setData] = useState<Message>();
  useEffect(() => {
    const id = user1! > user2 ? `${user1 + user2}` : `${user2 + user1}`;
    const unsub = onSnapshot(doc(db, 'lastMsg', id), (msgDoc) => {
      setData(msgDoc.data() as Message);
    });
    return () => unsub();
  }, []);
  return (
    <div
      className={`user_wrapper ${chat?.uid === user.uid && 'selected_user'}`}
      onClick={() => handleSelection(user)}
      aria-hidden="true"
    >
      <div className="user_info">
        <div className="user_detail">
          <img src={user.avatar || Img} alt="avatar" className="avatar" />
          <h4 className="chatroom_detail">{user.name}</h4>
          {data?.from !== user1 && data?.unread && (
            <small className="unread chatroom_detail">New</small>
          )}
        </div>
        <div
          className={`user_status ${user.isOnline ? 'online' : 'offline'}`}
        />
      </div>
      {data && (
        <p className="truncate chatroom_detail">
          <strong>{data.from === user1 ? 'Me:' : null}</strong>
          {data.text}
        </p>
      )}
    </div>
  );
}

export default ChatRoom;

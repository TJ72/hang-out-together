import React from 'react';
import Img from '../assets/avatar.jpg';

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

function ChatRoom({ user }: { user: User }) {
  return (
    <div className="user_wrapper">
      <div className="user_info">
        <div className="user_detail">
          <img src={user.avatar || Img} alt="avatar" className="avatar" />
          <h4>{user.name}</h4>
        </div>
        <div
          className={`user_status ${user.isOnline ? 'online' : 'offline'}`}
        />
      </div>
    </div>
  );
}

export default ChatRoom;

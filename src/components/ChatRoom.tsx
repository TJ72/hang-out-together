import React from 'react';
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

function ChatRoom({
  user,
  handleSelection,
}: {
  user: User;
  handleSelection: Function;
}) {
  return (
    <div
      className="user_wrapper"
      onClick={() => handleSelection(user)}
      aria-hidden="true"
    >
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

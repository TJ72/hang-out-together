import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../utils/firebase';
import ChatRoom from '../components/ChatRoom';

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

function Messenger() {
  const [users, setUsers] = useState<User[]>([]);
  useEffect(() => {
    const usersRef = collection(db, 'users');
    // create query object
    const q = query(usersRef, where('uid', 'not-in', [auth.currentUser?.uid]));
    // execute query
    const unsub = onSnapshot(q, (querySnapshot) => {
      const currentUsers = [] as User[];
      querySnapshot.forEach((doc) => {
        currentUsers.push(doc.data() as User);
      });
      setUsers(currentUsers);
    });
    return () => unsub();
  }, []);
  return (
    <div className="home_container">
      <div className="users_container">
        {users.map((user) => (
          <ChatRoom key={user.uid} user={user} />
        ))}
      </div>
    </div>
  );
}

export default Messenger;

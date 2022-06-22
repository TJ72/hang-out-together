import React, { useState, useEffect } from 'react';
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  Timestamp,
  orderBy,
  setDoc,
  doc,
} from 'firebase/firestore';
import { ref, getDownloadURL, uploadBytes } from 'firebase/storage';
import { db, auth, storage } from '../utils/firebase';
import ChatRoom from '../components/ChatRoom';
import MessageForm from '../components/MessageForm';
import Text from '../components/Text';

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
}

function Messenger() {
  const [users, setUsers] = useState<User[]>([]);
  const [chat, setChat] = useState<User>();
  const [text, setText] = useState('');
  const [img, setImg] = useState<File>();
  const [msgs, setMsgs] = useState<Message[]>([]);
  const user1 = auth.currentUser?.uid;
  useEffect(() => {
    const usersRef = collection(db, 'users');
    // create query object
    const q = query(usersRef, where('uid', 'not-in', [user1]));
    // execute query
    const unsub = onSnapshot(q, (querySnapshot) => {
      const currentUsers = [] as User[];
      querySnapshot.forEach((userDoc) => {
        currentUsers.push(userDoc.data() as User);
      });
      setUsers(currentUsers);
    });
    return () => unsub();
  }, []);

  const selectUser = (user: User) => {
    setChat(user);
    const user2 = user.uid;
    const id = user1! > user2 ? `${user1 + user2}` : `${user2 + user1}`;
    const msgsRef = collection(db, 'messages', id, 'chat');
    const q = query(msgsRef, orderBy('createdAt', 'asc'));

    onSnapshot(q, (querySnapshot) => {
      const newMsgs = [] as Message[];
      querySnapshot.forEach((msgsDoc) => {
        newMsgs.push(msgsDoc.data() as Message);
      });
      setMsgs(newMsgs);
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const user2 = chat?.uid;
    const id = user1! > user2! ? `${user1! + user2!}` : `${user2! + user1!}`;
    let url;
    if (img) {
      const imgRef = ref(
        storage,
        `images/${new Date().getTime()} - ${img.name}`,
      );
      const snap = await uploadBytes(imgRef, img);
      const dlUrl = await getDownloadURL(ref(storage, snap.ref.fullPath));
      url = dlUrl;
    }

    await addDoc(collection(db, 'messages', id, 'chat'), {
      text,
      from: user1,
      to: user2,
      createdAt: Timestamp.fromDate(new Date()),
      media: url || '',
    });

    await setDoc(doc(db, 'lastMsg', id), {
      text,
      from: user1,
      to: user2,
      createdAt: Timestamp.fromDate(new Date()),
      media: url || '',
      unread: true,
    });

    setText('');
    setImg(undefined);
  };

  return (
    <div className="home_container">
      <div className="users_container">
        {users.map((user) => (
          <ChatRoom key={user.uid} user={user} handleSelection={selectUser} />
        ))}
      </div>
      <div className="messages_container">
        {chat ? (
          <>
            <div className="messages_user">
              <h3>{chat.name}</h3>
            </div>
            <div className="messages">
              {msgs.length
                ? msgs.map((msg, i) => (
                    // eslint-disable-next-line react/no-array-index-key
                    <Text key={i} msg={msg} user1={user1!} />
                  ))
                : null}
            </div>
            <MessageForm
              handleSubmit={handleSubmit}
              text={text}
              setText={setText}
              setImg={setImg}
            />
          </>
        ) : (
          <h3 className="no_conv">Select a user to start conversation</h3>
        )}
      </div>
    </div>
  );
}

export default Messenger;

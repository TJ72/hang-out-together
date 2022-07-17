import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  Timestamp,
  orderBy,
  getDoc,
  setDoc,
  updateDoc,
  doc,
} from 'firebase/firestore';
import { ref, getDownloadURL, uploadBytes } from 'firebase/storage';
import { db, auth, storage } from '../utils/firebase';
import ChatRoom from '../components/ChatRoom';
import MessageForm from '../components/MessageForm';
import Text from '../components/Text';
import VideoChat from '../components/svg/VideoChat';
import Remove from '../components/svg/Remove';

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
  video?: boolean;
}

function Messenger() {
  const [users, setUsers] = useState<User[]>([]);
  const [chat, setChat] = useState<User>();
  const [text, setText] = useState('');
  const [img, setImg] = useState<File>();
  const [localPath, setLocalPath] = useState('');
  const [loading, setLoading] = useState(false);
  const [msgs, setMsgs] = useState<Message[]>([]);
  const navigate = useNavigate();
  const user1 = auth.currentUser?.uid;

  useEffect(() => {
    if (img) {
      const path = (window.URL || window.webkitURL).createObjectURL(img);
      setLocalPath(path);
    } else {
      setLocalPath('');
    }
  }, [img]);

  useEffect(() => {
    const usersRef = collection(db, 'users');
    // create query object
    const q = query(usersRef, where('uid', 'not-in', [user1]));
    // execute query
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const currentUsers = [] as User[];
      querySnapshot.forEach((userDoc) => {
        currentUsers.push(userDoc.data() as User);
      });
      setUsers(currentUsers);
    });
    return () => unsubscribe();
  }, []);

  const selectUser = async (user: User) => {
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
    const docSnap = await getDoc(doc(db, 'lastMsg', id));
    if (docSnap.data()?.from !== user1) {
      await updateDoc(doc(db, 'lastMsg', id), { unread: false });
    }
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
    setLoading(false);
  };

  const handleVideoChat = async () => {
    const user2 = chat?.uid;
    const id = user1! > user2! ? `${user1! + user2!}` : `${user2! + user1!}`;
    const callDoc = doc(collection(db, 'calls'));
    navigate(`/stream/${callDoc.id}`, { replace: false });

    await addDoc(collection(db, 'messages', id, 'chat'), {
      text: `/stream/${callDoc.id}?answer=1`,
      from: user1,
      to: user2,
      createdAt: Timestamp.fromDate(new Date()),
      media: '',
      video: true,
    });
  };

  const removeUploadImage = () => {
    setImg(undefined);
    setLocalPath('');
  };

  return (
    <div className="home_container">
      <div className="users_container">
        {users.map((user) => (
          <ChatRoom
            key={user.uid}
            user={user}
            handleSelection={selectUser}
            user1={user1!}
            chat={chat!}
          />
        ))}
      </div>
      <div className="messages_container">
        {chat ? (
          <>
            <div className="messages_user">
              <h3
                style={{
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '15px',
                }}
              >
                {chat.name}
                <VideoChat handleVideoChat={handleVideoChat} />
              </h3>
            </div>
            <div className="messages">
              {msgs.length
                ? msgs.map((msg, i) => (
                    // eslint-disable-next-line react/no-array-index-key
                    <Text key={i} msg={msg} user1={user1!} />
                  ))
                : null}
            </div>
            {localPath && (
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  position: 'absolute',
                  left: '17%',
                  bottom: '-1%',
                  backgroundColor: 'rgb(237 230 230 / 53%)',
                  zIndex: '150',
                }}
              >
                <Remove removeUploadImage={removeUploadImage} />
                <img
                  src={localPath}
                  alt="uploaded"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'contain',
                  }}
                />
              </div>
            )}
            <MessageForm
              handleSubmit={handleSubmit}
              text={text}
              img={img}
              loading={loading}
              setText={setText}
              setImg={setImg}
              setLoading={setLoading}
            />
          </>
        ) : (
          <h3 className="no_conv">Select a user and start the connection!</h3>
        )}
      </div>
    </div>
  );
}

export default Messenger;

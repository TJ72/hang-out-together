import React, { useEffect, useState } from 'react';
import {
  getDownloadURL,
  uploadBytes,
  deleteObject,
  ref,
} from 'firebase/storage';
import { getDoc, doc, updateDoc, Timestamp } from 'firebase/firestore';
import Camera from '../components/svg/Camera';
import Delete from '../components/svg/Delete';
import Img from '../assets/avatar.png';
import { storage, db, auth } from '../utils/firebase';

interface User {
  createdAt: Timestamp;
  email: string;
  follows: string[];
  isOnline: boolean;
  joins: string[];
  name: string;
  uid: string;
  avatar?: string;
  avatarPath?: string;
}

function Profile() {
  const [img, setImg] = useState<File>();
  const [user, setUser] = useState<User>();
  useEffect(() => {
    getDoc(doc(db, 'users', auth.currentUser!.uid)).then((docSnap) => {
      if (docSnap.exists()) {
        setUser(docSnap.data() as User);
      }
    });
    if (img) {
      const uploadImg = async () => {
        const imgRef = ref(
          storage,
          `avatar/${new Date().getTime()} - ${img.name}`,
        );
        if (user?.avatarPath) {
          await deleteObject(ref(storage, user.avatarPath));
        }
        const snap = await uploadBytes(imgRef, img);
        const url = await getDownloadURL(ref(storage, snap.ref.fullPath));
        updateDoc(doc(db, 'users', auth.currentUser!.uid), {
          avatar: url,
          avatarPath: snap.ref.fullPath,
        });
        setImg(undefined);
      };
      uploadImg();
    }
  }, [img]);
  const deleteImage = async () => {
    try {
      // eslint-disable-next-line no-alert
      const confirm = window.confirm('Delete avatar?');
      if (confirm) {
        await deleteObject(ref(storage, user?.avatarPath));
        await updateDoc(doc(db, 'users', auth.currentUser!.uid), {
          avatar: '',
          avatarPath: '',
        });
        setUser({ ...user!, avatar: '', avatarPath: '' });
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log('Error', e);
    }
  };
  return (
    <section>
      <div className="profile_container">
        <div className="img_container">
          <img src={user?.avatar || Img} alt="Avatar" />
          <div className="overlay">
            <div>
              <label htmlFor="photo">
                <Camera />
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="photo"
                  onChange={(e) => setImg(e.target.files![0])}
                />
              </label>
              {user?.avatar ? <Delete deleteImage={deleteImage} /> : null}
            </div>
          </div>
        </div>
        <div className="text_container">
          <h3>{user?.name}</h3>
          <p>{user?.email}</p>
          <hr />
          <small>Joined on: {user?.createdAt.toDate().toDateString()}</small>
        </div>
      </div>
    </section>
  );
}

export default Profile;

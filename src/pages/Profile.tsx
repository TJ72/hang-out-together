import React, { useEffect, useState } from 'react';
import { getDownloadURL, uploadBytes, ref } from 'firebase/storage';
import { getDoc, doc, updateDoc } from 'firebase/firestore';
import Camera from '../components/svg/Camera';
import Img from '../assets/avatar.jpg';
import { storage, db, auth } from '../utils/firebase';

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
            </div>
          </div>
        </div>
        <div className="text_container">
          <h3>{user?.name}</h3>
          <p>{user?.email}</p>
          <hr />
          <small>Joined on: ...</small>
        </div>
      </div>
    </section>
  );
}

export default Profile;

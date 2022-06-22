import React, { useEffect, useState } from 'react';
import { Timestamp } from 'firebase/firestore';
import {
  getDownloadURL,
  uploadBytes,
  deleteObject,
  ref,
} from 'firebase/storage';
import { setEventDoc, storage } from '../utils/firebase';
import LoadingImages from '../components/svg/LoadingImages';

function CreateEvent() {
  const [title, setTitle] = useState('');
  const [type, setType] = useState('Outdoor');
  const [host, setHost] = useState('');
  const [location, setLocation] = useState('');
  const [mainImage, setMainImage] = useState<File>();
  const [imgUrl, setImgUrl] = useState('');
  const [imgPath, setImgPath] = useState('');
  useEffect(() => {
    if (mainImage) {
      const uploadImg = async () => {
        const imgRef = ref(
          storage,
          `event/${new Date().getTime()} - ${mainImage.name}`,
        );
        if (imgPath) {
          await deleteObject(ref(storage, imgPath));
        }
        const snap = await uploadBytes(imgRef, mainImage);
        const url = await getDownloadURL(ref(storage, snap.ref.fullPath));
        setImgUrl(url);
        setImgPath(snap.ref.fullPath);
        setMainImage(undefined);
      };
      uploadImg();
    }
  }, [mainImage]);

  return (
    <>
      <div>Title</div>
      <input value={title} onChange={(e) => setTitle(e.target.value)} />
      <div>Type</div>
      <select value={type} onChange={(e) => setType(e.target.value)}>
        <option>Outdoor</option>
        <option>Indoor</option>
        <option>Online</option>
        <option>Other</option>
      </select>
      <div>Host</div>
      <input value={host} onChange={(e) => setHost(e.target.value)} />
      <div>Location</div>
      <input value={location} onChange={(e) => setLocation(e.target.value)} />
      <div>Main Image</div>
      <label
        htmlFor="photo"
        style={{
          width: '400px',
          height: '300px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgb(238, 238, 238)',
          borderRadius: '3px',
          cursor: 'pointer',
        }}
      >
        {imgUrl ? (
          <img
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            src={imgUrl}
            alt="The Activity"
          />
        ) : (
          <LoadingImages />
        )}
        <input
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          id="photo"
          onChange={(e) => {
            setMainImage(e.target.files![0]);
          }}
        />
      </label>

      <button
        type="button"
        onClick={() =>
          setEventDoc({
            title,
            type,
            host,
            createdAt: Timestamp.fromDate(new Date()),
            location,
            mainImageUrl: imgUrl,
            members: [],
          })
        }
      >
        submit
      </button>
    </>
  );
}

export default CreateEvent;

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import { Timestamp, collection, doc, setDoc } from 'firebase/firestore';
import {
  getDownloadURL,
  uploadBytes,
  deleteObject,
  ref,
} from 'firebase/storage';
import { db, storage } from '../utils/firebase';
import type { Event } from '../types/event';
import LoadingImages from '../components/svg/LoadingImages';
import 'react-datepicker/dist/react-datepicker.css';

function CreateEvent() {
  const [title, setTitle] = useState('');
  const [type, setType] = useState('Outdoor');
  const [host, setHost] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState(new Date());
  const [mainImage, setMainImage] = useState<File>();
  const [imgUrl, setImgUrl] = useState('');
  const [imgPath, setImgPath] = useState('');
  const navigate = useNavigate();

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

  const setEventDoc = async (data: Event) => {
    const eventRef = doc(collection(db, 'events'));
    await setDoc(eventRef, { ...data, id: eventRef.id });
    navigate(`/event/${eventRef.id}`, { replace: true });
  };

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
      <div>Event Date</div>
      <DatePicker
        selected={date}
        onChange={(selectedDate: Date) => setDate(selectedDate)}
      />
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
            date: Timestamp.fromDate(date),
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

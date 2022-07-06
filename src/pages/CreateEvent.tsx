import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import ReactQuill from 'react-quill';
import DatePicker from 'react-datepicker';
import { Timestamp, collection, doc, setDoc } from 'firebase/firestore';
import {
  getDownloadURL,
  uploadBytes,
  deleteObject,
  ref,
} from 'firebase/storage';
import { db, storage } from '../utils/firebase';
import LoadingImages from '../components/svg/LoadingImages';
import type { Event } from '../types/event';
import 'react-quill/dist/quill.snow.css';
import 'react-datepicker/dist/react-datepicker.css';
import { AuthContext } from '../context/auth';

const Wrapper = styled.div`
  margin-top: 115px;
`;

const Title = styled.div`
  margin-top: 10px;
  margin-bottom: 7px;
  font-size: 1.3rem;
  font-weight: 600;
  color: #3f3d56;
`;

function CreateEvent() {
  const [title, setTitle] = useState('');
  const [type, setType] = useState('Outdoor');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState(new Date());
  const [mainImage, setMainImage] = useState<File>();
  const [imgUrl, setImgUrl] = useState('');
  const [imgPath, setImgPath] = useState('');
  const [detail, setDetail] = useState('');
  const navigate = useNavigate();
  const userInfo = useContext(AuthContext);
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
    <Wrapper>
      <Title>Title</Title>
      <input value={title} onChange={(e) => setTitle(e.target.value)} />
      <Title>Type</Title>
      <select value={type} onChange={(e) => setType(e.target.value)}>
        <option>Outdoor</option>
        <option>Indoor</option>
        <option>Online</option>
        <option>Other</option>
      </select>
      <Title>Location</Title>
      <input value={location} onChange={(e) => setLocation(e.target.value)} />
      <Title>Event Date</Title>
      <DatePicker
        selected={date}
        onChange={(selectedDate: Date) => setDate(selectedDate)}
      />
      <Title>Main Image</Title>
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
      <Title>Detail</Title>
      <ReactQuill theme="snow" value={detail} onChange={setDetail} />
      <button
        type="button"
        onClick={() =>
          setEventDoc({
            title,
            type,
            host: userInfo!.name,
            date: Timestamp.fromDate(date),
            createdAt: Timestamp.fromDate(new Date()),
            location,
            mainImageUrl: imgUrl,
            detail,
            members: [],
          })
        }
      >
        submit
      </button>
    </Wrapper>
  );
}

export default CreateEvent;

// @ts-nocheck
import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { css } from 'styled-components';
import ReactQuill from 'react-quill';
import DatePicker from 'react-datepicker';
import { Timestamp, collection, doc, setDoc } from 'firebase/firestore';
import {
  getDownloadURL,
  uploadBytes,
  deleteObject,
  ref,
} from 'firebase/storage';
import { AuthContext } from '../context/auth';
import { db, storage } from '../utils/firebase';
import Outdoor from '../assets/outdoor.jpg';
import Indoor from '../assets/indoor.jpg';
import Online from '../assets/online.jpg';
import LoadingImages from '../components/svg/LoadingImages';
import type { Event } from '../types/event';
import 'react-quill/dist/quill.snow.css';
import 'react-datepicker/dist/react-datepicker.css';

const Background = styled.div<{ backgroundImage: string }>`
  width: 100%;
  height: 100%;
  transition: background 1s ease-in;
  ${(props) =>
    props.backgroundImage === 'Outdoor' &&
    css`
      background: url(${Outdoor}) no-repeat center center;
    `}
  ${(props) =>
    props.backgroundImage === 'Indoor' &&
    css`
      background: url(${Indoor}) no-repeat center center;
    `}
      ${(props) =>
    props.backgroundImage === 'Online' &&
    css`
      background: url(${Online}) no-repeat center center;
    `}
  background-size: cover;
  position: fixed;
  top: 0;
  left: 0;
  opacity: 0.7;
  z-index: -1;
`;

const Wrapper = styled.div`
  width: 60%;
  max-width: 700px;
  padding: 30px 30px;
  margin: 115px auto 60px;
  background-color: #fff;
  border-radius: 6px;
`;

const Title = styled.div`
  margin-top: 10px;
  margin-bottom: 10px;
  font-size: 1.3rem;
  font-weight: 600;
  color: #3f3d56;
`;

const ItemInput = styled.input`
  width: 70%;
  line-height: 25px;
  padding-left: 3px;
  border: none;
  border-bottom: 2px solid #bdbdbd;
  font-size: 1.25rem;
  font-weight: 500;
  &:focus {
    outline: none !important;
    border-color: #719ece;
  }
`;

const StyledDatePicker = styled(DatePicker)`
  width: 40%;
  height: 31px;
  padding-left: 6px;
  border: 2px solid #bdbdbd;
  border-radius: 6px;
  font-size: 1rem;
  letter-spacing: 1px;
  &:focus {
    outline: none !important;
    border-color: #719ece;
    box-shadow: 0 0 4px #719ece;
  }
`;

const ImageContainer = styled.label`
  width: 80%;
  height: 300px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: center;
  justify-content: center;
  background-color: rgb(238, 238, 238);
  border-radius: 3px;
  color: #3f3d56;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
`;

const SubmitBtn = styled.button`
  width: 120px;
  height: 45px;
  margin-top: 70px;
  margin-left: calc(50% - 60px);
  border: 0;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  color: #fff;
  background-color: #1c6791;
  cursor: pointer;
  &:hover {
    background-color: #aad7f0;
    color: #1c6791;
  }
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
      <Background backgroundImage={type} />
      <Title>Title</Title>
      <ItemInput value={title} onChange={(e) => setTitle(e.target.value)} />
      <Title>Type</Title>
      <div className="checkboxes">
        <label htmlFor="opt1" className="radio">
          <input
            type="radio"
            name="rdo"
            id="opt1"
            className="hidden"
            checked={type === 'Outdoor'}
            onChange={(e) => {
              if (e.target.checked) setType('Outdoor');
            }}
          />
          <span className="label" />
          Outdoor
        </label>
        <label htmlFor="opt1" className="radio">
          <input
            type="radio"
            name="rdo"
            id="opt1"
            className="hidden"
            checked={type === 'Indoor'}
            onChange={(e) => {
              if (e.target.checked) setType('Indoor');
            }}
          />
          <span className="label" />
          Indoor
        </label>
        <label htmlFor="opt1" className="radio">
          <input
            type="radio"
            name="rdo"
            id="opt1"
            className="hidden"
            checked={type === 'Online'}
            onChange={(e) => {
              if (e.target.checked) setType('Online');
            }}
          />
          <span className="label" />
          Online
        </label>
      </div>
      <Title>Location</Title>
      <ItemInput
        value={location}
        onChange={(e) => setLocation(e.target.value)}
      />
      <Title>Event Date</Title>
      <StyledDatePicker
        // className="date-picker"
        selected={date}
        onChange={(selectedDate: Date) => setDate(selectedDate)}
      />
      <Title>Main Image</Title>
      <ImageContainer htmlFor="photo">
        {imgUrl ? (
          <img
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            src={imgUrl}
            alt="The Activity"
          />
        ) : (
          <>
            <LoadingImages />
            <div>Click and Upload the Image</div>
          </>
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
      </ImageContainer>
      <Title>Detail</Title>
      <ReactQuill value={detail} onChange={setDetail} />
      <SubmitBtn
        type="button"
        onClick={() =>
          setEventDoc({
            title,
            type,
            host: userInfo!,
            date: Timestamp.fromDate(date),
            createdAt: Timestamp.fromDate(new Date()),
            location,
            mainImageUrl: imgUrl,
            detail,
            members: [],
          })
        }
      >
        Create
      </SubmitBtn>
    </Wrapper>
  );
}

export default CreateEvent;

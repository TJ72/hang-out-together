/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from 'react';
import styled, { css } from 'styled-components';
import {
  getDownloadURL,
  uploadBytes,
  deleteObject,
  ref,
} from 'firebase/storage';
import { getDoc, doc, updateDoc, Timestamp } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import Camera from '../components/svg/Camera';
import Delete from '../components/svg/Delete';
import Img from '../assets/avatar.png';
import { storage, db, auth } from '../utils/firebase';
import type { IJoin } from '../utils/toggleUserJoins';
import EventTime from '../components/svg/EventTime';
import GroupLink from '../components/svg/GroupLink';

interface User {
  createdAt: Timestamp;
  email: string;
  follows: string[];
  isOnline: boolean;
  joins: IJoin[];
  name: string;
  uid: string;
  avatar?: string;
  avatarPath?: string;
}

const Wrapper = styled.div`
  width: 100%;
  min-height: 100vh;
  margin-top: 85px;
  display: flex;
  justify-content: center;
  background-color: #f0f2f5;
`;

const Container = styled.div`
  width: 70%;
  max-width: 1200px;
  padding: 30px 40px;
  margin-top: 40px;
  margin-bottom: 50px;
  border: 1px solid #e4e6e9;
  border-radius: 15px;
  background-color: #fff;
`;

const UserName = styled.div`
  color: #3f3d56;
  font-size: 1.5rem;
  font-weight: 600;
  letter-spacing: 1px;
`;

const UserMail = styled.div`
  color: #3f3d56;
  margin-top: 10px;
  font-size: 1.2rem;
  font-weight: 550;
`;

const EventsNavBar = styled.ul`
  padding: 0;
  display: flex;
  list-style: none;
`;

const NavItem = styled.li<{ status: string }>`
  padding: 10px 40px;
  margin-top: 20px;
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: 1px;
  cursor: pointer;
  ${(props) =>
    props.status === 'Attending' &&
    css`
      :first-child {
        color: #f54545;
        border-bottom: 4px solid #f54545;
      }
    `}
  ${(props) =>
    props.status === 'Past' &&
    css`
      :nth-child(2) {
        color: #f54545;
        border-bottom: 4px solid #f54545;
      }
    `}
`;

const EventContainer = styled.div`
  padding: 10px 20px;
  background-color: #fff;
  border: 1px solid #e4e6e9;
`;

const EventWrapper = styled.div`
  padding: 20px;
  display: flex;
`;

const EventImage = styled.div`
  width: 240px;
  height: 180px;
  margin-right: 30px;
  overflow: hidden;
  border-radius: 5px;
  img {
    width: 100%;
    height: 100%;
    transition: 1s;
  }
  img:hover {
    transform: scale(1.2);
  }
`;

const EventDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

function Event({ join }: { join: IJoin }) {
  return (
    <EventWrapper>
      <EventImage>
        <Link to={`/event/${join.id}`}>
          <img src={join.mainImageUrl} alt="Activity" />
        </Link>
      </EventImage>
      <EventDetails>
        <div style={{ fontSize: '1.2rem', fontWeight: '600' }}>
          {join.title}
        </div>
        <div style={{ fontSize: '1rem', fontWeight: '550' }}>
          Hosted by: {join.host.name}
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            fontSize: '1.02rem',
            gap: '10px',
          }}
        >
          <EventTime />
          {join.date.toDate().toLocaleString().slice(0, -3)}
        </div>
        {join.type === 'Online' && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              fontSize: '1.02rem',
              gap: '10px',
            }}
          >
            <GroupLink />
            <Link
              to={`/group-video/${join.id}`}
              style={{ textDecoration: 'none' }}
            >
              Online Event Link
            </Link>{' '}
          </div>
        )}
      </EventDetails>
    </EventWrapper>
  );
}

function Profile() {
  const [img, setImg] = useState<File>();
  const [user, setUser] = useState<User>();
  const [status, setStatus] = useState('Attending');
  const [presentEvents, setPresentEvents] = useState<(IJoin | null)[]>([]);
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

  useEffect(() => {
    let present = [] as IJoin[];
    if (user?.joins && status === 'Attending') {
      present = user.joins
        .filter((join) => join.date >= Timestamp.fromDate(new Date()))
        .sort((x, y) => {
          if (x.date > y.date) return 1;
          if (x.date < y.date) return -1;
          return 0;
        });
    } else if (user?.joins) {
      present = user.joins
        .filter((join) => join.date < Timestamp.fromDate(new Date()))
        .sort((x, y) => {
          if (x.date > y.date) return 1;
          if (x.date < y.date) return -1;
          return 0;
        });
    }
    setPresentEvents(present);
  }, [user, status]);

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
    <Wrapper>
      <Container>
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
            <UserName>{user?.name}</UserName>
            <UserMail>{user?.email}</UserMail>
            <hr />
            <small style={{ color: '#3f3f3f' }}>
              Joined on: {user?.createdAt.toDate().toDateString()}
            </small>
          </div>
        </div>
        <EventsNavBar>
          <NavItem status={status} onClick={() => setStatus('Attending')}>
            Attending
          </NavItem>
          <NavItem status={status} onClick={() => setStatus('Past')}>
            Past
          </NavItem>
        </EventsNavBar>
        <EventContainer>
          {presentEvents &&
            presentEvents.map((join) => (
              <Event join={join as IJoin} key={join?.id} />
            ))}
        </EventContainer>
      </Container>
    </Wrapper>
  );
}

export default Profile;

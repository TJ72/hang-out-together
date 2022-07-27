import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styled from 'styled-components';
import { collection, getDocs, orderBy, query, where } from 'firebase/firestore';
import { db } from '../utils/firebase';
import type { Event } from '../types/event';
import CoverImage from '../assets/cover.jpg';

const Wrapper = styled.div`
  margin-top: 85px;
`;

const Cover = styled.div`
  width: 100%;
  height: 500px;
  background: url(${CoverImage}) no-repeat center center;
  background-size: cover;
  border: none;
  position: relative;
  div {
    font-family: 'Courgette';
    font-weight: 600;
    font-size: 2.5em;
    color: #e6776796;
    position: absolute;
    top: 30%;
    right: 5%;
  }
  @media (max-width: 1279px) {
    div {
      font-size: 1.8rem;
    }
  }
  @media (max-width: 768px) {
    height: 300px;
    div {
      display: none;
    }
  }
  @media (max-width: 376px) {
    height: 260px;
  }
`;

const CreateBtn = styled.button`
  width: 180px;
  height: 60px;
  background-color: #f54545;
  color: #fff;
  font-size: 1.3rem;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  position: absolute;
  bottom: 15%;
  right: 7%;
  cursor: pointer;
  :hover {
    background-color: #e6776796;
    color: #f54545;
    border: 1px solid #f54545;
  }
  @media (max-width: 768px) {
    width: 120px;
    height: 50px;
    font-size: 1rem;
    }
  }
  @media (max-width: 376px) {
    width: 90px;
    height: 40px;
    font-size: 0.8rem;
  }
`;

const Container = styled.div`
  width: 90%;
  max-width: 1160px;
  margin: 90px auto;
  display: flex;
  justify-content: flex-start;
  gap: 5%;
  flex-wrap: wrap;
  @media (max-width: 1279px) {
    width: 60%;
  }
  @media (max-width: 376px) {
    width: 90%;
  }
`;

const ItemWrapper = styled(Link)`
  text-decoration: none;
  width: 30%;
  min-width: 320px;
  @media (max-width: 1279px) {
    width: 40%;
  }
`;

const Item = styled.div`
  width: 100%;
  padding-bottom: 10px;
  margin-bottom: 40px;
  box-shadow: 0 0 5px #c4c0c0;
  border-radius: 3px;
  overflow: hidden;
  img {
    height: 215px;
    transition: 1s;
  }
  img:hover {
    transform: scale(1.2);
  }
`;

const ItemInfo = styled.div`
  margin-left: 8px;
  color: #3f3f3f;
`;

const ItemTitle = styled.div`
  margin-top: 19px;
  font-size: 1.25rem;
  font-weight: 600;
`;

const ItemDetail = styled.div`
  margin-top: 3px;
  line-height: 25px;
  font-size: 1rem;
  font-weight: 450;
`;

function EventItem({
  id,
  title,
  host,
  location,
  date,
  members,
  mainImageUrl,
}: Event) {
  return (
    <ItemWrapper to={`/event/${id}`}>
      <Item>
        <img style={{ width: '100%' }} src={mainImageUrl} alt="Activity" />
        <ItemInfo>
          <ItemTitle>{title}</ItemTitle>
          <ItemDetail style={{ marginTop: '6px' }}>
            Hosted by: {host.name}
          </ItemDetail>
          <ItemDetail>{location}</ItemDetail>
          <ItemDetail>{date.toDate().toDateString()}</ItemDetail>
          <ItemDetail>{members.length} attendees</ItemDetail>
        </ItemInfo>
      </Item>
    </ItemWrapper>
  );
}

function Home() {
  const [events, setEvents] = useState<Event[]>([]);
  const navigate = useNavigate();
  useEffect(() => {
    const getAllEvents = async () => {
      const eventsField = query(
        collection(db, 'events'),
        where('date', '>', new Date()),
        orderBy('date', 'asc'),
      );
      const querySnapshot = await getDocs(eventsField);
      const eventsDoc = querySnapshot.docs.map((eventDoc) => eventDoc.data());
      setEvents(eventsDoc as []);
    };
    getAllEvents();
  }, []);

  return (
    <Wrapper>
      <Cover>
        <div>
          A Sweet Friendship Refreshes
          <br /> the Soul.
        </div>
        <CreateBtn
          onClick={() => {
            navigate('/create', { replace: true });
          }}
        >
          Host Events
        </CreateBtn>
      </Cover>
      <Container>
        {events.map((event) => (
          <EventItem
            key={event.id}
            id={event.id}
            title={event.title}
            host={event.host}
            type={event.type}
            location={event.location}
            date={event.date}
            members={event.members}
            mainImageUrl={event.mainImageUrl}
            detail={event.detail}
            createdAt={event.createdAt}
          />
        ))}
      </Container>
    </Wrapper>
  );
}

export default Home;

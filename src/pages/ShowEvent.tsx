/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState, useContext } from 'react';
import styled from 'styled-components';
import { useParams } from 'react-router-dom';
import { collection, getDocs, orderBy, query, where } from 'firebase/firestore';
import {
  Comment,
  db,
  getEventDoc,
  setCommentDoc,
  updateEventMembers,
} from '../utils/firebase';
import { AuthContext } from '../context/auth';
import type { Event } from '../types/event';
import toggleUserJoins from '../utils/toggleUserJoins';
import toggleUserFollows from '../utils/toggleUserFollows';
import Avatar from '../assets/avatar.png';
import Time from '../components/svg/Time';
import Location from '../components/svg/Location';
import { IUser } from '../types/user';

const Wrapper = styled.div`
  margin-top: 115px;
`;

const Container = styled.div`
  max-width: 1120px;
  margin: 0 auto;
  position: relative;
`;

const JoinBtn = styled.button`
  width: 120px;
  height: 50px;
  color: #fff;
  background-color: #f65858;
  font-size: 1.2rem;
  font-weight: 600;
  border: 0;
  border-radius: 6px;
  position: absolute;
  top: 15px;
  right: 20px;
  cursor: pointer;
  :hover {
    background-color: #f2c4c4;
    color: #f65858;
    border: 1.5px solid red;
  }
`;

const Title = styled.div`
  margin: 0 auto;
  font-size: 2rem;
  font-family: 'Heebo';
  font-weight: 500;
  letter-spacing: 1.2px;
`;

const Host = styled.div`
  display: flex;
  gap: 19px;
  img {
    width: 45px;
    height: 45px;
    border-radius: 50%;
    border: 1px solid #3f3f3f;
  }
`;

const HostName = styled.div`
  font-weight: 550;
`;

const MainContainer = styled.div`
  margin-top: 35px;
  display: flex;
  gap: 80px;
  img {
    width: 600px;
    height: 400px;
    border-radius: 6px;
  }
`;

const InfoWrapper = styled.div`
  font-size: 1.4rem;
  font-weight: 550;
`;

const Info = styled.div`
  margin-top: 10px;
  display: flex;
  gap: 10px;
  align-items: center;
  :first-child {
    margin-top: 0px;
  }
`;

const AttendeeContainer = styled.div`
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
`;

const MemberWrapper = styled.div`
  padding: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 0 5px #c4c0c0;
  img {
    width: 60px;
    height: 60px;
    border-radius: 50%;
  }
`;

function Member({ name, avatar }: { name: string; avatar: string }) {
  return (
    <MemberWrapper>
      <img src={avatar || Avatar} alt="member avatar" />
      <div style={{ fontSize: '1rem' }}>{name}</div>
    </MemberWrapper>
  );
}

function ShowEvent() {
  const { id } = useParams();
  const [event, setEvent] = useState<Event | null>(null);
  const [members, setMembers] = useState<(IUser | null)[]>([]);
  const [attend, setAttend] = useState(false);
  const [content, setContent] = useState('');
  const [comments, setComments] = useState<(Comment | null)[]>([]);
  const user = useContext(AuthContext);
  if (!id) return null;

  useEffect(() => {
    getEventDoc(id).then((res: Event) => {
      if (!res) return;
      setEvent(res);
      setMembers(res.members);
      let currAttend = false;
      res.members.forEach((member) => {
        if (member.uid === user?.uid) {
          currAttend = true;
        }
      });
      setAttend(currAttend);
    });
    const getEventComments = async () => {
      const commentsField = query(
        collection(db, 'comments'),
        where('eventId', '==', id),
        orderBy('createdAt', 'asc'),
      );
      const querySnapshot = await getDocs(commentsField);
      const commentsDoc = querySnapshot.docs.map((commentDoc) =>
        commentDoc.data(),
      );
      setComments(commentsDoc as []);
    };
    getEventComments();
  }, []);

  useEffect(() => {
    let currAttend = false;
    members.forEach((member) => {
      if (member!.uid === user?.uid) {
        currAttend = true;
      }
    });
    setAttend(currAttend);
  }, [user]);

  if (!event) return null;

  function toggleAttend() {
    let newMembers = [];
    if (attend) {
      newMembers = members.filter((member) => member!.uid !== user!.uid);
    } else {
      newMembers = [...members, user];
    }
    setAttend(!attend);
    return newMembers;
  }

  return (
    <Wrapper>
      <Container>
        <Title>{event.title}</Title>
        <JoinBtn
          type="button"
          onClick={() => {
            if (!user) {
              // eslint-disable-next-line no-alert
              alert('請先登入！');
              return;
            }
            const newMembers = toggleAttend();
            updateEventMembers(event.id!, { members: newMembers });
            setMembers(newMembers);
            toggleUserJoins(event.id!);
          }}
        >
          {attend ? 'Disjoin' : 'Attend'}
        </JoinBtn>
        <Host>
          <img src={event.host.avatar || Avatar} alt="avatar" />
          <div>
            Hosted by
            <HostName>{event.host.name}</HostName>
          </div>
        </Host>
        <MainContainer>
          <img src={event.mainImageUrl} alt="event sample" />
          <InfoWrapper>
            <Info>
              <Time />
              Date
              <div style={{ marginLeft: '20px' }}>
                {event.date.toDate().toDateString()}
              </div>
            </Info>
            <Info>
              <Location />
              Location
              <div style={{ marginLeft: '20px' }}>{event.location}</div>
            </Info>
            <div style={{ marginTop: '30px', marginBottom: '12px' }}>
              Attendees ({members.length})
            </div>
            <AttendeeContainer>
              {members.map((member) => (
                <Member
                  key={member!.uid}
                  name={member!.name}
                  avatar={member?.avatar || ''}
                />
              ))}
            </AttendeeContainer>
          </InfoWrapper>
        </MainContainer>

        {/* <button
          type="button"
          onClick={() => {
            toggleUserFollows(event.id!);
          }}
        >
          Follow
        </button> */}
        <div>評論內容</div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <button
          type="button"
          onClick={() => {
            if (!content) return;
            setCommentDoc({
              eventId: id,
              author: user!,
              content,
              createdAt: new Date(),
            });
            setContent('');
          }}
        >
          submit
        </button>
      </Container>
    </Wrapper>
  );
}

export default ShowEvent;

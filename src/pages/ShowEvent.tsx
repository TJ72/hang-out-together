import React, { useEffect, useState, useContext } from 'react';
import styled from 'styled-components';
import { useParams } from 'react-router-dom';
import {
  collection,
  getDocs,
  orderBy,
  query,
  where,
  Timestamp,
} from 'firebase/firestore';
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
// import toggleUserFollows from '../utils/toggleUserFollows';
import Avatar from '../assets/avatar.png';
import Time from '../components/svg/Time';
import Location from '../components/svg/Location';
import { IUser } from '../types/user';

const Wrapper = styled.div`
  padding-bottom: 50px;
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
  font-weight: 600;
  letter-spacing: 1.2px;
`;

const Host = styled.div`
  display: flex;
  gap: 19px;
  img {
    width: 45px;
    height: 45px;
    border-radius: 50%;
    border: 1px solid #b3adad;
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
  gap: 6px;
  box-shadow: 0 0 5px #c4c0c0;
  img {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    border: 1px solid #b3adad;
  }
`;

const DetailTitle = styled.div`
  width: 70%;
  padding-bottom: 7px;
  margin-top: 35px;
  margin-bottom: 20px;
  box-shadow: 0 4px 2px -2px #f65858;
  font-size: 1.4rem;
  font-weight: 550;
`;

const CommentsContainer = styled.div`
  width: 70%;
  min-width: 600px;
  margin-top: 50px;
`;

const CommentTitle = styled.div`
  padding-bottom: 7px;
  margin-bottom: 20px;
  box-shadow: 0 4px 2px -2px #f65858;
  font-size: 1.4rem;
  font-weight: 550;
`;

const TextArea = styled.div`
  display: flex;
  gap: 25px;
  img {
    width: 55px;
    height: 55px;
    border-radius: 50%;
    border: 1px solid #b3adad;
  }
  textarea {
    width: calc(100% - 150px);
    height: 100px;
    padding: 7px;
    resize: none;
    border: 1px solid #b3adad;
    border-radius: 5px;
    font-size: 1rem;
    letter-spacing: 0.7px;
    :focus {
      outline: 0 !important;
      box-shadow: 0 0 1px 1px #043957;
    }
  }
`;

const TextSubmitBtn = styled.button`
  width: 80px;
  height: 38px;
  margin-left: 80px;
  margin-top: 10px;
  border: 0;
  border-radius: 6px;
  color: #fff;
  background-color: #043957;
  font-size: 0.9rem;
  cursor: pointer;
  :hover {
    color: #043957;
    background-color: #aad7f0;
  }
`;

const CommentWrapper = styled.div`
  margin-top: 20px;
  display: flex;
  gap: 25px;
  img {
    width: 55px;
    height: 55px;
    border-radius: 50%;
    border: 1px solid #b3adad;
  }
  span {
    margin-left: 25px;
    color: #98999b;
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

type CommentProps = {
  name: string;
  avatar: string;
  content: string;
  createdAt: Timestamp;
};

function EventComment({ name, avatar, content, createdAt }: CommentProps) {
  return (
    <CommentWrapper>
      <img src={avatar || Avatar} alt="user avatar" />
      <div>
        <div style={{ fontWeight: '500' }}>
          {name} <span>{createdAt.toDate().toDateString()}</span>
        </div>
        <div style={{ marginTop: '4px', fontSize: '1.1rem' }}>{content}</div>
      </div>
    </CommentWrapper>
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
        orderBy('createdAt', 'desc'),
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
          {attend ? 'Cancel' : 'Attend'}
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
        <DetailTitle>More Detail</DetailTitle>
        {/* eslint-disable-next-line react/no-danger */}
        <div dangerouslySetInnerHTML={{ __html: event.detail }} />
        <CommentsContainer>
          <CommentTitle>Comments ({comments.length})</CommentTitle>
          <TextArea>
            <img
              src={!user || !user.avatar ? Avatar : user.avatar}
              alt="Avatar"
            />
            <textarea
              placeholder="Leave some comments"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </TextArea>
          <TextSubmitBtn
            type="button"
            onClick={() => {
              if (!content) return;
              setCommentDoc({
                eventId: id,
                author: user!,
                content,
                createdAt: Timestamp.fromDate(new Date()),
              });
              setContent('');
              setComments([
                {
                  author: user,
                  eventId: id,
                  content,
                  createdAt: Timestamp.fromDate(new Date()),
                } as Comment,
                ...comments,
              ]);
            }}
          >
            Submit
          </TextSubmitBtn>
          {comments.map((comment) => (
            <EventComment
              key={comment!.createdAt.toString()}
              name={comment!.author.name}
              createdAt={comment!.createdAt}
              avatar={comment!.author?.avatar || ''}
              content={comment!.content}
            />
          ))}
        </CommentsContainer>
      </Container>
    </Wrapper>
  );
}

export default ShowEvent;

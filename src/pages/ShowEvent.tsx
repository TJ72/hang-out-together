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
import { IUser } from '../types/user';

const Wrapper = styled.div`
  margin-top: 100px;
`;

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
      if (user) {
        setAttend(res!.members.includes(user));
      }
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

  if (!event) return null;

  function toggleAttend() {
    let newMembers = [];
    if (attend) {
      newMembers = members.filter((member) => member !== user);
    } else {
      newMembers = [...members, user];
    }
    setAttend(!attend);
    return newMembers;
  }

  return (
    <Wrapper>
      <div>{event.title}</div>
      <div>{event.type}</div>
      <div>
        {/* {event.host?.avatar} */}
        {event.host.name}
      </div>
      <img
        style={{ width: '300px', height: '200px' }}
        src={event.mainImageUrl}
        alt="event sample"
      />
      <button
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
        {attend ? '退出' : '加入'}
      </button>
      <button
        type="button"
        onClick={() => {
          toggleUserFollows(event.id!);
        }}
      >
        Follow
      </button>
      <div>評論內容</div>
      <textarea value={content} onChange={(e) => setContent(e.target.value)} />
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
    </Wrapper>
  );
}

export default ShowEvent;

import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  auth,
  getEventDoc,
  setCommentDoc,
  updateEventMembers,
} from '../utils/firebase';
import type { Event } from '../types/event';
import toggleUserJoins from '../utils/toggleUserJoins';
import toggleUserFollows from '../utils/toggleUserFollows';

function ShowEvent() {
  const { id } = useParams();
  const [event, setEvent] = useState<Event | null>(null);
  const [members, setMembers] = useState([] as string[]);
  const [attend, setAttend] = useState(false);
  const [content, setContent] = useState('');
  const user = auth.currentUser;
  if (!id) return null;

  useEffect(() => {
    getEventDoc(id).then((res: Event) => {
      if (!res) return;
      setEvent(res);
      setMembers(res!.members);
      if (user) {
        setAttend(res!.members.includes(user.uid));
      }
    });
  }, []);

  if (!event) return null;

  function toggleAttend() {
    let newMembers = [];
    if (attend) {
      newMembers = members.filter((member) => member !== user?.uid);
    } else {
      newMembers = [...members, user!.uid];
    }
    setAttend(!attend);
    return newMembers;
  }

  return (
    <>
      <div>{event.title}</div>
      <div>{event.type}</div>
      <div>{event.host}</div>
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
          setCommentDoc({
            eventId: id,
            author: user!.uid,
            content,
            createdAt: new Date(),
          });
        }}
      >
        submit
      </button>
    </>
  );
}

export default ShowEvent;

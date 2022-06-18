import React, { useEffect, useState } from 'react';
import {
  getEventDoc,
  setCommentDoc,
  updateEventMembers,
} from '../utils/firebase';
import type { Event } from '../types/event';
import toggleUserJoins from '../utils/toggleUserJoins';
import toggleUserFollows from '../utils/toggleUserFollow';

function ShowEvent() {
  const [event, setEvent] = useState<Event | null>(null);
  const [members, setMembers] = useState([] as string[]);
  const [attend, setAttend] = useState(false);
  const [content, setContent] = useState('');
  // user join list

  useEffect(() => {
    getEventDoc('YGZ94uRN6kDRcMpT7ysA').then((res: Event) => {
      if (!res) return;
      setEvent(res);
      setMembers(res!.members);
      setAttend(res!.members.includes('Andy'));
    });
  }, []);

  if (!event) return null;

  function toggleAttend() {
    let newMembers = [];
    if (attend) {
      newMembers = members.filter((member) => member !== 'Andy');
    } else {
      newMembers = [...members, 'Andy'];
    }
    setAttend(!attend);
    return newMembers;
  }

  return (
    <>
      <div>{event.title}</div>
      <div>{event.type}</div>
      <div>{event.host}</div>
      <button
        type="button"
        onClick={() => {
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
            eventId: 'YGZ94uRN6kDRcMpT7ysA',
            author: 'Andy',
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

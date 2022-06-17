import React, { useEffect, useState } from 'react';
import { getDocData, setCommentDoc, joinEvent } from '../utils/firebase';

function ShowEvent() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [members, setMembers] = useState([]);
  const [content, setContent] = useState('');
  useEffect(() => {
    getDocData('events', 'YGZ94uRN6kDRcMpT7ysA').then((event) => {
      setMembers(event!.members);
    });
  }, []);
  return (
    <>
      <button
        type="button"
        onClick={() => {
          const newMembers = [...members, 'uid'];
          joinEvent('YGZ94uRN6kDRcMpT7ysA', { members: newMembers });
        }}
      >
        Join
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

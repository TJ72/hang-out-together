import React, { useEffect, useState } from 'react';
import { getDocData, setCommentDoc, updateJoinEvent } from '../utils/firebase';

function ShowEvent() {
  const [members, setMembers] = useState([] as string[]);
  const [attend, setAttend] = useState(false);
  const [content, setContent] = useState('');
  useEffect(() => {
    getDocData('events', 'YGZ94uRN6kDRcMpT7ysA').then((event) => {
      setMembers(event!.members);
    });
  }, []);
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
      <button
        type="button"
        onClick={() => {
          const newMembers = toggleAttend();
          updateJoinEvent('YGZ94uRN6kDRcMpT7ysA', { members: newMembers });
          setMembers(newMembers);
        }}
      >
        {attend ? `退出` : '加入'}
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

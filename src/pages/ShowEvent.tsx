import React, { useState } from 'react';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { setCommentDoc } from '../utils/firebase';

function ShowEvent() {
  const [content, setContent] = useState('');
  return (
    <>
      <button type="button">Join</button>
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

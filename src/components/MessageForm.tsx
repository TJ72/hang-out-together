import React from 'react';
import Attachment from './svg/Attachment';

type FormProps = {
  handleSubmit: Function;
  text: string;
  setText: Function;
};

function MessageForm({ handleSubmit, text, setText }: FormProps) {
  return (
    <form className="message_form">
      <div>
        <Attachment />
      </div>
      <input
        type="file"
        id="img"
        accept="image/*"
        style={{ display: 'none' }}
      />
      <div>
        <input
          type="text"
          placeholder="Enter message"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSubmit(e);
            }
          }}
        />
      </div>
      <div>
        <button type="button" className="btn" onClick={(e) => handleSubmit(e)}>
          Send
        </button>
      </div>
    </form>
  );
}

export default MessageForm;

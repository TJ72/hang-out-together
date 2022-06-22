import React from 'react';
import Attachment from './svg/Attachment';

type FormProps = {
  handleSubmit: Function;
  text: string;
  setText: Function;
  setImg: Function;
};

function MessageForm({ handleSubmit, text, setText, setImg }: FormProps) {
  return (
    <form className="message_form" onSubmit={(e) => handleSubmit(e)}>
      <label htmlFor="img">
        <Attachment />
        <input
          onChange={(e) => setImg(e.target.files![0])}
          type="file"
          id="img"
          accept="image/*"
          style={{ display: 'none' }}
        />
      </label>
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
        <button type="button" className="btn">
          Send
        </button>
      </div>
    </form>
  );
}

export default MessageForm;

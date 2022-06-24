import React from 'react';
import Attachment from './svg/Attachment';

type FormProps = {
  handleSubmit: Function;
  text: string;
  img: File | undefined;
  setText: Function;
  setImg: Function;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function MessageForm({ handleSubmit, text, setText, img, setImg }: FormProps) {
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
            // eslint-disable-next-line no-constant-condition
            if (e.key === 'Enter') {
              e.preventDefault();
              if (!text && !img) return;
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

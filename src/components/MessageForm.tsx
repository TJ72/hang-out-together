import React from 'react';
import Attachment from './svg/Attachment';

type FormProps = {
  handleSubmit: Function;
  text: string;
  loading: boolean;
  img: File | undefined;
  setText: Function;
  setImg: Function;
  setLoading: Function;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function MessageForm({
  handleSubmit,
  text,
  setText,
  img,
  setImg,
  loading,
  setLoading,
}: FormProps) {
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
          placeholder="Aa"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            // eslint-disable-next-line no-constant-condition
            if (e.key === 'Enter') {
              e.preventDefault();
              if (!text && !img) return;
              if (loading) return;
              setLoading(true);
              handleSubmit(e);
            }
          }}
        />
      </div>
      <div>
        <button
          type="button"
          className="btn"
          onClick={(e) => {
            if (!text && !img) return;
            if (loading) return;
            setLoading(true);
            handleSubmit(e);
          }}
        >
          Send
        </button>
      </div>
    </form>
  );
}

export default MessageForm;

import React from 'react';

function Remove({ removeUploadImage }: { removeUploadImage: Function }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      style={{
        width: '24px',
        height: '24px',
        cursor: 'pointer',
        zIndex: '100',
        position: 'absolute',
        top: '-3px',
        right: '-5px',
      }}
      onClick={() => removeUploadImage()}
      className="h-6 w-6"
      fill="none"
      viewBox="0 0 24 24"
      stroke="#f54545"
      strokeWidth="2"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

export default Remove;

import React, { useState } from 'react';
import { setEventDoc, uploadImageToFirebase } from '../utils/firebase';

function CreateEvent() {
  const [title, setTitle] = useState('');
  const [host, setHost] = useState('');
  const [location, setLocation] = useState('');
  const [mainImage, setMainImage] = useState<File | null>(null);
  return (
    <>
      <div>Title</div>
      <input value={title} onChange={(e) => setTitle(e.target.value)} />
      <div>Host</div>
      <input value={host} onChange={(e) => setHost(e.target.value)} />
      <div>Location</div>
      <input value={location} onChange={(e) => setLocation(e.target.value)} />
      <div>Main Image</div>
      <input
        type="file"
        onChange={(e) => {
          setMainImage(e.target.files![0]);
        }}
      />
      <button
        type="button"
        onClick={() => {
          uploadImageToFirebase(mainImage)?.then((res) =>
            setEventDoc({
              title,
              host,
              createdAt: new Date(),
              location,
              main_image: res,
              members: [],
            }),
          );
        }}
      >
        submit
      </button>
    </>
  );
}

export default CreateEvent;

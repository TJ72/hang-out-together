import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  collection,
  getDoc,
  setDoc,
} from 'firebase/firestore';
import {
  getStorage,
  uploadBytesResumable,
  getDownloadURL,
  ref,
} from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTHDOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

interface Event {
  title: string;
  host: string;
  createdAt: Date;
  location: string;
  main_image?: string;
  members: Array<string>;
  // images: Array<string>;
  // details: string;
  // deadline: Date;
}

export async function getDocData(collectionName: string, docId: string) {
  const docRef = doc(db, collectionName, docId);
  const docSnap = await getDoc(docRef);

  return docSnap.data();
}

export async function setEventDoc(data: Event) {
  const eventRef = doc(collection(db, 'events'));
  await setDoc(eventRef, { ...data, id: eventRef.id });
  return '成功';
}

export function uploadImageToFirebase(
  file: File | null,
): Promise<string> | null {
  if (file === null) return null;
  return new Promise((resolve, reject) => {
    const metadata = {
      contentType: file.type,
    };
    const fileRef = ref(storage, `images/${file.name}`);
    const uploadTask = uploadBytesResumable(fileRef, file, metadata);
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        console.log(snapshot.state);
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log(`Upload is ${progress}% done`);
      },
      (error) => {
        console.error(error);
        reject(error);
      },
      async () => {
        const data = await getDownloadURL(uploadTask.snapshot.ref);
        resolve(data);
      },
    );
  });
}

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import {
  getFirestore,
  doc,
  collection,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  onSnapshot,
} from 'firebase/firestore';
import {
  getStorage,
  uploadBytesResumable,
  getDownloadURL,
  ref,
} from 'firebase/storage';
import type { Event } from '../types/event';
import type { Room } from '../types/room';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTHDOMAIN,
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
const storage = getStorage(app);
export const auth = getAuth(app);

interface Comment {
  eventId: string;
  author: string;
  content: string;
  createdAt: Date;
  updatedAt?: Date;
}

export async function getEventDoc(docId: string) {
  const docRef = doc(db, 'events', docId);
  const docSnap = await getDoc(docRef);
  return docSnap.data() as Event;
}

export async function setEventDoc(data: Event) {
  const eventRef = doc(collection(db, 'events'));
  await setDoc(eventRef, { ...data, id: eventRef.id });
}

export async function updateEventMembers(
  docId: string,
  data: { members: Array<string> },
) {
  const docRef = doc(db, 'events', docId);
  await updateDoc(docRef, data);
}

export async function setCommentDoc(data: Comment) {
  const commentRef = doc(collection(db, 'comments'));
  await setDoc(commentRef, data);
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

export async function getUserInfo(uid: string) {
  const userRef = doc(db, 'users', uid);
  const docSnap = await getDoc(userRef);
  return docSnap.data();
}

export async function updateUserJoins(
  uid: string,
  data: (string | undefined)[],
) {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, { joins: data });
}

export async function updateUserFollows(
  uid: string,
  data: (string | undefined)[],
) {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, { follows: data });
}

// chatroom
export async function getUserChatRooms(uid: string) {
  const fields = query(
    collection(db, 'rooms'),
    where('uids', 'array-contains', uid),
  );
  const querySnapshot = await getDocs(fields);
  const rooms = querySnapshot.docs.map((roomDoc) => roomDoc.data() as Room);
  return rooms;
}

export function listenToDocument() {
  const q = query(collection(db, 'rooms'));
  const unsubscribe = onSnapshot(q, (snapshot) => {
    snapshot.docChanges().forEach((change) => {
      if (change.type === 'added') {
        console.log('New post:', change.doc.data());
      }
      if (change.type === 'modified') {
        console.log('Modified post:', change.doc.data());
      }
      if (change.type === 'removed') {
        console.log('Removed post:', change.doc.data());
      }
    });
  });
  return unsubscribe;
}

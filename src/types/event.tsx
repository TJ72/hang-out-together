import { Timestamp } from 'firebase/firestore';

export interface Event {
  id?: string;
  title: string;
  type: string;
  host: string;
  date: Timestamp;
  createdAt: Timestamp;
  location: string;
  mainImageUrl: string;
  members: string[];
  detail: string;
}

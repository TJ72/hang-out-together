import { Timestamp } from 'firebase/firestore';
import { IUser } from './user';

export interface Event {
  id?: string;
  title: string;
  type: string;
  host: IUser;
  date: Timestamp;
  createdAt: Timestamp;
  location: string;
  mainImageUrl: string;
  members: IUser[];
  detail: string;
}

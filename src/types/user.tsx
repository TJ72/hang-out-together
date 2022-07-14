import { Timestamp } from 'firebase/firestore';
import type { Event } from './event';

export interface IUser {
  createdAt: Timestamp;
  email: string;
  follows: Event[];
  isOnline: boolean;
  joins: [];
  name: string;
  uid: string;
  avatar?: string;
}

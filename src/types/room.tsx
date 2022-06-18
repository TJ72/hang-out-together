import type { Message } from './message';

export interface Room {
  messages: Message[];
  uid: string[];
}

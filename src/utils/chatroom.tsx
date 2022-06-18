import { getUserChatRooms } from './firebase';

export default async function displayRooms() {
  const uid = window.localStorage.getItem('uid');
  const rooms = await getUserChatRooms(uid!);
  return rooms;
}

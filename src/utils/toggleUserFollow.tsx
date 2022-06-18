import { updateUserFollows } from './firebase';

export default function toggleUserFollows(eventId: string) {
  const uid = window.localStorage.getItem('uid');
  if (!uid) {
    alert('請先登入');
    return;
  }
  const userFollows = JSON.parse(
    window.localStorage.getItem('follows') || '[]',
  );
  let newUserFollows: (string | undefined)[] = [];
  if (userFollows.includes(eventId)) {
    newUserFollows = userFollows.filter((join: string) => join !== eventId);
  } else {
    newUserFollows = [...userFollows, eventId];
  }
  window.localStorage.setItem('follows', JSON.stringify(newUserFollows));
  updateUserFollows(uid, newUserFollows);
}

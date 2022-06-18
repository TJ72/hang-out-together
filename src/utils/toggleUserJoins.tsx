import { updateUserJoins } from './firebase';

export default function toggleUserJoins(eventId: string) {
  const uid = window.localStorage.getItem('uid');
  if (!uid) {
    alert('請先登入');
    return;
  }
  const userJoins = JSON.parse(window.localStorage.getItem('joins') || '[]');
  let newUserJoins: (string | undefined)[] = [];
  if (userJoins.includes(eventId)) {
    newUserJoins = userJoins.filter((join: string) => join !== eventId);
  } else {
    newUserJoins = [...userJoins, eventId];
  }
  window.localStorage.setItem('joins', JSON.stringify(newUserJoins));
  updateUserJoins(uid, newUserJoins);
}

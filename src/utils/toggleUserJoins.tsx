import { auth, getUserInfo, updateUserJoins } from './firebase';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default async function toggleUserJoins(eventId: string) {
  const user = auth.currentUser!.uid;
  if (!user) {
    // eslint-disable-next-line no-alert
    alert('請先登入');
    return;
  }
  const prevJoins = await getUserInfo(user).then((res) => res!.joins);
  let currJoins: (string | undefined)[] = [];
  if (prevJoins.includes(eventId)) {
    currJoins = prevJoins.filter((join: string) => join !== eventId);
  } else {
    currJoins = [...prevJoins, eventId];
  }
  updateUserJoins(user, currJoins);
}

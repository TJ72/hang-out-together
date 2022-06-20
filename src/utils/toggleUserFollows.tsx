import { auth, getUserInfo, updateUserFollows } from './firebase';

export default async function toggleUserFollows(eventId: string) {
  const user = auth.currentUser!.uid;
  if (!user) {
    // eslint-disable-next-line no-alert
    alert('請先登入');
    return;
  }
  const prevFollows = await getUserInfo(user).then((res) => res!.follows);
  let currFollows: (string | undefined)[] = [];
  if (prevFollows.includes(eventId)) {
    currFollows = prevFollows.filter((join: string) => join !== eventId);
  } else {
    currFollows = [...prevFollows, eventId];
  }
  updateUserFollows(user, currFollows);
}

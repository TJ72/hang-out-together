import { Timestamp } from 'firebase/firestore';
import { IUser } from '../types/user';
import { auth, getUserInfo, updateUserJoins } from './firebase';

export interface IJoin {
  id: string;
  title: string;
  date: Timestamp;
  mainImageUrl: string;
  type: string;
  host: IUser;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default async function toggleUserJoins(eventData: IJoin) {
  const user = auth.currentUser!.uid;
  if (!user) {
    // eslint-disable-next-line no-alert
    alert('請先登入');
    return;
  }
  const prevJoins = await getUserInfo(user).then((res) => res!.joins);
  const currJoins: (IJoin | undefined)[] = [];
  let isToggled = false;
  prevJoins.forEach((join: IJoin) => {
    if (join.id === eventData.id) {
      isToggled = true;
    } else {
      currJoins.push(join);
    }
  });
  if (!isToggled) {
    currJoins.push(eventData);
  }
  updateUserJoins(user, currJoins);
}

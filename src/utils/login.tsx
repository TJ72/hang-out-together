import { getUserInfo } from './firebase';

export default function login() {
  getUserInfo('T2LR8pBWginrGE31E2UP').then((res) => {
    window.localStorage.setItem('uid', res!.uid);
    window.localStorage.setItem('name', res!.name);
    window.localStorage.setItem('mail', res!.mail);
    window.localStorage.setItem('joins', JSON.stringify(res!.joins));
    window.localStorage.setItem('follows', JSON.stringify(res!.follows));
  });
}

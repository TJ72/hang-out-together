import React, { createContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import type { NextOrObserver, User } from 'firebase/auth';
import { getDoc, doc } from 'firebase/firestore';
import { db, auth } from '../utils/firebase';
import type { IUser } from '../types/user';
import Loading from '../components/Loading';

export const AuthContext = createContext<IUser | null>(null);

function AuthProvider({ children }: { children: JSX.Element }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState<IUser | null>(null);

  useEffect(() => {
    function HandleLogIn(users: User) {
      setUser(users);
      setLoading(false);
    }
    onAuthStateChanged(auth, HandleLogIn as NextOrObserver<User>);
  }, []);

  useEffect(() => {
    if (!user) return;
    const getUserInfo = async () => {
      await getDoc(doc(db, 'users', user!.uid)).then((docSnap) =>
        setUserInfo(docSnap.data() as IUser),
      );
    };
    getUserInfo();
  }, [user]);

  if (loading) {
    return <Loading />;
  }
  return (
    <AuthContext.Provider value={userInfo}>{children}</AuthContext.Provider>
  );
}

export default AuthProvider;

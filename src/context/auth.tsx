import React, { createContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import type { NextOrObserver, User } from 'firebase/auth';
import { getDoc, doc } from 'firebase/firestore';
import { db, auth } from '../utils/firebase';
import type { IUser } from '../types/user';
import Loading from '../components/Loading';

export const AuthContext = createContext<IUser | null>(null);

function AuthProvider({ children }: { children: JSX.Element }) {
  const [user, setUser] = useState<IUser | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const getUserInfo = async (currUser: User) => {
      getDoc(doc(db, 'users', currUser.uid)).then((docSnap) => {
        if (docSnap.exists()) {
          setUser(docSnap.data() as IUser);
          setLoading(false);
        }
      });
    };
    onAuthStateChanged(auth, getUserInfo as NextOrObserver<User>);
  }, []);
  if (loading) {
    return <Loading />;
  }
  return <AuthContext.Provider value={user}>{children}</AuthContext.Provider>;
}

export default AuthProvider;

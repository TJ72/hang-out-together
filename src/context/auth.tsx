import React, { createContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import type { User, NextOrObserver } from 'firebase/auth';
import { auth } from '../utils/firebase';
import Loading from '../components/Loading';

export const AuthContext = createContext<User | null>(null);

function AuthProvider({ children }: { children: JSX.Element }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    function test(users: User) {
      setUser(users);
      setLoading(false);
    }
    onAuthStateChanged(auth, test as NextOrObserver<User>);
  }, []);
  if (loading) {
    return <Loading />;
  }
  return <AuthContext.Provider value={user}>{children}</AuthContext.Provider>;
}

export default AuthProvider;

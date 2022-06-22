import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { setDoc, doc, Timestamp } from 'firebase/firestore';
import { auth, db } from '../utils/firebase';

interface Data {
  name: string;
  email: string;
  password: string;
  error: null | string;
  loading: boolean;
}

function Register() {
  const [data, setData] = useState<Data>({
    name: '',
    email: '',
    password: '',
    error: null,
    loading: false,
  });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { name, email, password, error, loading } = data;
  const handleChange = (e: { target: { name: any; value: any } }) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setData({ ...data, error: null, loading: true });
    if (!name || !email || !password) {
      setData({ ...data, error: 'All fields are required' });
    }
    try {
      const result = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      await setDoc(doc(db, 'users', result.user.uid), {
        uid: result.user.uid,
        name,
        email,
        createdAt: Timestamp.fromDate(new Date()),
        isOnline: true,
        joins: [],
        follows: [],
      });
      setData({
        name: '',
        email: '',
        password: '',
        error: null,
        loading: false,
      });
    } catch (err: any) {
      setData({ ...data, error: err.message, loading: false });
    }
  };
  return (
    <section>
      <h3>Create An Account</h3>
      <div>
        <div className="input_container">
          <div>Name</div>
          <input type="text" name="name" value={name} onChange={handleChange} />
          <div>Email</div>
          <input
            type="text"
            name="email"
            value={email}
            onChange={handleChange}
          />
          <div>Password</div>
          <input
            type="password"
            name="password"
            value={password}
            onChange={handleChange}
          />
        </div>
        <button type="button" onClick={handleSubmit}>
          {loading ? 'Creating ...' : 'Register'}
        </button>
        {error && <p>{error}</p>}
      </div>
    </section>
  );
}

export default Register;

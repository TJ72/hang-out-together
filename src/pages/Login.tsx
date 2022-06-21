import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { updateDoc, doc } from 'firebase/firestore';
import { auth, db } from '../utils/firebase';

interface Data {
  email: string;
  password: string;
  error: null | string;
  loading: boolean;
}

function Login() {
  const [data, setData] = useState<Data>({
    email: '',
    password: '',
    error: null,
    loading: false,
  });
  const navigate = useNavigate();

  const { email, password, error, loading } = data;
  const handleChange = (e: { target: { name: any; value: any } }) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setData({ ...data, error: null, loading: true });
    if (!email || !password) {
      setData({ ...data, error: 'All fields are required' });
    }
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      await updateDoc(doc(db, 'users', result.user.uid), {
        isOnline: true,
      });
      setData({
        email: '',
        password: '',
        error: null,
        loading: false,
      });
      navigate('../', { replace: true });
    } catch (err: any) {
      setData({ ...data, error: err.message, loading: false });
    }
  };
  return (
    <section>
      <h3>Log into Your Account</h3>
      <div>
        <div className="input_container">
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
          {loading ? 'Logging in...' : 'Login'}
        </button>
        {error && <p>{error}</p>}
      </div>
    </section>
  );
}

export default Login;

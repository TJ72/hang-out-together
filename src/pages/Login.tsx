import React, { useState } from 'react';
import styled from 'styled-components';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { updateDoc, doc } from 'firebase/firestore';
import { auth, db } from '../utils/firebase';
import LoginCover from '../assets/login.jpg';

const Wrapper = styled.div`
  margin-top: 85px;
  width: 100%;
  height: calc(100vh - 85px);
  display: flex;
`;

const Banner = styled.div`
  width: 35%;
  height: 100%;
  background: url(${LoginCover}) no-repeat center center;
  background-size: cover;
  background-position: 50%;
  opacity: 0.7;
`;

const LoginForm = styled.div`
  width: 40%;
  margin-top: 8%;
  margin-left: 13%;
`;

const InputContainer = styled.div`
  margin-top: 20px;
  div {
    font-size: 1.17rem;
    font-weight: 550;
  }
  input {
    width: 60%;
    height: 28px;
    padding-left: 6px;
    margin-top: 10px;
    margin-bottom: 10px;
    border: none;
    outline: 0 !important;
    background-color: #f0f2f5;
    border-radius: 10px;
    font-size: 1rem;
    letter-spacing: 0.7px;
  }
`;

const LoginBtn = styled.button`
  width: 150px;
  height: 50px;
  margin-top: 15px;
  border: none;
  cursor: pointer;
  font-size: 1.2rem;
  font-weight: 550;
  color: #fff;
  background-color: #f54545;
  border-radius: 10px;
  &:hover {
    background-color: #e33b3b;
  }
`;

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
    <Wrapper>
      <Banner />
      <LoginForm>
        <h2 style={{ letterSpacing: '0.6px' }}>Log in</h2>
        <h3>
          Not a member yet?{' '}
          <span>
            <Link style={{ color: 'rgb(0 130 148)' }} to="/register">
              Sign up
            </Link>
          </span>
        </h3>
        <div>
          <InputContainer>
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
          </InputContainer>
          <LoginBtn type="button" onClick={handleSubmit}>
            {loading ? 'Logging in...' : 'Login'}
          </LoginBtn>
          {error && <p>{error}</p>}
        </div>
      </LoginForm>
    </Wrapper>
  );
}

export default Login;

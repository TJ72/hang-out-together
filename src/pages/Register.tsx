import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { setDoc, doc, Timestamp } from 'firebase/firestore';
import { auth, db } from '../utils/firebase';
import RegisterCover from '../assets/regiser.jpg';

interface Data {
  name: string;
  email: string;
  password: string;
  error: null | string;
  loading: boolean;
}

const Wrapper = styled.div`
  margin-top: 85px;
  width: 100%;
  height: calc(100vh - 85px);
  display: flex;
  justify-content: space-between;
`;

const RegisterForm = styled.div`
  width: 40%;
  margin-top: 8%;
  margin-left: 20%;
`;

const Banner = styled.div`
  width: 35%;
  height: 100%;
  background: url(${RegisterCover}) no-repeat center center;
  background-size: cover;
  background-position: 50%;
  opacity: 0.7;
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

const RegisterBtn = styled.button`
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
    <Wrapper>
      <RegisterForm>
        <h2 style={{ letterSpacing: '0.6px' }}>Sign up</h2>
        <h3>
          Already a member?{' '}
          <span>
            <Link style={{ color: 'rgb(0 130 148)' }} to="/login">
              Log in
            </Link>
          </span>
        </h3>
        <InputContainer>
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
        </InputContainer>
        <RegisterBtn type="button" onClick={handleSubmit}>
          {loading ? 'Creating ...' : 'Register'}
        </RegisterBtn>
        {error && <p>{error}</p>}
      </RegisterForm>
      <Banner />
    </Wrapper>
  );
}

export default Register;

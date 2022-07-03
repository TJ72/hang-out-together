// eslint-disable-next-line @typescript-eslint/no-unused-vars
import React, { useContext } from 'react';
import styled from 'styled-components';
import { Link, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { updateDoc, doc } from 'firebase/firestore';
import { auth, db } from '../utils/firebase';
import { AuthContext } from '../context/auth';

const Wrapper = styled.nav`
  height: 90px;
  padding: 0px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 1.5px 1px #b3afaf;
`;

const Logo = styled.div`
  font-size: 2.5rem;
  font-family: 'Kaushan Script';
  color: #ed3472;
`;

function Navbar() {
  const navigate = useNavigate();
  const user = useContext(AuthContext);

  const handleSignOut = async () => {
    await updateDoc(doc(db, 'users', auth.currentUser!.uid), {
      isOnline: false,
    });
    await signOut(auth);
    navigate('/login', { replace: true });
  };
  return (
    <Wrapper>
      <h3>
        <Link to="/">
          <Logo>Hang Out Together</Logo>
        </Link>
      </h3>
      <div>
        {user ? (
          <>
            <Link to="/profile">Profile</Link>
            <button type="button" className="btn" onClick={handleSignOut}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/register">Register</Link>
            <Link to="/login">Login</Link>
          </>
        )}
      </div>
    </Wrapper>
  );
}

export default Navbar;

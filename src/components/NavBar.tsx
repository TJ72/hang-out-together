import React from 'react';
import styled from 'styled-components';
import { Link, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { updateDoc, doc } from 'firebase/firestore';
import { auth, db } from '../utils/firebase';

const Wrapper = styled.nav`
  width: 100%;
  height: 85px;
  padding: 0px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: fixed;
  top: 0;
  box-shadow: 0 0 5px #c4c0c0;
  background-color: #fff;
  z-index: 10;
`;

const Logo = styled.div`
  font-size: 2.5rem;
  font-family: 'Kaushan Script';
  color: #f0165f;
`;

const NavItems = styled.div`
  display: flex;
`;

const NavItem = styled.div`
  margin-left: 10px;
  position: relative;
  font-family: 'Inter';
  font-size: 1.2rem;
  font-weight: 600;
  color: #043957;
  cursor: pointer;
  :after {
    content: '';
    width: 0;
    height: 3.5px;
    display: block;
    position: absolute;
    right: 0;
    transition: 0.4s;
    background-color: #5290b3;
  }
  :hover:after {
    width: 100%;
    left: 0;
  }
`;

function Navbar() {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await updateDoc(doc(db, 'users', auth.currentUser!.uid), {
      isOnline: false,
    });
    await signOut(auth);

    navigate('/', { replace: true });
  };
  return (
    <Wrapper>
      <h3>
        <Link to="/">
          <Logo>Hang Out Together</Logo>
        </Link>
      </h3>
      <div>
        {auth.currentUser ? (
          <NavItems>
            <Link to="/profile">
              <NavItem>Profile</NavItem>
            </Link>
            <Link to="/messages">
              <NavItem>Message</NavItem>
            </Link>
            <NavItem onClick={handleSignOut}>Log out</NavItem>
          </NavItems>
        ) : (
          <NavItems>
            <Link to="/register">
              <NavItem>Register</NavItem>
            </Link>
            <Link to="/login">
              <NavItem>Log in</NavItem>
            </Link>
          </NavItems>
        )}
      </div>
    </Wrapper>
  );
}

export default Navbar;

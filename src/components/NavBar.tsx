// eslint-disable-next-line @typescript-eslint/no-unused-vars
import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { updateDoc, doc } from 'firebase/firestore';
import { auth, db } from '../utils/firebase';
import { AuthContext } from '../context/auth';

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
    <nav>
      <h3>
        <Link to="/">Hang Out Together</Link>
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
    </nav>
  );
}

export default Navbar;

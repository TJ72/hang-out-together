import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import CreateEvent from './pages/CreateEvent';
import ShowEvent from './pages/ShowEvent';
import Register from './pages/Register';
import Login from './pages/Login';
import Profile from './pages/Profile';
import Messenger from './pages/Messenger';
import Stream from './pages/Stream';
import GroupVideo from './pages/GroupVideo';
import AuthProvider from './context/auth';
import Navbar from './components/NavBar';
import './App.css';

function App() {
  return (
    <div className="App">
      <AuthProvider>
        <BrowserRouter>
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/messages" element={<Messenger />} />
            <Route path="/create" element={<CreateEvent />} />
            <Route path="/event/:id" element={<ShowEvent />} />
            <Route path="/stream" element={<Stream />} />
            <Route path="/video/:topic" element={<GroupVideo />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </div>
  );
}

export default App;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import React, { useState, useEffect, useContext } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import CreateEvent from './pages/CreateEvent';
import ShowEvent from './pages/ShowEvent';
import Register from './pages/Register';
import Login from './pages/Login';
import Profile from './pages/Profile';
import Messenger from './pages/Messenger';
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
            <Route path="/" element={<div>Home</div>} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/messages" element={<Messenger />} />
            <Route path="/create" element={<CreateEvent />} />
            <Route path="/event/:id" element={<ShowEvent />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </div>
  );
}

export default App;

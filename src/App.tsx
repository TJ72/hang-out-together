// eslint-disable-next-line @typescript-eslint/no-unused-vars
import React, { useState, useEffect, useContext } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import CreateEvent from './pages/CreateEvent';
import ShowEvent from './pages/ShowEvent';
import Register from './pages/Register';
import Login from './pages/Login';
import Messenger from './pages/Messenger';
// import AuthProvider, { AuthContext } from './context/auth';
import Navbar from './components/NavBar';
import './App.css';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<div>Home</div>} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/messages" element={<Messenger />} />
          <Route path="/create" element={<CreateEvent />} />
          <Route path="/event/:id" element={<ShowEvent />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;

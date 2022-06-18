import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CreateEvent from './pages/CreateEvent';
import ShowEvent from './pages/ShowEvent';
import Register from './pages/Register';
import './App.css';
import login from './utils/login';
import displayRooms from './utils/chatroom';
import type { Room } from './types/room';

function App() {
  const [chatRooms, setChatRooms] = useState<Room[]>([]);
  useEffect(() => {
    login();
    const getAllChatRoom = async () => {
      const rooms = await displayRooms();
      if (!rooms) return;
      setChatRooms(rooms);
    };
    getAllChatRoom();
  }, []);
  console.log(chatRooms);
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<div>Home</div>} />
          <Route path="/register" element={<Register />} />
          <Route path="/create" element={<CreateEvent />} />
          <Route path="/event/:id" element={<ShowEvent />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;

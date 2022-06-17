import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CreateEvent from './pages/CreateEvent';
import './App.css';
import ShowEvent from './pages/ShowEvent';

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" />
          <Route path="/create" element={<CreateEvent />} />
          <Route path="/event" element={<ShowEvent />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import './App.css';
import ChatLayout from './components/ChatLaylout';
import HomePage from './components/HomePage';
import Login from './components/Login';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<Login />} />
      <Route
        path="/chat"
        element={
          <ProtectedRoute>
            <ChatLayout />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;

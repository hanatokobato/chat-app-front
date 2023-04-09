import React, { useContext } from 'react';
import { Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Header from './Header';

const RootLayout = () => {
  const { currentUser } = useContext(AuthContext);
  return (
    <div className="app-container">
      <Header />
      <div className="content">
        <Outlet />
      </div>
    </div>
  );
};

export default RootLayout;

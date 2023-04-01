import React, { useContext } from 'react';
import { Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const RootLayout = () => {
  const { currentUser } = useContext(AuthContext);
  return (
    <div className="h-100 app-container">
      <div className="h-100 container position-relative chat-container">
        {currentUser && (
          <div className="app-header clearfix">
            <h2 className="text-white">Realtime Chat App</h2>
            <div className="btn-logout float-right">
              <a className="btn btn-danger" href="/logout">
                Logout
              </a>
            </div>
          </div>
        )}
        <Outlet />
      </div>
    </div>
  );
};

export default RootLayout;

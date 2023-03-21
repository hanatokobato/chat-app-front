import React, { useContext } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './App.css';
import AppError from './components/AppError';
import ChatLayout from './components/ChatLaylout';
import Home from './components/Home';
import Login from './components/Login';
import { action as loginAction } from './components/Login';
import RootLayout from './components/RootLayout';
import { AuthContext } from './context/AuthContext';
import { checkAuthLoader } from './utils/auth';

function App() {
  const { login } = useContext(AuthContext);

  const router = createBrowserRouter([
    {
      path: '/',
      element: <RootLayout />,
      errorElement: <AppError />,
      children: [
        {
          index: true,
          element: <Home />,
        },
        {
          path: '/login',
          element: <Login />,
          action: loginAction({ login }),
        },
        {
          path: '/chat',
          element: <ChatLayout />,
          loader: checkAuthLoader,
        },
      ],
    },
  ]);

  return <RouterProvider router={router} />;
}

export default App;

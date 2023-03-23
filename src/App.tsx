import React, { useContext } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './App.scss';
import AppError from './components/AppError';
import ChatLayout from './components/ChatLaylout';
import Home from './components/Home';
import Login from './components/Login';
import { action as loginAction } from './components/Login';
import { action as signupAction } from './components/Signup';
import RootLayout from './components/RootLayout';
import Signup from './components/Signup';
import { AuthContext } from './context/AuthContext';
import { checkAuthLoader } from './utils/auth';
import ChatRooms from './components/ChatRooms';
import Room from './components/Room';

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
          path: '/signup',
          element: <Signup />,
          action: signupAction({ login }),
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
        {
          path: '/rooms',
          element: <ChatRooms />,
          loader: checkAuthLoader,
        },
        {
          path: '/rooms/:id',
          element: <Room />,
          loader: checkAuthLoader,
        },
      ],
    },
  ]);

  return <RouterProvider router={router} />;
}

export default App;

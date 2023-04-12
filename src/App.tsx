import React, { useContext } from 'react';
import {
  createBrowserRouter,
  redirect,
  RouterProvider,
} from 'react-router-dom';
import AppError from './components/AppError';
import ChatLayout from './components/ChatLaylout';
import Home from './components/Home';
import Login from './components/Login';
import { action as loginAction } from './components/Login';
import { action as signupAction } from './components/Signup';
import RootLayout from './components/RootLayout';
import Signup from './components/Signup';
import { AuthContext } from './context/AuthContext';
import { loader as roomLoader } from './components/Room';
import Room from './components/Room';
import Chat from './components/Chat';

function App() {
  const { login, currentUser } = useContext(AuthContext);

  const checkAuthLoader = ({ request }: any) => {
    const url = new URL(request.url);

    if (!currentUser && !['/login', '/signup'].includes(url.pathname)) {
      return redirect('/login');
    } else if (currentUser && ['/login', '/signup'].includes(url.pathname)) {
      return redirect('/');
    }
    return true;
  };

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
          loader: checkAuthLoader,
          action: signupAction({ login }),
        },
        {
          path: '/login',
          element: <Login />,
          loader: checkAuthLoader,
          action: loginAction({ login }),
        },
        {
          path: '/chat',
          element: <ChatLayout />,
          loader: checkAuthLoader,
        },
        {
          path: '/rooms',
          element: <Chat />,
          loader: checkAuthLoader,
        },
        {
          path: '/rooms/:id',
          element: <Chat />,
          loader: roomLoader,
        },
      ],
    },
  ]);

  return <RouterProvider router={router} />;
}

export default App;

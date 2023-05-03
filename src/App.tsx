import React, { useContext } from 'react';
import {
  createBrowserRouter,
  redirect,
  RouterProvider,
} from 'react-router-dom';
import AppError from './components/AppError';
import Login from './components/Login';
import { action as loginAction } from './components/Login';
import { action as signupAction } from './components/Signup';
import RootLayout from './components/RootLayout';
import Signup from './components/Signup';
import { AuthContext } from './context/AuthContext';
import { loader as roomLoader } from './components/Room';
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
          element: <Chat />,
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
    {
      path: '/login',
      element: <Login />,
      loader: checkAuthLoader,
      action: loginAction({ login }),
    },
    {
      path: '/signup',
      element: <Signup />,
      loader: checkAuthLoader,
      action: signupAction({ login }),
    },
  ]);

  return <RouterProvider router={router} />;
}

export default App;

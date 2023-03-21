import React, { useContext } from 'react';
import { Navigate, useRouteError } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const AppError = () => {
  const { logout } = useContext(AuthContext);
  const error: any = useRouteError();
  console.log(error);

  let message = 'Something went wrong!';

  if (error.statusCode === 401) {
    logout();
    return <Navigate to="/login" />;
  }

  if (error.status === 500) {
    message = error.data.message;
  }

  if (error.status === 404) {
    message = 'Could not find resource or page.';
  }

  return (
    <>
      <p>{message}</p>
    </>
  );
};

export default AppError;

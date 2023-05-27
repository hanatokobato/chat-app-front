import React, { useContext } from 'react';
import { Navigate, useRouteError, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import styles from './AppError.module.scss';

const AppError = () => {
  const navigate = useNavigate();
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
      <div className={`app-container ${styles['error-container']}`}>
        <div className="d-flex flex-column align-items-center mt-10">
          <span className={styles['error-code']}>{error.statusCode}</span>
          <div className="mt-4">
            <p className={styles['error-content']}>{message}</p>
          </div>
          <div className="mt-4">
            <button
              className="btn btn--primary btn--small"
              onClick={() => navigate('/')}
            >
              Go to home
            </button>
            <span className="ml-4">
              <button
                className="btn btn--white btn--outlined-primary btn--small"
                onClick={() => navigate(-1)}
              >
                Previous page
              </button>
            </span>
          </div>
        </div>
      </div>
    </>
  );
};

export default AppError;

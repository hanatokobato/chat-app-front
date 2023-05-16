import React, { useContext, useCallback } from 'react';
import logoImg from '../assets/images/logo.png';
import doraImg from '../assets/images/dora.jpg';
import { AuthContext } from '../context/AuthContext';
import styles from './Header.module.scss';
import axios from 'axios';
import { useNavigate, useLocation, matchRoutes, Link } from 'react-router-dom';

const Header = () => {
  const { currentUser, logout: clearUserInfo } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [{ route: isSignUp }] = matchRoutes(
    [{ path: '/signup' }],
    location
  ) ?? [{ route: false }];

  const [{ route: isLogin }] = matchRoutes([{ path: '/login' }], location) ?? [
    { route: false },
  ];

  const logout = useCallback(async () => {
    await axios.delete(`${process.env.REACT_APP_API_URL}/api/v1/logout`);
    clearUserInfo();
    navigate('/login');
  }, []);

  const goSignup = useCallback(async () => {
    navigate('/signup');
  }, []);

  const goLogin = useCallback(async () => {
    navigate('/login');
  }, []);

  return (
    <header className="header">
      <img src={logoImg} alt="logo" className={styles.logo} />

      <nav className={styles['user-nav']}>
        {currentUser?.id && (
          <div className={styles['user-nav__logout']}>
            <a onClick={logout}>Logout</a>
          </div>
        )}
        {!currentUser?.id && !isSignUp && (
          <div className={styles['user-nav__logout']}>
            <a onClick={goSignup}>Signup</a>
          </div>
        )}
        {!currentUser?.id && !isLogin && (
          <div className={styles['user-nav__logout']}>
            <a onClick={goLogin}>Login</a>
          </div>
        )}
        {currentUser?.id && (
          <Link className={styles['user-nav__user']} to="/account">
            <img
              src={currentUser.photo || doraImg}
              alt="User photo"
              className={styles['user-nav__user-photo']}
            />
            <span className={styles['user-nav__user-name']}>
              {currentUser?.name}
            </span>
          </Link>
        )}
      </nav>
    </header>
  );
};

export default Header;

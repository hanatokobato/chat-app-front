import React, { useContext } from 'react';
import logoImg from '../assets/images/logo.png';
import { AuthContext } from '../context/AuthContext';
import styles from './Header.module.scss';
import profileImg from '../assets/images/profile.jpg';

const Header = () => {
  const { currentUser } = useContext(AuthContext);

  return (
    <header className="header">
      <img src={logoImg} alt="logo" className={styles.logo} />

      <nav className={styles['user-nav']}>
        <div className={styles['user-nav__user']}>
          <img
            src={profileImg}
            alt="User photo"
            className={styles['user-nav__user-photo']}
          />
          <span className={styles['user-nav__user-name']}>
            {currentUser?.name}
          </span>
        </div>
      </nav>
    </header>
  );
};

export default Header;

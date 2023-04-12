import { faSearch, faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { IUser } from './Room';
import axios from 'axios';
import userImg from '../assets/images/profile.jpg';
import styles from './ListUser.module.scss';
import Search from './Search';

interface IProps {
  usersOnline: IUser[];
  selectReceiver: (user: IUser) => void;
}

const ListUser = ({ usersOnline, selectReceiver }: IProps) => {
  const { currentUser } = useContext(AuthContext);
  const [filteredUsersList, setFilteredUsersList] = useState<IUser[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    const getUsers = async () => {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/users`
      );
      setFilteredUsersList(response.data.data.users);
    };
    getUsers();
  }, []);

  return (
    <div className={styles['contacts-card']}>
      <div className={styles['contacts-header']}>
        <h3 className="d-flex">
          Online
          <span className="badge badge-success ml-2">{usersOnline.length}</span>
        </h3>
        <div className="w-100">
          <Search searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        </div>
      </div>
      <div className={styles['contacts-body']}>
        <div className={styles.contacts}>
          {filteredUsersList.map((user) => (
            <li
              key={user._id}
              onClick={(e) => {
                selectReceiver(user);
              }}
            >
              {user._id === currentUser!.id && (
                <div className="current-user-mark" />
              )}
              <div className="d-flex bd-highlight">
                <div className="img_cont">
                  <img
                    src={user._id === currentUser!.id ? userImg : userImg}
                    className={`rounded-circle ${styles['user-img']}`}
                    alt="user_img"
                  />
                  <span className="online_icon"></span>
                </div>
                <div className={styles['user-info']}>
                  <div>
                    <span>
                      {user.name} {user._id === currentUser!.id ? '(You)' : ''}
                    </span>
                    <span
                      className="badge badge-danger font-12px"
                      v-if="user.new_messages"
                    >
                      {user.new_messages}
                    </span>
                  </div>
                  <span>{user.email}</span>
                </div>
              </div>
            </li>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ListUser;

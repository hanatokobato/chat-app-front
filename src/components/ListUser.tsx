import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { IUser } from './Room';
import styles from './ListUser.module.scss';
import Search from './Search';
import AppError from '../utils/AppError';

interface IProps {
  usersOnline: IUser[];
  selectReceiver: (user: IUser) => void;
}

const ListUser = ({ usersOnline, selectReceiver }: IProps) => {
  const { currentUser } = useContext(AuthContext);
  if (!currentUser) throw new AppError('Please log in.', 401);

  const [filteredUsersList, setFilteredUsersList] = useState<IUser[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    setFilteredUsersList(
      usersOnline.filter((user) => user._id !== currentUser?.id)
    );
  }, [usersOnline]);

  return (
    <div className={styles['contacts-card']}>
      <div className={styles['contacts-header']}>
        <h3 className="d-flex">
          Online
          <span className="badge badge-success ml-2">
            {filteredUsersList.length}
          </span>
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
                    src={user.photo}
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
                    {user.new_messages > 0 && (
                      <span className="badge badge-danger font-12px">
                        {user.new_messages}
                      </span>
                    )}
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

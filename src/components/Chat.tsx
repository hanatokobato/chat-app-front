import React, { useCallback, useEffect, useState, useContext } from 'react';
import ChatRooms from './ChatRooms';
import styles from './Chat.module.scss';
import errorHandler from '../utils/errorHandler';
import axios from 'axios';
import Room, { IRoom } from './Room';
import AppError from '../utils/AppError';
import { AuthContext } from '../context/AuthContext';
import useCurrentPath from '../hooks/useCurrentPath';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import Search from './Search';

const Chat = () => {
  const { logout } = useContext(AuthContext);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filteredRooms, setFilteredRooms] = useState<IRoom[]>([]);
  const [totalRoomCount, setTotalRoomCount] = useState<number | undefined>();
  const currentPath = useCurrentPath();

  const fetchRooms = useCallback(async () => {
    try {
      const response: any = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/rooms`,
        { params: { search: searchQuery } }
      );
      if (response.data.status === 'success') {
        setFilteredRooms(response.data.data.rooms);
        setTotalRoomCount(response.data.result);
      }
    } catch (e: any) {
      const error = e.response
        ? new AppError(e.response.statusText, e.response.status)
        : new AppError(e, 500);
      errorHandler(error, { logout });
    }
  }, [searchQuery, logout]);

  useEffect(() => {
    const delayDebbounceFn = setTimeout(() => {
      fetchRooms();
    }, 500);

    return () => clearTimeout(delayDebbounceFn);
  }, [fetchRooms]);

  return (
    <>
      <nav className={styles.sidebar}>
        <Search searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        <div className={styles.search__result}>
          <span className="badge badge-warning">Result: {totalRoomCount}</span>
        </div>
        <ChatRooms rooms={filteredRooms} />
      </nav>
      <main className={styles['room-view']}>
        {currentPath === '/rooms/:id' && <Room />}
      </main>
    </>
  );
};

export default Chat;

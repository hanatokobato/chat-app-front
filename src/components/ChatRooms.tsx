import React from 'react';
import { Link } from 'react-router-dom';
import { IRoom } from './Room';
import styles from './ChatRooms.module.scss';

interface IProps {
  selectedRoom?: String;
  rooms: IRoom[];
}

const ChatRooms = ({ selectedRoom, rooms }: IProps) => {
  return (
    <ul className={styles['side-nav']}>
      {rooms.map((room, i) => (
        <li
          key={room._id}
          className={`${styles['side-nav__item']} ${
            room._id === selectedRoom ? styles['side-nav__item--active'] : ''
          }`}
        >
          <Link className={styles['side-nav__link']} to={`/rooms/${room._id}`}>
            <span>{room.name}</span>
            <p>{room.description}</p>
          </Link>
        </li>
      ))}
    </ul>
  );
};

export default ChatRooms;

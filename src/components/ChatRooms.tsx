import React, { useCallback, useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { IRoom } from './Room';
import AppError from './../utils/AppError';
import errorHandler from '../utils/errorHandler';
import { AuthContext } from '../context/AuthContext';

const ChatRooms = () => {
  const { logout } = useContext(AuthContext);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filteredRooms, setFilteredRooms] = useState<IRoom[]>([]);
  const [totalRoomCount, setTotalRoomCount] = useState<number | undefined>();

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
    <div className="row justify-content-center h-100">
      <div className="col-md-8 chat">
        <div className="card mb-sm-3 mb-md-0 contacts_card">
          <div className="card-header">
            <h3 className="d-flex text-white">
              Chatroom
              <span className="badge badge-success ml-2">{totalRoomCount}</span>
            </h3>
            <div className="input-group">
              <input
                value={searchQuery}
                type="text"
                placeholder="Search..."
                name=""
                className="form-control search"
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="input-group-prepend">
                <span className="input-group-text search_btn">
                  <i className="fas fa-search"></i>
                </span>
              </div>
            </div>
          </div>
          <div className="card-body contacts_body">
            <div className="contacts">
              {filteredRooms.map((room, i) => (
                <li key={i}>
                  <Link to={`/rooms/${room._id}`}>
                    <div className="d-flex bd-highlight">
                      <div className="user_info">
                        <span>{room.name}</span>
                        <p v-if="room.description">{room.description}</p>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatRooms;

import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { IRoom } from './Room';

const ChatRooms = () => {
  const [filteredRooms, setFilteredRooms] = useState<IRoom[]>([]);
  const [totalRoomCount, setTotalRoomCount] = useState<number | undefined>();

  const fetchRooms = useCallback(async () => {
    try {
      const response: any = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/rooms`
      );
      if (response.data.status === 'success') {
        setFilteredRooms(response.data.data.rooms);
        setTotalRoomCount(response.data.result);
      }
    } catch (e) {}
  }, []);

  useEffect(() => {
    fetchRooms();
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
                v-model="searchQuery"
                type="text"
                placeholder="Search..."
                name=""
                className="form-control search"
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

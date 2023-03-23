import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { IUser } from './Room';

interface IProps {
  usersOnline: IUser[];
  selectReceiver: (user: IUser) => void;
}

const ListUser = ({ usersOnline, selectReceiver }: IProps) => {
  const { currentUser } = useContext(AuthContext);
  const [filteredUsersList, setFilteredUsersList] = useState<IUser[]>([]);

  return (
    <div className="card mb-sm-3 mb-md-0 contacts_card">
      <div className="card-header">
        <h3 className="d-flex text-white">
          Online
          <span className="badge badge-success ml-2">{usersOnline.length}</span>
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
          {filteredUsersList.map((user) => (
            <li
              key={user._id}
              onClick={(e) => {
                selectReceiver(user);
              }}
            >
              <div
                className="current-user-mark"
                v-if="user.id === $root.user.id"
              />
              <div className="d-flex bd-highlight">
                <div className="img_cont">
                  <img
                    src={
                      user._id === currentUser!.id
                        ? '/images/current_user.jpg'
                        : '/images/other_user.jpg'
                    }
                    className="rounded-circle user_img"
                    alt=""
                  />
                  <span className="online_icon"></span>
                </div>
                <div className="user_info">
                  <span>
                    {user.name} {user._id === currentUser!.id ? '(You)' : ''}
                  </span>
                  <span
                    className="badge badge-danger font-12px"
                    v-if="user.new_messages"
                  >
                    {user.new_messages}
                  </span>
                  <p>{user.email}</p>
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

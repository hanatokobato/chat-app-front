import { faLocationArrow } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useState } from 'react';
import Emoji from './Emoji';
import MessageItem from './MessageItem';
import { IRoom, IChat, IMessage, ICoordinates } from './Room';
import styles from './Room.module.scss';

interface IProps {
  currentRoom?: IRoom;
  chat: IChat;
  selectedMessage?: IMessage;
  isShowEmoji: boolean;
  emojiCoordinates?: ICoordinates;
  saveMessage: (e: any) => void;
  showEmoji: (message: IMessage, event: any) => void;
  hideEmoji: () => void;
  selectEmoji: (emoji: any) => void;
}

const SharedRoom = ({
  currentRoom,
  chat,
  selectedMessage,
  isShowEmoji,
  emojiCoordinates,
  showEmoji,
  saveMessage,
  hideEmoji,
  selectEmoji,
}: IProps) => {
  const [inputMessage, setInputMessage] = useState<string>();

  const saveMessageHandler = () => {
    saveMessage(inputMessage);
    setInputMessage('');
  };

  return (
    <>
      <div id="shared_room" className={styles['room--shared']}>
        {chat.message.isLoading && (
          <div className="loading mb-2 text-center">
            <svg
              version="1.1"
              id="loader-1"
              xmlns="http://www.w3.org/2000/svg"
              xmlnsXlink="http://www.w3.org/1999/xlink"
              x="0px"
              y="0px"
              width="40px"
              height="40px"
              viewBox="0 0 50 50"
              xmlSpace="preserve"
            >
              <path
                fill="#FF6700"
                d="M43.935,25.145c0-10.318-8.364-18.683-18.683-18.683c-10.318,0-18.683,8.365-18.683,18.683h4.068c0-8.071,6.543-14.615,14.615-14.615c8.072,0,14.615,6.543,14.615,14.615H43.935z"
                transform="rotate(18.3216 25 25)"
              >
                <animateTransform
                  attributeType="xml"
                  attributeName="transform"
                  type="rotate"
                  from="0 25 25"
                  to="360 25 25"
                  dur="0.6s"
                  repeatCount="indefinite"
                ></animateTransform>
              </path>
            </svg>
          </div>
        )}

        {chat.message.list.map((message) => (
          <MessageItem
            key={message._id}
            message={message}
            isSelected={selectedMessage?._id === message._id}
            showEmoji={showEmoji}
            hideEmoji={hideEmoji}
          />
        ))}
      </div>
      <div className="mt-3">
        <div className="input-group">
          <textarea
            value={inputMessage}
            name=""
            className={`form-control ${styles.type_msg}`}
            placeholder="Type your message..."
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyUp={(e) => {
              if (e.key !== 'Enter') return;

              saveMessageHandler();
            }}
          />
          <div className="input-group-append">
            <span
              className={`input-group-text ${styles.send_btn}`}
              onClick={saveMessageHandler}
            >
              <FontAwesomeIcon icon={faLocationArrow} />
            </span>
          </div>
        </div>
      </div>

      {emojiCoordinates && (
        <Emoji
          emojiCoordinates={emojiCoordinates}
          isShow={isShowEmoji}
          selectedMessage={selectedMessage}
          hideEmoji={hideEmoji}
          selectEmoji={selectEmoji}
        />
      )}
    </>
  );
};

export default SharedRoom;

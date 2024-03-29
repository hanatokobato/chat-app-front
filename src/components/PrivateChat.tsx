import React, { useState, useCallback, useEffect } from 'react';
import ColorPickerModal from './ColorPickerModal';
import Emoji from './Emoji';
import MessageItem from './MessageItem';
import { IChat, IMessage, ICoordinates } from './Room';
import styles from './PrivateChat.module.scss';
import { throttle } from 'lodash';
import { SendMessage } from 'react-use-websocket';

interface IProps {
  chat: IChat;
  selectedMessage?: IMessage;
  isShowEmoji: boolean;
  emojiCoordinates?: ICoordinates;
  closePrivateChat: () => void;
  saveMessage: (message: string, receiver?: string) => void;
  focusPrivateInput: () => void;
  showEmoji: (message: IMessage, event: any) => void;
  hideEmoji: () => void;
  selectEmoji: (emoji: any) => void;
  togglePrivateChat: () => void;
  sendWsEvent: SendMessage;
}

const PrivateChat = ({
  chat,
  selectedMessage,
  emojiCoordinates,
  isShowEmoji,
  closePrivateChat,
  saveMessage,
  focusPrivateInput,
  showEmoji,
  hideEmoji,
  selectEmoji,
  togglePrivateChat,
  sendWsEvent,
}: IProps) => {
  const [msgColor, setMsgColor] = useState<string>();
  const [isShowColorPicker, setIsShowColorPicker] = useState<boolean>(false);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [seenMessageId, setSeenMessageId] = useState<string>();

  const toggleColorPicker = () => {};

  const onInputPrivateChange = useCallback(
    throttle(() => {
      sendWsEvent(
        JSON.stringify({
          type: 'typing',
          isTyping: true,
          receiverId: chat.selectedReceiver!._id,
        })
      );

      setTimeout(() => {
        sendWsEvent(
          JSON.stringify({
            type: 'typing',
            isTyping: false,
            receiverId: chat.selectedReceiver!._id,
          })
        );
      }, 1500);
    }, 2000),
    []
  );

  const selectColor = () => {};

  const saveMessageHandler = (e: any) => {
    if (e.key !== 'Enter') return;

    saveMessage(inputMessage, chat.selectedReceiver!._id);
    setInputMessage('');
  };

  useEffect(() => {
    chat.message.list.forEach((msg) => {
      if (msg.seenAt) setSeenMessageId(msg._id);
    });
  }, [chat.message.list]);

  return (
    <div
      className={`${styles['private-message-container']} ${
        chat.isPrivateChatExpand ? styles.expand : ''
      }`}
      onClick={focusPrivateInput}
    >
      <div
        className={`${styles['chat-header']} d-flex p-2 border-bottom ${
          chat.hasNewMessage ? 'blink-anim' : ''
        }`}
        onClick={() => togglePrivateChat()}
      >
        <div className={styles.img_cont}>
          <img
            src={chat.selectedReceiver?.photo}
            className={`rounded-circle ${styles.user_img}`}
            style={{ width: '40px', height: '40px' }}
            alt=""
          />
          <span
            className={`${styles.online_icon} ${
              chat.isOnline ? 'online' : 'offline'
            }`}
            style={{ bottom: '-3px' }}
          ></span>
        </div>
        <div className={styles.user_info}>
          <span>{chat.selectedReceiver?.name}</span>
          {/* <!-- <p style="color: black;" class="mb-0">{{ chat.selectedReceiver.name }} left 50 mins ago</p> --> */}
        </div>
        <div className="color-picker">
          <i
            data-toggle="tooltip"
            data-placement="top"
            title="Message Color"
            className="fas fa-circle"
            onClick={toggleColorPicker}
            style={{ cursor: 'pointer', color: msgColor }}
          ></i>
        </div>

        <button className={styles['btn-close']} onClick={closePrivateChat}>
          <i className="fal fa-times"></i>
        </button>
      </div>

      {chat.isPrivateChatExpand && (
        <div className={`${styles['private-chat-body']} p-2`} id="private_room">
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
              msgColor={msgColor}
              isDisplaySeen={message._id === seenMessageId}
              showEmoji={showEmoji}
              hideEmoji={hideEmoji}
            />
          ))}
          {chat.isSelectedReceiverTyping && (
            <div className="d-flex justify-content-start mb-4">
              <div className={styles.img_cont_msg}>
                <img
                  src={chat.selectedReceiver?.photo}
                  className={`rounded-circle ${styles.user_img_msg}`}
                  alt=""
                />
              </div>
              <div className={styles.msg_container}>
                <div id={styles.wave}>
                  <span className={styles.dot}></span>
                  <span className={styles.dot}></span>
                  <span className={styles.dot}></span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      {chat.isPrivateChatExpand && (
        <div className={styles['text-input']}>
          <input
            value={inputMessage}
            id="private_input"
            type="text"
            className="w-100"
            placeholder="Type a message..."
            autoComplete="off"
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyUp={saveMessageHandler}
            onInput={onInputPrivateChange}
          />
        </div>
      )}
      {emojiCoordinates && (
        <Emoji
          emojiCoordinates={emojiCoordinates}
          isShow={isShowEmoji}
          selectedMessage={selectedMessage}
          hideEmoji={hideEmoji}
          selectEmoji={selectEmoji}
        />
      )}

      {isShowColorPicker && (
        <ColorPickerModal
          isShow={isShowColorPicker}
          hide={toggleColorPicker}
          selectColor={selectColor}
        />
      )}
    </div>
  );
};

export default PrivateChat;

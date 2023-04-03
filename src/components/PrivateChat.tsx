import React, { useState } from 'react';
import ColorPickerModal from './ColorPickerModal';
import Emoji from './Emoji';
import MessageItem from './MessageItem';
import { IChat, IMessage, ICoordinates } from './Room';

interface IProps {
  chat: IChat;
  selectedMessage?: IMessage;
  isShowEmoji: boolean;
  emojiCoordinates?: ICoordinates;
  closePrivateChat: () => void;
  saveMessage: (e: any) => void;
  focusPrivateInput: () => void;
  showEmoji: (message: IMessage, event: any) => void;
  hideEmoji: () => void;
  selectEmoji: (emoji: any) => void;
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
}: IProps) => {
  const [msgColor, setMsgColor] = useState<string>();
  const [isShowColorPicker, setIsShowColorPicker] = useState<boolean>(false);

  const toggleColorPicker = () => {};

  const onInputPrivateChange = () => {};

  const selectColor = () => {};

  return (
    <div
      className={`private-message-container ${
        chat.isPrivateChatExpand ? 'expand' : ''
      }`}
      onClick={focusPrivateInput}
    >
      <div
        className={`chat-header d-flex p-2 border-bottom ${
          chat.hasNewMessage ? 'blink-anim' : ''
        }`}
        onClick={() => (chat.isPrivateChatExpand = !chat.isPrivateChatExpand)}
      >
        <div className="img_cont">
          <img
            src="https://static.turbosquid.com/Preview/001292/481/WV/_D.jpg"
            className="rounded-circle user_img"
            style={{ width: '40px', height: '40px' }}
            alt=""
          />
          <span
            className={`online_icon ${chat.isOnline ? 'online' : 'offline'}`}
            style={{ bottom: '-3px' }}
          ></span>
        </div>
        <div className="user_info">
          <span style={{ color: 'black' }}>{chat.selectedReceiver?.name}</span>
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

        <button className="btn-close" onClick={closePrivateChat}>
          <i className="fal fa-times"></i>
        </button>
      </div>

      <div
        className="private-chat-body p-2"
        v-if="chat.isPrivateChatExpand"
        id="private_room"
      >
        <div className="loading mb-2 text-center" v-if="chat.message.isLoading">
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
        {chat.message.list.map((message) => (
          <MessageItem
            key={message._id}
            message={message}
            msgColor={msgColor}
            showEmoji={showEmoji}
            hideEmoji={hideEmoji}
          />
        ))}
        <div className="d-flex justify-content-end" v-if="chat.isSeen">
          <i className="font-12px">Seen {chat.seenAt}</i>
        </div>
        <div
          className="d-flex justify-content-start mb-4"
          v-if="chat.isSelectedReceiverTyping"
        >
          <div className="img_cont_msg">
            <img
              src="https://static.turbosquid.com/Preview/001292/481/WV/_D.jpg"
              className="rounded-circle user_img_msg"
              alt=""
            />
          </div>
          <div className="msg_container">
            <div id="wave">
              <span className="dot"></span>
              <span className="dot"></span>
              <span className="dot"></span>
            </div>
          </div>
        </div>
      </div>
      <div className="text-input" v-if="chat.isPrivateChatExpand">
        <input
          v-model="inputMessage"
          id="private_input"
          type="text"
          className="w-100"
          placeholder="Type a message..."
          onKeyUp={saveMessage}
          onInput={onInputPrivateChange}
        />
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

      <ColorPickerModal
        v-if="isShowColorPicker"
        isShow={isShowColorPicker}
        hide={toggleColorPicker}
        selectColor={selectColor}
      />
    </div>
  );
};

export default PrivateChat;

import React, { useCallback, useEffect, useState } from 'react';
import styles from './ChatLayout.module.scss';
import ChatItem from './ChatItem';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import axios from 'axios';

const socketUrl = `${process.env.REACT_APP_API_WS_URL}/chat`;

interface Message {
  id: number;
  message: string;
  user: {
    _id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

const ChatLayout = () => {
  const [messageInput, setMessageInput] = useState<string>('');
  const { sendMessage, lastMessage, readyState } = useWebSocket(socketUrl);
  const [messageHistory, setMessageHistory] = useState<Message[]>([]);

  useEffect(() => {
    const getMessages = async () => {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/messages`
      );

      const { data, status } = response.data;

      if (status === 'success') {
        setMessageHistory(data.messages.map((m: Message) => ({ ...m })));
      }
    };

    getMessages();
  }, []);

  useEffect(() => {
    if (lastMessage !== null) {
      const { id, message, user, createdAt, updatedAt } = JSON.parse(
        lastMessage.data
      );
      setMessageHistory((prev) =>
        prev.concat({ id, message, user, createdAt, updatedAt })
      );
    }
  }, [lastMessage, setMessageHistory]);

  const handleClickSendMessage = useCallback(() => {
    sendMessage(messageInput);
  }, [messageInput, sendMessage]);

  const connectionStatus = {
    [ReadyState.CONNECTING]: 'Connecting',
    [ReadyState.OPEN]: 'Open',
    [ReadyState.CLOSING]: 'Closing',
    [ReadyState.CLOSED]: 'Closed',
    [ReadyState.UNINSTANTIATED]: 'Uninstantiated',
  }[readyState];

  return (
    <>
      <div>
        <div className={styles.chat}>
          <div className={styles['chat-title']}>
            <h1>Chatroom ({connectionStatus})</h1>
          </div>
          <div className={styles.messages}>
            <div className={styles['messages-content']}>
              {messageHistory.map((message, i) => (
                <ChatItem
                  userName={message.user.name}
                  timestamp={message.createdAt}
                  text={message.message}
                  key={i}
                ></ChatItem>
              ))}
            </div>
          </div>
          <div className={styles['message-box']}>
            <textarea
              className={styles['message-input']}
              placeholder="Type message..."
              onChange={(e) => setMessageInput(e.target.value)}
            ></textarea>
            <button
              type="submit"
              className={styles['message-submit']}
              disabled={readyState !== ReadyState.OPEN}
              onClick={handleClickSendMessage}
            >
              Send
            </button>
          </div>
        </div>
        <div className={styles.bg}></div>
      </div>
    </>
  );
};

export default ChatLayout;

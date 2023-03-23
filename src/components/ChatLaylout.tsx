import React, { useCallback, useEffect, useState } from 'react';
import './ChatLayout.scss';
import ChatItem from './ChatItem';
import useWebSocket, { ReadyState } from 'react-use-websocket';

const socketUrl = `${process.env.REACT_APP_API_WS_URL}/chat`;

interface Message {
  id: number;
  message: string;
  userId: string;
  userName: string;
  timestamp: string;
}

const ChatLayout = () => {
  const [messageInput, setMessageInput] = useState<string>('');
  const { sendMessage, lastMessage, readyState } = useWebSocket(socketUrl);
  const [messageHistory, setMessageHistory] = useState<Message[]>([]);

  useEffect(() => {
    if (lastMessage !== null) {
      const {
        id,
        message,
        user_id: userId,
        user_name: userName,
        timestamp,
      } = JSON.parse(lastMessage.data);
      setMessageHistory((prev) =>
        prev.concat({ id, message, userId, userName, timestamp })
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
        <div className="chat">
          <div className="chat-title">
            <h1>Chatroom ({connectionStatus})</h1>
          </div>
          <div className="messages">
            <div className="messages-content">
              {messageHistory.map((message, i) => (
                <ChatItem
                  userName={message.userName}
                  timestamp={message.timestamp}
                  text={message.message}
                  key={i}
                ></ChatItem>
              ))}
            </div>
          </div>
          <div className="message-box">
            <textarea
              className="message-input"
              placeholder="Type message..."
              onChange={(e) => setMessageInput(e.target.value)}
            ></textarea>
            <button
              type="submit"
              className="message-submit"
              disabled={readyState !== ReadyState.OPEN}
              onClick={handleClickSendMessage}
            >
              Send
            </button>
          </div>
        </div>
        <div className="bg"></div>
      </div>
    </>
  );
};

export default ChatLayout;

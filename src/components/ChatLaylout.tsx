import React, { useCallback, useState } from "react";
import "./ChatLayout.scss";
import ChatItem from "./ChatItem";
import useWebSocket from "react-use-websocket";

const socketUrl = "ws://localhost:3000/chat";

const ChatLayout = () => {
  const [messageInput, setMessageInput] = useState<string>("");
  const { sendMessage } = useWebSocket(socketUrl);

  const handleClickSendMessage = useCallback(() => {
    sendMessage(messageInput);
  }, [messageInput, sendMessage]);

  return (
    <>
      <div>
        <div className="chat">
          <div className="chat-title">
            <h1>Chatroom</h1>
          </div>
          <div className="messages">
            <div className="messages-content">
              {[1, 2, 3].map((i) => (
                <ChatItem key={i}></ChatItem>
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

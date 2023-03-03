import React from "react";
import "./ChatItem.scss";

interface Props {
  userName: string;
  timestamp: string;
  text: string;
}

const ChatItem = ({ userName, timestamp, text }: Props) => {
  return (
    <div className="message">
      <div className="message-item user-name">{userName}</div>
      <div className="message-item timestamp">| {timestamp}</div>
      <div className="message-item text-message">{text}</div>
    </div>
  );
};

export default ChatItem;

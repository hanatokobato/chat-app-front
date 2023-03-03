import React from "react";
import "./ChatItem.scss";

const ChatItem = () => {
  return (
    <div className="message">
      <div className="message-item user-name">MTD</div>
      <div className="message-item timestamp">| 11:21:32:</div>
      <div className="message-item text-message">Hello how are you</div>
    </div>
  );
};

export default ChatItem;

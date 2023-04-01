import React, { useContext, useState } from 'react';
import { IMessage } from './Room';
import { AuthContext } from '../context/AuthContext';
import sanitizeHtml from 'sanitize-html';
import Reaction from './Reaction';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFaceSmile } from '@fortawesome/free-solid-svg-icons';

interface IProps {
  message: IMessage;
  showEmoji: (message: IMessage, event: any) => void;
  msgColor?: string;
}

const MessageItem = ({ message, showEmoji, msgColor }: IProps) => {
  const { currentUser } = useContext(AuthContext);
  const [highlight] = useState<string>(() => {
    if (message.receiver) {
      // ignore if this is private message
      return message.message;
    }
    const content = sanitizeHtml(message.message);
    return content.replace(
      new RegExp('chuc mung|congratulations|congrats|happy new year', 'gi'),
      (match: string) => {
        return '<span class="highlightText">' + match + '</span>';
      }
    );
  });

  const showEmojiHandler = (e: any) => {
    showEmoji(message, e);
  };

  return (
    <>
      {message.type === 'bot' && (
        <div className="d-flex justify-content-end mb-4">
          <div
            className="msg_container_send bot-notification"
            data-toggle="tooltip"
            data-placement="top"
            title={message.createdAt}
          >
            Bot: {message.message}
          </div>
        </div>
      )}
      {message.type !== 'bot' && message.sender._id === currentUser!.id && (
        <>
          <div
            className={`msg-item d-flex justify-content-end mb-4 ${
              message.receiver ? 'private' : ''
            }`}
          >
            <div className="msg-actions d-flex mr-2">
              <div className="d-flex align-items-center">
                <i
                  className="fal fa-grin-alt"
                  data-toggle="tooltip"
                  data-placement="top"
                  title="React"
                  onClick={showEmojiHandler}
                ></i>
              </div>
            </div>
            <div
              className="msg_container_send"
              data-toggle="tooltip"
              data-placement="top"
              title={message.createdAt}
              style={message.receiver ? { backgroundColor: msgColor } : {}}
            >
              <div dangerouslySetInnerHTML={{ __html: highlight }}></div>
              {message.reactions.length && (
                <Reaction reactions={message.reactions} />
              )}
            </div>
            <div
              className="img_cont_msg"
              data-toggle="tooltip"
              data-placement="top"
              title={`${message.sender.name} (${message.sender.email})`}
            >
              <img
                src="/images/current_user.jpg"
                className="rounded-circle user_img_msg"
                alt=""
              />
            </div>
          </div>
        </>
      )}
      {!message.reactions.length && (
        <div
          className={`msg-item d-flex justify-content-start mb-4 ${
            message.receiver ? 'private' : ''
          }`}
        >
          <div
            className="img_cont_msg bg-white rounded-circle d-flex justify-content-center align-items-center"
            data-toggle="tooltip"
            data-placement="top"
            title={`${message.sender.name} (${message.sender.email})`}
          >
            <span
              className="rounded-circle d-flex justify-content-center align-items-center"
              style={{ backgroundColor: `${message.sender.color}` }}
            >
              {message.sender.name[0].toUpperCase()}
            </span>
          </div>
          <div
            className={`msg_container ${message.receiver ? 'bg-gray' : ''}`}
            data-toggle="tooltip"
            data-placement="top"
            title={message.createdAt}
          >
            <div dangerouslySetInnerHTML={{ __html: highlight }}></div>
            {!!message.reactions.length && (
              <Reaction reactions={message.reactions} />
            )}
          </div>
          <div className="msg-actions d-flex ml-2">
            <div className="d-flex align-items-center">
              <FontAwesomeIcon icon={faFaceSmile} color={'white'} title="React" />
              <i
                className="fal fa-grin-alt"
                data-toggle="tooltip"
                data-placement="top"
                title="React"
                onClick={showEmojiHandler}
              ></i>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MessageItem;

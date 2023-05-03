import React, { useContext, useState, useEffect, useRef } from 'react';
import { IMessage } from './Room';
import { AuthContext } from '../context/AuthContext';
import sanitizeHtml from 'sanitize-html';
import Reaction from './Reaction';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFaceSmile } from '@fortawesome/free-solid-svg-icons';
import profileImg from '../assets/images/profile.jpg';
import doraImg from '../assets/images/dora.jpg';
import styles from './MessageItem.module.scss';

interface IProps {
  message: IMessage;
  isSelected?: boolean;
  showEmoji: (message: IMessage, event: any) => void;
  msgColor?: string;
  isDisplaySeen?: boolean;
  hideEmoji: () => void;
}

const MessageItem = ({
  message,
  isSelected,
  showEmoji,
  msgColor,
  hideEmoji,
  isDisplaySeen,
}: IProps) => {
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
        return `<span class="${styles.highlightText}">` + match + '</span>';
      }
    );
  });
  const emojiRef = useRef<HTMLDivElement>(null);

  const showEmojiHandler = (e: any) => {
    showEmoji(message, e);
  };

  useEffect(() => {
    if (isSelected) {
      const closeEmojis = (e: any) => {
        if (!emojiRef.current?.contains(e.target)) {
          hideEmoji();
        }
      };

      document.addEventListener('click', closeEmojis);

      return () => {
        document.removeEventListener('click', closeEmojis);
      };
    }
  }, [isSelected]);

  return (
    <>
      {message.type === 'bot' && (
        <div className="d-flex justify-content-end mb-5">
          <div
            className={`${styles.msg_container_send} ${styles['bot-notification']}`}
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
            className={`${styles['msg-item']} d-flex justify-content-end mb-5 ${
              message.receiver ? styles.private : ''
            }`}
          >
            <div className={`${styles['msg-actions']} d-flex mr-2`}>
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
            {isDisplaySeen && (
              <div className="d-flex align-items-end">
                <img
                  src={doraImg}
                  className={`rounded-circle ${styles.seen_img_msg}`}
                />
              </div>
            )}
            <div
              className={styles.msg_container_send}
              data-toggle="tooltip"
              data-placement="top"
              title={message.createdAt}
              style={message.receiver ? { backgroundColor: msgColor } : {}}
            >
              <div dangerouslySetInnerHTML={{ __html: highlight }}></div>
              {!!message.reactions.length && (
                <Reaction reactions={message.reactions} />
              )}
            </div>
            <div
              className={styles.img_cont_msg}
              data-toggle="tooltip"
              data-placement="top"
              title={`${message.sender.name} (${message.sender.email})`}
            >
              <img
                src={profileImg}
                className={`rounded-circle ${styles.user_img_msg}`}
                alt=""
              />
            </div>
          </div>
        </>
      )}
      {message.type !== 'bot' && message.sender._id !== currentUser!.id && (
        <div
          className={`${styles['msg-item']} d-flex justify-content-start mb-5 ${
            message.receiver ? styles.private : ''
          }`}
        >
          <div
            className={`${styles.img_cont_msg} bg-white rounded-circle d-flex justify-content-center align-items-center`}
            data-toggle="tooltip"
            data-placement="top"
            title={`${message.sender.name} (${message.sender.email})`}
          >
            <img
              src={doraImg}
              className={`rounded-circle ${styles.user_img_msg}`}
              alt=""
            />
          </div>
          <div
            className={`${styles.msg_container} ${
              message.receiver ? styles['bg-gray'] : ''
            }`}
            data-toggle="tooltip"
            data-placement="top"
            title={message.createdAt}
          >
            <div dangerouslySetInnerHTML={{ __html: highlight }}></div>
            {!!message.reactions.length && (
              <Reaction reactions={message.reactions} />
            )}
          </div>
          <div className={`${styles['msg-actions']} d-flex ml-2`}>
            <div className="d-flex align-items-center">
              <div ref={emojiRef}>
                <FontAwesomeIcon
                  icon={faFaceSmile}
                  color={'var(--color-primary)'}
                  title="React"
                  cursor="pointer"
                  onClick={showEmojiHandler}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MessageItem;

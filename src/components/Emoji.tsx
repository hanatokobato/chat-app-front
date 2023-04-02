import React, { useState, useContext, useRef } from 'react';
import { ICoordinates, IMessage } from './Room';
import { EmojiContext } from '../context/EmojiContext';
import styles from './Emoji.module.scss';

interface IProps {
  emojiCoordinates: ICoordinates;
  isShow: boolean;
  selectedMessage?: IMessage;
  selectEmoji: (emoji: any) => void;
  hideEmoji: () => void;
}

interface IUserReaction {
  emojiId: string;
  reactionId: string;
}

const defaultUserReaction = {
  emojiId: '-1',
  reactionId: '-1',
};

const Emoji = ({
  emojiCoordinates,
  isShow,
  selectedMessage,
  selectEmoji,
  hideEmoji,
}: IProps) => {
  const { emojis } = useContext(EmojiContext);
  const [userReaction] = useState<IUserReaction>(defaultUserReaction);
  const containerRef = useRef<HTMLDivElement>(null);

  return isShow ? (
    <div
      ref={containerRef}
      className={`${styles['emoji-container']} d-flex align-items-center`}
      style={{
        left: `${emojiCoordinates.x}px`,
        top: `${emojiCoordinates.y - 60}px`,
      }}
    >
      {emojis.map((e) => (
        <div
          className={styles['emoji-item']}
          key={e.src}
          onClick={() => selectEmoji(e)}
        >
          <div className={styles['emoji-text']}>{e.name}</div>
          <img src={e.src} alt={e.alt} />
          {userReaction.emojiId === e._id && <div className="dot"></div>}
        </div>
      ))}
      <div className="overlay"></div>
    </div>
  ) : (
    <></>
  );
};

export default Emoji;

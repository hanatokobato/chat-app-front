import React, { useState, useContext } from 'react';
import { ICoordinates, IMessage } from './Room';
import { EmojiContext } from '../context/EmojiContext';

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

  return isShow ? (
    <div
      className="emoji-container d-flex align-items-center"
      style={{
        left: `${emojiCoordinates.x}px`,
        top: `${emojiCoordinates.y - 60}px`,
      }}
    >
      {emojis.map((e) => (
        <div className="emoji-item" key={e.src} onClick={() => selectEmoji(e)}>
          <div className="emoji-text">{e.name}</div>
          <img src={e.src} alt={e.alt} />
          {userReaction.emojiId === e.id && <div className="dot"></div>}
        </div>
      ))}
      <div className="overlay"></div>
    </div>
  ) : (
    <></>
  );
};

export default Emoji;

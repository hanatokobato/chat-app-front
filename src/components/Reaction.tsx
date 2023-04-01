import React, { useContext, useState } from 'react';
import { EmojiContext } from '../context/EmojiContext';

interface IReaction {
  emoji_id: string;
}

interface IProps {
  reactions: IReaction[];
}

const Reaction = ({ reactions }: IProps) => {
  const { emojis } = useContext(EmojiContext);

  const [reactionFormat] = useState(() => {
    const listReactionEmojis = [];
    for (const e of emojis) {
      const index = reactions.findIndex((r) => r.emoji_id === e.id);
      if (index > -1) {
        const indexInList = listReactionEmojis.findIndex(
          (item) => item.id === e.id
        );
        if (indexInList === -1) {
          listReactionEmojis.push(e);
        }
      }
    }
    return listReactionEmojis;
  });

  return (
    <div className="reaction-container d-flex justify-content-center align-items-center">
      {reactionFormat.map((e) => (
        <div
          className="reaction-item d-flex"
          v-for="e in reactionFormat"
          key={e.id}
        >
          <img src={e.src} alt={e.alt} />
        </div>
      ))}
      <div className="reaction-item d-flex">
        <span className="total ml-1">{reactions.length}</span>
      </div>
    </div>
  );
};

export default Reaction;

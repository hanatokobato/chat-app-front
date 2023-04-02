import React, { useContext, useState, useEffect } from 'react';
import { EmojiContext } from '../context/EmojiContext';
import styles from './Reaction.module.scss';

interface IReaction {
  emoji_id: string;
}

interface IProps {
  reactions: IReaction[];
}

const Reaction = ({ reactions }: IProps) => {
  const { emojis } = useContext(EmojiContext);

  const [reactionFormat, setReactionFormat] = useState(() => {
    const listReactionEmojis = [];
    for (const e of emojis) {
      const index = reactions.findIndex((r) => r.emoji_id === e._id);
      if (index > -1) {
        const indexInList = listReactionEmojis.findIndex(
          (item) => item._id === e._id
        );
        if (indexInList === -1) {
          listReactionEmojis.push(e);
        }
      }
    }
    return listReactionEmojis;
  });

  useEffect(() => {
    const listReactionEmojis = [];
    for (const e of emojis) {
      const index = reactions.findIndex((r) => r.emoji_id === e._id);
      if (index > -1) {
        const indexInList = listReactionEmojis.findIndex(
          (item) => item._id === e._id
        );
        if (indexInList === -1) {
          listReactionEmojis.push(e);
        }
      }
    }
    setReactionFormat(listReactionEmojis);
  }, [reactions]);

  return (
    <div
      className={`${styles['reaction-container']} d-flex justify-content-center align-items-center`}
    >
      {reactionFormat.map((e) => (
        <div
          className={`${styles['reaction-item']} d-flex"`}
          v-for="e in reactionFormat"
          key={e._id}
        >
          <img src={e.src} alt={e.alt} />
        </div>
      ))}
      <div className={`${styles['reaction-item']} d-flex"`}>
        <span className={`${styles.total} ml-1`}>{reactions.length}</span>
      </div>
    </div>
  );
};

export default Reaction;

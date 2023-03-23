import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export interface IEmoji {
  id: string;
  name: string;
  value: string;
  src: string;
  alt: string;
}

interface IEmojiContext {
  emojis: IEmoji[];
}

export const EmojiContext = createContext<IEmojiContext>({
  emojis: [],
});

const EmojiProvider = ({ children }: any) => {
  const [emojis, setEmojis] = useState<IEmoji[]>([]);

  useEffect(() => {
    const fetchEmojis = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/v1/emojis`
        );
        setEmojis(response.data.data.emojis);
      } catch (e) {
        console.log(e);
      }
    };
    fetchEmojis();
  }, []);

  return (
    <EmojiContext.Provider value={{ emojis }}>{children}</EmojiContext.Provider>
  );
};

export default EmojiProvider;

import React, { useState, useContext } from 'react';
import ListUser from './ListUser';
import PrivateChat from './PrivateChat';
import SharedRoom from './SharedRoom';
import sanitizeHtml from 'sanitize-html';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

export interface IMessage {
  _id: string;
  reactions: {
    user_id: string;
    emoji_id: string;
  }[];
}

export interface IChat {
  hasNewMessage: boolean;
  isPrivateChatExpand: boolean;
  isSelectedReceiverTyping: boolean;
  isOnline: boolean;
  selectedReceiver?: {
    _id: string;
    name: string;
  };
  message: {
    list: IMessage[];
    currentPage?: number;
    perPage?: number;
    lastPage?: number;
    total?: number;
    newMessageArrived?: number;
    isLoading: boolean;
  };
  isSeen?: boolean;
  seenAt?: string;
  roomId: string;
}

export interface IRoom {
  _id: string;
  name: string;
  description: string;
}

export interface IUser {
  _id: string;
  name: string;
  email: string;
  new_messages: number;
}

export interface ICoordinates {
  x: number;
  y: number;
}

const initChat = {
  message: {
    list: [],
    isLoading: false,
  },
  selectedReceiver: undefined,
  isPrivateChatExpand: false,
  isSelectedReceiverTyping: false,
  hasNewMessage: false,
  isSeen: undefined,
  seenAt: '',
  roomId: '',
  isOnline: true,
};

const Room = () => {
  const { currentUser } = useContext(AuthContext);
  const [publicChat, setPublicChat] = useState<IChat>(initChat);
  const [privateChat, setPrivateChat] = useState<IChat>(initChat);
  const [selectedMessage, setSelectedMessge] = useState<IMessage>();
  const [isShowEmoji, setIsShowEmoji] = useState<boolean>(false);
  const [emojiCoordinates, setEmojiCoordinates] = useState<ICoordinates>();
  const [currentRoom, useCurrentRoom] = useState<IRoom>();
  const [usersOnline, setUsersOnline] = useState<IUser[]>([]);

  const getMessages = async (room: string, page = 1, loadMore = false) => {
    const isPrivate = room.toString().includes('__');
    const chat = isPrivate ? privateChat : publicChat;
    const setChat = isPrivate ? setPrivateChat : setPublicChat;
    try {
      setChat((currentChat) => ({
        ...currentChat,
        isLoading: true,
      }));
      const response = await axios.get(`/messages?room=${room}&page=${page}`);
      setChat((currentChat) => ({
        ...currentChat,
        message: {
          ...currentChat.message,
          list: [...response.data.data.reverse(), ...currentChat.message.list],
          currentPage: response.data.current_page,
          perPage: response.data.per_page,
          lastPage: response.data.last_page,
          total: response.data.total,
          newMessageArrived: response.data.data.length,
        },
      }));

      // TODO: scroll
      // if (loadMore) {
      //   this.$nextTick(() => {
      //     const el = $(isPrivate ? '#private_room' : '#shared_room')
      //     const lastFirstMessage = el.children().eq(chat.message.newMessageArrived - 1)
      //     el.scrollTop(lastFirstMessage.position().top - 10)
      //   })
      // } else {
      //   this.scrollToBottom(document.getElementById(isPrivate ? 'private_room' : 'shared_room'), false)
      // }
    } catch (error) {
      console.log(error);
    } finally {
      setChat((currentChat) => ({
        ...currentChat,
        isLoading: false,
      }));
    }
  };

  const resetPrivateChat = () => {
    setPrivateChat(initChat);
  };

  const closePrivateChat = () => {
    resetPrivateChat();
  };

  const saveMessage = async (message: string, receiver = null) => {
    try {
      if (!receiver && !message.trim().length) {
        return;
      }
      message = sanitizeHtml(message).trim();
      if (!message.length) {
        return;
      }
      const response = await axios.post('/messages', {
        receiver,
        content: message,
        room: receiver ? null : currentRoom!._id,
      });
      if (receiver) {
        setPrivateChat((currentChat) => {
          return {
            ...currentChat,
            message: {
              ...currentChat.message,
              list: [...currentChat.message.list, response.data.message],
            },
            isSeen: false,
          };
        });
        // TODO: broadcast typing
        // this.$Echo
        //   .private(`room.${this.privateChat.roomId}`)
        //   .whisper('typing', {
        //     user: this.$root.user,
        //     isTyping: false,
        //   });
      } else {
        setPublicChat((currentChat) => {
          return {
            ...currentChat,
            message: {
              ...currentChat.message,
              list: [...currentChat.message.list, response.data.message],
            },
          };
        });
      }
      // TODO: scroll to bottom
      // this.scrollToBottom(
      //   document.getElementById(`${receiver ? 'private' : 'shared'}_room`),
      //   true
      // );
    } catch (error) {
      console.log(error);
    }
  };

  const focusPrivateInput = () => {
    const input = document.getElementById('private_input');
    if (input) {
      input.focus();
      // TODO: broadcast seen
      // this.$Echo.private(`room.${this.privateChat.roomId}`)
      //   .whisper('seen', {
      //     user: this.$root.user,
      //     seen: true,
      //     time: new Date()
      //   })
      setPrivateChat((currentChat) => {
        return { ...currentChat, hasNewMessage: false };
      });
      const index = usersOnline.findIndex(
        (item) => item._id === privateChat!.selectedReceiver!._id
      );
      if (index > -1) {
        setUsersOnline((currentUsers) => {
          return currentUsers.map((user, i) => {
            if (index === i) {
              return { ...user, new_messages: 0 };
            } else {
              return user;
            }
          });
        });
      }
    }
  };

  const showEmoji = (message: IMessage, event: any) => {
    setEmojiCoordinates({
      x: event.clientX,
      y: event.clientY,
    });
    setIsShowEmoji(true);
    setSelectedMessge(message);
  };

  const hideEmoji = () => {
    setIsShowEmoji(false);
    setSelectedMessge(undefined);
  };

  const selectEmoji = async (emoji: any) => {
    try {
      if (!selectedMessage) return;

      const response = await axios.post('/reactions', {
        msg_id: selectedMessage._id,
        user_id: currentUser!.id,
        emoji_id: emoji.id,
      });
      const index = selectedMessage.reactions.findIndex(
        (item) => item.user_id === currentUser!.id
      );
      if (index > -1) {
        const reaction = selectedMessage.reactions[index];
        if (emoji.id === reaction.emoji_id) {
          // deactive
          selectedMessage.reactions.splice(index, 1);
        } else {
          reaction.emoji_id = emoji.id;
        }
      } else {
        // user first react
        const { reaction } = response.data;
        setSelectedMessge((currentMessage) => {
          return {
            ...currentMessage!,
            reactions: [
              ...currentMessage!.reactions,
              { ...reaction, user: currentUser },
            ],
          };
        });
      }
      hideEmoji();
    } catch (error) {
      console.log(error);
    }
  };

  const selectReceiver = async (receiver: IUser) => {
    if (currentUser!.id === receiver._id) {
      return;
    }
    resetPrivateChat();
    const roomId =
      currentUser!.id > receiver._id
        ? `${receiver._id}__${currentUser!.id}`
        : `${currentUser!.id}__${receiver._id}`;
    setPrivateChat((currentChat) => ({
      ...currentChat,
      selectedReceiver: receiver,
      isPrivateChatExpand: true,
      roomId,
    }));
    // TODO: subscribe typing
    // this.$Echo.private(`room.${roomId}`) // this room to receive whisper events
    //   .listenForWhisper('typing', (e) => {
    //     this.privateChat.isSelectedReceiverTyping = e.isTyping
    //     this.scrollToBottom(document.getElementById('private_room'), true)
    //   })
    //   .listenForWhisper('seen', (e) => {
    //     if (this.privateChat.isSeen === false) { // check if user waiting for his message to be seen
    //       this.privateChat.isSeen = true
    //       this.privateChat.seenAt = e.time
    //       this.scrollToBottom(document.getElementById('private_room'), true)
    //     }
    //   })
    //   .listen('MessageReacted', e => {
    //     this.onOtherUserReaction(e.reaction, 'private')
    //   })
    await getMessages(roomId); // need to await until messages are loaded first then we are able to focus the input below
  };

  return (
    <div className="row justify-content-center h-100">
      <div className="col-md-8 chat">
        <SharedRoom
          chat={publicChat}
          currentRoom={currentRoom}
          selectedMessage={selectedMessage}
          isShowEmoji={isShowEmoji}
          emojiCoordinates={emojiCoordinates}
          saveMessage={saveMessage}
          showEmoji={showEmoji}
          hideEmoji={hideEmoji}
          selectEmoji={selectEmoji}
          // @getMessages="getMessages"
        />
      </div>
      <div className="col-md-4 chat">
        <ListUser usersOnline={usersOnline} selectReceiver={selectReceiver} />
      </div>
      {privateChat.selectedReceiver && (
        <PrivateChat
          chat={privateChat}
          selectedMessage={selectedMessage}
          isShowEmoji={isShowEmoji}
          emojiCoordinates={emojiCoordinates}
          closePrivateChat={closePrivateChat}
          saveMessage={saveMessage}
          focusPrivateInput={focusPrivateInput}
          showEmoji={showEmoji}
          hideEmoji={hideEmoji}
          selectEmoji={selectEmoji}
          // @getMessages="getMessages"
        />
      )}
    </div>
  );
};

export default Room;

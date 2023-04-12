import React, { useState, useContext, useEffect, useCallback } from 'react';
import ListUser from './ListUser';
import PrivateChat from './PrivateChat';
import SharedRoom from './SharedRoom';
import sanitizeHtml from 'sanitize-html';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useLoaderData } from 'react-router-dom';
import styles from './Room.module.scss';

export interface IMessage {
  _id: string;
  message: string;
  type: string;
  sender: IUser;
  receiver: IUser;
  createdAt: string;
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
  color: string;
}

export interface ICoordinates {
  x: number;
  y: number;
}

interface ILoader {
  room: IRoom;
}

export const loader = async ({ request, params }: any) => {
  const roomId = params.id;

  const response = await axios.get(
    `${process.env.REACT_APP_API_URL}/api/v1/rooms/${roomId}`
  );
  const { room } = response.data.data;

  return { room };
};

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
  const { room } = useLoaderData() as ILoader;
  const { currentUser } = useContext(AuthContext);
  const [publicChat, setPublicChat] = useState<IChat>(initChat);
  const [privateChat, setPrivateChat] = useState<IChat>(initChat);
  const [selectedMessage, setSelectedMessge] = useState<IMessage>();
  const [isShowEmoji, setIsShowEmoji] = useState<boolean>(false);
  const [emojiCoordinates, setEmojiCoordinates] = useState<ICoordinates>();
  const [currentRoom, setCurrentRoom] = useState<IRoom>();
  const [usersOnline, setUsersOnline] = useState<IUser[]>([]);

  const getMessages = useCallback(
    async (room: string, page = 1, loadMore = false) => {
      const isPrivate = room.toString().includes('__');
      const setChat = isPrivate ? setPrivateChat : setPublicChat;
      try {
        setChat((currentChat) => ({
          ...currentChat,
          isLoading: true,
        }));
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/v1/messages?room=${room}&page=${page}`
        );
        const responseMessages = response.data.data.messages.map((m: any) => ({
          ...m,
          reactions: m.reactions.map((r: any) => ({
            emoji_id: r.emoji._id,
            user_id: r.user._id,
          })),
        }));
        setChat((currentChat) => {
          return {
            ...currentChat,
            message: {
              ...currentChat.message,
              list: [
                ...responseMessages.reverse(),
                // ...currentChat.message.list, // TODO: uncomment
              ],
              currentPage: response.data.current_page,
              perPage: response.data.per_page,
              lastPage: response.data.last_page,
              total: response.data.total,
              newMessageArrived: response.data.data.length,
            },
          };
        });

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
    },
    []
  );

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
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/v1/messages`,
        {
          receiver,
          message,
          room: receiver ? null : currentRoom!._id,
        }
      );
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
              list: [
                ...currentChat.message.list,
                { ...response.data.data.message, reactions: [] },
              ],
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
  };

  const selectEmoji = async (emoji: any) => {
    try {
      if (!selectedMessage) return;

      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/v1/reactions`,
        {
          msg_id: selectedMessage._id,
          user_id: currentUser!.id,
          emoji_id: emoji._id,
        }
      );
      getMessages(room._id);
      // const index = selectedMessage.reactions.findIndex(
      //   (item) => item.user_id === currentUser!.id
      // );
      // if (index > -1) {
      //   const reaction = selectedMessage.reactions[index];
      //   if (emoji._id === reaction.emoji_id) {
      //     // deactive
      //     setSelectedMessge((currentMessage) => {
      //       const newReactions = [...currentMessage!.reactions];
      //       newReactions.splice(index, 1);
      //       return {
      //         ...currentMessage!,
      //         reactions: newReactions,
      //       };
      //     });
      //     // selectedMessage.reactions.splice(index, 1);
      //   } else {
      //     setSelectedMessge((currentMessage) => {
      //       const newReactions = [...currentMessage!.reactions];
      //       newReactions[index].emoji_id = emoji._id;
      //       return {
      //         ...currentMessage!,
      //         reactions: newReactions,
      //       };
      //     });
      //     // reaction.emoji_id = emoji._id;
      //   }
      // } else {
      //   // user first react
      //   setSelectedMessge((currentMessage) => {
      //     return {
      //       ...currentMessage!,
      //       reactions: [
      //         ...currentMessage!.reactions,
      //         {
      //           msg_id: selectedMessage._id,
      //           user_id: currentUser!.id,
      //           emoji_id: emoji._id,
      //         },
      //       ],
      //     };
      //   });
      // }
      // setPublicChat((current) => {
      //   const newMessages = current.message.list.map((msg) =>
      //     msg._id === selectedMessage._id ? { ...selectedMessage } : msg
      //   );

      //   return Object.assign(
      //     {},
      //     {
      //       ...current,
      //       message: {
      //         ...current.message,
      //         list: newMessages,
      //       },
      //     }
      //   );
      // });
      setSelectedMessge(undefined);
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

  useEffect(() => {
    if (room) {
      setCurrentRoom(room);
      getMessages(room._id);
    }

    // TODO: join room ws

    // TODO: listen to user in private chat
  }, [room]);

  return (
    <>
      <div className={styles.overview}>
        <div className={styles.overview__heading}>
          <h1>{currentRoom?.name}</h1>
          <h5>{currentRoom?.description}</h5>
        </div>
      </div>
      <div className={styles.detail}>
        <div className={`col-md-9 ${styles['chat--shared']}`}>
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
        <div className="flex-grow-1">
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
    </>
  );
};

export default Room;

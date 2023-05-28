import React, {
  useState,
  useContext,
  useEffect,
  useCallback,
  useReducer,
} from 'react';
import ListUser from './ListUser';
import PrivateChat from './PrivateChat';
import SharedRoom from './SharedRoom';
import sanitizeHtml from 'sanitize-html';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useLoaderData } from 'react-router-dom';
import styles from './Room.module.scss';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import { cloneDeep } from 'lodash';
import Chat from './Chat';
import AppError from '../utils/AppError';

export interface IMessage {
  _id: string;
  message: string;
  type: string;
  sender: IUser;
  receiver: IUser;
  createdAt: string;
  seenAt: string;
  reactions: {
    user_id: string;
    emoji_id: string;
  }[];
}

interface IChatMessage {
  list: IMessage[];
  currentPage?: number;
  perPage?: number;
  lastPage?: number;
  total?: number;
  newMessageArrived?: number;
  isLoading: boolean;
}

export interface IChat {
  hasNewMessage: boolean;
  isPrivateChatExpand: boolean;
  isSelectedReceiverTyping: boolean;
  isOnline: boolean;
  selectedReceiver?: IUser;
  message: IChatMessage;
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
  photo?: string;
}

export interface ICoordinates {
  x: number;
  y: number;
}

interface ILoader {
  room: IRoom;
}

enum ChatReducerTypes {
  PUSH_MESSAGE,
  TOGGLE_LOADING,
  SET_MESSAGES,
  TOGGLE_HAS_NEW_MESSAGE,
  RESET_CHAT,
  OPEN_PRIVATE_CHAT,
  LOAD_MORE,
  TOGGLE_PRIVATE_CHAT,
  TOGGLE_TYPING,
  TOGGLE_SEEN,
  UPDATE_REACTION,
}

interface IChatReducerActionPushMessage {
  type: ChatReducerTypes.PUSH_MESSAGE;
  message: IMessage;
}

interface IChatReducerActionToggleLoading {
  type: ChatReducerTypes.TOGGLE_LOADING;
  isLoading: boolean;
}

interface IChatReducerActionToggleHasNewMessage {
  type: ChatReducerTypes.TOGGLE_HAS_NEW_MESSAGE;
  hasNewMessage: boolean;
}

interface IChatReducerActionSetMessages {
  type: ChatReducerTypes.SET_MESSAGES;
  message: IChatMessage;
}

interface IChatReducerActionLoadMore {
  type: ChatReducerTypes.LOAD_MORE;
  message: IChatMessage;
}

interface IChatReducerActionReset {
  type: ChatReducerTypes.RESET_CHAT;
}

interface IChatReducerActionOpenPrivateChat {
  type: ChatReducerTypes.OPEN_PRIVATE_CHAT;
  receiver: IUser;
  roomId: string;
}

interface IChatReducerActionTogglePrivateChatDisplay {
  type: ChatReducerTypes.TOGGLE_PRIVATE_CHAT;
}

interface IChatReducerActionToggleIsTyping {
  type: ChatReducerTypes.TOGGLE_TYPING;
  isTyping: boolean;
}

interface IChatReducerActionToggleSeen {
  type: ChatReducerTypes.TOGGLE_SEEN;
  seen: boolean;
  seenAt: string;
  messageId: string;
}

interface IChatReducerActionUpdateReaction {
  type: ChatReducerTypes.UPDATE_REACTION;
  messageId: string;
  userId: string;
  emojiId: string;
  updateType: string;
}

type IChatReducerAction =
  | IChatReducerActionPushMessage
  | IChatReducerActionToggleLoading
  | IChatReducerActionSetMessages
  | IChatReducerActionToggleHasNewMessage
  | IChatReducerActionReset
  | IChatReducerActionOpenPrivateChat
  | IChatReducerActionLoadMore
  | IChatReducerActionTogglePrivateChatDisplay
  | IChatReducerActionToggleIsTyping
  | IChatReducerActionToggleSeen
  | IChatReducerActionUpdateReaction;

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

const publicChatReducer = (state: IChat, action: IChatReducerAction) => {
  const currentChat = cloneDeep(state);
  if (action.type === ChatReducerTypes.PUSH_MESSAGE) {
    currentChat.message.list.push(action.message);
    currentChat.hasNewMessage = true;
  }

  if (action.type === ChatReducerTypes.TOGGLE_HAS_NEW_MESSAGE) {
    currentChat.hasNewMessage = action.hasNewMessage;
  }

  if (action.type === ChatReducerTypes.TOGGLE_LOADING) {
    currentChat.message.isLoading = action.isLoading;
  }

  if (
    action.type === ChatReducerTypes.LOAD_MORE &&
    currentChat.message.currentPage !== action.message.currentPage
  ) {
    currentChat.message = {
      ...action.message,
      list: [...action.message.list, ...currentChat.message.list],
    };
  }

  if (action.type === ChatReducerTypes.SET_MESSAGES) {
    currentChat.message = action.message;
  }

  if (action.type === ChatReducerTypes.UPDATE_REACTION) {
    const reactMessage = currentChat.message.list.find(
      (m) => m._id === action.messageId
    );
    if (reactMessage) {
      switch (action.updateType) {
        case 'reaction_created':
          reactMessage.reactions.push({
            user_id: action.userId,
            emoji_id: action.emojiId,
          });
          break;
        case 'reaction_updated':
          reactMessage.reactions = reactMessage.reactions.filter(
            (r) => r.user_id !== action.userId
          );
          reactMessage.reactions.push({
            user_id: action.userId,
            emoji_id: action.emojiId,
          });
          break;
        case 'reaction_deleted':
          reactMessage.reactions = reactMessage.reactions.filter(
            (r) => r.user_id !== action.userId
          );
          break;
      }
    }
  }

  return currentChat;
};

const privateChatReducer = (state: IChat, action: IChatReducerAction) => {
  const currentChat = cloneDeep(state);

  if (action.type === ChatReducerTypes.PUSH_MESSAGE) {
    currentChat.message.list.push(action.message);
    currentChat.isSeen = undefined;
    currentChat.hasNewMessage = true;
  }

  if (action.type === ChatReducerTypes.SET_MESSAGES) {
    currentChat.message = action.message;
    const lastMsg = action.message.list.at(-1);
    currentChat.isSeen = !!lastMsg?.createdAt;
  }

  if (action.type === ChatReducerTypes.TOGGLE_HAS_NEW_MESSAGE) {
    currentChat.hasNewMessage = action.hasNewMessage;
  }

  if (action.type === ChatReducerTypes.RESET_CHAT) {
    return initChat;
  }

  if (action.type === ChatReducerTypes.OPEN_PRIVATE_CHAT) {
    currentChat.selectedReceiver = action.receiver;
    currentChat.roomId = action.roomId;
    currentChat.isPrivateChatExpand = true;
  }

  if (action.type === ChatReducerTypes.TOGGLE_PRIVATE_CHAT) {
    currentChat.isPrivateChatExpand = !currentChat.isPrivateChatExpand;
  }

  if (action.type === ChatReducerTypes.TOGGLE_TYPING) {
    currentChat.isSelectedReceiverTyping = action.isTyping;
  }

  if (action.type === ChatReducerTypes.TOGGLE_SEEN) {
    currentChat.message.list.forEach((message, index, arr) => {
      if (action.messageId === message._id) arr[index].seenAt = action.seenAt;
    });
  }

  return currentChat;
};

const Room = () => {
  const { room } = useLoaderData() as ILoader;
  const { currentUser } = useContext(AuthContext);
  const [publicChat, dispatchPublicChat] = useReducer(
    publicChatReducer,
    initChat
  );
  const [privateChat, dispatchPrivateChat] = useReducer(
    privateChatReducer,
    initChat
  );
  const [selectedMessage, setSelectedMessge] = useState<IMessage>();
  const [isShowEmoji, setIsShowEmoji] = useState<boolean>(false);
  const [emojiCoordinates, setEmojiCoordinates] = useState<ICoordinates>();
  const [currentRoom, setCurrentRoom] = useState<IRoom>();
  const [usersOnline, setUsersOnline] = useState<IUser[]>([]);
  const { sendMessage: sendWsEvent, lastMessage, readyState } = useWebSocket(
    `${process.env.REACT_APP_API_WS_URL}/rooms/${room._id}`,
    {
      shouldReconnect: (closeEvent) => true,
      reconnectAttempts: 5,
      reconnectInterval: (attemptNumber) =>
        Math.min(Math.pow(2, attemptNumber) * 1000, 10000),
    }
  );

  const getMessages = useCallback(
    async (room: string, page = 1, loadMore = false) => {
      const isPrivate = room.toString().includes('__');
      const setChat = isPrivate ? dispatchPrivateChat : dispatchPublicChat;
      try {
        setChat({ type: ChatReducerTypes.TOGGLE_LOADING, isLoading: true });
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
        setChat({
          type: loadMore
            ? ChatReducerTypes.LOAD_MORE
            : ChatReducerTypes.SET_MESSAGES,
          message: {
            list: [...responseMessages.reverse()],
            currentPage: response.data.currentPage,
            perPage: response.data.perPage,
            lastPage: response.data.lastPage,
            total: response.data.result,
            isLoading: false,
            newMessageArrived: response.data.data.length,
          },
        });

        setChat({
          type: ChatReducerTypes.TOGGLE_HAS_NEW_MESSAGE,
          hasNewMessage: !loadMore,
        });
      } catch (error) {
        console.log(error);
      } finally {
        setChat({ type: ChatReducerTypes.TOGGLE_LOADING, isLoading: false });
      }
    },
    []
  );

  const resetPrivateChat = () => {
    dispatchPrivateChat({ type: ChatReducerTypes.RESET_CHAT });
  };

  const closePrivateChat = () => {
    resetPrivateChat();
  };

  const saveMessage = async (message: string, receiver?: string) => {
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
        dispatchPrivateChat({
          type: ChatReducerTypes.PUSH_MESSAGE,
          message: { ...response.data.data.message, reactions: [] },
        });
        sendWsEvent(
          JSON.stringify({
            type: 'typing',
            isTyping: false,
            receiverId: privateChat.selectedReceiver?._id,
          })
        );
      } else {
        dispatchPublicChat({
          type: ChatReducerTypes.PUSH_MESSAGE,
          message: { ...response.data.data.message, reactions: [] },
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  const focusPrivateInput = () => {
    const input = document.getElementById('private_input');
    if (input) {
      input.focus();
      dispatchPrivateChat({
        type: ChatReducerTypes.TOGGLE_HAS_NEW_MESSAGE,
        hasNewMessage: false,
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
    dispatchPrivateChat({
      type: ChatReducerTypes.OPEN_PRIVATE_CHAT,
      receiver,
      roomId,
    });
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
  }, [room]);

  useEffect(() => {
    if (lastMessage !== null) {
      const { eventType, eventData } = JSON.parse(lastMessage.data);
      switch (eventType) {
        case 'message':
          if (
            eventData.message.room._id &&
            eventData.message.room._id === room._id
          ) {
            dispatchPublicChat({
              type: ChatReducerTypes.PUSH_MESSAGE,
              message: { ...eventData.message, reactions: [] },
            });
          } else if (
            !eventData.message.room._id &&
            eventData.message.receiver._id === currentUser?.id
          ) {
            if (
              privateChat.selectedReceiver &&
              eventData.message.sender._id ===
                privateChat.selectedReceiver._id &&
              privateChat.isPrivateChatExpand
            ) {
              dispatchPrivateChat({
                type: ChatReducerTypes.PUSH_MESSAGE,
                message: { ...eventData.message, reactions: [] },
              });
            } else {
              setUsersOnline((users) => {
                const currentUsers = cloneDeep(users);
                return currentUsers.map((u) => {
                  if (u._id === eventData.message.sender._id) {
                    u.new_messages++;
                  }
                  return u;
                });
              });
            }
          }
          break;
        case 'users':
          setUsersOnline(
            eventData.users.map((u: any) => ({
              ...u,
              new_messages: 0,
              photo: u.photoUrl,
            }))
          );
          break;
        case 'joining':
          setUsersOnline((cur) => [
            ...cur,
            { ...eventData.user, photo: eventData.user.photoUrl },
          ]);
          break;
        case 'leaving':
          setUsersOnline((cur) =>
            cur.filter((u) => u._id !== eventData.user._id)
          );
          break;
        case 'typing':
          dispatchPrivateChat({
            type: ChatReducerTypes.TOGGLE_TYPING,
            isTyping: eventData.isTyping,
          });
          break;
        case 'seen':
          dispatchPrivateChat({
            type: ChatReducerTypes.TOGGLE_SEEN,
            seen: eventData.seen,
            seenAt: eventData.seenAt,
            messageId: eventData.messageId,
          });
          break;
        case 'reaction_created':
        case 'reaction_updated':
        case 'reaction_deleted':
          dispatchPublicChat({
            type: ChatReducerTypes.UPDATE_REACTION,
            updateType: eventType,
            messageId: eventData.reaction.message_id,
            userId: eventData.reaction.user_id,
            emojiId: eventData.reaction.emoji_id,
          });
          break;
      }
    }
  }, [lastMessage]);

  useEffect(() => {
    const updateSeen = async (messageId: string) => {
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/v1/messages/${messageId}`,
        {
          seenAt: new Date(),
        }
      );

      if (response.data.status === 'success') {
        const message = response.data.data.message;
        dispatchPrivateChat({
          type: ChatReducerTypes.TOGGLE_SEEN,
          seen: true,
          seenAt: message.seenAt,
          messageId: message._id,
        });
        sendWsEvent(
          JSON.stringify({
            type: 'seen',
            seen: true,
            seenAt: message.seenAt,
            messageId: message._id,
            receiverId: privateChat.selectedReceiver?._id,
          })
        );
      }
    };

    const lastMsg = privateChat.message.list.at(-1);
    if (
      privateChat.selectedReceiver?._id &&
      privateChat.isPrivateChatExpand &&
      lastMsg &&
      !lastMsg.seenAt &&
      lastMsg.receiver._id === currentUser?.id
    ) {
      updateSeen(lastMsg._id);
    }
  }, [
    privateChat.message.list,
    privateChat.selectedReceiver,
    privateChat.isPrivateChatExpand,
  ]);

  const connectionStatus = {
    [ReadyState.CONNECTING]: 'Connecting',
    [ReadyState.OPEN]: 'Open',
    [ReadyState.CLOSING]: 'Closing',
    [ReadyState.CLOSED]: 'Closed',
    [ReadyState.UNINSTANTIATED]: 'Uninstantiated',
  }[readyState];

  return (
    <>
      <div className={styles.overview}>
        <div className={styles.overview__heading}>
          <h1>{currentRoom?.name}</h1>
          <h5>
            {currentRoom?.description} ({connectionStatus})
          </h5>
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
            getMessages={getMessages}
            toggleHasNewMessage={(hasNewMessage: boolean) => {
              dispatchPublicChat({
                type: ChatReducerTypes.TOGGLE_HAS_NEW_MESSAGE,
                hasNewMessage: hasNewMessage,
              });
            }}
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
            sendWsEvent={sendWsEvent}
            togglePrivateChat={() => {
              dispatchPrivateChat({
                type: ChatReducerTypes.TOGGLE_PRIVATE_CHAT,
              });
            }}
          />
        )}
      </div>
    </>
  );
};

export default Room;

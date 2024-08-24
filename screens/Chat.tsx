import React, {useContext, useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Entypo from 'react-native-vector-icons/Entypo';
import io from 'socket.io-client';
import {GlobalState} from './Context/GlobalState';
import {UserBaseURL} from './Components/API';
import Toast from 'react-native-toast-message';
import EmojiSelector from 'react-native-emoji-selector';
import Feather from 'react-native-vector-icons/Feather';
import AntDesign from 'react-native-vector-icons/AntDesign';
import {axiosInstance} from './Components/AxiosConfig';
import Card from './Components/Card';

const ENDPOINT = UserBaseURL;
const Chat = () => {
  const {user, darkMode} = useContext(GlobalState);
  const userId = user?._id;
  const [updateUI, setUpdateUI] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState<any>([]);
  const [chatUsers, setChatUsers] = useState([]);
  const [chatId, setChatId] = useState(null);
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const [showAddUserModal, setAddUserModal] = useState(false);
  const [fullScreenMode, setFullScreenMode] = useState(false);
  const containerRef = useRef<any>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollToEnd({animated: true});
    }
  }, [messages, fullScreenMode]);
  const socket: any = useRef(null);

  useEffect(() => {
    socket.current = io(ENDPOINT);
    socket.current.emit('setup', userId);
    socket.current.on('connection', () => setIsSocketConnected(true));
    socket.current.on('message received', (newMessageReceived: any) => {
      if (!chatId || chatId !== newMessageReceived.chat._id) {
        return;
      }
      setMessages((prevMessages: any) => [...prevMessages, newMessageReceived]);
      setUpdateUI(prev => !prev);
    });
    return () => {
      socket.current.disconnect();
    };
  }, [userId, chatId]);

  useEffect(() => {
    axiosInstance
      .get(`${UserBaseURL}/chat/`)
      .then(res => {
        setChatUsers(res.data);
      })
      .catch(error => {
        console.log('user error fetch chat', error);
        Toast.show({
          type: 'error',
          text1:
            error.response?.data?.message ||
            'An error occurred while fetching chat.',
        });
      });
  }, [updateUI, chatUsers]);

  useEffect(() => {
    if (chatId) {
      axiosInstance
        .get(`${UserBaseURL}/message/${chatId}`)
        .then(res => {
          setMessages(res.data || []);
          socket.current.emit('join chat', chatId);
        })
        .catch(error => {
          console.log('error fetching messages', error);
        });
    }
  }, [chatId]);

  const handleSendMessage = async () => {
    if (inputMessage.trim()) {
      try {
        const res = await axiosInstance.post(`${UserBaseURL}/message/`, {
          content: inputMessage,
          chatId,
        });
        socket.current.emit('new message', res.data);
        setMessages((prevMessages: any) => [...prevMessages, res.data]);
        setUpdateUI(prev => !prev);
        setInputMessage('');
      } catch (error: any) {
        console.log('error sending message', error);
        Toast.show({
          type: 'error',
          text1:
            error.response?.data?.message ||
            'An error occurred while sending the message.',
        });
      }
    }
  };

  const handleEmojiClick = (emoji: any) => {
    setInputMessage(inputMessage + emoji);
    // setShowEmojiPicker(false);
  };

  const styles = StyleSheet.create({
    container: {flex: 1},
    newChatButton: {
      backgroundColor: 'red',
      zIndex: 999,
      padding: 10,
      borderRadius: 50,
      position: 'absolute',
      right: 10,
    },
    chatContainer: {flex: 1, flexDirection: 'row'},
    sidebar: {
      width: '100%',
      flex: 1,
    },
    sidebarHeader: {
      padding: 20,
      fontSize: 30,
      fontWeight: 'bold',
      color: darkMode ? 'white' : 'black',
    },
    noUsersText: {textAlign: 'center', marginTop: 20},
    chatItem: {flexDirection: 'row', padding: 10, alignItems: 'center'},
    selectedChat: {
      backgroundColor: darkMode ? '#1B254B' : '#e0e0e0',
      borderRadius: 9,
    },
    userAvatar: {width: 40, height: 40, borderRadius: 20},
    chatInfo: {marginLeft: 10},
    chatName: {fontWeight: 'bold', color: darkMode ? 'white' : 'black'},
    chatPreview: {color: darkMode ? '#d3d3d3' : '#555555'},
    chatArea: {flex: 1},
    messagesContainer: {flex: 1},
    noMessages: {flex: 1, justifyContent: 'center', alignItems: 'center'},
    noMessagesText: {fontSize: 18, color: '#aaa'},
    message: {flexDirection: 'row', marginVertical: 5},
    sentMessage: {
      alignSelf: 'flex-end',
      backgroundColor: '#007BFF',
      padding: 10,
      borderRadius: 10,
    },
    receivedMessage: {
      alignSelf: 'flex-start',
      backgroundColor: '#f1f1f1',
      padding: 10,
      borderRadius: 10,
    },
    messageAvatar: {width: 30, height: 30, borderRadius: 15, marginRight: 10},
    inputContainer: {flexDirection: 'row', alignItems: 'center'},
    input: {
      flex: 1,
      borderWidth: 1,
      borderColor: '#ddd',
      borderRadius: 20,
      paddingHorizontal: 10,
    },
    userList: {
      flexGrow: 1,
    },
    placeholderContainer: {
      justifyContent: 'center',
      alignItems: 'center',
      flex: 1,
    },
    placeholderText: {fontSize: 18, color: darkMode ? 'white' : 'black'},

    // New Styles
    groupChatAvatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: '#e0e0e0',
      justifyContent: 'center',
      alignItems: 'center',
    },
    avatarText: {
      fontSize: 20,
      color: '#000',
    },
    selectedChatUserContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      // paddingVertical: 2,
      backgroundColor: darkMode ? '#0a1d43' : '#fff',
    },
    selectedChatUser: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    userName: {
      marginLeft: 10,
      fontSize: 16,
      fontWeight: '900',
      color: darkMode ? '#fff' : '#000',
    },
    messageContent: {
      maxWidth: '80%',
      color: 'black',
      flexDirection: 'column',
    },
    messageText: {
      color: 'black',
    },
    sentMessageText: {
      color: 'white',
    },
    messageMeta: {
      flexDirection: 'row',
      justifyContent: 'flex-start',
      marginTop: 4,
    },
    messageTime: {
      fontSize: 10,
      color: '#858383',
      marginRight: 6,
    },
    sendMessageTime: {
      fontSize: 10,
      color: '#e3e1e1',
      marginRight: 6,
    },
    messageSeen: {
      fontSize: 10,
      color: '#a9a9a9',
    },
  });

  const renderChatList = () => (
    <View style={styles.sidebar}>
      <Text style={styles.sidebarHeader}>
        <Entypo
          name="chat"
          size={29}
          style={{color: darkMode ? 'white' : 'black',}}
        />{' '}
        Chat
      </Text>
      <View
        style={{
          borderBottomColor: 'gray',
          elevation: 2,
          borderBottomWidth: 0.2,
          marginBottom: 10,
          width: '100%',
        }}></View>
      <ScrollView
        contentContainerStyle={styles.userList}
        showsVerticalScrollIndicator={false}>
        {chatUsers.length === 0 ? (
          <View style={styles.placeholderContainer}>
            <Text style={styles.placeholderText}>No users found</Text>
          </View>
        ) : (
          chatUsers.map((chat: any) => {
            // Common latest message text formatting
            const latestMessage = chat.latestMessage;
            const latestMessageText = latestMessage
              ? ` ${
                  latestMessage.sender.UserName === user.UserName
                    ? 'You'
                    : latestMessage.sender.UserName
                }: ${latestMessage.content}`
              : '';

            return (
              <TouchableOpacity
                key={chat._id}
                style={[
                  styles.chatItem,
                  chat._id === chatId ? styles.selectedChat : null,
                ]}
                onPress={() => {
                  setChatId(chat._id);
                  setFullScreenMode(true);
                }}>
                {/* Group Chat Handling */}
                {chat.isGroupChat ? (
                  <>
                    <View style={styles.groupChatAvatar}>
                      <Text style={styles.avatarText}>G</Text>
                    </View>
                    <View style={styles.chatInfo}>
                      <Text style={styles.chatName}>{chat.chatName}</Text>
                      <Text style={styles.chatPreview}>
                        {latestMessageText}
                      </Text>
                    </View>
                  </>
                ) : (
                  // Individual Chat Handling
                  chat.users
                    .filter(
                      (chatUser: any) => chatUser._id.toString() !== user._id,
                    )
                    .map((chatUser: any) => (
                      <View key={chatUser._id} style={styles.chatItem}>
                        <Image
                          source={{uri: chatUser.ProfilePic}}
                          style={styles.userAvatar}
                        />
                        <View style={styles.chatInfo}>
                          <Text style={styles.chatName}>
                            {chatUser.UserName}
                          </Text>
                          <Text style={styles.chatPreview}>
                            {latestMessageText}
                          </Text>
                        </View>
                      </View>
                    ))
                )}
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </View>
  );

  const style = StyleSheet.create({
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    inputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    input: {
      flex: 1,
      borderWidth: 1,
      borderColor: '#ddd',
      borderRadius: 20,
      paddingHorizontal: 10,
      paddingRight: 50,
      color: darkMode ? '#fff' : '#333',
    },
    emojiButton: {
      position: 'absolute',
      right: 10,
      top: '50%',
      transform: [{translateY: -12}], // Center vertically within the input
      zIndex: 1,
    },
  });
  const renderChatArea = () => (
    <Card
      key={1}
      style={{
        marginVertical: 4,
        borderRadius: 8,
        paddingBottom: 6,
        paddingTop: 0,
        backgroundColor: darkMode ? '#0a1d43' : '#fff',
        elevation: 1,
        flex: 1,
      }}>
      {/* Display selected user above the chat area */}
      {chatId && (
        <View
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
          <View style={styles.selectedChatUserContainer}>
            {chatUsers
              .filter((chat: any) => chat._id === chatId)
              .map((chat: any) => (
                <View key={chat._id} style={styles.selectedChatUser}>
                  {!chat.isGroupChat &&
                    chat.users
                      .filter(
                        (chatUser: any) => chatUser._id.toString() !== user._id,
                      )
                      .map((chatUser: any) => (
                        <View key={chatUser._id} style={styles.chatItem}>
                          <Image
                            source={{uri: chatUser.ProfilePic}}
                            style={styles.userAvatar}
                          />
                          <Text style={styles.userName}>{chatUser.Name}</Text>
                        </View>
                      ))}
                  {chat.isGroupChat && (
                    <Text style={styles.userName}>{chat.chatName}</Text>
                  )}
                </View>
              ))}
          </View>
          <View style={{display: 'flex', flexDirection: 'row', gap: 6}}>
            <View
              style={{
                elevation: 2,
                backgroundColor: darkMode ? 'white' : 'black',
                borderRadius: 50,
                width: 28,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              {fullScreenMode ? (
                <Feather
                  name="minimize-2"
                  size={18}
                  color={darkMode ? 'black' : 'white'}
                  onPress={() => setFullScreenMode((prev: any) => !prev)}
                />
              ) : (
                <Entypo
                  name="resize-full-screen"
                  size={18}
                  color={darkMode ? 'black' : 'white'}
                  onPress={() => setFullScreenMode((prev: any) => !prev)}
                />
              )}
            </View>
            <AntDesign
              name="closecircle"
              size={28}
              color="red"
              onPress={() => {
                setChatId(null);
                setFullScreenMode(false);
                setShowEmojiPicker(false);
              }}
              style={{elevation: 2}}
            />
          </View>
        </View>
      )}
      <View
        style={{
          borderBottomColor: 'gray',
          elevation: 2,
          borderBottomWidth: 0.2,
          marginBottom: 10,
          width: '100%',
        }}></View>
      <ScrollView
        ref={containerRef}
        style={styles.messagesContainer}
        showsVerticalScrollIndicator={false}>
        {messages.length === 0 ? (
          <View style={styles.placeholderContainer}>
            <Text style={styles.placeholderText}>No messages to show</Text>
          </View>
        ) : (
          messages.map((message: any) => (
            <View
              key={message._id}
              style={[
                styles.message,
                message.sender._id === user._id
                  ? styles.sentMessage
                  : styles.receivedMessage,
              ]}>
              <Image
                source={{uri: message.sender?.ProfilePic}}
                style={styles.messageAvatar}
              />
              <View style={styles.messageContent}>
                <Text
                  style={
                    message.sender._id === user._id
                      ? styles.sentMessageText
                      : styles.messageText
                  }>
                  {message.content}
                </Text>
                <View style={styles.messageMeta}>
                  <Text
                    style={
                      message.sender._id === user._id
                        ? styles.sendMessageTime
                        : styles.messageTime
                    }>
                    {new Date(message.createdAt).toLocaleTimeString(undefined, {
                      hour: 'numeric',
                      minute: 'numeric',
                      hour12: true,
                    })}
                  </Text>
                  {message.sender._id === user._id && (
                    <Text style={styles.messageSeen}>
                      {message.seen ? 'Seen' : ''}
                    </Text>
                  )}
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {chatId && (
        <View style={style.inputContainer}>
          <View style={style.inputWrapper}>
            <TextInput
              style={style.input}
              value={inputMessage}
              onChangeText={setInputMessage}
              onSubmitEditing={handleSendMessage}
              placeholder="Type something here..."
              placeholderTextColor={darkMode ? '#969696' : '#747474'}
            />
            <TouchableOpacity
              style={style.emojiButton}
              onPress={() => setShowEmojiPicker((prv)=>!prv)}>
              <Icon
                name="emoticon"
                size={24}
                color={darkMode ? 'black' : 'yellow'}
                style={{
                  backgroundColor: darkMode ? 'yellow' : 'black',
                  borderRadius: 50,
                }}
              />
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            onPress={handleSendMessage}
            style={{marginLeft: 10}}>
            <Icon
              name="send"
              size={24}
              color={darkMode ? 'white' : '#007BFF'}
            />
          </TouchableOpacity>
        </View>
      )}
    </Card>
  );

  return (
    <View style={styles.container}>
      {fullScreenMode ? (
        renderChatArea()
      ) : (
        <>
          <TouchableOpacity
            style={[styles.newChatButton, chatId ? {top: 10} : {bottom: 10}]}
            onPress={() => setAddUserModal(true)}>
            <Icon name="message-plus" size={28} color="#fff" />
          </TouchableOpacity>
          {renderChatList()}
          {chatId && renderChatArea()}
        </>
      )}
      <Modal
        visible={showAddUserModal}
        transparent={true}
        animationType="slide">
        <ModalContent
          onClose={() => setAddUserModal(false)}
          setUpdateUI={setUpdateUI}
        />
      </Modal>
      {showEmojiPicker && <EmojiSelector onEmojiSelected={handleEmojiClick} />}
    </View>
  );
};

const ModalContent = ({onClose, setUpdateUI}: any) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const {user, darkMode} = useContext(GlobalState);

  const searchUsers = () => {
    if (searchQuery.trim() === '') {
      setSearchResults([]);
      return;
    }
    axiosInstance
      .post(`${UserBaseURL}/chat/search`, {search: searchQuery})
      .then(res => {
        const results = res.data.results.filter((u: any) => u._id !== user._id);
        setSearchResults(results || []);
      })
      .catch(err => {
        Toast.show({type: 'error', text1: err.message});
      });
  };

  const handleChatAccess = (oppUserId: number) => {
    axiosInstance
      .post(`${UserBaseURL}/chat/`, {oppUserId})
      .then(res => {
        setUpdateUI((prev: boolean) => !prev);
        onClose();
      })
      .catch(err => {
        Toast.show({type: 'error', text1: err.message});
      });
  };

  const styles = StyleSheet.create({
    modalContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
      width: '90%',
      backgroundColor: darkMode ? '#0a1d43' : '#fff',
      borderRadius: 15,
    },
    modalHeader: {
      color: darkMode ? 'white' : 'black',
      marginBottom: 5,
      fontSize: 18,
      fontWeight: 'bold',
    },
    searchResult: {flexDirection: 'row', alignItems: 'center', padding: 10},
    resultAvatar: {width: 40, height: 40, borderRadius: 20},
    resultName: {flex: 1, marginLeft: 10,color: darkMode ? 'white' : 'black',},
    noResultsText: {
      color: darkMode ? 'white' : 'black',
      textAlign: 'center',
      marginTop: 20,
    },
    placeholderContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    placeholderText: {fontSize: 18, color: '#aaa'},
    searchContainer: {
      backgroundColor: darkMode ? '#0B1437' : '#F4F7FE',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderRadius: 20,
      paddingHorizontal: 10,
      width: '100%',
    },
    searchInput: {
      color: darkMode ? '#fff' : '#000',
      marginLeft: 5,
      height: 40,
      fontSize: 16,
      width: '80%',
    },
  });

  return (
    <View style={styles.modalContainer}>
      <View style={styles.modalContent}>
        <View
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingHorizontal: 15,
            paddingVertical: 10,
          }}>
          <Text style={styles.modalHeader}>Search User</Text>
          <AntDesign
            name="closecircle"
            size={28}
            color="red"
            onPress={onClose}
            style={{elevation: 2}}
          />
        </View>
        <View
          style={{
            borderBottomColor: 'gray',
            elevation: 2,
            borderBottomWidth: 0.2,
            marginBottom: 10,
            width: '100%',
          }}></View>
        <View style={{padding: 15}}>
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search..."
              placeholderTextColor={darkMode ? '#fff' : '#666'}
              onChangeText={setSearchQuery}
              onSubmitEditing={searchUsers}
            />
            <TouchableOpacity
              style={{display: 'flex', justifyContent: 'center', width: 'auto'}}
              onPress={searchUsers}>
              <Feather
                name="search"
                size={28}
                color={darkMode ? '#fff' : '#000'}
              />
            </TouchableOpacity>
          </View>
          <ScrollView>
            {searchResults.length > 0 ? (
              searchResults.map((user: any) => (
                <View key={user._id} style={styles.searchResult}>
                  <Image
                    source={{uri: user.ProfilePic}}
                    style={styles.resultAvatar}
                  />
                  <Text style={styles.resultName}>{user.UserName}</Text>
                  <TouchableOpacity onPress={() => handleChatAccess(user._id)}>
                    <Icon
                      name="message-processing-outline"
                      size={24}
                      color="#007BFF"
                    />
                  </TouchableOpacity>
                </View>
              ))
            ) : (
              <Text style={styles.noResultsText}>No users found</Text>
            )}
          </ScrollView>
        </View>
      </View>
    </View>
  );
};

export default Chat;

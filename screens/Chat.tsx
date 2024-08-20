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
import axios from 'axios';
import io from 'socket.io-client';
import {ThemeContext} from './Context/ThemeContext';
import {UserBaseURL} from './Components/API';
import Toast from 'react-native-toast-message';
import EmojiSelector from 'react-native-emoji-selector';
import Feather from 'react-native-vector-icons/Feather';
import AntDesign from 'react-native-vector-icons/AntDesign';

const ENDPOINT = UserBaseURL;
const Chat = () => {
  const {user, darkMode} = useContext(ThemeContext);
  const userId = user?._id;
  const [updateUI, setUpdateUI] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState<any>([]);
  const [chatUsers, setChatUsers] = useState([]);
  const [chatId, setChatId] = useState(null);
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const [showAddUserModal, setAddUserModal] = useState(false);
  const [fullScreenMode, setFullScreenMode] = useState(false); // Added state for full screen mode
  const containerRef = useRef(null);

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
    axios
      .get(`${UserBaseURL}/chat/`)
      .then(res => {
        console.log(JSON.stringify(res),"ccccccccccccccccccccc")
        setChatUsers(res.data || [])})
      .catch(error => {
        console.log('user error fetch chat', error);
        Toast.show({
          type: 'error',
          text1:
            error.response?.data?.message ||
            'An error occurred while fetching chat.',
        });
      });
  }, [updateUI]);

  useEffect(() => {
    if (chatId) {
      axios
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
        const res = await axios.post(`${UserBaseURL}/message/`, {
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
    setInputMessage(inputMessage + emoji.native);
    setShowEmojiPicker(false);
  };

  const styles = StyleSheet.create({
    container: {flex: 1},
    newChatButton: {
      backgroundColor: 'red',
      zIndex: 999,
      padding: 10,
      borderRadius: 50,
      position: 'absolute',
      bottom: 10,
      left: 10,
    },
    chatContainer: {flex: 1, flexDirection: 'row'},
    sidebar: {width: '30%', backgroundColor: '#f4f4f4'},
    sidebarHeader: {padding: 10, fontSize: 18, fontWeight: 'bold'},
    userList: {flex: 1},
    noUsersText: {textAlign: 'center', marginTop: 20},
    chatItem: {flexDirection: 'row', padding: 10, alignItems: 'center'},
    selectedChat: {backgroundColor: '#e0e0e0'},
    userAvatar: {width: 40, height: 40, borderRadius: 20},
    chatInfo: {marginLeft: 10},
    chatName: {fontWeight: 'bold'},
    chatPreview: {color: '#555'},
    chatArea: {flex: 1, backgroundColor: '#fff'},
    messagesContainer: {flex: 1, padding: 10},
    noMessages: {flex: 1, justifyContent: 'center', alignItems: 'center'},
    noMessagesText: {fontSize: 18, color: '#aaa'},
    message: {flexDirection: 'row', marginVertical: 5},
    sentMessage: {
      alignSelf: 'flex-end',
      backgroundColor: '#007BFF',
      color: '#fff',
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
    messageContent: {maxWidth: '80%'},
    inputContainer: {flexDirection: 'row', alignItems: 'center', padding: 10},
    input: {
      flex: 1,
      borderWidth: 1,
      borderColor: '#ddd',
      borderRadius: 20,
      paddingHorizontal: 10,
    },

    placeholderContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    placeholderText: {fontSize: 18, color: '#aaa'},
  });

  const renderChatList = () => (
    <View style={styles.sidebar}>
      <Text style={styles.sidebarHeader}>Chat</Text>
      <ScrollView style={styles.userList}>
        {chatUsers.length === 0 ? (
          <View style={styles.placeholderContainer}>
            <Text style={styles.placeholderText}>No users found</Text>
          </View>
        ) : chatUsers.length > 0 ? (
          chatUsers.map((chat: any) => (
            <TouchableOpacity
              key={chat._id}
              style={[
                styles.chatItem,
                chat._id === chatId ? styles.selectedChat : null,
              ]}
              onPress={() => {
                setChatId(chat._id);
                setFullScreenMode(true); // Switch to full screen mode when a chat is selected
              }}>
              <Image
                source={{uri: chat.users[0]?.ProfilePic}}
                style={styles.userAvatar}
              />
              <View style={styles.chatInfo}>
                <Text style={styles.chatName}>{chat.chatName}</Text>
                <Text style={styles.chatPreview}>
                  {chat.latestMessage
                    ? `${chat.latestMessage.sender.UserName}: ${chat.latestMessage.content}`
                    : ''}
                </Text>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <Text style={styles.placeholderText}>No active user to chat</Text>
        )}
      </ScrollView>
    </View>
  );

  const renderChatArea = () => (
    <View style={styles.chatArea}>
      <ScrollView ref={containerRef} style={styles.messagesContainer}>
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
                <Text>{message.content}</Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
      {chatId && (
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={inputMessage}
            onChangeText={setInputMessage}
            onSubmitEditing={handleSendMessage}
            placeholder="Type something here..."
          />
          <TouchableOpacity
            onPress={() => setShowEmojiPicker(!showEmojiPicker)}>
            <Icon name="emoticon" size={24} color="#aaa" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleSendMessage}>
            <Icon name="send" size={24} color="#007BFF" />
          </TouchableOpacity>
          {showEmojiPicker && (
            <EmojiSelector onEmojiSelected={handleEmojiClick} />
          )}
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {fullScreenMode ? (
        renderChatArea()
      ) : (
        <>
          <TouchableOpacity
            style={styles.newChatButton}
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
    </View>
  );
};

const ModalContent = ({onClose, setUpdateUI}: any) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const {user, darkMode} = useContext(ThemeContext);

  const searchUsers = () => {
  if (searchQuery.trim() === '') {
    setSearchResults([]);
    return; 
  }
  console.log({searchQuery})
    axios
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
    axios
      .post(`${UserBaseURL}/chat/`, {oppUserId})
      .then((res) => {
        console.log(res)
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
      width: '80%',
      backgroundColor: darkMode ? '#0a1d43' : '#fff',
      padding: 20,
      borderRadius: 10,
    },
    modalHeader: {
      color: darkMode ? 'white' : 'black',
      marginBottom: 5,
      fontSize: 18,
      fontWeight: 'bold',
    },
    searchResult: {flexDirection: 'row', alignItems: 'center', padding: 10},
    resultAvatar: {width: 40, height: 40, borderRadius: 20},
    resultName: {flex: 1, marginLeft: 10},
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
            flexDirection:'row',
            justifyContent: 'space-between',
            marginBottom:10
          }}>
          <Text style={styles.modalHeader}>Search User</Text>
          <AntDesign
            name="closecircle"
            size={28}
            color='red'
            onPress={onClose}
          />
        </View>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search..."
            placeholderTextColor={darkMode ? '#fff' : '#666'}
            onChangeText={setSearchQuery}
            onSubmitEditing={searchUsers}
          />
          <TouchableOpacity
            style={{display: 'flex', justifyContent: 'center', width:'auto'}}
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
                  <Icon name="message-processing-outline" size={24} color="#007BFF" />
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <Text style={styles.noResultsText}>No users found</Text>
          )}
        </ScrollView>
      </View>
    </View>
  );
};

export default Chat;

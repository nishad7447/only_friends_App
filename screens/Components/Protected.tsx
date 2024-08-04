import React, {
  useEffect,
  useState,
  ReactNode,
  useContext,
  useCallback,
} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Button,
  StyleSheet,
  Image,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import {
  NavigationProp,
  useFocusEffect,
  useNavigation,
} from '@react-navigation/native';
import {UserBaseURL} from './API';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {axiosInstance} from './AxiosConfig';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Feather from 'react-native-vector-icons/Feather';
import AntDesign from 'react-native-vector-icons/AntDesign';
import {ScrollView} from 'react-native-gesture-handler';
import {ThemeContext} from '../Context/ThemeContext';
import Dropdown from './Dropdown';
import NotificationComponent from './Notification';
import Spinner from './Spinner';

interface ProtectedProps {
  children: ReactNode;
}

const Protected: React.FC<ProtectedProps> = ({children}) => {
  const navigation = useNavigation<NavigationProp<any>>();

  const {darkMode, toggleTheme} = useContext(ThemeContext);
  const [loadingUser, setLoadingUser] = useState(true);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [user, setUser] = useState<any>();
  const [updateUi, setUpdateUi] = useState(false);

  const validateToken = async () => {
    try {
      const response: any = await axiosInstance.get(`${UserBaseURL}/auth`);
      if (response.data.success) {
        setUser(response.data.data);
        AsyncStorage.setItem('user', JSON.stringify(response.data.data));
        AsyncStorage.setItem('online', JSON.stringify(true));

        setUpdateUi(prev => !prev);
      } else {
        AsyncStorage.setItem('message', JSON.stringify(response?.message));
        throw new Error(response.data.message + ' validationToken error');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingUser(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      const checkToken = async () => {
        const jwtToken = await AsyncStorage.getItem('jwtToken');
        if (jwtToken) {
          validateToken();
        } else {
          navigation.navigate('SignIn');
        }
        /////////////////////////AsyncStorage ///////////////////
        // console.log({jwtToken}, 'inProtected');
        const getAllAsyncStorageItems = async () => {
          try {
            const keys = await AsyncStorage.getAllKeys();
            const result = await AsyncStorage.multiGet(keys);

            result.forEach(([key, value]) => {
              console.log(
                `||||||||||AsyncStorage====>${key}: ${value}|||||||||||`,
              );
            });

            // return result;
          } catch (error) {
            console.error('Error fetching AsyncStorage items', error);
          }
        };
        getAllAsyncStorageItems();
        ///////////////////////////////////////////////////////////
      };
      checkToken();
    }, [navigation]),
  );

  useEffect(() => {
    const fetchNotifications = async () => {
      if (await AsyncStorage.getItem('jwtToken')) {
        try {
          const response = await axiosInstance.get(
            `${UserBaseURL}/notifications`,
          );
          if (response.data.success) {
            setNotifications(response.data.notifications);
          }
        } catch (error) {
          console.log('Error fetching notifications:', error);
        }
      }
    };
    fetchNotifications();
  }, [updateUi]);

  const handleSignOutClick = async () => {
    await AsyncStorage.removeItem('jwtToken');
    await AsyncStorage.removeItem('user');
    try {
      if (user) {
        const res = await axiosInstance.get(
          `${UserBaseURL}/logout/${user?._id}`,
        );
        if (res.data.message === 'Logout success') {
          navigation.navigate('SignIn');
        }
      }
    } catch (err) {
      console.log(err);
    }
  };

  const clearAllNotifi = async () => {
    try {
      const res = await axiosInstance.get(`${UserBaseURL}/clearAllNotifi`);
      if (res.data.success) setUpdateUi(prev => !prev);
    } catch (error) {
      console.error(error);
    }
  };

  const delAllNotifi = async () => {
    try {
      const res = await axiosInstance.get(`${UserBaseURL}/delAllNotifi`);
      if (res.data.success) setUpdateUi(prev => !prev);
    } catch (error) {
      console.error(error);
    }
  };

  const notificationBtn = async (notifiId: string, notifiType: string) => {
    if (notifiType === 'message') {
      try {
        const res = await axiosInstance.get(
          `${UserBaseURL}/removeMsgCount/${notifiId}`,
        );
        if (res.data.success) {
          navigation.navigate('Chat');
        }
      } catch (error) {
        console.error(error);
      }
    }
  };

  return (
    <>
      <StatusBar
        translucent={true}
        backgroundColor={'transparent'}
        barStyle={darkMode ? 'light-content' : 'dark-content'}
      />
      {loadingUser ? (
        <Spinner />
      ) : (
        <SafeAreaView style={{flex: 1}}>
          <View
            style={[
              styles.container,
              {backgroundColor: darkMode ? '#1B2559' : '#EBF1F7'},
            ]}>
            <View style={styles.content}>
              <View
                style={[
                  styles.navbar,
                  {
                    paddingTop: 10,
                    backgroundColor: darkMode ? '#111C44' : '#FFFFFF',
                  },
                ]}>
                {/* BackBotton */}
                <TouchableOpacity
                  onPress={() => console.log('Back button pressed')}>
                  <AntDesign
                    name="left"
                    size={14}
                    color={darkMode ? '#fff' : '#000'}
                    style={{width: 8}}
                  />
                </TouchableOpacity>
                {/* Search Input */}
                <View
                  style={[
                    styles.searchContainer,
                    {backgroundColor: darkMode ? '#0B1437' : '#F4F7FE'},
                  ]}>
                  <Feather
                    name="search"
                    size={18}
                    color={darkMode ? '#fff' : '#000'}
                  />
                  <TextInput
                    style={[
                      styles.searchInput,
                      {color: darkMode ? '#fff' : '#000'},
                    ]}
                    placeholder="Search..."
                    placeholderTextColor={darkMode ? '#fff' : '#666'}
                  />
                </View>
                {/* Logo */}
                <Text
                  style={[
                    styles.title,
                    {color: darkMode ? '#4A90E2' : '#4A90E2'},
                  ]}>
                  OnlyFriends
                </Text>
                {/* Notification DropDown */}
                <Dropdown
                  top={52}
                  right={10}
                  button={
                    <Icon
                      name="notifications-outline"
                      size={18}
                      color={darkMode ? '#fff' : '#000'}
                    />
                  }
                  children={
                    <NotificationComponent
                      notifications={notifications}
                      darkMode={darkMode}
                      clearAllNotifi={clearAllNotifi}
                      delAllNotifi={delAllNotifi}
                      notifictionBtn={notificationBtn}
                    />
                  }
                />
                {/* ThemeChange */}
                <TouchableOpacity onPress={toggleTheme}>
                  {darkMode ? (
                    <Feather name="sun" size={18} color="#fff" />
                  ) : (
                    <FontAwesome name="moon-o" size={18} color="#000" />
                  )}
                </TouchableOpacity>
                {/* Message */}
                <TouchableOpacity
                  onPress={() => {
                    handleSignOutClick();
                    console.log('Messages clicked');
                  }}>
                  <MaterialCommunityIcons
                    name="message-processing-outline"
                    size={18}
                    color={darkMode ? '#fff' : '#000'}
                  />
                </TouchableOpacity>
                {/* Profile */}
                <Dropdown
                  top={52}
                  right={10}
                  button={
                    <Image
                      style={styles.profileImage}
                      source={{uri: user?.ProfilePic}}
                      alt={user?.UserName}
                    />
                  }
                  children={
                    <View>
                      <Text style={[styles.link, {marginTop: 0}]}>
                        👋 Hey, {user?.UserName}
                      </Text>
                      <TouchableOpacity
                        onPress={() => navigation.navigate('Profile')}>
                        <Text style={styles.link}>Profile Settings</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => navigation.navigate('SavedPosts')}>
                        <Text style={styles.link}>Saved Posts</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={handleSignOutClick}>
                        <Text style={styles.signOut}>Log Out</Text>
                      </TouchableOpacity>
                    </View>
                  }
                />
              </View>
              <ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}>
                {children}
              </ScrollView>
            </View>
          </View>
        </SafeAreaView>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 30,
    flex: 1,
  },
  content: {
    flexGrow: 1,
    padding: 10,
  },
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderRadius: 50,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 4,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    textShadowColor: 'rgba(255, 255, 255, 0.8)', // White color with opacity
    textShadowOffset: {width: 0, height: 0}, // No offset
    textShadowRadius: 3,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingHorizontal: 10,
  },
  searchInput: {
    marginLeft: 5,
    height: 40,
    fontSize: 16,
    width: 70,
  },
  profileImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },

  //dropdown
  // profileImage: {
  //   height: 40,
  //   width: 40,
  //   borderRadius: 20,
  // },
  dropdownContainer: {
    padding: 10,
    top: 48,
    left: -180,
    // width: 'maxcontent',
  },
  // dropdownContent: {
  //   flex: 1,
  //   flexDirection: 'column',
  //   // justifyContent: 'start',
  //   borderRadius: 20,
  //   backgroundColor: 'white',
  //   shadowColor: '#000',
  //   shadowOffset: { width: 0, height: 2 },
  //   shadowOpacity: 0.8,
  //   shadowRadius: 2,
  //   elevation: 5,
  // },
  link: {
    color: 'gray',
    marginTop: 10,
  },
  signOut: {
    color: 'red',
    marginTop: 10,
  },
});
export default Protected;

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
  StyleSheet,
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
import Feather from 'react-native-vector-icons/Feather';
import {GlobalState} from '../Context/GlobalState';
import Dropdown from './Dropdown';
import NotificationComponent from './Notification';
import Spinner from './Spinner';
import BottomBar from './BottomBar';

interface ProtectedProps {
  children: ReactNode;
}

const Protected: React.FC<ProtectedProps> = ({children}) => {
  const navigation = useNavigation<NavigationProp<any>>();

  const {darkMode, search, setSearch, toggleTheme, orientation} =
    useContext(GlobalState);
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

  const styles = StyleSheet.create({
    container: {
      backgroundColor: darkMode ? '#1B2559' : '#EBF1F7',
      paddingTop: 40,
      flex: 1,
      paddingHorizontal: 4,
    },
    content: {
      flex: 1,
    },
    navbar: {
      width:'100%',
      paddingTop: 10,
      backgroundColor: darkMode ? '#111C44' : '#FFFFFF',
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
      marginLeft: 7,
      fontSize: 24,
      fontWeight: 'bold',
      textShadowColor: 'rgba(255, 255, 255, 0.8)', // White color with opacity
      textShadowOffset: {width: 0, height: 0}, // No offset
      textShadowRadius: 3,
      width:'40%'
    },
    searchContainer: {
      backgroundColor: darkMode ? '#0B1437' : '#F4F7FE',
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: 20,
      paddingHorizontal: 10,
      width: '50%',
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
          <View style={styles.container}>
            <View style={styles.navbar}>
              {/* Search Input */}
              <View style={styles.searchContainer}>
                <Feather
                  name="search"
                  size={18}
                  color={darkMode ? '#fff' : '#000'}
                />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search..."
                  placeholderTextColor={darkMode ? '#fff' : '#666'}
                  value={search}
                  onTouchStart={() => navigation.navigate('Search')}
                  onChangeText={setSearch}
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
              <View
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'space-evenly',
                  width: '10%',
                }}>
                {/* Theme change */}
                {/* <TouchableOpacity onPress={toggleTheme}>
                  {darkMode ? (
                    <MaterialCommunityIcons name="white-balance-sunny" size={18} color="#fff" />
                  ) : (
                    <FontAwesome name="moon-o" size={18} color="#000" />
                  )}
                </TouchableOpacity> */}
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
              </View>
            </View>
            <View style={styles.content}>{children}</View>
          </View>
          <BottomBar user={user} />
        </SafeAreaView>
      )}
    </>
  );
};

export default Protected;

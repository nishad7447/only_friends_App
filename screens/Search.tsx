import React, {useState, useContext, useEffect} from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  FlatList,
  StyleSheet,
  Image,
} from 'react-native';
import {GlobalState} from './Context/GlobalState';
import Spinner from './Components/Spinner';
import Posts from './Components/Posts';
import {axiosInstance} from './Components/AxiosConfig';
import {UserBaseURL} from './Components/API';
import Toast from 'react-native-toast-message';
import {NavigationProp, useNavigation} from '@react-navigation/native';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Card from './Components/Card';

function SearchScreen() {
  const {user, search, darkMode} = useContext(GlobalState);
  const [loadingUser, setLoadingUser] = useState(true);
  const [selected, setSelected] = useState('Posts');
  const [posts, setPosts] = useState<any[]>([]);
  const [suggestedUsers, setSuggestedUsers] = useState<any[]>([]);
  const navigation = useNavigation<NavigationProp<any>>();

  const fetchPosts = async () => {
    try {
      const res = await axiosInstance.get(`${UserBaseURL}/getAllPosts`);
      setPosts(res.data.posts);
      setSuggestedUsers(res.data.users);
    } catch (error) {
      console.error('Error fetching data', error);
      Toast.show({
        type: 'error',
        text1: 'An error occurred while fetching data.',
      });
    } finally {
      setLoadingUser(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    if (search === '' || search === null) {
      fetchPosts(); // Refresh posts and users if search is cleared
    } else {
      setPosts(
        posts.filter(
          post =>
            post.content.toLowerCase().includes(search.toLowerCase()) ||
            post.userId.UserName.toLowerCase().includes(search.toLowerCase()),
        ),
      );
      setSuggestedUsers(
        suggestedUsers.filter(user =>
          user.UserName.toLowerCase().includes(search.toLowerCase()),
        ),
      );
    }
  }, [search]);

  const handleGoToUser = (userId: number) => {
    navigation.navigate('Profile', {userId});
  };

  const followOrUnfollow = async (link: string, friendId: number) => {
    try {
      const res = await axiosInstance.post(`${UserBaseURL}/${link}`, {
        oppoId: friendId,
      });
      Toast.show({
        type: 'success',
        text1: res.data.message,
      });
      fetchPosts(); // Refresh data after follow/unfollow action
    } catch (error) {
      console.error('Error following/unfollowing user', error);
      Toast.show({
        type: 'error',
        text1: 'An error occurred while processing your request.',
      });
    }
  };

  if (loadingUser) {
    return <Spinner />;
  }

  return (
    <View style={[styles.container]}>
      {/* Selection Buttons */}
      <View style={styles.selectionButtons}>
        <TouchableOpacity
          style={[
            styles.button,
            {backgroundColor: darkMode ? '#333' : '#f0f0f0', elevation: 4},
            selected === 'Posts' && styles.activeButton,
          ]}
          onPress={() => setSelected('Posts')}>
          <Text
            style={[styles.buttonText, {color: darkMode ? '#fff' : '#000'}]}>
            Posts
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.button,
            {backgroundColor: darkMode ? '#333' : '#f0f0f0', elevation: 4},
            selected === 'Users' && styles.activeButton,
          ]}
          onPress={() => setSelected('Users')}>
          <Text
            style={[styles.buttonText, {color: darkMode ? '#fff' : '#000'}]}>
            Users
          </Text>
        </TouchableOpacity>
      </View>

      {/* Posts or Users List */}
      {selected === 'Posts' ? (
        posts.length === 0 ? (
          <View style={styles.messageContainer}>
            <Text
              style={[styles.messageText, {color: darkMode ? '#fff' : '#000'}]}>
              There are no posts found.
            </Text>
          </View>
        ) : (
          <FlatList
            data={posts}
            keyExtractor={item => item._id}
            showsHorizontalScrollIndicator={false}
            renderItem={({item}) => (
              <Posts
                key={item._id}
                post={item}
                setUpdateUI={() => {}}
                userId={item.userId._id}
                loggedInUser={user}
              />
            )}
          />
        )
      ) : suggestedUsers.length === 0 ? (
        <View style={styles.messageContainer}>
          <Text
            style={[styles.messageText, {color: darkMode ? '#fff' : '#000'}]}>
            There are no users found.
          </Text>
        </View>
      ) : (
        <FlatList
          data={suggestedUsers}
          keyExtractor={item => item._id.toString()}
          numColumns={2} // Set number of columns to 2
          key={`users-grid-${selected}`} // Add key prop to force re-render
          renderItem={({item}: any) => (
            <Card
              key={item._id}
              style={{
                flex: 1,
                margin: 5,
                borderRadius: 8,
                overflow: 'hidden',
                backgroundColor: darkMode ? '#0a1d43' : '#fff',
              }}>
              <View style={styles.cardContent}>
                <TouchableOpacity onPress={() => handleGoToUser(item._id)}>
                  <Image
                    source={{uri: item.ProfilePic}}
                    style={styles.profileImage}
                  />
                </TouchableOpacity>
                <View style={styles.textContainer}>
                  <TouchableOpacity onPress={() => handleGoToUser(item._id)}>
                    <Text
                      style={[
                        styles.username,
                        {color: darkMode ? '#fff' : '#000'},
                      ]}>
                      {item.UserName}
                    </Text>
                  </TouchableOpacity>
                  {item.Followers.includes(user?._id) ? (
                    <View style={styles.buttonsContainer}>
                      <TouchableOpacity
                        style={styles.unfollowButton}
                        onPress={() => followOrUnfollow('unfollow', item._id)}>
                        <Text style={styles.unfollowButtonText}>
                          <SimpleLineIcons name="user-unfollow" size={16} />{' '}
                          Unfollow
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.messageButton}
                        onPress={() => navigation.navigate('Chat')}>
                        <Text style={styles.messageButtonText}>
                          <MaterialCommunityIcons
                            name="message-text-outline"
                            size={16}
                          />{' '}
                          Message
                        </Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={styles.followButton}
                      onPress={() => followOrUnfollow('follow', item._id)}>
                      <Text style={styles.followButtonText}>
                        <SimpleLineIcons name="user-follow" size={16} /> Follow
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </Card>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  selectionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeButton: {
    backgroundColor: '#007bff',
    elevation: 2,
  },
  buttonText: {
    fontWeight: 'bold',
  },
  cardContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  textContainer: {
    alignItems: 'center',
  },
  username: {
    fontWeight: 'bold',
    marginBottom: 10,
  },
  buttonsContainer: {
    flexDirection: 'column',
    gap: 4,
    justifyContent: 'space-between',
    width: '100%',
  },
  followButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#1E90FF',
    borderRadius: 10,
    alignItems: 'center',
    marginRight: 5, // Add some margin for spacing
  },
  followButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  unfollowButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1E90FF',
    alignItems: 'center',
    marginRight: 5, // Add some margin for spacing
  },
  unfollowButtonText: {
    color: '#1E90FF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  messageButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#DBDBDB',
    borderRadius: 10,
    alignItems: 'center',
    flex: 1,
  },
  messageButtonText: {
    color: 'black',
    fontSize: 14,
  },
  messageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  messageText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SearchScreen;

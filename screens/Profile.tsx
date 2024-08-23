import React, {useState, useContext, useEffect} from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Card from './Components/Card';
import {ThemeContext} from './Context/ThemeContext';
import {NavigationProp, useNavigation} from '@react-navigation/native';
import {axiosInstance} from './Components/AxiosConfig';
import {UserBaseURL} from './Components/API';
import Toast from 'react-native-toast-message';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import CreatePost from './Components/CreatePost';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';
import Entypo from 'react-native-vector-icons/Entypo';
import Posts from './Components/Posts';

const Spinner: React.FC = () => {
  const styles = StyleSheet.create({
    spinnerContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    spinner: {
      width: 80,
      height: 80,
      borderRadius: 40,
      borderWidth: 8,
      borderColor: 'transparent',
      borderTopColor: '#0000ff',
    },
  });
  return (
    <View style={styles.spinnerContainer}>
      <View style={styles.spinner}></View>
    </View>
  );
};

const Profile = ({route}: any) => {
  const {userId} = route.params;
  const {darkMode, user} = useContext(ThemeContext);
  const loggedInUser = user;
  const [loadingUser, setLoadingUser] = useState<boolean>(true);
  const [posts, setPosts] = useState([]);
  const [users, setUser] = useState(user);
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [updateUI, setUpdateUI] = useState(false);
  const navigation = useNavigation<NavigationProp<any>>();

  useEffect(() => {
    if (userId) {
      axiosInstance
        .get(`${UserBaseURL}/userDetail/${userId}`)
        .then(res => {
          setUser(res.data.user);
        })
        .catch(error => {
          console.log('user error details', error);

          if (
            error.response &&
            error.response.data &&
            error.response.data.message
          ) {
            const errorMessage = error.response.data.message;
            Toast.show({type: 'error', text1: errorMessage});
          } else {
            Toast.show({
              type: 'error',
              text1: 'An error occurred while user fetch details.',
            });
          }
        });
    } else {
      setUser(user);
    }
    axiosInstance
      .get(`${UserBaseURL}/userProfile/${userId ? userId : user._id}`)
      .then(res => {
        setPosts(res.data.posts);
        setSuggestedUsers(res.data.users?.Followings);
      })
      .catch(error => {
        console.log('user error fetch posts', error);

        if (
          error.response &&
          error.response.data &&
          error.response.data.message
        ) {
          const errorMessage = error.response.data.message;
          Toast.show({type: 'error', text1: errorMessage});
        } else {
          Toast.show({
            type: 'error',
            text1: 'An error occurred while user fetch posts.',
          });
        }
      })
      .finally(() => {
        setLoadingUser(false);
      });
  }, [updateUI, userId]);

  const followORunfollow = (link: string, friendId: number) => {
    axiosInstance
      .post(`${UserBaseURL}/${link}`, {oppoId: friendId})
      .then(res => {
        Toast.show({
          type: 'success',
          text1: res?.data.message,
        });
        setUpdateUI(prevState => !prevState);
      })
      .catch(error => {
        console.log('user error clicking unFollow', error);

        if (
          error.response &&
          error.response.data &&
          error.response.data.message
        ) {
          const errorMessage = error.response.data.message;
          Toast.show({
            type: 'error',
            text1: errorMessage,
          });
        } else {
          Toast.show({
            type: 'error',
            text1: 'An error occurred while user error clicking unFollow.',
          });
        }
      });
  };

  const styles = StyleSheet.create({
    container: {
      flexGrow: 1,
    },
    sidebar: {
      flex: 1,
      padding: 10,
    },
    sticky: {
      position: 'static',
      top: 28,
    },
    userInfo: {
      paddingVertical: 6,
      paddingHorizontal: 14,
    },
    userHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 10,
    },
    userDetails: {
      flexDirection: 'row',
    },
    profilePic: {
      width: 50,
      height: 50,
      borderRadius: 25,
      marginRight: 10,
    },
    userName: {
      color: darkMode ? 'white' : 'black',
      fontSize: 18,
      fontWeight: 'bold',
    },
    userUsername: {
      color: 'gray',
    },
    userBio: {
      maxWidth: 100,
      maxHeight: 70,
      marginBottom: 10,
    },
    userDetailsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 10,
    },
    userDetailText: {
      marginLeft: 4,
      color: 'gray',
    },
    stats: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    statNumber: {
      fontSize: 18,
      fontWeight: 'bold',
    },
    statLabel: {
      color: 'gray',
    },
    friendsList: {
      padding: 10,
    },
    friendsListTitle: {
      fontSize: 16,
      fontWeight: 'bold',
    },
    friendItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 10,
    },
    friendDetails: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    friendPic: {
      width: 40,
      height: 40,
      borderRadius: 20,
      marginRight: 10,
    },
    friendName: {
      fontSize: 14,
      fontWeight: 'bold',
    },
    messageIcon: {
      color: 'blue',
    },
    postsContainer: {
      paddingHorizontal: 10,
    },
    noPosts: {
      fontSize: 18,
      fontWeight: 'bold',
      textAlign: 'center',
      marginTop: 48,
    },
  });

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {loadingUser ? (
        <Spinner />
      ) : (
        <>
          <Card
            style={{
              margin: 10,
              padding: 10,
              backgroundColor: darkMode ? '#0a1d43' : '#fff',
              borderRadius: 16,
              shadowColor: darkMode ? '#ccc' : '#000',
              shadowOffset: {width: 0, height: 2},
              shadowOpacity: 0.2,
              shadowRadius: 4,
              elevation: 10,
            }}>
            <View style={styles.userInfo}>
              <View style={styles.userHeader}>
                <View style={styles.userDetails}>
                  <Image
                    style={styles.profilePic}
                    source={{uri: users?.ProfilePic}}
                  />
                  <View>
                    <Text style={styles.userName}>
                      {users?.Name ? users?.Name : ''}
                    </Text>
                    <Text style={styles.userUsername}>
                      @{users?.UserName ? users?.UserName : ''}
                    </Text>
                  </View>
                </View>
                <Text style={styles.userBio}>
                  {users?.Bio ? users?.Bio : ''}
                </Text>
                <View
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                  }}>
                  <View style={styles.userDetailsRow}>
                    {users?.Occupation ? (
                      <>
                        <SimpleLineIcons
                          name="briefcase"
                          size={13}
                          color="gray"
                        />
                        <Text style={styles.userDetailText}>
                          {users?.Occupation ? users?.Occupation : ''}
                        </Text>
                      </>
                    ) : (
                      ''
                    )}
                  </View>
                  <View style={styles.userDetailsRow}>
                    {users?.Location ? (
                      <>
                        <Entypo name="location-pin" size={16} color="gray" />
                        <Text style={styles.userDetailText}>
                          {users?.Location ? users?.Location : ''}
                        </Text>
                      </>
                    ) : (
                      ''
                    )}
                  </View>
                </View>
              </View>
              {/* followers,following,post */}
              <View style={styles.stats}>
                <TouchableOpacity
                  onPress={() =>
                    //  nav(`/followers/${user?._id}`)
                    console.log('followersClicked')
                  }>
                  <Text style={styles.statNumber}>
                    {users?.Followers.length
                      ? users?.Followers.length.toString()
                      : '0'}
                  </Text>
                  <Text style={styles.statLabel}>Followers</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() =>
                    // nav(`/following/${user?._id}`)
                    console.log('followingClicked')
                  }>
                  <Text style={styles.statNumber}>
                    {users?.Followings.length
                      ? users?.Followings.length.toString()
                      : '0'}
                  </Text>
                  <Text style={styles.statLabel}>Following</Text>
                </TouchableOpacity>
                <View>
                  <Text style={styles.statNumber}>
                    {posts?.length ? posts.length.toString() : '0'}
                  </Text>
                  <Text style={styles.statLabel}>Posts</Text>
                </View>
              </View>
              {/* buttons */}
              <View
                style={{
                  marginTop: 10,
                  width: '100%',
                  gap: 4,
                  display: 'flex',
                  flexDirection: 'row',
                }}>
                {loggedInUser.UserName === users.UserName ? (
                  // <SimpleLineIcons name="settings" size={16} />
                  <></>
                ) : (
                  <>
                    {users?.Followers.includes(loggedInUser?._id || userId) ? (
                      <>
                        <TouchableOpacity
                          style={{
                            width: '50%',
                            padding: 6,
                            backgroundColor: '#fff',
                            borderRadius: 10,
                            borderWidth: 1,
                            borderColor: '#1E90FF',
                            alignItems: 'center',
                          }}
                          onPress={() =>
                            followORunfollow('unfollow', users?._id)
                          }>
                          <Text
                            style={{
                              color: '#1E90FF',
                              fontSize: 16,
                              fontWeight: 'bold',
                            }}>
                            <SimpleLineIcons name="user-unfollow" size={16} />{' '}
                            Unfollow
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={{
                            width: '50%',
                            padding: 6,
                            backgroundColor: '#DBDBDB',
                            borderRadius: 10,
                            alignItems: 'center',
                          }}
                          onPress={() => navigation.navigate('Chat')}>
                          <Text
                            style={{
                              color: 'black',
                              fontSize: 16,
                              fontWeight: 'bold',
                            }}>
                            <MaterialCommunityIcons
                              name="message-text-outline"
                              size={16}
                            />{' '}
                            Message
                          </Text>
                        </TouchableOpacity>
                      </>
                    ) : (
                      <>
                        <TouchableOpacity
                          style={{
                            width: '100%',
                            padding: 6,
                            backgroundColor: '#1E90FF',
                            borderRadius: 10,
                            alignItems: 'center',
                          }}
                          onPress={() =>
                            followORunfollow('follow', users?._id)
                          }>
                          <Text
                            style={{
                              color: '#fff',
                              fontSize: 16,
                              fontWeight: 'bold',
                            }}>
                            <SimpleLineIcons name="user-follow" size={16} />{' '}
                            Follow
                          </Text>
                        </TouchableOpacity>
                      </>
                    )}
                  </>
                )}
              </View>
            </View>
          </Card>
          <View style={styles.postsContainer}>
            {(!userId && <CreatePost setUpdateUI={setUpdateUI} />) ||
              (userId === user._id && <CreatePost setUpdateUI={setUpdateUI} />)}
            {posts.length === 0 ? (
              <Text style={styles.noPosts}>No posts</Text>
            ) : (
              posts.map((post: any) => (
                <Posts
                  key={post._id}
                  post={post}
                  setUpdateUI={setUpdateUI}
                  userId={userId}
                  loggedInUser={loggedInUser}
                />
              ))
            )}
          </View>
        </>
      )}
    </ScrollView>
  );
};

export default Profile;

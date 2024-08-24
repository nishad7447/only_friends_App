import React, {useState, useEffect, useContext} from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
} from 'react-native';
import {GlobalState} from './Context/GlobalState';
import {axiosInstance} from './Components/AxiosConfig';
import {UserBaseURL} from './Components/API';
import Toast from 'react-native-toast-message';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {NavigationProp, useNavigation} from '@react-navigation/native';
import Card from './Components/Card';

const FollowersOrFollowings = ({route}: any) => {
  const {id, type} = route.params;
  const {user, darkMode} = useContext(GlobalState);
  const [searchQuery, setSearchQuery] = useState('');
  const [follow, setFollow] = useState<any[]>([]);
  const [updateUI, setUpdateUI] = useState(false);
  const navigation = useNavigation<NavigationProp<any>>();

  useEffect(() => {
    const fetchFollow = async () => {
      try {
        const endpoint =
          type === 'followers'
            ? `${UserBaseURL}/getFollowers/${id}`
            : `${UserBaseURL}/getFollowings/${id}`;

        const res = await axiosInstance.get(endpoint);
        setFollow(
          type === 'followers'
            ? res.data.followers.Followers
            : res.data.followings.Followings,
        );
      } catch (error) {
        console.error('Error fetching follow data', error);
        Toast.show({
          type: 'error',
          text1: 'An error occurred while fetching follow data.',
        });
      }
    };

    fetchFollow();
  }, [updateUI, id, type]);

  const filteredFollow = follow.filter(item =>
    item.UserName.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const followOrUnfollow = async (link: string, friendId: number) => {
    try {
      const res = await axiosInstance.post(`${UserBaseURL}/${link}`, {
        oppoId: friendId,
      });
      Toast.show({
        type: 'success',
        text1: res.data.message,
      });
      setUpdateUI(prev => !prev);
    } catch (error) {
      console.error('Error following/unfollowing user', error);
      Toast.show({
        type: 'error',
        text1: 'An error occurred while processing your request.',
      });
    }
  };

  const handleGoToUser = (userId: number) => {
    navigation.navigate('Profile', {userId});
  };

  return (
    <View style={[styles.container]}>
      <Text style={[styles.title, {color: darkMode ? '#fff' : '#000'}]}>
        {type === 'followers' ? 'Followers' : 'Followings'}
      </Text>
      <TextInput
        style={[
          styles.searchInput,
          {
            backgroundColor: darkMode ? '#333' : '#fff',
            color: darkMode ? '#fff' : '#000',
          },
        ]}
        placeholder="Search..."
        placeholderTextColor={darkMode ? '#ccc' : '#888'}
        value={searchQuery}
        onChangeText={text => setSearchQuery(text)}
      />
      <FlatList
        data={filteredFollow}
        keyExtractor={item => item._id.toString()}
        numColumns={2}
        renderItem={({item}: {item: any}) => (
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  searchInput: {
    height: 40,
    borderRadius: 20,
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
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
    marginRight: 5,
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
    marginRight: 5,
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
  cardContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  textContainer: {
    alignItems: 'center',
  },
});

export default FollowersOrFollowings;

import React, {useContext, useEffect, useState} from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  StyleSheet,
} from 'react-native';
import {ThemeContext} from './Context/ThemeContext';
import {axiosInstance} from './Components/AxiosConfig';
import {UserBaseURL} from './Components/API';
import Toast from 'react-native-toast-message';
import moment from 'moment';
import AntDesign from 'react-native-vector-icons/AntDesign';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Card from './Components/Card';

const SavedPosts = () => {
  const {user, darkMode} = useContext(ThemeContext);
  const [loadingUser, setLoadingUser] = useState(true);
  const [savedPosts, setSavedPosts] = useState([]);
  const [updateUI, setUpdateUI] = useState(false);
  const [clickedPostId, setClickedPostId] = useState(null);

  useEffect(() => {
    axiosInstance
      .get(`${UserBaseURL}/getAllSavedPosts`)
      .then(res => {
        setSavedPosts(res.data.savedPosts[0].savedPosts);
      })
      .catch(error => {
        console.log('user error fetch allsavedpost', error);
        Toast.show({
          type: 'error',
          text1:
            error.response?.data?.message ||
            'An error occurred while fetching saved posts.',
        });
      })
      .finally(() => {
        setLoadingUser(false);
      });
  }, [updateUI]);

  const handleLikeClick = (postId: number) => {
    axiosInstance
      .get(`${UserBaseURL}/like/${postId}`)
      .then(res => {
        Toast.show({
          type: 'success',
          text1: res?.data.message,
        });
        setUpdateUI(prevState => !prevState);
      })
      .catch(error => {
        console.log('user error clicking like', error);
        Toast.show({
          type: 'error',
          text1:
            error.response?.data?.message ||
            'An error occurred while clicking like.',
        });
      });
  };

  const handleSavedClick = (postId: number) => {
    axiosInstance
      .get(`${UserBaseURL}/savedpost/${postId}`)
      .then(res => {
        Toast.show({
          type: 'success',
          text1: res?.data.message,
        });
        setUpdateUI(prevState => !prevState);
      })
      .catch(error => {
        console.log('user error saving post', error);
        Toast.show({
          type: 'error',
          text1:
            error.response?.data?.message ||
            'An error occurred while saving post.',
        });
      });
  };

  const formatPostDate = (date: string) => {
    const now = moment();
    const postDate = moment(date);

    if (now.diff(postDate, 'seconds') < 60) {
      return 'Just now';
    } else if (now.diff(postDate, 'days') === 0) {
      return postDate.fromNow();
    } else if (now.diff(postDate, 'days') === 1) {
      return 'Yesterday';
    } else if (now.diff(postDate, 'days') <= 4) {
      return `${now.diff(postDate, 'days')} days ago`;
    } else if (now.diff(postDate, 'years') === 0) {
      return postDate.format('MMMM D');
    } else {
      return postDate.format('LL');
    }
  };

  const renderLikeInfo = (post: any) => {
    const likeCount = post.likes.length;
    const userLiked = post.likes.includes(user?._id);

    if (likeCount === 0) {
      return '';
    }

    if (userLiked) {
      if (likeCount === 1) {
        return ' You liked this post';
      } else {
        return ` You and ${likeCount - 1} others `;
      }
    } else {
      return ` ${likeCount} likes`;
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 10,
      backgroundColor: darkMode ? '#1B2559' : '#EDF2F7',
    },
    spinnerContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    header: {
      color: darkMode ? 'white' : 'black',
      fontSize: 24,
      fontWeight: 'bold',
      marginVertical: 10,
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      marginRight: 12,
    },
    userName: {
      color: darkMode ? 'white' : 'black',
      fontWeight: 'bold',
      fontSize: 16,
    },
    postDate: {
      fontSize: 12,
      color: '#666',
    },
    title: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 8,
    },
    content: {
      color: darkMode ? 'white' : 'black',
      fontSize: 14,
      marginBottom: 12,
    },
    actions: {
        marginHorizontal: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      marginRight: 16,
    },
    actionText: {
      marginLeft: 4,
      fontSize: 10,
      color: '#666',
    },
    media: {
      width: '100%',
      height: 200,
      borderRadius: 8,
      marginBottom: 12,
    },
    noPostsText: {
      color: darkMode ? 'white' : 'black',
      textAlign: 'center',
      fontSize: 18,
      marginTop: 50,
    },
  });

  const renderItem = ({item}: {item: any}) => (
    <Card
      key={item._id}
      style={{
        marginBottom: 16,
        borderRadius: 8,
        // padding: 16,
        backgroundColor: darkMode ? '#0a1d43' : '#fff',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 1,
      }}>
      <View style={styles.cardHeader}>
        <Image
          source={{uri: item.postId.userId.ProfilePic}}
          style={styles.avatar}
        />
        <View>
          <Text style={styles.userName}>{item.postId.userId.UserName}</Text>
          <Text style={styles.postDate}>{formatPostDate(item.createdAt)}</Text>
        </View>
      </View>
      <Text style={styles.title}>{item.postId.title}</Text>
      {item.postId.fileUrl && renderMedia(item.postId.fileUrl)}
      <Text style={styles.content}>{item.postId.content}</Text>
        <View style={styles.actions}>
          <TouchableOpacity
            onPress={() => handleLikeClick(item.postId._id)}
            style={styles.actionButton}>
            {item.postId.likes?.includes(user?._id) ? (
              <AntDesign name="heart" size={26} color={'red'} />
            ) : (
              <AntDesign name="hearto" size={26} color={'#A3AED0'} />
            )}
            <Text style={styles.actionText}>{renderLikeInfo(item.postId)}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setClickedPostId(item.postId._id)}
            style={styles.actionButton}>
            <FontAwesome name="commenting-o" size={26} color={'#A3AED0'} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleSavedClick(item.postId._id)}
            style={styles.actionButton}>
            {item.postId.savedBy?.includes(user?._id) ? (
              <FontAwesome name="bookmark" size={26} color={'black'} />
            ) : (
              <FontAwesome name="bookmark-o" size={26} color={'#A3AED0'} />
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <MaterialIcons name="share" size={26} color={'#A3AED0'} />
          </TouchableOpacity>
      </View>
    </Card>
  );

  const renderMedia = (fileUrl: any) => {
    const extension = fileUrl.split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif'].includes(extension)) {
      return <Image source={{uri: fileUrl}} style={styles.media} />;
    } else if (extension === 'mp4') {
      return (
        <></>
        // <Video source={{uri: fileUrl}} style={styles.media} controls={true} />
      );
    } else if (extension === 'mp3') {
      return (
        <></>
        // <Audio source={{uri: fileUrl}} style={styles.media} controls={true} />
      );
    } else {
      return <Text>Unsupported file format</Text>;
    }
  };

  return (
    <View style={styles.container}>
      {loadingUser ? (
        <View style={styles.spinnerContainer}>
          <ActivityIndicator
            size="large"
            color={darkMode ? 'fff' : '#0000ff'}
          />
        </View>
      ) : (
        <>
          <Text style={styles.header}>Saved Posts</Text>
          {savedPosts.length > 0 ? (
            <FlatList
              data={savedPosts}
              renderItem={renderItem}
              keyExtractor={item => item._id}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <Text style={styles.noPostsText}>
              There is nothing in saved posts
            </Text>
          )}
        </>
      )}
      {clickedPostId && (
        <></>
        // <CommentModal
        //   postId={clickedPostId}
        //   closeModal={() => setClickedPostId(null)}
        // />
      )}
    </View>
  );
};

export default SavedPosts;

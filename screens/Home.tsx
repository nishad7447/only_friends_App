import React, {useContext, useEffect, useState} from 'react';
import {
  View,
  Text,
  Image,
  Button,
  ScrollView,
  Modal,
  TextInput,
  StyleSheet,
} from 'react-native';
import moment from 'moment';
import {UserBaseURL} from './Components/API';
import {axiosInstance} from './Components/AxiosConfig';
import {TouchableOpacity} from 'react-native-gesture-handler';
import {ThemeContext} from './Context/ThemeContext';
import AntDesign from 'react-native-vector-icons/AntDesign';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Card from './Components/Card';
import CreatePost from './Components/CreatePost';

interface User {
  _id: string;
  UserName: string;
  ProfilePic: string;
}

interface Post {
  _id: string;
  userId: User;
  fileUrl?: string;
  content: string;
  createdAt: string;
}

interface HomeState {
  user: any; // Adjust according to your user state type
}

const Spinner: React.FC = () => (
  <View style={styles.spinnerContainer}>
    <View style={styles.spinner}></View>
  </View>
);

const Home: React.FC = () => {
  const [user, setUser] = useState<any>();
  const [loadingUser, setLoadingUser] = useState<boolean>(true);
  const [posts, setPosts] = useState<Post[]>([]);
  const [suggestedUsers, setSuggestedUsers] = useState<User[]>([]);
  const [updateUI, setUpdateUI] = useState<boolean>(false);
  const [ad, setAd] = useState<any>(null); // Adjust type if needed
  const [numPosts, setNumPosts] = useState<number | null>(null);
  const [followings, setFollowings] = useState<User[]>([]);
  const [clickedPostId, setClickedPostId] = useState<number | null>(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState<boolean>(false);
  const [editModalVisible, setEditModalVisible] = useState<boolean>(false);
  const [editPostContent, setEditPostContent] = useState<string>('');
  const [editPostId, setEditPostId] = useState<string | null>(null);
  const [reportModalVisible, setReportModalVisible] = useState<boolean>(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const {darkMode} = useContext(ThemeContext);

  useEffect(() => {
    const fetchData = async () => {
      const user = await AsyncStorage.getItem('user');
      setUser(user);
      axiosInstance
        .get(`${UserBaseURL}/getAllPosts`)
        .then(res => {
          setPosts(res.data.posts);
          setSuggestedUsers(res.data.users);
          setAd(res.data.randomAd);
          setNumPosts(res.data.NumPosts);
          setFollowings(res.data.UserFollowersFollowings?.Followings);
        })
        .catch(error => {
          console.error(error);
          // toast.error('An error occurred.');
        })
        .finally(() => {
          setLoadingUser(false);
        });
    };
    fetchData();
  }, [updateUI]);

  const handleLikeClick = (postId: string) => {
    axiosInstance
      .get(`${UserBaseURL}/like/${postId}`)
      .then(res => {
        // toast.success(res?.data.message);
        setUpdateUI(prev => !prev);
      })
      .catch(error => {
        console.error(error);
        // toast.error('An error occurred.');
      });
  };

  const handleSaveClick = (postId: string) => {
    axiosInstance
      .get(`${UserBaseURL}/savedpost/${postId}`)
      .then(res => {
        // toast.success(res?.data.message);
        setUpdateUI(prev => !prev);
      })
      .catch(error => {
        console.error(error);
        // toast.error('An error occurred.');
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

  const handleEditPost = () => {
    if (editPostId) {
      axiosInstance
        .post(`${UserBaseURL}/editPost`, {
          postId: editPostId,
          content: editPostContent,
        })
        .then(res => {
          // toast.success('Post edited successfully');
          setUpdateUI(prev => !prev);
          setEditModalVisible(false);
        })
        .catch(error => {
          console.error(error);
          // toast.error('An error occurred.');
        });
    }
  };

  const handleCommentClick = (postId: number) => {
    setClickedPostId(postId);
  };

  return (
    <>
      {loadingUser ? (
        <Spinner />
      ) : (
        <View style={styles.postsContainer}>
          <CreatePost setUpdateUI={setUpdateUI} />
          {posts && posts.length === 0 ? (
            <Text style={styles.noPostsText}>No posts</Text>
          ) : (
            posts &&
            posts.map((post: any) => (
              <Card
              key={post._id}
                style={{
                  marginBottom: 16,
                  borderRadius: 8,
                  padding: 16,
                  backgroundColor: darkMode ? '#0a1d43' : '#fff',
                  shadowColor: darkMode ? '#ccc' : '#000',
                  shadowOffset: {width: 0, height: 2},
                  shadowOpacity: 0.2,
                  shadowRadius: 4,
                  elevation: 10,
                }}>
                <View style={styles.header}>
                  <Image
                    source={{uri: post?.userId?.ProfilePic}}
                    style={styles.avatar}
                  />
                  <View>
                    <Text
                      style={[
                        styles.username,
                        {color: darkMode ? 'white' : 'black'},
                      ]}>
                      {post?.userId?.UserName}
                    </Text>
                    <Text style={styles.date}>
                      {formatPostDate(post?.createdAt)}
                    </Text>
                  </View>
                </View>
                {post?.fileUrl && (
                  <Image
                    source={{uri: post?.fileUrl}}
                    style={styles.postImage}
                  />
                )}
                <Text
                  style={[
                    styles.content,
                    {color: darkMode ? 'white' : 'black'},
                  ]}>
                  {post?.content}
                </Text>
                <View style={styles.actions}>
                  <TouchableOpacity
                    onPress={() => {
                      console.log('Like clicked');
                      handleLikeClick(post._id);
                    }}>
                    {post?.likes.includes(user?._id) ? (
                      <AntDesign name="heart" size={26} color={'red'} />
                    ) : (
                      <AntDesign name="hearto" size={26} color={'#A3AED0'} />
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      console.log('comments clicked');
                      handleCommentClick(post._id);
                    }}>
                    <FontAwesome
                      name="commenting-o"
                      size={26}
                      color={'#A3AED0'}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      console.log('Saved clicked');
                      handleSaveClick(post._id);
                    }}>
                    {post.savedBy?.includes(user?._id) ? (
                      <FontAwesome name="bookmark" size={26} color={'black'} />
                    ) : (
                      <FontAwesome
                        name="bookmark-o"
                        size={26}
                        color={'#A3AED0'}
                      />
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      console.log('comments clicked');
                    }}>
                    <MaterialIcons name="share" size={26} color={'#A3AED0'} />
                  </TouchableOpacity>
                </View>
              </Card>
            ))
          )}
        </View>
      )}
      <Modal visible={deleteModalVisible} transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modal}>
            <Text>Are you sure you want to delete this post?</Text>
            <Button
              title="Cancel"
              onPress={() => setDeleteModalVisible(false)}
            />
            <Button
              title="Delete"
              onPress={() => {
                /* deletePost() */
              }}
            />
          </View>
        </View>
      </Modal>
      <Modal visible={editModalVisible} transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modal}>
            <Text>Edit post</Text>
            <TextInput
              value={editPostContent}
              onChangeText={setEditPostContent}
              multiline={true}
              style={styles.textInput}
            />
            <Button title="Save" onPress={handleEditPost} />
            <Button title="Cancel" onPress={() => setEditModalVisible(false)} />
          </View>
        </View>
      </Modal>
      <Modal visible={reportModalVisible} transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modal}>
            <Text>Report Post</Text>
            {/* Add your reporting options here */}
            <Button
              title="Cancel"
              onPress={() => setReportModalVisible(false)}
            />
            <Button
              title="Report"
              onPress={() => {
                /* reportPost() */
              }}
            />
          </View>
        </View>
      </Modal>
    </>
  );
};

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
  postsContainer: {
    flex: 1,
    marginTop:7
  },
  noPostsText: {
    textAlign: 'center',
    marginTop: 100,
    fontSize: 18,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  username: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  date: {
    fontSize: 12,
    color: '#888',
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginVertical: 8,
  },
  content: {
    marginVertical:4,
    fontSize: 14,
    marginBottom: 10,
  },
  actions: {
    marginHorizontal: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modal: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
    width: '80%',
  },
  textInput: {
    height: 100,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 4,
    marginVertical: 10,
    padding: 10,
  },
});

export default Home;

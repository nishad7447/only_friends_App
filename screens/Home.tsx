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
import {RefreshControl, TouchableOpacity} from 'react-native-gesture-handler';
import {ThemeContext} from './Context/ThemeContext';
import CreatePost from './Components/CreatePost';
import {NavigationProp, useNavigation} from '@react-navigation/native';
import Posts from './Components/Posts';

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
  const navigation = useNavigation<NavigationProp<any>>();
  const [loadingUser, setLoadingUser] = useState<boolean>(true);
  const [posts, setPosts] = useState<Post[]>([]);
  const [ad, setAd] = useState<Post[]>([]);
  const [updateUI, setUpdateUI] = useState<boolean>(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState<boolean>(false);
  const [editModalVisible, setEditModalVisible] = useState<boolean>(false);
  const [editPostContent, setEditPostContent] = useState<string>('');
  const [reportModalVisible, setReportModalVisible] = useState<boolean>(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [editPostId, setEditPostId] = useState<string | null>(null);
  const {darkMode, user} = useContext(ThemeContext);

  const handleRefresh = () => {
    setIsRefreshing(prev => !prev);
  };

  useEffect(() => {
    const fetchData = async () => {
      axiosInstance
        .get(`${UserBaseURL}/getAllPosts`)
        .then(res => {
          setPosts(res.data.posts);
          setAd(res.data.randomAd);
        })
        .catch(error => {
          console.error(error);
          // toast.error('An error occurred.');
        })
        .finally(() => {
          setLoadingUser(false);
          setIsRefreshing(false);
        });
    };
    fetchData();
  }, [updateUI, isRefreshing]);

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

  return (
    <>
      {loadingUser ? (
        <Spinner />
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollViewContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
            />
          }>
          <View style={styles.postsContainer}>
            <CreatePost setUpdateUI={setUpdateUI} />
            {posts && posts.length === 0 ? (
              <Text style={styles.noPostsText}>No posts</Text>
            ) : (
              posts &&
              posts.map((post: any) => (
                  <Posts
                    key={post._id}
                    post={post}
                    setUpdateUI={setUpdateUI}
                    userId={''}
                    loggedInUser={user}
                  />
              ))
            )}
          </View>
        </ScrollView>
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
  scrollViewContent: {
    flexGrow: 1,
    padding: 10,
    // top:48
  },
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
    marginTop: 7,
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
    marginVertical: 4,
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

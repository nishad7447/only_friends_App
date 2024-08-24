import React, {useContext, useEffect, useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
} from 'react-native';
import {UserBaseURL} from './Components/API';
import {axiosInstance} from './Components/AxiosConfig';
import {RefreshControl} from 'react-native-gesture-handler';
import {GlobalState} from './Context/GlobalState';
import CreatePost from './Components/CreatePost';
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

const Spinner: React.FC = () => (
  <View style={styles.spinnerContainer}>
    <View style={styles.spinner}></View>
  </View>
);

const Home: React.FC = () => {
  const [loadingUser, setLoadingUser] = useState<boolean>(true);
  const [posts, setPosts] = useState<Post[]>([]);
  const [ad, setAd] = useState<Post[]>([]);
  const [updateUI, setUpdateUI] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const { user} = useContext(GlobalState);

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
    </>
  );
};

const styles = StyleSheet.create({
  scrollViewContent: {
    flexGrow: 1,
    padding: 10,
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
});

export default Home;

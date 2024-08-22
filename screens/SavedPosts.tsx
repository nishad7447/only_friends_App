import React, {useContext, useEffect, useState} from 'react';
import {View, Text, ActivityIndicator, StyleSheet} from 'react-native';
import {ThemeContext} from './Context/ThemeContext';
import {axiosInstance} from './Components/AxiosConfig';
import {UserBaseURL} from './Components/API';
import Toast from 'react-native-toast-message';
import Posts from './Components/Posts';

const SavedPosts = () => {
  const {user, darkMode} = useContext(ThemeContext);
  const [loadingUser, setLoadingUser] = useState(true);
  const [savedPosts, setSavedPosts] = useState([]);
  const [updateUI, setUpdateUI] = useState(false);

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
    noPostsText: {
      color: darkMode ? 'white' : 'black',
      textAlign: 'center',
      fontSize: 18,
      marginTop: 50,
    },
  });

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
            savedPosts.map((post: any) => (
              <Posts
                key={post.postId._id}
                post={post.postId}
                setUpdateUI={setUpdateUI}
                userId={''}
                loggedInUser={user}
              />
            ))
          ) : (
            <Text style={styles.noPostsText}>
              There is nothing in saved posts
            </Text>
          )}
        </>
      )}
    </View>
  );
};

export default SavedPosts;

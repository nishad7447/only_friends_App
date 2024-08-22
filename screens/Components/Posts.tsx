import React, {useContext, useRef, useState} from 'react';
import {axiosInstance} from './AxiosConfig';
import {UserBaseURL} from './API';
import Toast from 'react-native-toast-message';
import Card from './Card';
import {ThemeContext} from '../Context/ThemeContext';
import {TouchableOpacity} from 'react-native-gesture-handler';
import {NavigationProp, useNavigation} from '@react-navigation/native';
import {Image, StyleSheet, Text, View} from 'react-native';
import moment from 'moment';
import AntDesign from 'react-native-vector-icons/AntDesign';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Video from 'react-native-video';
import Dropdown from './Dropdown';

interface PostsProps {
  post: any;
  setUpdateUI: React.Dispatch<React.SetStateAction<boolean>>;
  userId: string;
  loggedInUser: any;
}

const Posts: React.FC<PostsProps> = ({
  post,
  setUpdateUI,
  userId,
  loggedInUser,
}) => {
  const navigation = useNavigation<NavigationProp<any>>();
  const [clickedPostId, setClickedPostId] = useState<number | null>(null);
  const {darkMode} = useContext(ThemeContext);

  const handleCommentClick = (postId: number) => {
    setClickedPostId(postId);
  };

  const closeModal = () => {
    setClickedPostId(null);
  };

  //like
  const handleLikeClick = (postId: number) => {
    axiosInstance
      .get(`${UserBaseURL}/like/${postId}`)
      .then(res => {
        Toast.show({type: 'success', text1: res?.data.message});
        setUpdateUI((prevState: boolean) => !prevState);
      })
      .catch(error => {
        console.log('user error clicking like', error);

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
            text1: 'An error occurred while user clicking like.',
          });
        }
      });
  };
  const renderLikeInfo = (post: any) => {
    const likeCount = post.likes?.length;
    if (likeCount === 0) {
      return '';
    }

    const userLiked = post.likes?.includes(userId ? userId : loggedInUser._id);

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

  //savedpost
  const handleSaveClick = (postId: number) => {
    axiosInstance
      .get(`${UserBaseURL}/savedpost/${postId}`)
      .then(res => {
        Toast.show({type: 'success', text1: res?.data.message});
        setUpdateUI((prevState: boolean) => !prevState);
      })
      .catch(error => {
        console.log('user error saved post', error);

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
            text1: 'An error occurred while user saved post.',
          });
        }
      });
  };
  //post settings
  const [openDropdowns, setOpenDropdowns] = useState<any>({});
  const handleDropdownToggle = (postId: string) => {
    console.log({postId});
    setOpenDropdowns((prevOpenDropdowns: any) => ({
      ...prevOpenDropdowns,
      [postId]: !prevOpenDropdowns[postId],
    }));
  };
  const dropdownRef = useRef(null);
  // useEffect(() => {
  //     const handleOutsideClick = (event:any) => {
  //         if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
  //             setOpenDropdowns({});
  //         }
  //     };
  //     document.addEventListener('mousedown', handleOutsideClick);
  //     return () => {
  //         document.removeEventListener('mousedown', handleOutsideClick);
  //     };
  // }, []);

  //deleteMODAL
  const [deleteModal, setDeleteModal] = useState(false);
  const [deletePostId, setDeletePostId] = useState<number | null>(null);

  const showDeleteModal = (postId: number) => {
    setDeletePostId(postId);
    setDeleteModal(true);
  };

  const deleteModalConfirm = () => {
    setDeleteModal(false);
    axiosInstance
      .delete(`${UserBaseURL}/deletePost/${deletePostId}`)
      .then(res => {
        if (res.data.success) {
          setUpdateUI(prev => !prev);
          Toast.show({type: 'success', text1: res.data.message});
        }
      })
      .catch(error => {
        console.log('user error delete post', error);

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
            text1: 'An error occurred while user delete post.',
          });
        }
      });
  };

  const deleteModalCancel = () => {
    setDeleteModal(false);
  };

  //reportMODAL
  const [reportModal, setReportModal] = useState(false);
  const [reportPostId, setReportPostId] = useState<number | null>(null);
  const showReportModal = (postId: number) => {
    setReportPostId(postId);
    setReportModal(true);
  };
  const reportModalCancel = () => {
    setReportModal(false);
  };

  const reportOptions = [
    {label: 'Inappropriate content', value: 'inappropriate'},
    {label: 'Spam', value: 'spam'},
    {label: 'Hate speech', value: 'hate_speech'},
    // Add more report options as needed
  ];

  const [selectedOpt, setSelecetedOpt] = useState<string | null>(null);
  const selectedReason = (reason: string) => {
    setSelecetedOpt(reason);
  };

  const reportModalConfirm = () => {
    setReportModal(false);
    axiosInstance
      .put(`${UserBaseURL}/reportPost`, {
        postId: reportPostId,
        reason: selectedOpt,
      })
      .then(res => {
        if (res.data.success) {
          setUpdateUI(prev => !prev);
          Toast.show({type: 'success', text1: res.data.message});
        }
      })
      .catch(error => {
        console.log('user error report post', error);

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
            text1: 'An error occurred while user report post.',
          });
        }
      });
  };

  const handleGoToUser = (userId: number) => {
    navigation.navigate('Profile', {userId});
  };

  //moment.js config
  const formatPostDate = (date: string) => {
    const now = moment();
    const postDate = moment(date);

    if (now.diff(postDate, 'seconds') < 60) {
      return 'Just now';
    } else if (now.diff(postDate, 'days') === 0) {
      return postDate.fromNow(); // Display "x minutes ago", "an hour ago", etc.
    } else if (now.diff(postDate, 'days') === 1) {
      return 'Yesterday';
    } else if (now.diff(postDate, 'days') <= 4) {
      return `${now.diff(postDate, 'days')} days ago`; // Display "X days ago" for posts within the last 4 days
    } else if (now.diff(postDate, 'years') === 0) {
      return postDate.format('MMMM D'); // Display "Month Day" for posts within the current year
    } else {
      return postDate.format('LL'); // Display "Month Day, Year" for posts older than a year
    }
  };

  const styles = StyleSheet.create({
    headerContiner: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    header: {
      marginBottom: 8,
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
    content: {
      marginVertical: 4,
      fontSize: 14,
      marginBottom: 10,
    },
    actionText: {
      marginLeft: 4,
      fontSize: 10,
      color: '#666',
    },

    postContent: {
      padding: 8,
    },
    postHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 10,
    },
    postProfilePic: {
      width: 40,
      height: 40,
      borderRadius: 20,
      marginRight: 10,
    },
    postUsername: {
      fontSize: 14,
      fontWeight: 'bold',
    },
    postDate: {
      color: 'gray',
    },
    optionsIcon: {
      marginLeft: 'auto',
    },
    dropdown: {
      position: 'absolute',
      top: 50,
      right: 0,
      backgroundColor: 'white',
      borderRadius: 5,
      borderColor: 'gray',
      borderWidth: 1,
      shadowColor: 'black',
      shadowOpacity: 0.2,
      shadowRadius: 5,
      elevation: 5,
      width: 100,
    },
    dropdownItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 10,
    },
    dropdownItemText: {
      marginLeft: 5,
    },
    postImage: {
      width: '100%',
      height: 200,
      borderRadius: 10,
      marginBottom: 10,
    },
    postVideo: {
      width: '100%',
      height: 200,
      borderRadius: 10,
      marginBottom: 10,
    },
    postAudio: {
      width: '100%',
      marginBottom: 10,
    },
    postText: {
      fontSize: 14,
      marginBottom: 10,
    },
    actions: {
      marginHorizontal: 10,
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    likedIcon: {
      color: 'red',
    },
    savedIcon: {
      color: 'black',
    },

    //dropdown
    button: {
      padding: 10,
      backgroundColor: 'gray',
      borderRadius: 5,
    },
    overlay: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    //   dropdown: {
    //     position: 'absolute',
    //     top: '10%', // Adjust based on the button's position
    //     right: 0,
    //     backgroundColor: 'white',
    //     borderRadius: 8,
    //     padding: 10,
    //     shadowColor: '#000',
    //     shadowOffset: { width: 0, height: 2 },
    //     shadowOpacity: 0.8,
    //     shadowRadius: 2,
    //     elevation: 5,
    //   },
    option: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 8,
      paddingHorizontal: 12,
    },
    optionSep: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    optionText: {
      marginLeft: 8,
      fontSize: 14,
      color: '#000',
    },
  });

  const renderMedia = (fileUrl: any) => {
    const extension = fileUrl.split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif'].includes(extension)) {
      return (
        <Image
          source={{uri: fileUrl}}
          style={{
            width: '100%',
            height: 200,
            borderRadius: 8,
            marginBottom: 12,
          }}
        />
      );
    } else if (extension === 'mp4') {
      return (
        // <></>
        <Video
          source={{uri: fileUrl}}
          style={{
            width: '100%',
            height: 200,
            borderRadius: 8,
            marginBottom: 12,
          }}
          controls={true}
          onError={error => {
            console.log('Video error:', error);
          }}
          paused={false}
          repeat={true}
        />
      );
    } else if (extension === 'mp3') {
      return (
        <></>
        // <Audio source={{uri: fileUrl}} style={{width: '100%',height: 200, borderRadius: 8, marginBottom: 12,}} controls={true} />
      );
    } else {
      return <Text>Unsupported file format</Text>;
    }
  };

  //edit modal
  const [editModal, setEditModal] = useState(false);
  const [editPostId, setEditPostId] = useState<number | null>(null);
  const [editPostContent, setEditPostContent] = useState('');
  const showEditModal = (postId: number, content: string) => {
    setEditPostId(postId);
    setEditPostContent(content);
    setEditModal(true);
  };
  const editModalCancel = () => {
    setEditModal(false);
  };

  //share
  const [showShareModal, setShowShareModal] = useState(false);
  const [sharePostId, setSharePostId] = useState<number | null>(null);
  const toggleModal = (postId: number) => {
    setShowShareModal(true);
    setSharePostId(postId);
  };
  const closeShareModal = () => {
    setShowShareModal(false);
  };

  return (
    <>
      <Card
        key={post._id}
        style={{
          marginBottom: 10,
          borderRadius: 8,
          padding: 16,
          backgroundColor: darkMode ? '#0a1d43' : '#fff',
          shadowOffset: {width: 0, height: 2},
          shadowOpacity: 0.2,
          shadowRadius: 4,
          elevation: 10,
        }}>
        <View style={styles.headerContiner}>
          <TouchableOpacity onPress={() => handleGoToUser(post.userId._id)}>
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
          </TouchableOpacity>
          {/* <TouchableOpacity onPress={() => handleDropdownToggle(post._id)}>
            <MaterialCommunityIcons name="dots-vertical" size={20} />
          </TouchableOpacity> */}
          <Dropdown
            top={52}
            right={10}
            button={
              <MaterialCommunityIcons
                name="dots-vertical"
                size={20}
                style={{color: darkMode ? 'white' : 'black'}}
              />
            }
            children={
              <View ref={dropdownRef} style={styles.dropdown}>
                {post?.userId?.UserName === loggedInUser.UserName ? (
                  <>
                    <View style={styles.option}>
                      <TouchableOpacity
                        style={styles.optionSep}
                        onPress={() => showDeleteModal(post._id)}>
                        <AntDesign name="delete" size={20} />
                        <Text style={styles.optionText}>Delete</Text>
                      </TouchableOpacity>
                    </View>
                    <View style={styles.option}>
                      <TouchableOpacity
                        style={styles.optionSep}
                        onPress={() => showEditModal(post?._id, post?.content)}>
                        <AntDesign name="edit" size={18} />
                        <Text style={styles.optionText}>Edit</Text>
                      </TouchableOpacity>
                    </View>
                  </>
                ) : (
                  <View style={styles.option}>
                    <TouchableOpacity
                      style={styles.optionSep}
                      onPress={() => showReportModal(post._id)}>
                      <MaterialIcons
                        name="report-problem"
                        size={20}
                        color={'yellow'}
                      />
                      <Text style={styles.optionText}>Report</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            }
          />
          {openDropdowns[post._id] && <></>}
        </View>
        {/* {post?.fileUrl && (
          <Image source={{uri: post?.fileUrl}} style={styles.postImage} />
        )} */}
        {post.fileUrl && renderMedia(post.fileUrl)}
        <Text style={[styles.content, {color: darkMode ? 'white' : 'black'}]}>
          {post?.content}
        </Text>
        <View style={styles.actions}>
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginRight: 4,
            }}
            onPress={() => {
              handleLikeClick(post._id);
            }}>
            {post?.likes?.includes(loggedInUser?._id) ? (
              <AntDesign name="heart" size={26} color={'red'} />
            ) : (
              <AntDesign name="hearto" size={26} color={'#A3AED0'} />
            )}
            <Text style={styles.actionText}>{renderLikeInfo(post)}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              console.log('comments clicked');
              handleCommentClick(post._id);
            }}>
            <FontAwesome name="commenting-o" size={26} color={'#A3AED0'} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              handleSaveClick(post._id);
            }}>
            {post.savedBy?.includes(loggedInUser?._id) ? (
              <FontAwesome
                name="bookmark"
                size={26}
                color={darkMode ? 'white' : 'black'}
              />
            ) : (
              <FontAwesome name="bookmark-o" size={26} color={'#A3AED0'} />
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
    </>
  );
};

export default Posts;

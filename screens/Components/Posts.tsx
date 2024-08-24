import React, {useContext, useMemo, useRef, useState} from 'react';
import {axiosInstance} from './AxiosConfig';
import {UserBaseURL} from './API';
import Toast from 'react-native-toast-message';
import Card from './Card';
import {GlobalState} from '../Context/GlobalState';
import {TouchableOpacity} from 'react-native-gesture-handler';
import {NavigationProp, useNavigation} from '@react-navigation/native';
import {Image, StyleSheet, Text, View} from 'react-native';
import moment from 'moment';
import AntDesign from 'react-native-vector-icons/AntDesign';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import CustomModal from './Modal';
import {RadioGroup} from 'react-native-radio-buttons-group';
import EditModal from './EditModal';
import Share from 'react-native-share';
import CommentModal from './CommentModel';
import VideoPlayer from './VideoComponent';

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
  const [clickedPostId, setClickedPostId] = useState<string | null>(null);
  const {darkMode, user} = useContext(GlobalState);

  const handleCommentClick = (postId: string) => {
    setClickedPostId(postId);
  };

  const closeModal = () => {
    setClickedPostId(null);
  };

  //like
  const handleLikeClick = (postId: string) => {
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
    setOpenDropdowns((prevOpenDropdowns: any) => ({
      ...prevOpenDropdowns,
      [postId]: !prevOpenDropdowns[postId],
    }));
  };
  const dropdownRef = useRef(null);

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

  const reportOptions = useMemo(
    () => [
      {id: '1', label: 'Inappropriate content', value: 'inappropriate'},
      {id: '2', label: 'Spam', value: 'spam'},
      {id: '3', label: 'Hate speech', value: 'hate_speech'},
    ],
    [],
  );

  const [selectedOpt, setSelecetedOpt] = useState<any>(null);

  const reportModalConfirm = () => {
    if (!selectedOpt) {
      Toast.show({type: 'error', text1: 'Please Select a option'});
      return;
    }
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

  //edit modal
  const [editModal, setEditModal] = useState(false);
  const [editPostId, setEditPostId] = useState<string | null>(null);
  const [editPostContent, setEditPostContent] = useState('');
  const showEditModal = (postId: string, content: string) => {
    setEditPostId(postId);
    setEditPostContent(content);
    setEditModal(true);
  };
  const editModalCancel = () => {
    setEditModal(false);
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
      zIndex: 999,
      top: 40,
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
      return <VideoPlayer fileUrl={fileUrl} />;
    } else if (extension === 'mp3') {
      return (
        <></>
        // <Audio source={{uri: fileUrl}} style={{width: '100%',height: 200, borderRadius: 8, marginBottom: 12,}} controls={true} />
      );
    } else {
      return <Text>Unsupported file format</Text>;
    }
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
          elevation: 2,
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
          <TouchableOpacity onPress={() => handleDropdownToggle(post._id)}>
            <MaterialCommunityIcons
              name="dots-vertical"
              color={darkMode ? 'white' : 'black'}
              size={20}
              style={{position: 'relative'}}
            />
          </TouchableOpacity>

          {openDropdowns[post._id] && (
            <View ref={dropdownRef} style={styles.dropdown}>
              {post?.userId?.UserName === loggedInUser.UserName ? (
                <>
                  <View style={styles.option}>
                    <TouchableOpacity
                      style={styles.optionSep}
                      onPress={() => {
                        setOpenDropdowns({});
                        showDeleteModal(post._id);
                      }}>
                      <AntDesign name="delete" size={20} color={'red'} />
                      <Text style={styles.optionText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.option}>
                    <TouchableOpacity
                      style={styles.optionSep}
                      onPress={() => {
                        setOpenDropdowns({});
                        showEditModal(post?._id, post?.content);
                      }}>
                      <AntDesign name="edit" size={18} color={'blue'} />
                      <Text style={styles.optionText}>Edit</Text>
                    </TouchableOpacity>
                  </View>
                </>
              ) : (
                <View style={styles.option}>
                  <TouchableOpacity
                    style={styles.optionSep}
                    onPress={() => {
                      setOpenDropdowns({});
                      showReportModal(post._id);
                    }}>
                    <MaterialIcons
                      name="report-problem"
                      size={20}
                      color={'yellow'}
                      style={{
                        backgroundColor: 'red',
                        borderRadius: 50,
                        padding: 2,
                      }}
                    />
                    <Text style={styles.optionText}>Report</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
        </View>
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
            onPress={async () => {
              try {
                await Share.open({
                  title: `Post Shared By ${user.Name}`,
                  message: `Post Shared By ${user.Name} Check out this link!`,
                  urls: [`https://onlyfriends.fun/#${post._id}`],
                });
              } catch (error) {
                Toast.show({
                  type: 'error',
                  text1:
                    'Share failed, An error occurred while sharing the link.',
                });
              }
            }}>
            <MaterialIcons name="share" size={26} color={'#A3AED0'} />
          </TouchableOpacity>
        </View>
      </Card>
      {clickedPostId && (
        <CommentModal postId={clickedPostId} closeModal={closeModal} />
      )}

      {deleteModal && (
        <CustomModal
          Heading="Delete Post"
          content="Are you sure to delete this post?"
          onCancel={deleteModalCancel}
          onConfirm={deleteModalConfirm}
        />
      )}

      {reportModal && (
        <CustomModal
          Heading="Report Post"
          content={
            <View style={{}}>
              <RadioGroup
                radioButtons={reportOptions}
                onPress={setSelecetedOpt}
                selectedId={selectedOpt}
                layout="column" // or "row" for horizontal layout
                labelStyle={{
                  color: darkMode ? 'white' : 'black',
                  alignItems: 'center',
                }}
                containerStyle={{alignItems: 'flex-start'}}
              />
            </View>
          }
          onCancel={reportModalCancel}
          onConfirm={reportModalConfirm}
        />
      )}

      {editModal && (
        <EditModal
          onCancel={editModalCancel}
          setUpdateUI={setUpdateUI}
          editPostId={editPostId}
          editPostContent={editPostContent}
        />
      )}
    </>
  );
};

export default Posts;

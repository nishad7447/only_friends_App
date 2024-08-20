import React, {useState, useRef, useContext, useEffect} from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  FlatList,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Card from './Components/Card';
import {ThemeContext} from './Context/ThemeContext';
import {
  NavigationProp,
  useNavigation,
} from '@react-navigation/native';
import {axiosInstance} from './Components/AxiosConfig';
import {UserBaseURL} from './Components/API';
import Toast from 'react-native-toast-message';
import moment from 'moment';
import CreatePost from './Components/CreatePost';

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
  // const [openDropdowns, setOpenDropdowns] = useState({});
  const [loadingUser, setLoadingUser] = useState<boolean>(true);
  const [posts, setPosts] = useState([]);
  const [users, setUser] = useState(user);
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [updateUI, setUpdateUI] = useState(false);
  const navigation = useNavigation<NavigationProp<any>>();

  // const dropdownRef = useRef(null);

  useEffect(() => {
    if (userId) {
      axiosInstance
        .get(`${UserBaseURL}/userDetail/${userId}`)
        .then(res => {
          console.log(res);
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
    }
    axiosInstance
      .get(`${UserBaseURL}/userProfile/${userId ? userId : users._id}`)
      .then(res => {
        console.log(res);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updateUI]);

  // comment
  const [clickedPostId, setClickedPostId] = useState<number | null>(null);

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
        console.log(res.data);
        Toast.show({type: 'success', text1: res?.data.message});
        setUpdateUI(prevState => !prevState);
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
    const likeCount = post.likes.length;
    const userLiked = post.likes.includes(userId ? userId : loggedInUser._id);

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

  //savedpost
  const handleSavedClick = (postId: number) => {
    axiosInstance
      .get(`${UserBaseURL}/savedpost/${postId}`)
      .then(res => {
        console.log(res.data);
        Toast.show({type: 'success', text1: res?.data.message});
        setUpdateUI(prevState => !prevState);
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
  const handleDropdownToggle = (postId: number) => {
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
        console.log(res, 'delete post res');
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
        console.log(res, 'report post res');
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

  const handleGoToUser = (userId: number) => {
    navigation.navigate('Profile', {userId});
  };

  
const styles = StyleSheet.create({
    container: {
      flexGrow: 1,
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
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
      padding: 10,
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
        color: darkMode? 'white':'black',
      fontSize: 18,
      fontWeight: 'bold',
    },
    userUsername: {
      color: 'gray',
    },
    userBio: {
      marginBottom: 10,
    },
    userDetailsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 10,
    },
    userDetailText: {
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
      flex: 3,
      padding: 10,
    },
    noPosts: {
      fontSize: 18,
      fontWeight: 'bold',
      textAlign: 'center',
      marginTop: 48,
    },
    postContent: {
      padding: 10,
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
    postActions: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
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
    // messageIcon: {
    //     color: 'blue',
    // },
  });

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {loadingUser ? (
        <Spinner />
      ) : (
        <>
              <Card
              style={{
                margin:10,
                padding: 30,
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
                        source={{uri: user?.ProfilePic}}
                      />
                      <View>
                        <Text style={styles.userName}>
                          {user?.Name ? user?.Name : ''}
                        </Text>
                        <Text style={styles.userUsername}>
                          @{user?.UserName ? user?.UserName : ''}
                        </Text>
                      </View>
                    </View>
                    {loggedInUser.UserName === user.UserName ? (
                    <></>
                    ) : user?.Followers.includes(
                        loggedInUser?._id || userId,
                      ) ? (
                      <></>
                    ) : (
                      // <UnFollowBTN friendId={user?._id} setUpdateUI={setUpdateUI} />
                      <></>
                      // <FollowBTN friendId={user?._id} setUpdateUI={setUpdateUI} />
                    )}
                  </View>
                  <Text style={styles.userBio}>
                    {user?.Bio ? user?.Bio : ''}
                  </Text>
                  <View style={styles.userDetailsRow}>
                    {/* <BiBriefcase /> */}
                    <Text style={styles.userDetailText}>
                      {user?.Occupation ? user?.Occupation : ''}
                    </Text>
                  </View>
                  <View style={styles.userDetailsRow}>
                    {/* <BiMap /> */}
                    <Text style={styles.userDetailText}>
                      {user?.Location ? user?.Location : ''}
                    </Text>
                  </View>
                  <View style={styles.stats}>
                    <TouchableOpacity
                      onPress={() =>
                        //  nav(`/followers/${user?._id}`)
                        console.log('followersClicked')
                      }>
                      <Text style={styles.statNumber}>
                        {user?.Followers.length
                          ? user?.Followers.length.toString()
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
                        {user?.Followings.length
                          ? user?.Followings.length.toString()
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
                </View>
              </Card>
        <View style={styles.grid}>
          <View style={styles.sidebar}>
            <View style={styles.sticky}>
              {/* {loggedInUser._id === user._id && (
                <Card extra="mt-4">
                  <View style={styles.friendsList}>
                    <Text style={styles.friendsListTitle}>My Friend Lists</Text>
                    {suggestedUsers.map((friend: any) => (
                      <View key={friend?._id} style={styles.friendItem}>
                        <View style={styles.friendDetails}>
                          <Image
                            style={styles.friendPic}
                            source={{uri: friend?.ProfilePic}}
                          />
                          <TouchableOpacity
                            onPress={() => handleGoToUser(friend?._id)}>
                            <Text style={styles.friendName}>
                              {friend?.UserName ? friend?.UserName : ''}
                            </Text>
                          </TouchableOpacity>
                        </View>
                        <TouchableOpacity
                          onPress={() =>
                            // nav('/chat')
                            console.log('chat')
                          }>
                           <SiGooglemessages style={styles.messageIcon} /> 
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                </Card>
              )} */}
            </View>
          </View>
          <View style={styles.postsContainer}>
            {!userId && <CreatePost setUpdateUI={setUpdateUI} />}
            {/* {posts.length === 0 ? (
              <Text style={styles.noPosts}>No posts</Text>
            ) : (
              posts.map((post: any) => (
                <Card key={post.id} extra="mb-4">
                  <View style={styles.postContent}>
                    <View style={styles.postHeader}>
                      <Image
                        style={styles.postProfilePic}
                        source={{uri: post?.userId?.ProfilePic}}
                      />
                      <View>
                        <Text style={styles.postUsername}>
                          {post?.userId?.UserName ? post?.userId?.UserName:''}
                        </Text>
                        <Text style={styles.postDate}>
                          {formatPostDate(post?.createdAt)}
                        </Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => handleDropdownToggle(post._id)}>
                         <SlOptionsVertical style={styles.optionsIcon} /> 
                      </TouchableOpacity>
                      {openDropdowns[post._id] && (
                        <View ref={dropdownRef} style={styles.dropdown}>
                          <FlatList
                            data={
                              post?.userId?.UserName === loggedInUser.UserName
                                ? [
                                    {
                                      label: 'Delete',
                                      icon: 'delete',
                                      // <MdDeleteForever style={styles.deleteIcon} size={20} />
                                      onPress: () => showDeleteModal(post._id),
                                    },
                                    {
                                      label: 'Edit',
                                      icon: 'edit',
                                      //  <FaEdit style={styles.editIcon} size={18} />
                                      onPress: () =>
                                        showEditModal(post?._id, post?.content),
                                    },
                                  ]
                                : [
                                    {
                                      label: 'Report',
                                      icon: 'report',
                                      //  <MdReportProblem style={styles.reportIcon} size={20} />
                                      onPress: () => showReportModal(post._id),
                                    },
                                  ]
                            }
                            renderItem={({item}) => (
                              <TouchableOpacity
                                onPress={item.onPress}
                                style={styles.dropdownItem}>
                                {item.icon}
                                <Text style={styles.dropdownItemText}>
                                  {item.label ? item.label : ""}
                                </Text>
                              </TouchableOpacity>
                            )}
                            keyExtractor={item => item.label}
                          />
                        </View>
                      )}
                    </View>
                    {post?.fileUrl &&
                      (() => {
                        const extension = post?.fileUrl
                          .split('.')
                          .pop()
                          .toLowerCase();
                        if (['jpg', 'jpeg', 'png', 'gif'].includes(extension)) {
                          return (
                            <Image
                              style={styles.postImage}
                              source={{uri: post?.fileUrl}}
                            />
                          );
                        } else if (extension === 'mp4') {
                          return (
                            // <Video
                            //     style={styles.postVideo}
                            //     source={{ uri: post?.fileUrl }}
                            //     controls
                            //     resizeMode="contain"
                            // />
                            <></>
                          );
                        } else if (extension === 'mp3') {
                          return (
                            // <Audio
                            //     style={styles.postAudio}
                            //     source={{ uri: post?.fileUrl }}
                            //     controls
                            // />
                            <></>
                          );
                        } else {
                          return <Text>Unsupported file format</Text>;
                        }
                      })()}
                    <Text style={styles.postText}>{post?.content ? post?.content : ""}</Text>
                    <View style={styles.postActions}>
                      <TouchableOpacity
                        onPress={() => handleLikeClick(post._id)}
                        style={styles.actionButton}>
                        {post.likes.includes(loggedInUser?._id) ? (
                          <AntDesign name="heart" size={26} color={'red'} />
                        ) : (
                          <AntDesign
                            name="hearto"
                            size={26}
                            color={'#A3AED0'}
                          />
                        )}
                        <Text
                        // style={styles.likeInfo}
                        >
                          {renderLikeInfo(post)}
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleCommentClick(post._id)}
                        style={styles.actionButton}>
                        <FontAwesome
                          name="commenting-o"
                          size={26}
                          color={'#A3AED0'}
                        />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleSavedClick(post._id)}
                        style={styles.actionButton}>
                        {post.savedBy?.includes(loggedInUser?._id) ? (
                          <FontAwesome
                            name="bookmark"
                            size={26}
                            color={'black'}
                          />
                        ) : (
                          <FontAwesome
                            name="bookmark-o"
                            size={26}
                            color={'#A3AED0'}
                          />
                        )}
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => toggleModal(post._id)}
                        style={styles.actionButton}>
                         <BiSolidShareAlt /> 
                        share
                      </TouchableOpacity>
                    </View>
                  </View>
                </Card>
              ))
            )} */}
          </View>
        </View>
        </>

      )}
      {/* {clickedPostId && <CommentModal postId={clickedPostId} closeModal={closeModal} />}
            {deleteModal && (
                <ModalComponent
                    Heading="Delete Post"
                    content="Are you sure to delete this post?"
                    onCancel={deleteModalCancel}
                    onConfirm={deleteModalConfirm}
                />
            )}
            {reportModal && (
                <ModalComponent
                    Heading="Report Post"
                    content={
                        <View>
                            {reportOptions.map(option => (
                                <View key={option.value}>
                                    <Text>
                                        <input
                                            type="radio"
                                            name="reportOption"
                                            value={option.value}
                                            onClick={() => selectedReason(option.label)}
                                        />
                                        {option.label}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    }
                    onCancel={reportModalCancel}
                    onConfirm={reportModalConfirm}
                />
            )}
            {showShareModal && <ShareModal isOpen={showShareModal} onClose={closeShareModal} id={sharePostId} />}
            {editModal && (
                <EditModal
                    onCancel={editModalCancel}
                    setUpdateUI={setUpdateUI}
                    editPostId={editPostId}
                    editPostContent={editPostContent}
                />
            )} */}
    </ScrollView>
  );
};


export default Profile;

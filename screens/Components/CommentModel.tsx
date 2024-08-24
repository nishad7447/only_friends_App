import React, {useState, useEffect, useRef, useContext} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  StyleSheet,
  Image,
} from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import {GlobalState} from '../Context/GlobalState';
import Toast from 'react-native-toast-message';
import {UserBaseURL} from './API';
import {axiosInstance} from './AxiosConfig';
import moment from 'moment';

interface CommentModalProps {
  postId: string | null;
  closeModal: () => void;
}

const CommentModal: React.FC<CommentModalProps> = ({postId, closeModal}) => {
  const [comment, setComment] = useState('');
  const [fetchedComments, setFetchedComments] = useState([]);
  const [updateUI, setUpdateUI] = useState(false);
  const {darkMode, user} = useContext(GlobalState);
  const modalRef = useRef<View>(null);
  const [delCommentModal, setDelCommentModal] = useState(false);
  const [delCommentId, setDelCommentId] = useState<string | null>(null);

  useEffect(() => {
    axiosInstance
      .get(`${UserBaseURL}/getAllComments/${postId}`)
      .then(res => setFetchedComments(res.data.comments))
      .catch(err => console.error(err));
  }, [updateUI]);

  const handleCommentChange = (text: string) => {
    setComment(text);
  };

  const handleCommentSubmit = () => {
    axiosInstance
      .post(`${UserBaseURL}/commentPost`, {comment, postId})
      .then(res => {
        Toast.show({type: 'success', text1: res.data.message});
        setUpdateUI(prevState => !prevState);
        setComment('');
      })
      .catch(err => {
        Toast.show({type: 'error', text1: err.response.data.message});
      });
  };

  const showDelCommentModal = (id: string) => {
    setDelCommentId(id);
    setDelCommentModal(true);
  };

  const delCommentModalConfirm = () => {
    axiosInstance
      .delete(`${UserBaseURL}/deleteComment/${delCommentId}`)
      .then(res => {
        if (res.data.success) {
          setUpdateUI(prev => !prev);
          setDelCommentModal(false);
          Toast.show({type: 'success', text1: res.data.message});
        }
      })
      .catch(err => {
        Toast.show({type: 'error', text1: err.response.data.message});
      });
  };

  const delCommentModalCancel = () => {
    setDelCommentModal(false);
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

  return (
    <Modal
      transparent
      visible={true}
      animationType="fade"
      onRequestClose={closeModal}>
      <View
        style={[
          styles.modalContainer,
          {
            backgroundColor: darkMode
              ? 'rgba(0, 0, 0, 0.7)'
              : 'rgba(0, 0, 0, 0.5)',
          },
        ]}>
        <View
          style={[
            styles.modalContent,
            {backgroundColor: darkMode ? '#1B2559' : '#EBF1F7'},
          ]}>
          <View style={styles.header}>
            <Text style={[styles.title, {color: darkMode ? '#fff' : '#000'}]}>
              Comments
            </Text>
            <TouchableOpacity onPress={closeModal}>
              <AntDesign
                name="closecircle"
                size={24}
                color={darkMode ? '#ff4d4d' : '#ff4d4d'}
              />
            </TouchableOpacity>
          </View>
          <View style={styles.separator} />
          <ScrollView
            style={styles.commentsContainer}
            showsVerticalScrollIndicator={false}>
            {Array.isArray(fetchedComments) && fetchedComments.length > 0 ? (
              fetchedComments.map((comment: any, index) => (
                <View key={index} style={[styles.comment]}>
                  <Image
                    source={{uri: comment.userId.ProfilePic}}
                    style={styles.commentAvatar}
                  />
                  <View style={styles.commentContent}>
                    <Text style={[styles.commentText,{color: darkMode ? '#fff' : '#000'}]}>{comment.content}</Text>
                    <Text style={styles.commentTime}>
                      {formatPostDate(comment.createdAt)}
                    </Text>
                  </View>
                  {comment.userId._id === user._id && (
                    <TouchableOpacity
                      onPress={() => showDelCommentModal(comment._id)}
                      style={styles.deleteButton}>
                      <FontAwesome
                        name="trash"
                        size={20}
                        color={darkMode ? '#ff4d4d' : '#ff4d4d'}
                      />
                    </TouchableOpacity>
                  )}
                </View>
              ))
            ) : (
              <Text
                style={[
                  styles.noComments,
                  {color: darkMode ? '#fff' : '#000'},
                ]}>
                No comments yet
              </Text>
            )}
          </ScrollView>
          <View style={styles.inputContainer}>
            <TextInput
              style={[
                styles.textInput,
                {
                  backgroundColor: darkMode ? '#555' : '#f5f5f5',
                  color: darkMode ? '#fff' : '#000',
                },
              ]}
              placeholder="Write your comment..."
              placeholderTextColor={darkMode ? '#888' : '#aaa'}
              value={comment}
              onChangeText={handleCommentChange}
              multiline
            />
            {comment.trim().length > 0 && (
              <TouchableOpacity
                onPress={handleCommentSubmit}
                style={styles.sendButton}>
                <MaterialCommunityIcons name="send" size={20} color="#fff" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      {/* Delete Confirmation Modal */}
      {delCommentModal && (
        <Modal
          transparent
          visible={delCommentModal}
          animationType="fade"
          onRequestClose={delCommentModalCancel}>
          <View
            style={[
              styles.modalContainer,
              {
                backgroundColor: darkMode
                  ? 'rgba(0, 0, 0, 0.7)'
                  : 'rgba(0, 0, 0, 0.5)',
              },
            ]}>
            <View
              style={[
                styles.modalContent,
                {backgroundColor: darkMode ? '#1B2559' : '#EBF1F7'},
              ]}>
              <Text
                style={[
                  styles.modalTitle,
                  {color: darkMode ? '#fff' : '#000'},
                ]}>
                Delete Comment
              </Text>
              <View style={styles.separator} />
              <Text
                style={[
                  styles.modalContentText,
                  {color: darkMode ? '#ddd' : '#000'},
                ]}>
                Are you sure you want to delete this comment?
              </Text>
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  onPress={delCommentModalCancel}
                  style={[
                    styles.modalButton,
                    {backgroundColor: darkMode ? '#444' : '#ccc'},
                  ]}>
                  <Text style={styles.modalButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={delCommentModalConfirm}
                  style={[styles.modalButton, {backgroundColor: '#ff4d4d'}]}>
                  <Text style={styles.modalButtonText}>Confirm</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </Modal>
  );
};

const styles = StyleSheet.create({
  separator: {
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    marginBottom: 15,
    elevation: 2,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    borderRadius: 10,
    padding: 16,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  commentsContainer: {
    // flex: 1,
    maxHeight: '80%',
    marginBottom: 16,
  },
  comment: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderRadius: 10,
  },
  receivedComment: {
    backgroundColor: '#fff',
  },
  commentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  commentContent: {
    flex: 1,
    borderRadius: 10,
    padding: 10,
  },
  commentText: {
    fontSize: 16,
  },

  commentTime: {
    fontSize: 12,
    color: '#888',
  },

  noComments: {
    textAlign: 'center',
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textInput: {
    elevation:3,
    flex: 1,
    borderRadius: 20,
    padding: 10,
    marginRight: 10,
    maxHeight: 80,
  },
  sendButton: {
    padding: 10,
    backgroundColor: '#007bff',
    borderRadius: 50,
  },
  deleteButton: {
    marginLeft: 10,
  },
  modalTitle: {
    marginBottom: 8,
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalContentText: {
    marginBottom: 8,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  modalButton: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 5,
    marginLeft: 10,
  },
  modalButtonText: {
    color: '#fff',
  },
});

export default CommentModal;

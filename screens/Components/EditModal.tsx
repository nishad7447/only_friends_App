import React, {useState, useContext} from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import {GlobalState} from '../Context/GlobalState';
import {axiosInstance} from './AxiosConfig';
import {UserBaseURL} from './API';
import Toast from 'react-native-toast-message';

interface EditModalProps {
  onCancel: () => void;
  setUpdateUI: React.Dispatch<React.SetStateAction<boolean>>;
  editPostId: string | null;
  editPostContent: string;
}

const EditModal: React.FC<EditModalProps> = ({
  onCancel,
  setUpdateUI,
  editPostId,
  editPostContent,
}) => {
  const [editContent, setEditContent] = useState<string>(editPostContent);
  const {darkMode, user} = useContext(GlobalState);

  const changeContent = async () => {
    try {
      await axiosInstance.post(`${UserBaseURL}/editPost`, {
        postId: editPostId,
        content: editContent,
      });
      Toast.show({text1: 'Post edited successfully', type: 'success'});
      setUpdateUI(prev => !prev);
      onCancel();
    } catch (error: any) {
      console.error('Error editing post:', error);
      const errorMessage =
        error.response?.data?.message ||
        'An error occurred while editing the post.';
      Toast.show({type: 'error', text1: errorMessage});
    }
  };

  return (
    <Modal
      transparent={true}
      animationType="fade"
      visible={true}
      onRequestClose={onCancel}>
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
            {backgroundColor: darkMode ? '#0a1d43' : '#fff'},
          ]}>
          <View style={styles.modalHeader}>
            <Text
              style={[
                styles.modalTitle,
                {color: darkMode ? 'white' : 'black'},
              ]}>
              Edit Post
            </Text>
            <TouchableOpacity onPress={onCancel}>
              <AntDesign
                name="closecircle"
                size={28}
                color="red"
                style={{elevation: 2}}
              />
            </TouchableOpacity>
          </View>
          <View style={styles.separator} />
          <Text style={[styles.label, {color: darkMode ? 'white' : 'black'}]}>
            Edit the content of the post:
          </Text>
          <TextInput
            placeholder="New post..."
            style={[
              styles.textInput,
              {
                backgroundColor: darkMode ? '#2c2c2c' : '#f0f0f0',
                color: darkMode ? 'white' : 'black',
              },
            ]}
            multiline
            value={editContent}
            onChangeText={setEditContent}
          />
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.submitButton}
              onPress={changeContent}>
              <MaterialIcons name="edit" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 15,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  separator: {
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    marginBottom: 15,
    elevation: 2,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 10,
  },
  textInput: {
    borderRadius: 10,
    padding: 8,
    fontSize: 16,
    textAlignVertical: 'top',
    maxHeight: '80%',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  cancelButton: {
    marginRight: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#ccc',
    borderRadius: 5,
  },
  submitButton: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#007bff',
    borderRadius: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
  },
});

export default EditModal;

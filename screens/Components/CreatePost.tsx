import React, {useContext, useEffect, useState} from 'react';
import {
  View,
  TextInput,
  Image,
  Text,
  Button,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import {launchImageLibrary, launchCamera} from 'react-native-image-picker';
import {showMessage} from 'react-native-flash-message';
import Icon from 'react-native-vector-icons/Ionicons';
import {axiosInstance} from './AxiosConfig';
import {UserBaseURL} from './API';
import Card from './Card';
import {ThemeContext} from '../Context/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function CreatePost({setUpdateUI}: {setUpdateUI: any}) {
    const {user} = useContext(ThemeContext)

  const {darkMode} = useContext(ThemeContext);
  const [postText, setPostText] = useState('');
  const [attachedImage, setAttachedImage] = useState<any>(null);
  const [attachedVideo, setAttachedVideo] = useState<any>(null);
  const [attachedAudio, setAttachedAudio] = useState<any>(null);
  const [uurl, setUrl] = useState(null);

  const allowedImageExtensions = ['jpg', 'jpeg', 'png', 'gif'];
  const allowedVideoExtensions = ['mp4', 'mov', 'avi'];

  const handlePostChange = (text: string) => {
    setPostText(text);
  };

  const handlePostSubmit = async () => {
    const formData = new FormData();

    if (postText) {
      formData.append('postText', postText);
    }

    if (attachedImage) {
      formData.append('file', {
        uri: attachedImage.uri,
        type: attachedImage.type,
        name: attachedImage.fileName,
      });
    }

    if (attachedVideo) {
      formData.append('file', {
        uri: attachedVideo.uri,
        type: attachedVideo.type,
        name: attachedVideo.fileName,
      });
    }

    if (attachedAudio) {
      formData.append('file', {
        uri: attachedAudio.uri,
        type: attachedAudio.type,
        name: attachedAudio.fileName,
      });
    }

    if (user) {
      formData.append('userId', user._id);
    }

    console.log('FormData:', formData);

    try {
      const response = await axiosInstance.post(
        `${UserBaseURL}/post`,
        formData,
      );
      console.log('Response from backend:', response.data);
      setPostText('');
      setAttachedImage(null);
      setAttachedVideo(null);
      setAttachedAudio(null);
      showMessage({
        message: response?.data?.message,
        type: 'success',
      });
      setUpdateUI((prevState: any) => !prevState);
    } catch (error: any) {
      if (error.response) {
        showMessage({
          message:
            error?.response?.data?.message || 'Error sending data to backend',
          type: 'danger',
        });
      }
      console.error('Error sending data to backend:', error);
    }
  };

  const handleImageChange = () => {
    launchImageLibrary({mediaType: 'photo'}, (response: any) => {
      if (!response.didCancel && !response.error) {
        const image = response.assets[0];
        const fileExtension = image.fileName.split('.').pop().toLowerCase();
        if (allowedImageExtensions.includes(fileExtension)) {
          setAttachedImage(image);
        } else {
          showMessage({
            message: 'Invalid image format. Please select a valid image file.',
            type: 'danger',
          });
        }
      }
    });
  };

  const handleVideoChange = () => {
    launchImageLibrary({mediaType: 'video'}, (response: any) => {
      if (!response.didCancel && !response.error) {
        const video = response.assets[0];
        const fileExtension = video.fileName.split('.').pop().toLowerCase();
        if (allowedVideoExtensions.includes(fileExtension)) {
          setAttachedVideo(video);
        } else {
          showMessage({
            message: 'Invalid video format. Please select a valid video file.',
            type: 'danger',
          });
        }
      }
    });
  };

  const handleAudioChange = () => {
    // Implement audio picker here
  };

  const renderFilePreview = () => {
    if (attachedImage) {
      return (
        <Image source={{uri: attachedImage.uri}} style={styles.previewImage} />
      );
    } else if (attachedVideo) {
      return <Text>Video Preview: {attachedVideo.fileName}</Text>; // You can use a video player component
    } else if (attachedAudio) {
      return <Text>Audio Preview: {attachedAudio.fileName}</Text>; // You can use an audio player component
    } else {
      return null;
    }
  };
  return (
    <Card
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
      <View style={styles.inputContainer}>
        <Image source={{uri: user?.ProfilePic}} style={styles.avatar} />
        <TextInput
          placeholder="New post..."
          placeholderTextColor={darkMode ? '#969696' : '#747474'} 
          style={[styles.textInput,{backgroundColor: darkMode ? '#0B1437' : '#F4F7FE',color: darkMode ? '#fff' : '#000'}]}
          value={postText}
          onChangeText={handlePostChange}
          multiline
        />
      </View>
      <View style={styles.previewContainer}>{renderFilePreview()}</View>
      <View style={styles.divider} />
      <View style={styles.iconContainer}>
        <TouchableOpacity onPress={handleImageChange}>
          <Icon name="image-outline" size={24} color="#A3AED0" />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleVideoChange}>
          <Icon
            name="videocam-outline"
            size={24}
            color="#A3AED0"
            style={styles.icon}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleAudioChange}>
          <Icon name="mic-outline" size={24} color="#A3AED0" style={styles.icon} />
        </TouchableOpacity>
        {/* <Button title="Post" onPress={handlePostSubmit} /> */}
        <TouchableOpacity style={styles.button} onPress={handlePostSubmit}>
          <Icon name="send" size={18} style={{marginRight:6,color: '#fff'}} />
          <Text style={styles.buttonText}>Post</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor:'red'
  },
  textInput: {
    flex: 1,
    padding: 8,
    borderRadius: 8,
  },
  previewContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  previewImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
    borderRadius: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#ccc',
    marginBottom: 16,
  },
  iconContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  icon: {
    marginLeft: 16,
  },
  button: {
    display:'flex',
    flexDirection:'row',
    justifyContent:'center',
    width: 90,
    padding: 7,
    backgroundColor: '#1E90FF',
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

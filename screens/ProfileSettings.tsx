import React, {useContext, useEffect, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import {launchImageLibrary} from 'react-native-image-picker'; // For image selection
import {showMessage} from 'react-native-flash-message'; // For toast messages
import {ThemeContext} from './Context/ThemeContext';
import {axiosInstance} from './Components/AxiosConfig';
import {UserBaseURL} from './Components/API';
import Icon from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import Card from './Components/Card';
import Toast from 'react-native-toast-message';

const ProfileSettings = () => {
  const {user, darkMode} = useContext(ThemeContext);
  const [name, setName] = useState(user.Name);
  const [email, setEmail] = useState(user.Email);
  const [bio, setBio] = useState(user?.Bio || '');
  const [location, setLocation] = useState(user?.Location || '');
  const [occupation, setOccupation] = useState(user?.Occupation || '');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [selectedImage, setSelectedImage] = useState(user?.ProfilePic || '');
  const [attachedImage, setAttachedImage] = useState<any>(null);
  const [deActivateModal, setDeActivateModal] = useState(false);
  const [passwordChangeModal, setPasswordChangeModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [formErr, setFormErr] = useState<{
    name: string;
    email: string;
    location: string;
    occupation: string;
    bio: string;
  }>({
    name: '',
    email: '',
    location: '',
    occupation: '',
    bio: '',
  });

  useEffect(() => {
    if (isRefreshing) {
      setFormErr({
        name: '',
        email: '',
        location: '',
        occupation: '',
        bio: '',
      });
      setName(user.name ? user.name : '');
      setEmail(user.email ? user.email : '');
      setBio(user.bio ? user.bio : '');
      setLocation(user.location ? user.location : '');
      setOccupation(user.occupation ? user.occupation : '');
      setPassword('');
      setNewPassword('');
      setIsRefreshing(prev => !prev);
    }
  }, [isRefreshing]);

  const handleRefresh = () => {
    setIsRefreshing(prev => !prev);
  };

  const isEmailValid = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSaveProfile = () => {
    let errors: {
      name: string;
      email: string;
      location: string;
      occupation: string;
      bio: string;
    } = {
      name: '',
      email: '',
      location: '',
      occupation: '',
      bio: '',
    };
    // Email validation
    if (email && !isEmailValid(email)) {
      errors.email = 'Please enter a valid email address.';
    }

    // Name validation
    if (email.trim().length <= 0) {
      errors.email = 'Please enter a valid email.';
    }

    // Name validation
    if (name.trim().length <= 0) {
      errors.name = 'Please enter a valid name.';
    }

    // Location validation
    if (location.trim().length <= 0) {
      errors.location = 'Please enter a valid location.';
    }

    // Occupation validation
    if (occupation.trim().length <= 0) {
      errors.occupation = 'Please enter a valid occupation.';
    }

    // Bio validation
    if (bio.trim().length <= 0) {
      errors.bio = 'Please enter a valid bio.';
    }

    if (Object.keys(errors).length > 0) {
      setFormErr({...errors});
      Object.values(errors).forEach(errorMessage => {
        console.log({errorMessage});
        Toast.show({
          text1: errorMessage,
          type: 'error',
        });
      });
    }

    console.log(formErr);
    const formData:any = {
      Name: name,
      Email: email,
      Bio: bio,
      Location: location,
      Occupation: occupation,
    };
    if (attachedImage) {
      formData.file = {
        uri: attachedImage.uri, // URI of the image
        type: attachedImage.type || 'application/octet-stream', // MIME type
        name: attachedImage.fileName || 'photo.jpg', // Filename
      };
    }
    console.log(formData, 'formData');
    axiosInstance
      .put(`${UserBaseURL}/editUser`, formData)
      .then(res => {
        if (res.data.success) {
          showMessage({message: res.data.message, type: 'success'});
        }
      })
      .catch(error => {
        const errorMessage =
          error.response?.data?.message ||
          'An error occurred while saving profile information.';
        showMessage({message: errorMessage, type: 'danger'});
      });
  };

  const handleSaveSecurity = () => {
    passwordChangeModalCancel();
    if (!validatePasswordStrength(newPassword)) {
      showMessage({
        message: 'Password must be at least 3 characters long.',
        type: 'danger',
      });
      return;
    }
    axiosInstance
      .put(`${UserBaseURL}/editUserPass`, {
        CurrentPass: password,
        NewPass: newPassword,
      })
      .then(res => {
        if (res.data.success) {
          showMessage({message: res.data.message, type: 'success'});
        }
      })
      .catch(error => {
        const errorMessage =
          error.response?.data?.message ||
          'An error occurred while saving security settings.';
        showMessage({message: errorMessage, type: 'danger'});
      });
  };

  const handleDeactivateAccount = () => {
    axiosInstance
      .put(`${UserBaseURL}/deactivateUserAcc`)
      .then(res => {
        if (res.data.success) {
          showMessage({message: res.data.message, type: 'success'});
        }
      })
      .catch(error => {
        const errorMessage =
          error.response?.data?.message ||
          'An error occurred while deactivating account.';
        showMessage({message: errorMessage, type: 'danger'});
      });
  };

  const allowedImageExtensions = ['jpg', 'jpeg', 'png', 'gif'];
  const handleImageUpload = () => {
    launchImageLibrary({mediaType: 'photo'}, (response: any) => {
      if (!response.didCancel && !response.error) {
        const image = response.assets[0];
        const fileExtension = image.fileName.split('.').pop().toLowerCase();
        if (allowedImageExtensions.includes(fileExtension)) {
          setAttachedImage(image);
          setSelectedImage(image.uri); // Update selectedImage with the new image URI
        } else {
          showMessage({
            message: 'Invalid image format. Please select a valid image file.',
            type: 'danger',
          });
        }
      }
    });
  };

  const validatePasswordStrength = (password: string) => password.length >= 3;

  const deActivateModalCancel = () => setDeActivateModal(false);
  const passwordChangeModalCancel = () => setPasswordChangeModal(false);

  const styles = StyleSheet.create({
    scrollViewContent: {
      flexGrow: 1,
      padding: 10,
    },
    container: {
      padding: 30,
      backgroundColor: darkMode ? '#0a1d43' : '#fff',
      borderRadius: 16,
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 10,
    },
    title: {
      color: darkMode ? '#fff' : '#333',
      fontSize: 24,
      fontWeight: 'bold',
    },
    deactivateText: {
      color: 'red',
    },
    imageContainer: {
      alignItems: 'center',
      marginBottom: 20,
    },
    profileCoverImage: {
      position: 'relative',
      width: '100%',
      height: 100,
      marginBottom: '15%',
      borderRadius: 10,
    },
    profileImage: {
      position: 'absolute',
      bottom: 20,
      width: 100,
      height: 100,
      borderRadius: 50,
      marginBottom: 35,
    },
    uploadContainer: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'column',
      padding: 10,
    },
    uploadIcon: {
      color: '#2152FF',
    },
    uploadText: {
      color: '#2152FF',
      fontSize: 16,
    },
    input: {
      color: darkMode ? '#fff' : '#333',
      borderWidth: 1,
      borderColor: '#ccc',
      padding: 10,
      marginBottom: 15,
      borderRadius: 5,
    },
    errorText: {
      color: '#ff0000',
      marginBottom: 8,
    },
    button: {
      backgroundColor: '#2152FF',
      padding: 15,
      borderRadius: 5,
      alignItems: 'center',
      marginBottom: 20,
    },
    buttonText: {
      color: 'white',
      fontWeight: 'bold',
      fontSize: 16,
    },
    dividerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: 16,
    },
    dividerText: {
      marginHorizontal: 8,
      color: darkMode ? '#8d97a5' : '#666',
    },
    divider: {
      flex: 1,
      height: 1,
      backgroundColor: '#E5EAEF',
    },
  });

  return (
    <ScrollView
      contentContainerStyle={styles.scrollViewContent}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
      }>
      <Card style={styles.container}>
        <View
          style={{
            marginBottom: '3%',
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}>
          <Text style={styles.title}>Profile Information</Text>
          <TouchableOpacity onPress={() => setDeActivateModal(true)}>
            <View
              style={{
                display: 'flex',
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
              }}>
              <Text style={styles.deactivateText}>Deactivate</Text>
              <Icon
                name="exit-outline"
                size={20}
                style={{marginLeft: 5, color: 'red'}}
              />
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.imageContainer}>
          <Image
            source={{
              uri: 'https://images.pexels.com/photos/3418400/pexels-photo-3418400.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
            }}
            style={styles.profileCoverImage}
          />
          <Image
            source={{
              uri:
                attachedImage && attachedImage.uri
                  ? attachedImage.uri
                  : selectedImage,
            }}
            style={styles.profileImage}
          />
          <TouchableOpacity
            onPress={handleImageUpload}
            style={styles.uploadContainer}>
            <Feather name="upload" size={20} style={styles.uploadIcon} />
            <Text style={styles.uploadText}>Upload New Image</Text>
          </TouchableOpacity>
        </View>

        <TextInput
          style={[styles.input, formErr.name ? {borderColor: 'red'} : {}]}
          placeholder="Full Name"
          placeholderTextColor={darkMode ? '#969696' : '#747474'}
          value={name}
          onChangeText={setName}
        />
        {formErr.name ? (
          <Text style={styles.errorText}>{formErr.name}</Text>
        ) : null}
        <TextInput
          style={[styles.input, formErr.email ? {borderColor: 'red'} : {}]}
          placeholder="Email Address"
          placeholderTextColor={darkMode ? '#969696' : '#747474'}
          value={email}
          onChangeText={setEmail}
        />
        {formErr.email ? (
          <Text style={styles.errorText}>{formErr.email}</Text>
        ) : null}
        <TextInput
          style={[styles.input, formErr.location ? {borderColor: 'red'} : {}]}
          placeholder="Your Location"
          placeholderTextColor={darkMode ? '#969696' : '#747474'}
          value={location}
          onChangeText={setLocation}
        />
        {formErr.location ? (
          <Text style={styles.errorText}>{formErr.location}</Text>
        ) : null}
        <TextInput
          style={[styles.input, formErr.bio ? {borderColor: 'red'} : {}]}
          placeholder="Tell us about yourself"
          placeholderTextColor={darkMode ? '#969696' : '#747474'}
          value={bio}
          onChangeText={setBio}
        />
        {formErr.bio ? (
          <Text style={styles.errorText}>{formErr.bio}</Text>
        ) : null}
        <TextInput
          style={[styles.input, formErr.occupation ? {borderColor: 'red'} : {}]}
          placeholder="Your Occupation"
          placeholderTextColor={darkMode ? '#969696' : '#747474'}
          value={occupation}
          onChangeText={setOccupation}
        />
        {formErr.occupation ? (
          <Text style={styles.errorText}>{formErr.occupation}</Text>
        ) : null}

        <TouchableOpacity style={styles.button} onPress={handleSaveProfile}>
          <Text style={styles.buttonText}>Save Profile Information</Text>
        </TouchableOpacity>

        <View style={styles.dividerContainer}>
          <View style={styles.divider} />
          <Text style={styles.dividerText}>Credential Manage</Text>
          <View style={styles.divider} />
        </View>

        <Text style={[styles.title, {marginBottom: 20}]}>Change Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Current Password"
          placeholderTextColor={darkMode ? '#969696' : '#747474'}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        <TextInput
          style={styles.input}
          placeholder="New Password"
          placeholderTextColor={darkMode ? '#969696' : '#747474'}
          secureTextEntry
          value={newPassword}
          onChangeText={setNewPassword}
        />
        <TouchableOpacity
          style={styles.button}
          onPress={() => setPasswordChangeModal(true)}>
          <Text style={styles.buttonText}>Save Security Settings</Text>
        </TouchableOpacity>

        {deActivateModal && (
          <></>
          // <Modal
          //     Heading="Deactivate Account"
          //     content="Are you sure you want to deactivate your account?"
          //     onCancel={deActivateModalCancel}
          //     onConfirm={handleDeactivateAccount}
          // />
        )}
        {passwordChangeModal && (
          <></>
          // <Modal
          //     Heading="Confirmation"
          //     content="Are you sure you want to change your password?"
          //     onCancel={passwordChangeModalCancel}
          //     onConfirm={handleSaveSecurity}
          // />
        )}
      </Card>
    </ScrollView>
  );
};

export default ProfileSettings;

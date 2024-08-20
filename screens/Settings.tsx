import React, {useContext} from 'react';
import {Text, View, StyleSheet, TouchableOpacity, Alert} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {ThemeContext} from './Context/ThemeContext';
import {axiosInstance} from './Components/AxiosConfig';
import {UserBaseURL} from './Components/API';

export default function Settings() {
  const {user, darkMode} = useContext(ThemeContext);
  const navigation = useNavigation();

  const handleSignOutClick = async () => {
    await AsyncStorage.removeItem('jwtToken');
    await AsyncStorage.removeItem('user');
    try {
      if (user) {
        const res = await axiosInstance.get(
          `${UserBaseURL}/logout/${user?._id}`,
        );
        if (res.data.message === 'Logout success') {
          navigation.navigate('SignIn');
        }
      }
    } catch (err) {
      console.log(err);
      Alert.alert('Error', 'Failed to log out. Please try again.');
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 40,
    },
    greeting: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 20,
      color: darkMode ? 'white' : 'black',
    },
    separator: {
      height: 0.2,
      backgroundColor: darkMode ? '#e2e8f0' : 'black',
      marginVertical: 20,
    },
    link: {
      fontSize: 16,
      color: darkMode ? 'white' : 'black',
      marginBottom: 20,
    },
    logoutLink: {
      fontSize: 16,
      color: '#e53e3e',
      marginTop: 20,
    },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.greeting}>👋 Hey, {user?.UserName}</Text>

      <View style={styles.separator} />

      <TouchableOpacity onPress={() => navigation.navigate('ProfileSettings')}>
        <Text style={styles.link}>Profile Settings</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('SavedPosts')}>
        <Text style={styles.link}>Saved Posts</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('SponsoredAd')}>
        <Text style={styles.link}>Create Ad</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleSignOutClick}>
        <Text style={styles.logoutLink}>Log Out</Text>
      </TouchableOpacity>
    </View>
  );
}

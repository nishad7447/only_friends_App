import React, {useState, useEffect, useContext} from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from 'react-native';
import {
  GoogleSignin,
  GoogleSigninButton,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import axios from 'axios';
import {NavigationProp, useNavigation} from '@react-navigation/native';
import Card from './Components/Card';
import FixedPlugin from './Components/FixedPlugin';
import {GlobalState} from './Context/GlobalState';
import {UserBaseURL} from './Components/API';
import {ScrollView} from 'react-native-gesture-handler';
import Toast from 'react-native-toast-message';

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [mobile, setMobile] = useState('');
  const [otpErr, setOtpErr] = useState('');
  const [emailErr, setEmailErr] = useState('');
  const [passErr, setPassErr] = useState('');
  const [mobErr, setMobErr] = useState('');
  const [usernameErr, setUsernameErr] = useState('');
  const [formErr, setFormErr] = useState('');
  const navigation = useNavigation<NavigationProp<any>>();

  const validateEmail = (email: string) => {
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return emailRegex.test(email);
  };

  const validateMobile = (mobile: string) => {
    const mobileRegex = /^[0-9]{10}$/;
    return mobileRegex.test(mobile);
  };

  const validatePasswordStrength = (password: string) => {
    return password.length >= 3;
  };

  const userSignupOtpSubmit = () => {
    if (!email || !password || !name || !username) {
      setFormErr('Please fill in all fields');
      return;
    }
    if (!validateEmail(email)) {
      setEmailErr('Invalid email address');
      return;
    }
    if (!validateMobile(mobile)) {
      setMobErr('Invalid Mobile');
      return;
    }
    if (!validatePasswordStrength(password)) {
      setPassErr('Password must be at least 3 char');
      return;
    }

    axios
      .post(`${UserBaseURL}/auth/signup`, {
        Email: email,
        Password: password,
        Name: name,
        UserName: username,
        Mobile: mobile,
        // otp: otp,
      })
      .then(res => {
        if (res.data.message === 'Verification success') {
          Alert.alert('Success', 'Signed up');
          navigation.navigate('Home'); // Adjust based on your navigation setup
        }
      })
      .catch(err => {
        if (err.response?.data?.message) {
          switch (err.response.data.message) {
            case 'User already Exist':
              setEmailErr(err.response.data.message);
              break;
            case 'User name taken':
              setUsernameErr(err.response.data.message);
              break;
            case 'Mobile already Exist':
              setMobErr(err.response.data.message);
              break;
            case 'Invalid OTP':
              setOtpErr(err.response.data.message);
              break;
            default:
              setFormErr(err.response.data.message);
          }
        }
      });
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setEmailErr('');
      setPassErr('');
      setUsernameErr('');
      setMobErr('');
      setFormErr('');
      setOtpErr('');
    }, 3000);
    return () => clearTimeout(timer);
  }, [emailErr, passErr, usernameErr, mobErr, formErr, otpErr]);

  useEffect(() => {
    GoogleSignin.configure({
      webClientId:
        '969952852580-q77urroi4f3chu5hlua9nqpvq6vl1gje.apps.googleusercontent.com', // Your web client ID
      androidClientId:
        '969952852580-gfgeq0bddp3jj9658m145n2ao2ogmug6.apps.googleusercontent.com', // Your Android client ID
      scopes: ['profile', 'email'],
      offlineAccess: true, // If you need offline access
    });
  }, []);

  const handleGoogleSignUp = async () => {
    try {
      // Always sign out before attempting a new sign-up
      await GoogleSignin.signOut();
      console.log('Signed out previous session');

      // Check for Play Services
      await GoogleSignin.hasPlayServices({showPlayServicesUpdateDialog: true});

      // Attempt to sign in
      const userInfo = await GoogleSignin.signIn();

      if (userInfo && userInfo.idToken) {
        console.log(userInfo.idToken);
        const res: any = await axios.post(`${UserBaseURL}/auth/googleSignUp`, {
          credential: userInfo.idToken,
        });
        if (
          res.data.message === 'Signup Success' ||
          res.data.message === 'User saved successfully'
        ) {
          Toast.show({type: 'success', text1: res.data.message});
          navigation.navigate('SignIn');
        }
      }
    } catch (error: any) {
      if (error?.message === 'Request failed with status code 400') {
        setEmailErr('User already exist');
        return Toast.show({type: 'error', text1: 'User already exist'});
      } else {
        setEmailErr(error?.message);
        return Toast.show({type: 'error', text1: error?.message});
      }
      console.error('Detailed error:', JSON.stringify(error.message, null, 2));
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log('User cancelled the login flow');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        console.log('Operation is in progress already');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        console.log('Play services not available or outdated');
      } else {
        console.error(
          'Something went wrong during sign up',
          error.code,
          error.message,
        );
        setEmailErr('Signup Failed');
      }
    }
  };

  const {darkMode, orientation} = useContext(GlobalState);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: darkMode ? '#0d2659' : '#f5f5f5',
    },
    header: {
      position: 'absolute',
      top: 30,
      left: 35,
    },
    headerText: {
      fontSize: 32,
      fontWeight: 'bold',
      color: darkMode ? '#1E90FF' : '#3b82f6',
    },
    card: {
      width: '90%',
      padding: 20,
      borderRadius: 10,
      backgroundColor: darkMode ? '#0a1d43' : '#fff',
      shadowColor: darkMode ? '#ccc' : '#000',
      shadowOffset: {width: 0, height: 1},
      shadowOpacity: 0.2,
      shadowRadius: 2,
      elevation: 10,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: darkMode ? '#fff' : '#333',
    },
    titleLandscape: {
      textAlign: 'center',
      fontSize: 40,
      fontWeight: 'bold',
      color: '#1E90FF',
    },
    subtitle: {
      fontSize: 16,
      color: darkMode ? '#8d97a5' : '#666',
      marginVertical: 10,
    },
    googleButton: {
      width: '100%',
      height: 48,
      marginVertical: 10,
    },
    separator: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: 20,
    },
    separatorLine: {
      flex: 1,
      height: 1,
      backgroundColor: darkMode ? '#8d97a5' : '#ccc',
    },
    separatorText: {
      marginHorizontal: 10,
      color: darkMode ? '#8d97a5' : '#666',
    },
    input: {
      height: 40,
      padding: 12,
      borderColor: '#707c8f',
      borderBottomWidth: 1,
      marginVertical: 10,
      borderRadius: 8,
      color: darkMode ? '#fff' : '#333',
    },
    errorInput: {
      borderColor: 'red',
    },
    errorText: {
      color: 'red',
    },
    signInText: {
      marginTop: 10,
      fontSize: 14,
      color: darkMode ? '#fff' : '#1d4ed8',
    },
    button: {
      width: '100%',
      padding: 16,
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

  return (
    <View style={styles.container}>
      {orientation === 'portrait' ? (
        <View style={styles.header}>
          <Text style={styles.headerText}>OnlyFriends</Text>
        </View>
      ) : (
        ''
      )}
      <FixedPlugin orientation={orientation} />
      <Card style={styles.card}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {orientation === 'landscape' ? (
            <Text style={styles.titleLandscape}>OnlyFriends</Text>
          ) : (
            ''
          )}
          <Text style={styles.title}>Sign Up</Text>
          <Text style={styles.subtitle}>Welcome to OnlyFriends family</Text>

          <GoogleSigninButton
            onPress={handleGoogleSignUp}
            style={{width: '100%', height: 48}}
            size={GoogleSigninButton.Size.Wide}
            color={'light'}
          />
          
          <View style={styles.separator}>
            <View style={styles.separatorLine} />
            <Text style={styles.separatorText}>or</Text>
            <View style={styles.separatorLine} />
          </View>

          <TextInput
            style={[styles.input, emailErr ? styles.errorInput : null]}
            placeholder="Full Name"
            placeholderTextColor={darkMode ? '#969696' : '#747474'} // Placeholder color
            value={name}
            onChangeText={setName}
          />
          <TextInput
            style={[styles.input, usernameErr ? styles.errorInput : null]}
            placeholder="Username"
            placeholderTextColor={darkMode ? '#969696' : '#747474'} // Placeholder color
            value={username}
            onChangeText={setUsername}
          />
          <TextInput
            style={[styles.input, emailErr ? styles.errorInput : null]}
            placeholder="mail@simmmple.com"
            placeholderTextColor={darkMode ? '#969696' : '#747474'} // Placeholder color
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            style={[styles.input, mobErr ? styles.errorInput : null]}
            placeholder="9876543210"
            placeholderTextColor={darkMode ? '#969696' : '#747474'} // Placeholder color
            value={mobile}
            keyboardType="numeric"
            maxLength={10}
            onChangeText={text => setMobile(text.replace(/\D/g, ''))}
          />
          <TextInput
            style={[styles.input, passErr ? styles.errorInput : null]}
            placeholder="Min. 3 characters"
            placeholderTextColor={darkMode ? '#969696' : '#747474'} // Placeholder color
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          {formErr || emailErr || usernameErr || passErr || mobErr ? (
            <Text style={styles.errorText}>
              {formErr || emailErr || usernameErr || passErr || mobErr}
            </Text>
          ) : null}
          <TouchableOpacity style={styles.button} onPress={userSignupOtpSubmit}>
            <Text style={styles.buttonText}>Sign Up</Text>
          </TouchableOpacity>
          {/* <Button title="Sign Up" onPress={userSignupOtpSend} /> */}
          <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
            <Text style={styles.subtitle}>
              Already user? <Text style={styles.signInText}> Sign In</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </Card>
    </View>
  );
}

import React, {useCallback, useContext, useEffect, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import {
  useNavigation,
  NavigationProp,
  useFocusEffect,
} from '@react-navigation/native';
import {
  GoogleSignin,
  GoogleSigninButton,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import FixedPlugin from './Components/FixedPlugin';
import Card from './Components/Card';
import {GlobalState} from './Context/GlobalState';
import {UserBaseURL} from './Components/API';
import {ScrollView} from 'react-native-gesture-handler';

type SignInProps = {};

export default function SignIn({}: SignInProps) {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [emailErr, setEmailErr] = useState<string>('');
  const [passErr, setPassErr] = useState<string>('');
  const [formErr, setFormErr] = useState<string>('');
  const navigation = useNavigation<NavigationProp<any>>();
  const {setUser, darkMode, orientation} = useContext(GlobalState);

  useFocusEffect(
    useCallback(() => {
      const checkToken = async () => {
        const token = await AsyncStorage.getItem('jwtToken');
        if (token) {
          navigation.navigate('Home');
        }
      };
      checkToken();
    }, [navigation]),
  );

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return emailRegex.test(email);
  };

  const validatePasswordStrength = (password: string): boolean => {
    return password.length >= 3;
  };

  const userLogin = () => {
    if (!email || !password) {
      setFormErr('Please fill in all fields');
      return;
    }
    if (!validateEmail(email)) {
      setEmailErr('Invalid email address');
      return;
    }
    if (!validatePasswordStrength(password)) {
      setPassErr('Password must be at least 3 characters');
      return;
    }

    axios
      .post(`${UserBaseURL}/auth/login`, {Email: email, Password: password})
      .then(res => {
        if (res.data.message === 'Login Success') {
          AsyncStorage.setItem('jwtToken', JSON.stringify(res.data.token));
          AsyncStorage.setItem('user', JSON.stringify(res.data.user));
          setUser(res.data.user);
          Toast.show({type: 'success', text1: 'Login success'});
          navigation.navigate('Home');
        }
      })
      .catch(err => {
        console.log(err, 'Catchhh');
        const message = err?.response?.data?.message;
        Toast.show({type: 'error', text1: message});
        if (message === 'User does not exist') {
          setEmailErr(message);
        } else if (message === 'Incorrect credentials') {
          setPassErr(message);
        } else if (message === 'Password is wrong, Try google login') {
          setPassErr(message);
        } else if (message === 'User is blocked') {
          setFormErr(message);
        }
      });
  };

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: '969952852580-q77urroi4f3chu5hlua9nqpvq6vl1gje.apps.googleusercontent.com', // Your web client ID
      androidClientId: '969952852580-gfgeq0bddp3jj9658m145n2ao2ogmug6.apps.googleusercontent.com', // Your Android client ID
      scopes: ['profile', 'email'],
      offlineAccess: true, // If you need offline access
    });
  }, []);

  const handleGoogleLogin = async () => {
    try {
      let token;
      await GoogleSignin.signOut();
       console.log('Signed out previous session');
      const isSignedIn = await GoogleSignin.hasPreviousSignIn();
      console.log({isSignedIn});
      if (isSignedIn) {
        // User is already signed in, get the tokens
        const tokens = await GoogleSignin.getTokens();
        console.log(tokens);
        token = tokens.idToken;
      } else {
        await GoogleSignin.hasPlayServices();
        const userInfo = await GoogleSignin.signIn();
        token = userInfo.idToken;
        console.log(token);
      }
      const res = await axios.post(`${UserBaseURL}/auth/googleSignIn`, {
        credential: token,
      });
      if (res.data.message === 'Login Success') {
        AsyncStorage.setItem('jwtToken', JSON.stringify(res.data.token));
        AsyncStorage.setItem('user', JSON.stringify(res.data.user));
        setUser(res.data.user);
        Toast.show({type: 'success', text1: 'Login success'});
        navigation.navigate('Home');
      } else {
        Toast.show({type: 'error', text1: res.data.message});
        if (
          res.data.message === 'User does not exist' ||
          res.data.message === 'User is blocked'
        ) {
          setEmailErr(res.data.message);
        }
      }
    } catch (error: any) {
      console.error('Detailed error:', JSON.stringify(error, null, 2));
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log('User cancelled the login flow');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        console.log('Operation is in progress already');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        console.log('Play services not available or outdated');
      } else {
        console.error('Something went wrong during sign in', error.code);
        setEmailErr('Login Failed');
        Toast.show({type: 'error', text1: 'Login Failed'});
      }
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: darkMode ? '#0d2659' : '#f7fafc',
    },
    title: {
      position: 'absolute',
      top: 30,
      left: 35,
      fontSize: 40,
      fontWeight: 'bold',
      color: '#1E90FF',
    },
    titleLandscape: {
      textAlign: 'center',
      fontSize: 40,
      fontWeight: 'bold',
      color: '#1E90FF',
    },
    heading: {
      fontSize: 28,
      fontWeight: 'bold',
      marginBottom: 16,
      color: darkMode ? '#fff' : '#333',
    },
    subheading: {
      fontSize: 16,
      marginBottom: 24,
      color: darkMode ? '#8d97a5' : '#666',
    },
    dividerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: 16,
    },
    divider: {
      flex: 1,
      height: 1,
      backgroundColor: '#8d97a5',
    },
    dividerText: {
      marginHorizontal: 8,
      color: darkMode ? '#8d97a5' : '#666',
    },
    input: {
      width: '100%',
      padding: 12,
      marginVertical: 8,
      borderWidth: 0.4,
      borderColor: '#707c8f',
      borderRadius: 8,
      color: darkMode ? '#fff' : '#333',
    },
    errorText: {
      color: '#ff0000',
      marginBottom: 8,
    },
    linkText: {
      color: darkMode ? '#fff' : '#1E90FF',
      marginBottom: 16,
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
    registerContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginTop: 16,
    },
    registerText: {
      color: darkMode ? '#8d97a5' : '#666',
    },
    registerLink: {
      color: darkMode ? '#fff' : '#1E90FF',
      marginLeft: 4,
    },
  });

  return (
    <View style={styles.container}>
      {orientation === 'portrait' ? (
        <Text style={styles.title}>OnlyFriends</Text>
      ) : (
        ''
      )}
      <FixedPlugin orientation={orientation} />
      <Card
        style={{
          width: '90%',
          padding: 30,
          backgroundColor: darkMode ? '#0a1d43' : '#fff',
          borderRadius: 16,
          shadowColor: darkMode ? '#ccc' : '#000',
          shadowOffset: {width: 0, height: 2},
          shadowOpacity: 0.2,
          shadowRadius: 4,
          elevation: 10,
        }}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {orientation === 'landscape' ? (
            <Text style={styles.titleLandscape}>OnlyFriends</Text>
          ) : (
            ''
          )}
          <Text style={styles.heading}>Sign In</Text>
          <Text style={styles.subheading}>
            Enter your email and password to sign in!
          </Text>
          <GoogleSigninButton
            style={{width: '100%', height: 48}}
            size={GoogleSigninButton.Size.Wide}
            color={'light'}
            onPress={handleGoogleLogin}
          />
          <View style={styles.dividerContainer}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.divider} />
          </View>
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor={darkMode ? '#969696' : '#747474'} // Placeholder color
            value={email}
            onChangeText={setEmail}
          />
          {emailErr ? <Text style={styles.errorText}>{emailErr}</Text> : null}
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor={darkMode ? '#969696' : '#747474'} // Placeholder color
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          {passErr ? <Text style={styles.errorText}>{passErr}</Text> : null}
          <TouchableOpacity
            onPress={() => navigation.navigate('ForgotPassword')}>
            <Text style={styles.linkText}>Forgot Password?</Text>
          </TouchableOpacity>
          <Text style={styles.errorText}>{formErr}</Text>
          <TouchableOpacity style={styles.button} onPress={userLogin}>
            <Text style={styles.buttonText}>Sign In</Text>
          </TouchableOpacity>
          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>Not registered yet?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
              <Text style={styles.registerLink}>Create an account</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </Card>
      {/* <Toast ref={(ref) => Toast.setRef(ref)} /> */}
    </View>
  );
}

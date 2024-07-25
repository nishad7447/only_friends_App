import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import {useNavigation, NavigationProp} from '@react-navigation/native';
import {
  GoogleSignin,
  GoogleSigninButton,
} from '@react-native-google-signin/google-signin';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import FixedPlugin from './Components/FixedPlugin';
// Import your custom components here
// import InputField from "../../components/IniputField/InputField";
// import Card from "../../components/Card/Card";
// import FixedPlugin from "../../components/FixedPlugin/FixedPlugin";

type SignInProps = {};

export default function SignIn({}: SignInProps) {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [emailErr, setEmailErr] = useState<string>('');
  const [passErr, setPassErr] = useState<string>('');
  const [formErr, setFormErr] = useState<string>('');
  const navigation = useNavigation<NavigationProp<any>>();

  const UserBaseURL = 'http://localhost:3000';

  useEffect(() => {
    const checkToken = async () => {
      const token = await AsyncStorage.getItem('jwtToken');
      if (token) {
        navigation.navigate('Home');
      }
    };
    checkToken();
  }, []);

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: 'YOUR_GOOGLE_CLIENT_ID',
    });
  }, []);

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
          Toast.show({type: 'success', text1: 'Login success'});
          navigation.navigate('Home');
        }
      })
      .catch(err => {
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

  const handleGoogleLogin = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      axios
        .post(`${UserBaseURL}/auth/googleSignIn`, userInfo)
        .then(res => {
          if (res.data.message === 'Login Success') {
            AsyncStorage.setItem('jwtToken', JSON.stringify(res.data.token));
            AsyncStorage.setItem('user', JSON.stringify(res.data.user));
            Toast.show({type: 'success', text1: 'Login success'});
            navigation.navigate('Home');
          } else {
            Toast.show({type: 'error', text1: res.data.message});
            if (res.data.message === 'User does not exist') {
              setEmailErr(res.data.message);
            } else if (res.data.message === 'User is blocked') {
              setEmailErr(res.data.message);
            }
          }
        })
        .catch(err => {
          Toast.show({type: 'error', text1: err.message});
          if (err.message === 'Request failed with status code 400') {
            setEmailErr('User does not exist');
          } else {
            setEmailErr(err.message);
          }
        });
    } catch (error) {
      setEmailErr('Login Failed');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>OnlyFriends</Text>
      <FixedPlugin />
      {/* <Card extra="flex-row items-center rounded-xl shadow-lg bg-white dark:bg-gray-900"> */}
      <View style={styles.card}>
        <Text style={styles.heading}>Sign In</Text>
        <Text style={styles.subheading}>
          Enter your email and password to sign in!
        </Text>
        <GoogleSigninButton
          style={{width: 192, height: 48}}
          size={GoogleSigninButton.Size.Wide}
          color={GoogleSigninButton.Color.Dark}
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
          value={email}
          onChangeText={setEmail}
        />
        {emailErr ? <Text style={styles.errorText}>{emailErr}</Text> : null}
        <TextInput
          style={styles.input}
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        {passErr ? <Text style={styles.errorText}>{passErr}</Text> : null}
        <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
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
      </View>
      {/* </Card> */}
      {/* <Toast ref={(ref) => Toast.setRef(ref)} /> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  title: {
    position: 'absolute',
    top: 30,
    left: 35,
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1E90FF',
  },
  card: {
    width: '90%',
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  heading: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  subheading: {
    fontSize: 16,
    marginBottom: 24,
    color: '#666',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#ccc',
  },
  dividerText: {
    marginHorizontal: 8,
    color: '#666',
  },
  input: {
    width: '100%',
    padding: 12,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
  },
  errorText: {
    color: '#ff0000',
    marginBottom: 8,
  },
  linkText: {
    color: '#1E90FF',
    marginBottom: 16,
  },
  button: {
    width: '100%',
    padding: 16,
    backgroundColor: '#1E90FF',
    borderRadius: 8,
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
    color: '#666',
  },
  registerLink: {
    color: '#1E90FF',
    marginLeft: 4,
  },
});

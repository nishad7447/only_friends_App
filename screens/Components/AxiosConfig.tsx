import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {NavigationProp, useNavigation} from '@react-navigation/native';

const axiosInstance = axios.create();

axiosInstance.interceptors.request.use(
  async config => {
    const token = await AsyncStorage.getItem('jwtToken');
    if (token) {
      config.headers['authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  },
);

axiosInstance.interceptors.response.use(
  response => {
    if (response?.data?.message === 'jwt expired') {
      AsyncStorage.removeItem('jwtToken');
      AsyncStorage.removeItem('user');
      const navigation = useNavigation<NavigationProp<any>>();
      navigation.navigate('SignIn'); 
    }
    return response;
  },
  error => {
    console.log(error);
    if (error?.response?.data?.message === 'jwt expired') {
      AsyncStorage.removeItem('jwtToken');
      AsyncStorage.removeItem('user');
      const navigation = useNavigation<NavigationProp<any>>();
      navigation.navigate('SignIn'); 
    }
    return Promise.reject(error);
  },
);

export {
  axiosInstance,
};

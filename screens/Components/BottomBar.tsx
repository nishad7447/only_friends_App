import React, {useContext, useState, useRef, useEffect} from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Image,
  Animated,
  Easing,
} from 'react-native';
import {useNavigation, NavigationProp} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Feather from 'react-native-vector-icons/Feather';
import {ThemeContext} from '../Context/ThemeContext';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

const BottomBar: React.FC<{user: any}> = ({user}) => {
  const navigation = useNavigation<NavigationProp<any>>();
  const {darkMode, toggleTheme} = useContext(ThemeContext);
  const [selected, setSelected] = useState<string>('Home');

  // Animation states for each item
  const homeRotateAnim = useRef(new Animated.Value(0)).current;
  const chatRotateAnim = useRef(new Animated.Value(0)).current;
  const profileRotateAnim = useRef(new Animated.Value(0)).current;
  const SettingsRotateAnim = useRef(new Animated.Value(0)).current;

  // Rotate animation function
  const startRotateAnimation = (anim: Animated.Value) => {
    Animated.timing(anim, {
      toValue: 1,
      duration: 300,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start(() => anim.setValue(0));
  };

  // Trigger rotation animation based on selected item
  useEffect(() => {
    if (selected === 'Home') startRotateAnimation(homeRotateAnim);
    if (selected === 'Chat') startRotateAnimation(chatRotateAnim);
    if (selected === 'Profile') startRotateAnimation(profileRotateAnim);
    if (selected === 'Settings') startRotateAnimation(SettingsRotateAnim);
  }, [selected]);

  const handleNavigation = (screen: string) => {
    setSelected(screen);
    navigation.navigate(screen);
  };

  // Rotation interpolation
  const rotate = (anim: Animated.Value) =>
    anim.interpolate({
      inputRange: [0, 2],
      outputRange: ['0deg', '360deg'],
    });

  return (
    <View
      style={[
        styles.container,
        {backgroundColor: darkMode ? '#111C44' : '#FFFFFF'},
      ]}>
      <TouchableOpacity
        style={[
          styles.iconContainer,
          selected === 'Home' && styles.selectedContainer,
        ]}
        onPress={() => handleNavigation('Home')}>
        <Animated.View style={{transform: [{rotate: rotate(homeRotateAnim)}]}}>
          <Icon
            name="home-outline"
            size={28}
            color={darkMode ? '#fff' : '#000'}
          />
        </Animated.View>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.iconContainer,
          selected === 'Chat' && styles.selectedContainer,
        ]}
        onPress={() => handleNavigation('Chat')}>
        <Animated.View style={{transform: [{rotate: rotate(chatRotateAnim)}]}}>
          <MaterialCommunityIcons
            name="message-processing-outline"
            size={28}
            color={darkMode ? '#fff' : '#000'}
          />
        </Animated.View>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.iconContainer,
          selected === 'Profile' && styles.selectedContainer,
        ]}
        onPress={() => {
          console.log(user._id);
          navigation.navigate('Profile', {userId: user._id});
        }}>
        <Animated.View
          style={{transform: [{rotate: rotate(profileRotateAnim)}]}}>
          <Image
            style={styles.profileImage}
            source={{uri: user?.ProfilePic}}
            alt={user?.UserName}
          />
        </Animated.View>
      </TouchableOpacity>
      <TouchableOpacity onPress={toggleTheme}>
        {darkMode ? (
          <MaterialCommunityIcons
            name="white-balance-sunny"
            size={28}
            color="#fff"
          />
        ) : (
          <FontAwesome name="moon-o" size={28} color="#000" />
        )}
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.iconContainer,
          selected === 'Settings' && styles.selectedContainer,
        ]}
        onPress={() => handleNavigation('Settings')}>
        <Animated.View
          style={{transform: [{rotate: rotate(SettingsRotateAnim)}]}}>
          <Feather
            name="settings"
            size={28}
            color={darkMode ? 'white' : 'black'}
          />
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: 10,
    borderTopWidth: 1,
    borderColor: '#ddd',
    height: 60,
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },
  selectedContainer: {
    backgroundColor: '#4A90E2',
    borderRadius: 12,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  profileImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
});

export default BottomBar;

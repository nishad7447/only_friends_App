import React, {useContext, useState, useEffect} from 'react';
import {View, TouchableOpacity, StyleSheet, Image} from 'react-native';
import {
  useNavigation,
  NavigationProp,
  useRoute,
  useIsFocused,
} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Feather from 'react-native-vector-icons/Feather';
import {GlobalState} from '../Context/GlobalState';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

const BottomBar: React.FC<{user: any}> = ({user}) => {
  const navigation = useNavigation<NavigationProp<any>>();
  const route = useRoute();
  const isFocused = useIsFocused();
  const {darkMode, toggleTheme} = useContext(GlobalState);
  const [selected, setSelected] = useState<string>('Home');

  useEffect(() => {
    if (isFocused) {
      const currentRoute = route.name;
      setSelected(currentRoute);
    }
  }, [isFocused, route.name]);

  const handleNavigation = (screen: string) => {
    setSelected(screen);
    navigation.navigate(screen);
  };

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
        <Icon
          name="home-outline"
          size={28}
          color={darkMode ? '#fff' : '#000'}
        />
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
          selected === 'Profile' && styles.selectedContainer,
        ]}
        onPress={() => {
          navigation.navigate('Profile', {userId: ''});
        }}>
        <Image
          style={styles.profileImage}
          source={{uri: user?.ProfilePic}}
          alt={user?.UserName}
        />
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.iconContainer,
          selected === 'Chat' && styles.selectedContainer,
        ]}
        onPress={() => handleNavigation('Chat')}>
        <Icon
          name="chatbox-ellipses-outline"
          size={28}
          color={darkMode ? '#fff' : '#000'}
        />
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.iconContainer,
          selected === 'Settings' && styles.selectedContainer,
        ]}
        onPress={() => handleNavigation('Settings')}>
        <Feather
          name="settings"
          size={28}
          color={darkMode ? 'white' : 'black'}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: 7,
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
    borderRadius: 50,
    padding: 6,
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

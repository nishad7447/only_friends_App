import React, {useContext} from 'react';
import {TouchableOpacity, View, StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {GlobalState} from '../Context/GlobalState';

const FixedPlugin: React.FC<{orientation: string}> = ({orientation}) => {
  const {darkMode, toggleTheme} = useContext(GlobalState);

  return (
    <TouchableOpacity
      style={orientation === 'landscape' ? styles.btnLandscape : styles.button}
      onPress={toggleTheme}>
      <View style={styles.iconContainer}>
        {darkMode ? (
          <MaterialCommunityIcons
            name="white-balance-sunny"
            size={24}
            color="white"
          />
        ) : (
          <Icon name="moon" size={24} color="white" />
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  btnLandscape: {
    position: 'absolute',
    zIndex: 999,
    bottom: 10,
    right: 15,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#6a53ff',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
  },
  button: {
    position: 'absolute',
    bottom: 30,
    right: 35,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#6a53ff',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5, // Shadow for Android
  },
  iconContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 50,
    padding: 10,
  },
});

export default FixedPlugin;

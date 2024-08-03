import React, { useContext } from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { ThemeContext } from '../Context/ThemeContext';

const FixedPlugin: React.FC = () => {
  const { darkMode, toggleTheme } = useContext(ThemeContext);

  return (
    <TouchableOpacity style={styles.button} onPress={toggleTheme}>
      <View style={styles.iconContainer}>
        {darkMode ? (
          <Icon name="sun" size={24} color="white" />
        ) : (
          <Icon name="moon" size={24} color="white" />
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
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

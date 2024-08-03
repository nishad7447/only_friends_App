import React, { useState, useEffect, ReactNode, useRef, useContext } from 'react';
import {
  View,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Animated,
} from 'react-native';
import { ThemeContext } from '../Context/ThemeContext';

interface DropdownProps {
  button: ReactNode;
  children: ReactNode;
  top:number;
  right:number;
}

const Dropdown: React.FC<DropdownProps> = ({ button, children, top, right }) => {
  const [openWrapper, setOpenWrapper] = useState(false);
  const scaleValue = useRef(new Animated.Value(0)).current;
const {darkMode}=useContext(ThemeContext)

  const toggleDropdown = () => {
    setOpenWrapper(!openWrapper);
    Animated.timing(scaleValue, {
      toValue: openWrapper ? 0 : 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const styles = StyleSheet.create({
    container: {
      position: 'relative',
  },
    dropdown: {
      position: 'absolute',
      zIndex: 10,
      top,
      right,
      backgroundColor: darkMode ? '#111C44' : '#FFFFFF',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.8,
      shadowRadius: 2,
      elevation: 5,
      borderRadius: 20,
      padding: 10,
    },
    modalBackground: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={toggleDropdown}>
        {button}
      </TouchableOpacity>
      <Modal
        transparent={true}
        visible={openWrapper}
        onRequestClose={() => setOpenWrapper(false)}
      >
        <TouchableOpacity style={styles.modalBackground} onPress={() => setOpenWrapper(false)}>
          <Animated.View
            style={[
              styles.dropdown,
              {
                transform: [{ scale: scaleValue }],
                opacity: scaleValue,
              },
            ]}
          >
            {children}
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};


export default Dropdown;

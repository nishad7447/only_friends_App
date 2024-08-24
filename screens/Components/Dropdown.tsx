import React, {useState, useRef, useContext} from 'react';
import {
  View,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Animated,
  TouchableWithoutFeedback,
} from 'react-native';
import {GlobalState} from '../Context/GlobalState';

interface DropdownProps {
  button: React.ReactNode;
  children: React.ReactNode;
  top: number;
  right: number;
}

const Dropdown: React.FC<DropdownProps> = ({button, children, top, right}) => {
  const [openWrapper, setOpenWrapper] = useState(false);
  const scaleValue = useRef(new Animated.Value(0)).current;
  const {darkMode} = useContext(GlobalState);

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
      shadowColor: darkMode ? '#fff' : '#000',
      shadowOffset: {width: 0, height: 2},
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
    dropdownContent: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
    },
  });

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={toggleDropdown}>{button}</TouchableOpacity>
      <Modal
        transparent={true}
        visible={openWrapper}
        onRequestClose={() => setOpenWrapper(false)}>
        <TouchableWithoutFeedback onPress={() => setOpenWrapper(false)}>
          <View style={styles.modalBackground}>
            <TouchableWithoutFeedback>
              <Animated.View
                style={[
                  styles.dropdown,
                  {
                    transform: [{scale: scaleValue}],
                    opacity: scaleValue,
                  },
                ]}>
                <View style={styles.dropdownContent}>{children}</View>
              </Animated.View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

export default Dropdown;

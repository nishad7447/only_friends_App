import React, {useRef, useContext} from 'react';
import {View, Text, TouchableOpacity, StyleSheet, Modal} from 'react-native';
import {GlobalState} from '../Context/GlobalState';
import AntDesign from 'react-native-vector-icons/AntDesign';

interface ModalProps {
  Heading: string;
  content: React.ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
}

const CustomModal: React.FC<ModalProps> = ({
  Heading,
  content,
  onConfirm,
  onCancel,
}) => {
  const modalRef = useRef<View>(null);
  const {darkMode} = useContext(GlobalState);

  //   useEffect(() => {
  //     const handleOutsideClick = (event: any) => {
  //       if (modalRef.current && !modalRef.current?.contains(event.target)) {
  //         onCancel();
  //       }
  //     };

  //     document.addEventListener('mousedown', handleOutsideClick);
  //     return () => {
  //       document.removeEventListener('mousedown', handleOutsideClick);
  //     };
  //   }, [onCancel]);

  const styles = StyleSheet.create({
    modalContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
      width: '90%',
      maxHeight: '80%',
      backgroundColor: darkMode ? '#0a1d43' : '#fff',
      borderRadius: 15,
      padding: 20,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 10,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: darkMode ? 'white' : 'black',
    },
    modalBody: {
      marginBottom: 20,
    },
    modalText: {
      fontSize: 16,
      color: darkMode ? 'white' : 'black',
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      marginTop: 10,
    },
    cancelButton: {
      marginRight: 10,
      paddingHorizontal: 15,
      paddingVertical: 10,
      backgroundColor: darkMode ? '#333' : '#ccc',
      borderRadius: 5,
    },
    confirmButton: {
      paddingHorizontal: 15,
      paddingVertical: 10,
      backgroundColor: 'red',
      borderRadius: 5,
    },
    buttonText: {
      color: 'white',
    },
    separator: {
      borderBottomWidth: 1,
      borderBottomColor: '#ccc',
      marginBottom: 15,
      elevation: 2,
    },
  });

  return (
    <Modal
      transparent={true}
      animationType="fade"
      visible={true}
      onRequestClose={onCancel}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent} ref={modalRef}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{Heading}</Text>
            <TouchableOpacity onPress={onCancel}>
              <AntDesign
                name="closecircle"
                size={28}
                color="red"
                style={{elevation: 2}}
              />
            </TouchableOpacity>
          </View>
          <View style={styles.separator} />
          <View style={styles.modalBody}>
            <Text style={styles.modalText}>{content}</Text>
          </View>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.confirmButton} onPress={onConfirm}>
              <Text style={styles.buttonText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default CustomModal;

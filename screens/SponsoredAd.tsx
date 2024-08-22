import React, {useContext, useState} from 'react';
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {ThemeContext} from './Context/ThemeContext';
import {launchImageLibrary} from 'react-native-image-picker';
import Toast from 'react-native-toast-message';
import {Picker} from '@react-native-picker/picker';
import {ScrollView} from 'react-native-gesture-handler';
import RazorpayCheckout from 'react-native-razorpay';
import {axiosInstance} from './Components/AxiosConfig';
import {UserBaseURL} from './Components/API';

const SponsoredAd = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [attachedImage, setAttachedImage] = useState(null);
  const [name, setName] = useState('');
  const [link, setLink] = useState('');
  const [description, setDescription] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const amountPerDayInRupees = 100;
  const {user, darkMode} = useContext(ThemeContext);
  const navigation = useNavigation();
  const [formErr, setFormErr] = useState<{
    name: string;
    link: string;
    description: string;
    selectedDate: string;
  }>({
    name: '',
    link: '',
    description: '',
    selectedDate: '',
  });

  const allowedImageExtensions = ['jpg', 'jpeg', 'png', 'gif'];

  const handleImageUpload = async () => {
    launchImageLibrary({mediaType: 'photo'}, (response: any) => {
      if (!response.didCancel && !response.error) {
        const image = response.assets[0];
        const fileExtension = image.fileName.split('.').pop().toLowerCase();
        if (allowedImageExtensions.includes(fileExtension)) {
          setAttachedImage(image);
          setSelectedImage(image.uri); // Update selectedImage with the new image URI
        } else {
          Toast.show({
            type: 'error',
            text1: 'Invalid image format. Please select a valid image file.',
          });
        }
      }
    });
  };

  const handleDateChange = (itemValue: any) => {

    if (itemValue === '-1') {
      setSelectedDate('');
    } else {
      setSelectedDate(itemValue);
    }
  };

  const calculateTotalAmount = () => {
    if (selectedDate) {
      return Number(selectedDate) * amountPerDayInRupees;
    }
    return 0;
  };

  const displayRazorpay = async () => {
    if (!name.trim() || !link.trim() || !description.trim() || !attachedImage) {
      Toast.show({type: 'error', text1: 'All fields are required.'});
      return;
    }

    const result = await axiosInstance.post(`${UserBaseURL}/createOrder`, {
      amount: calculateTotalAmount(),
    });
    console.log(JSON.stringify(result));
    if (!result) {
      Toast.show({type: 'error', text1: 'Server error'});
      return;
    }

    const {amount, id: order_id, currency} = result.data;

    const options = {
      description: 'Payment for Sponsored Ad',
      image: 'https://flowbite.com/docs/images/logo.svg',
      currency,
      key: 'rzp_test_2Lp72JYGIW7UGG', // Replace with your Razorpay key ID
      amount: amount * 100, // Convert amount to paise
      name: 'OnlyFriends',
      order_id: order_id,
      prefill: {
        email: user?.email || 'example@example.com',
        contact: user?.contact || '9191919191',
        name: user?.name || 'User Name',
      },
      theme: {color: '#0a1d43'},
    };

    RazorpayCheckout.open(options)
      .then(async (response: any) => {
        const formData = new FormData();
        formData.append('Name', name);
        formData.append('Link', link);
        formData.append('Description', description);
        formData.append('Amount', calculateTotalAmount());
        formData.append('ExpiresWithIn', Number(selectedDate));
        formData.append('orderCreationId', order_id);
        formData.append('userId', user._id);
        formData.append('razorpayPaymentId', response.razorpay_payment_id);
        formData.append('razorpayOrderId', response.razorpay_order_id);
        formData.append('razorpaySignature', response.razorpay_signature);

        if (attachedImage) {
          formData.append('file', attachedImage);
        }

        axiosInstance
          .post(`${UserBaseURL}/createAd`, formData)
          .then(res => {
            if (res.data.success) {
              Toast.show({type: 'success', text1: res.data.message});
              navigation.navigate('Home');
            }
          })
          .catch(error => {
            console.log('user create ad', error);
            console.log(JSON.stringify(error, null, '\t'))
            if (
              error.response &&
              error.response.data &&
              error.response.data.message
            ) {
              const errorMessage = error.response.data.message;
              Toast.show({type: 'error', text1: errorMessage});
            } else {
              Toast.show({
                type: 'error',
                text1: 'An error occurred while creating the Ad.',
              });
            }
          });
      })
      .catch((error: any) => {
        const errorCode = error?.error?.code || 'UNKNOWN_ERROR';
        const errorDescription =
          error?.error?.description || 'An unknown error occurred';

        let userFriendlyMessage = '';
        switch (errorCode) {
          case 'BAD_REQUEST_ERROR':
            userFriendlyMessage =
              'Payment was cancelled or there was a delay in response from the UPI app.';
            break;
          case 'NETWORK_ERROR':
            userFriendlyMessage =
              'There was a network error. Please try again.';
            break;
          case 'SERVER_ERROR':
            userFriendlyMessage =
              'The server encountered an error. Please try again later.';
            break;
          default:
            userFriendlyMessage = errorDescription;
        }

        Toast.show({
          type: 'error',
          text1: `Payment Failed: ${userFriendlyMessage}`,
        });
      });
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
      backgroundColor: darkMode ? '#1B2559' : '#EDF2F7',
    },
    header: {
      color: darkMode ? 'white' : 'black',
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 20,
      textAlign: 'center',
    },
    imageContainer: {
      alignItems: 'center',
      marginBottom: 20,
    },
    image: {
      width: '100%',
      height: 200,
      borderRadius: 8,
    },
    uploadText: {
      marginTop: 10,
      color: '#1E90FF',
      fontWeight: 'bold',
    },
    form: {
      flex: 1,
    },
    label: {
      fontSize: 16,
      marginBottom: 8,
      color: darkMode ? 'white' : 'black',
    },
    picker: {
      marginBottom: 16,
      borderColor: '#ccc',
      borderWidth: 1,
      borderRadius: 8,
      width: '100%',
      height: '15%',
      paddingHorizontal: 2,
    },
    input: {
      color: darkMode ? 'white' : 'black',
      height: 40,
      borderColor: '#ccc',
      borderWidth: 1,
      borderRadius: 8,
      marginBottom: 16,
      padding: 8,
    },
    amountText: {
      fontSize: 16,
      marginBottom: 16,
      color: darkMode ? 'white' : 'black',
    },
    amount: {
      fontWeight: 'bold',
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
  });

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Sponsored Ad Creation</Text>
      <ScrollView showsVerticalScrollIndicator={false}>
        <TouchableOpacity
          onPress={handleImageUpload}
          style={styles.imageContainer}>
          <Image
            source={{
              uri: selectedImage || 'https://via.placeholder.com/800x400',
            }}
            style={styles.image}
          />
          <Text style={styles.uploadText}>Upload New Image</Text>
        </TouchableOpacity>

        <View style={styles.form}>
          <Text style={styles.label}>Select Date (up to 10 days)</Text>
          <View style={styles.picker}>
            <Picker
              selectedValue={selectedDate}
              onValueChange={handleDateChange}
              style={{
                backgroundColor: darkMode ? '#1B2559' : '#EDF2F7',
                color: darkMode ? 'white' : 'black',
                flex: 1,
                height: ' 10%',
              }}
              dropdownIconColor={darkMode ? 'white' : 'black'}>
              <Picker.Item label="Select a date" value="-1" />
              {[...Array(10)].map((_, index) => (
                <Picker.Item
                  style={{
                    backgroundColor: !darkMode
                      ? index % 2 == 0
                        ? '#EDF2F7'
                        : ''
                      : '',
                  }}
                  key={index}
                  label={`${index + 1} day`}
                  value={`${index + 1}`}
                />
              ))}
            </Picker>
          </View>

          <TextInput
            style={styles.input}
            placeholder="Enter Sponsor Name"
            placeholderTextColor={darkMode ? '#969696' : '#747474'}
            value={name}
            onChangeText={setName}
          />

          <TextInput
            style={styles.input}
            placeholder="Enter Sponsor Link"
            placeholderTextColor={darkMode ? '#969696' : '#747474'}
            value={link}
            onChangeText={setLink}
          />

          <TextInput
            style={styles.input}
            placeholder="Enter Description"
            placeholderTextColor={darkMode ? '#969696' : '#747474'}
            value={description}
            onChangeText={setDescription}
            multiline
          />

          <Text style={styles.amountText}>
            Total Amount:{' '}
            <Text style={styles.amount}>₹{calculateTotalAmount()}</Text>
          </Text>

          <TouchableOpacity onPress={displayRazorpay} style={styles.button}>
            <Text style={styles.buttonText}>Pay & Submit</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default SponsoredAd;

import 'react-native-gesture-handler';
import 'react-native-screens';
import 'react-native-safe-area-context';
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StyleSheet } from 'react-native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import SignIn from './screens/Signin';
import { ThemeProvider } from './screens/Context/ThemeContext';
import SignUp from './screens/SignUp';// Import other screens as needed

const Stack = createNativeStackNavigator();

const App = () => {
  useEffect(() => {
    GoogleSignin.configure({
      webClientId:
        '969952852580-q77urroi4f3chu5hlua9nqpvq6vl1gje.apps.googleusercontent.com', // Replace with your Google client ID
    });
  }, []);

  return (
    <ThemeProvider>
      <NavigationContainer>
        {/* <SafeAreaView style={styles.container}> */}
        <Stack.Navigator initialRouteName="SignIn">
          <Stack.Screen
            name="SignIn"
            component={SignIn}
            options={{headerShown: false}}
          />
           <Stack.Screen
            name="SignUp"
            component={SignUp}
            options={{ headerShown: false }}
          />
          {/* Add other screens here */}
          {/* <Stack.Screen name="Home" component={Home} options={{ headerShown: false }} /> */}
          {/* <Stack.Screen name="ForgotPassword" component={ForgotPassword} options={{ headerShown: false }} /> */}
        </Stack.Navigator>
        {/* <Toast /> */}
        {/* </SafeAreaView> */}
      </NavigationContainer>
    </ThemeProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;

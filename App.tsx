import 'react-native-gesture-handler';
import 'react-native-screens';
import 'react-native-safe-area-context';
import React, {ReactNode, useContext, useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {StatusBar, StyleSheet} from 'react-native';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import SignIn from './screens/Signin';
import {ThemeContext, ThemeProvider} from './screens/Context/ThemeContext';
import SignUp from './screens/SignUp';
import Home from './screens/Home';
import Protected from './screens/Components/Protected';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import Toast from 'react-native-toast-message';

const Stack = createNativeStackNavigator();

const withProtected = <P extends object>(WrappedComponent: React.ComponentType<P>): React.FC<P> => {
  const ProtectedComponent: React.FC<P> = (props) => (
    <Protected>
      <WrappedComponent {...props} />
    </Protected>
  );

  return ProtectedComponent;
};

const App = () => {
  const {darkMode}=useContext(ThemeContext)
  useEffect(() => {
    GoogleSignin.configure({
      webClientId:
        '969952852580-q77urroi4f3chu5hlua9nqpvq6vl1gje.apps.googleusercontent.com', // Replace with your Google client ID
    });
  }, []);

  return (
      <ThemeProvider>
        <GestureHandlerRootView style={{flex: 1}}>
          <NavigationContainer>
            <Stack.Navigator initialRouteName="SignIn">
              <Stack.Screen
                name="SignIn"
                component={SignIn}
                options={{headerShown: false}}
              />
              <Stack.Screen
                name="SignUp"
                component={SignUp}
                options={{headerShown: false}}
              />
              {/* Add other screens here */}
              <Stack.Screen
                name="Home"
                component={withProtected(Home)}
                options={{headerShown: false}}
              />
              {/* <Stack.Screen name="ForgotPassword" component={ForgotPassword} options={{ headerShown: false }} /> */}
            </Stack.Navigator>
            <Toast />
          </NavigationContainer>
        </GestureHandlerRootView>
      </ThemeProvider>
  );
};

export default App;

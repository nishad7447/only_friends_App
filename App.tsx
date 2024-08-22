import 'react-native-gesture-handler';
import 'react-native-screens';
import 'react-native-safe-area-context';
import React, {useContext, useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import {ThemeContext, ThemeProvider} from './screens/Context/ThemeContext';
import SignIn from './screens/Signin';
import SignUp from './screens/SignUp';
import Protected from './screens/Components/Protected';
import Home from './screens/Home';
import ProfileSettings from './screens/ProfileSettings';
import SavedPosts from './screens/SavedPosts';
import Profile from './screens/Profile';
import Settings from './screens/Settings';
import SponsoredAd from './screens/SponsoredAd';
import Chat from './screens/Chat';
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
            <Stack.Navigator initialRouteName="Home">
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
              <Stack.Screen
                name="Home"
                component={withProtected(Home)}
                options={{headerShown: false}}
              />
              <Stack.Screen
                name="ProfileSettings"
                component={withProtected(ProfileSettings)}
                options={{headerShown: false}}
              />
              <Stack.Screen
                name="SavedPosts"
                component={withProtected(SavedPosts)}
                options={{headerShown: false}}
              />
              <Stack.Screen
                name="Profile"
                component={withProtected(Profile)}
                options={{headerShown: false}}
              />
              <Stack.Screen
                name="Settings"
                component={withProtected(Settings)}
                options={{headerShown: false}}
              />
              <Stack.Screen
                name="SponsoredAd"
                component={withProtected(SponsoredAd)}
                options={{headerShown: false}}
              />
              <Stack.Screen
                name="Chat"
                component={withProtected(Chat)}
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

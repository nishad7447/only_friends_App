import 'react-native-gesture-handler';
import 'react-native-screens';
import 'react-native-safe-area-context';
import {StyleSheet} from 'react-native';
import React, {useContext, useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import {GlobalState, GlobalStateProvider} from './screens/Context/GlobalState';
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
import SearchScreen from './screens/Search';
import FollowersOrFollowings from './screens/FollowersOrFollowings';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import Toast, {BaseToast, ErrorToast} from 'react-native-toast-message';

const Stack = createNativeStackNavigator();

const withProtected = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
): React.FC<P> => {
  const ProtectedComponent: React.FC<P> = props => (
    <Protected>
      <WrappedComponent {...props} />
    </Protected>
  );

  return ProtectedComponent;
};

const App = () => {
  const {darkMode} = useContext(GlobalState);
  useEffect(() => {
    GoogleSignin.configure({
      webClientId:
        '969952852580-q77urroi4f3chu5hlua9nqpvq6vl1gje.apps.googleusercontent.com', // Replace with your Google client ID
    });
  }, []);

  const styles = StyleSheet.create({
    toast: {
      paddingTop: 10,
      backgroundColor: darkMode ? '#111C44' : '#FFFFFF',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 10,
      borderRadius: 50,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.2,
      shadowRadius: 2,
      elevation: 4,
      height: 60,
      width: '100%',
      borderWidth: 2,
    },
  });
  const toastConfig = {
    success: props => (
      <BaseToast {...props} style={[styles.toast, {borderColor: 'green'}]} />
    ),
    error: props => (
      <ErrorToast {...props} style={[styles.toast, {borderColor: 'red'}]} />
    ),
  };

  return (
    <GlobalStateProvider>
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
            <Stack.Screen
              name="Search"
              component={withProtected(SearchScreen)}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="FollowersOrFollowings"
              component={withProtected(FollowersOrFollowings)}
              options={{headerShown: false}}
            />
          </Stack.Navigator>
          <Toast config={toastConfig} position="top" bottomOffset={100} />
        </NavigationContainer>
      </GestureHandlerRootView>
    </GlobalStateProvider>
  );
};

export default App;

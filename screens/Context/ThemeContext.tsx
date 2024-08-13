import React, { createContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Dimensions } from 'react-native';

interface ThemeContextProps {
  darkMode: boolean;
  toggleTheme: () => void;
  user: any | null;
  setUser: (user: any | null) => void;
  orientation: string;
  setOrientation: (orientation: string) => void;
}

const ThemeContext = createContext<ThemeContextProps>({
  darkMode: false,
  toggleTheme: () => {},
  user: null,
  setUser: () => {},
  orientation: 'portrait',
  setOrientation: () => {},
});

const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [user, setUser] = useState<any | null>(null);
  const [orientation, setOrientation] = useState<string>('portrait');

  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const storedPreference = await AsyncStorage.getItem('darkMode');
        console.log({ storedPreference });
        if (storedPreference !== null) {
          setDarkMode(JSON.parse(storedPreference));
        }
      } catch (error) {
        console.error('Failed to load theme preference', error);
      }
    };

    loadThemePreference();
  }, []);

  const toggleTheme = async () => {
    try {
      const newDarkMode = !darkMode;
      setDarkMode(newDarkMode);
      await AsyncStorage.setItem('darkMode', JSON.stringify(newDarkMode));
    } catch (error) {
      console.error('Failed to save theme preference', error);
    }
  };

  useEffect(() => {
    const loadUserDetails = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('user');
        console.log({ storedUser });
        if (storedUser !== null) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Failed to load user details', error);
      }
    };

    loadUserDetails();
  }, []);

  const updateUser = async (user: any | null) => {
    try {
      setUser(user);
      if (user) {
        await AsyncStorage.setItem('user', JSON.stringify(user));
      } else {
        await AsyncStorage.removeItem('user');
      }
    } catch (error) {
      console.error('Failed to save user details', error);
    }
  };

  const determineOrientation = () => {
    const { width, height } = Dimensions.get('window');
    setOrientation(width > height ? 'landscape' : 'portrait');
  };

  useEffect(() => {
    determineOrientation();
    const subscription = Dimensions.addEventListener('change', determineOrientation);

    return () => {
      if (subscription) {
        subscription.remove(); // Cleanup the event listener on unmount
      }
    };
  }, []);

  console.log({ darkMode, user, orientation });

  return (
    <ThemeContext.Provider
      value={{
        darkMode,
        toggleTheme,
        user,
        setUser: updateUser,
        orientation,
        setOrientation,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export { ThemeProvider, ThemeContext };

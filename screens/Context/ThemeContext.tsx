import React, { createContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';


interface ThemeContextProps {
  darkMode: boolean;
  toggleTheme: () => void;
  user: any | null;
  setUser: (user: any | null) => void;
}

const ThemeContext = createContext<ThemeContextProps>({
  darkMode: false,
  toggleTheme: () => {},
  user: null,
  setUser: () => {},
});

const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [user, setUser] = useState<any | null>(null);

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

  // Optional: Load user details from AsyncStorage or an API if necessary
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

  console.log({ darkMode, user });

  return (
    <ThemeContext.Provider value={{ darkMode, toggleTheme, user, setUser: updateUser }}>
      {children}
    </ThemeContext.Provider>
  );
};

export { ThemeProvider, ThemeContext };

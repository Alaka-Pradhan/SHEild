import AsyncStorage from '@react-native-async-storage/async-storage';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { createContext, useEffect, useState } from 'react';
import 'react-native-reanimated';
import RegistrationScreen from '../components/RegistrationScreen';

export const ThemeContext = createContext({
  darkMode: false,
  setDarkMode: (_: boolean) => {},
});
export const RegistrationContext = createContext({
  isRegistered: false,
  setIsRegistered: (_: boolean) => {},
});

export default function RootLayout() {
  const [darkMode, setDarkMode] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    const loadTheme = async () => {
      const theme = await AsyncStorage.getItem('darkMode');
      setDarkMode(theme === 'true');
    };
    const checkRegistration = async () => {
      const userProfile = await AsyncStorage.getItem('userProfile');
      setIsRegistered(!!userProfile);
    };
    loadTheme();
    checkRegistration();
    const interval = setInterval(async () => {
      const theme = await AsyncStorage.getItem('darkMode');
      setDarkMode(theme === 'true');
    }, 500);
    return () => clearInterval(interval);
  }, []);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeContext.Provider value={{ darkMode, setDarkMode }}>
      <RegistrationContext.Provider value={{ isRegistered, setIsRegistered }}>
        <ThemeProvider value={darkMode ? DarkTheme : DefaultTheme}>
          {isRegistered ? (
            <>
              <Stack>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="+not-found" />
              </Stack>
              <StatusBar style="auto" />
            </>
          ) : (
            <RegistrationScreen onRegister={() => setIsRegistered(true)} />
          )}
        </ThemeProvider>
      </RegistrationContext.Provider>
    </ThemeContext.Provider>
  );
}

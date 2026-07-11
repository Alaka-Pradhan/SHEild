import AsyncStorage from '@react-native-async-storage/async-storage';
import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { registerRootComponent } from 'expo';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator } from 'react-native';
import 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeContext } from './contexts/ThemeContext';
import MainNavigator from './navigation/MainNavigator';

const SHEildLightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#7B3FA0',
    background: '#F8F3F9',
    card: '#FFFFFF',
    text: '#11181C',
    border: '#E0E0E0',
    notification: '#B00020',
  },
};

const SHEildDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: '#9B59B6',
    background: '#151718',
    card: '#2A2A2E',
    text: '#ECEDEE',
    border: '#3A3A3E',
    notification: '#FF6B6B',
  },
};

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [themeLoaded, setThemeLoaded] = useState(false);

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('darkMode');
        if (savedTheme !== null) {
          setDarkMode(savedTheme === 'true');
        }
      } finally {
        setThemeLoaded(true);
      }
    };
    loadTheme();
  }, []);

  if (!themeLoaded) {
    return <ActivityIndicator size="large" style={{ flex: 1 }} />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeContext.Provider value={{ darkMode, setDarkMode }}>
          <NavigationContainer theme={darkMode ? SHEildDarkTheme : SHEildLightTheme}>
            <StatusBar style={darkMode ? 'light' : 'dark'} />
            <MainNavigator />
          </NavigationContainer>
        </ThemeContext.Provider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

registerRootComponent(App);

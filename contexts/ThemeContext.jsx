import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from 'i18next';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');
  const [fontFamily, setFontFamily] = useState('Poppins_400Regular');  // Default font

  // Load stored theme and font from AsyncStorage
  const loadStoredPreferences = useCallback(async () => {
    try {
      const storedTheme = await AsyncStorage.getItem('theme');
      const storedFont = await AsyncStorage.getItem('fontFamily');
      
      if (storedTheme) {
        setTheme(storedTheme);
      } else {
        const systemTheme = Appearance.getColorScheme();
        setTheme(systemTheme || 'light');  // Fallback to light if system theme is not available
      }

      if (storedFont) {
        setFontFamily(storedFont);
      }
    } catch (error) {
      console.error('Failed to load preferences:', error);
    }
  }, []);

  // Toggle theme between light and dark
  const toggleTheme = useCallback(async () => {
    try {
      const newTheme = theme === 'light' ? 'dark' : 'light';
      setTheme(newTheme);
      await AsyncStorage.setItem('theme', newTheme);
    } catch (error) {
      console.error('Failed to save theme:', error);
    }
  }, [theme]);

  // Function to toggle font between two (or more) font options
  const toggleFont = useCallback(async () => {
    try {
      const newFont = fontFamily === 'Poppins_400Regular' ? 'Poppins_500Medium' : 'Poppins_400Regular';  // Example toggle
      setFontFamily(newFont);
      await AsyncStorage.setItem('fontFamily', newFont);
    } catch (error) {
      console.error('Failed to save font:', error);
    }
  }, [fontFamily]);

  useEffect(() => {
    loadStoredPreferences();
  }, [loadStoredPreferences]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, fontFamily, toggleFont, t: i18n.t }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

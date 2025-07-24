import React, { createContext, useContext, useState, useEffect } from 'react';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import en from '../locales/en.json';  
import rw from '../locales/rw.json';  

// Initialize i18n configuration
i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      rw: { translation: rw },
    },
    lng: 'en',  // Default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,  // React already escapes HTML by default
    },
  });

const LanguageContext = createContext();

// Function to load language preference from AsyncStorage
const loadLanguagePreference = async () => {
  try {
    const storedLanguage = await AsyncStorage.getItem('language');
    return storedLanguage || 'en';  // Default to 'en' if no stored language
  } catch (error) {
    console.error('Failed to load language:', error);
    return 'en';  // Fallback language
  }
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(i18n.language);

  // Load language from AsyncStorage on initial render
  useEffect(() => {
    const fetchLanguage = async () => {
      const storedLanguage = await loadLanguagePreference();
      i18n.changeLanguage(storedLanguage);
      setLanguage(storedLanguage);
    };
    fetchLanguage();
  }, []);

  // Change language and store it in AsyncStorage
  const changeLanguage = async (lng) => {
    i18n.changeLanguage(lng);
    setLanguage(lng);
    try {
      await AsyncStorage.setItem('language', lng);
    } catch (error) {
      console.error('Failed to store language:', error);
    }
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t: i18n.t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);

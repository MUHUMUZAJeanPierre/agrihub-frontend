// utils/authUtils.js
import AsyncStorage from '@react-native-async-storage/async-storage';

export const checkAuthentication = async () => {
  try {
    const userData = await AsyncStorage.getItem('@user_data');
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error checking authentication:', error);
    return null;
  }
};

export const requireAuth = async (navigation, callback) => {
  const user = await checkAuthentication();
  if (user) {
    // User is authenticated, execute the callback
    callback();
  } else {
    // User is not authenticated, redirect to login
    navigation.navigate('login');
  }
};
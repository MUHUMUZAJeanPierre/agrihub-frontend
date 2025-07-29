import React, { createContext, useContext, useEffect, useState } from 'react';
import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../firebase';
import { setDoc, doc, serverTimestamp, getDoc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { showMessage } from 'react-native-flash-message';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

const AUTH_KEYS = {
  TOKEN: '@auth_token',
  USER_ID: '@user_id',
  USER_DATA: '@user_data',
};

export const AuthProvider = ({ children, navigation }) => {
  const [loading, setLoading] = useState(false);
  const [logged, setLogged] = useState("");
  const [isLog, setIsLog] = useState(false);
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(undefined);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuthenticated(true);
        setUser(user);
        updateUserData(user.uid);
      }
    });
    return unsub
  }, []);

  const updateUserData = async (userId) => {
    const docRef = doc(db, 'users', userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      let data = docSnap.data();
      setUser({ ...user, name: data.name, userId: data.userId });
    }
  }


  const register = async (formData, onSuccess, email, password) => {
    setLoading(true);
    let firebaseUser = null;
    let apiRegistered = false;

    try {
   
      // Backend registration
      const response = await fetch('https://agrihub-backend-4z99.onrender.com/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.toLowerCase().trim(),
          password: formData.password,
          role: formData.role,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'API registration failed');
      apiRegistered = true;

      showMessage({
        message: 'Registration Successful',
        description: `Welcome to AgriHub, ${formData.name}`,
        type: 'success',
        icon: 'success',
      });

      onSuccess?.(); // Call optional callback (e.g., navigate to login)


         // Firebase create user
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      console.log('response.user', userCredential?.user);
      // firebaseUser = userCredential.user;

      // Save basic user data in Firestore
      await setDoc(doc(db, 'users', userCredential.user?.uid), {
        name: formData.name,
        userId: userCredential?.user?.uid,
        role: formData.role,
      });
      return { success: true, data: response?.user }







    } catch (error) {
      console.error('Registration error:', error);
      showMessage({
        message: 'Registration Failed',
        description: error.message,
        type: 'danger',
        icon: 'danger',
        duration: 5000,
      });

      if (firebaseUser && !apiRegistered) {
        try {
          await firebaseUser.delete(); // Clean up Firebase account
        } catch (err) {
          console.warn('Firebase cleanup failed:', err);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  // const login = async (email, password, onSuccess) => {
  //   setLoading(true);
  //   try {
  //     // Firebase sign-in
  //     const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
  //     const firebaseUser = userCredential.user;

  //     // SecureStore basic session
  //     await SecureStore.setItemAsync('userId', firebaseUser.uid);
  //     await SecureStore.setItemAsync('userEmail', email.trim().toLowerCase());

  //     // Backend sign-in
  //     const res = await fetch('https://agrihub-backend-4z99.onrender.com/login', {
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
  //     });

  //     const data = await res.json();
  //     if (!res.ok) throw new Error(data?.message || 'Login failed');

  //     await AsyncStorage.setItem(AUTH_KEYS.TOKEN, data.token);
  //     await AsyncStorage.setItem(AUTH_KEYS.USER_ID, data.user._id);
  //     await AsyncStorage.setItem(AUTH_KEYS.USER_DATA, JSON.stringify(data.user));

  //     showMessage({
  //       message: 'Login Successful',
  //       description: `Welcome back, ${data.user.name}`,
  //       type: 'success',
  //       icon: 'success',
  //     });

  //     onSuccess?.(data.user.role); // Pass role to redirect

  //   } catch (err) {
  //     console.error('Login error:', err);
  //     showMessage({
  //       message: 'Login Failed',
  //       description: err.message,
  //       type: 'danger',
  //       icon: 'danger',
  //       duration: 5000,
  //     });

  //     await AsyncStorage.multiRemove([
  //       AUTH_KEYS.TOKEN,
  //       AUTH_KEYS.USER_ID,
  //       AUTH_KEYS.USER_DATA,
  //     ]);
  //   } finally {
  //     setLoading(false);
  //   }
  // };


  const login = async (email, password, onSuccess) => {
    setLoading(true);
    try {
      
    

      const res = await fetch('https://agrihub-backend-4z99.onrender.com/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Login failed')

      await AsyncStorage.setItem(AUTH_KEYS.TOKEN, data.token);
      await AsyncStorage.setItem(AUTH_KEYS.USER_ID, data.user._id);
      await AsyncStorage.setItem(AUTH_KEYS.USER_DATA, JSON.stringify(data.user));

      // ✅ Your role-based login logic
      const userData = data.user;
      if (userData && userData.role === "farmer") {
        setLogged("farmer");
        setIsLog(true);
      } else if (userData && userData.role === "buyer") {
        setLogged("buyer");
        setIsLog(true);
      } else if (userData && userData.role === "plant pathologist") {
        setLogged("plant pathologist");
        setIsLog(true);
      } else {
        console.log("Invalid account");
      }

      showMessage({
        message: 'Login Successful',
        description: `Welcome back, ${userData.name}`,
        type: 'success',
        icon: 'success',
      });

      onSuccess?.(userData.role); // Still optional if you want navigation



      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('response.user.login', userCredential?.user);
      return { success: true };
      // const firebaseUser = userCredential.user;

      // await SecureStore.setItemAsync('userId', firebaseUser.uid);
      // await SecureStore.setItemAsync('userEmail', email.trim().toLowerCase());

    } catch (err) {
      console.error('Login error:', err);
      showMessage({
        message: 'Login Failed',
        description: err.message,
        type: 'danger',
        icon: 'danger',
        duration: 5000,
      });

      await AsyncStorage.multiRemove([
        AUTH_KEYS.TOKEN,
        AUTH_KEYS.USER_ID,
        AUTH_KEYS.USER_DATA,
      ]);
    } finally {
      setLoading(false);
    }
  };


  const logout = async (navigation) => {
    try {
      setLoading(true);
      await AsyncStorage.multiRemove([
        AUTH_KEYS.TOKEN,
        AUTH_KEYS.USER_ID,
        AUTH_KEYS.USER_DATA,
      ]);

      setLogged('');
      setIsLog(false);

      showMessage({
        message: 'Logged Out',
        description: 'You have been successfully logged out.',
        type: 'info',
        icon: 'info',
      });

      // ✅ Navigate to "Boards" screen
      navigation.replace('boards');

    } catch (error) {
      console.error('Logout error:', error);
      showMessage({
        message: 'Logout Failed',
        description: error.message,
        type: 'danger',
        icon: 'danger',
      });
    } finally {
      setLoading(false);
    }
  };


  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      loading,
      register,
      login,
      logged,
      isLog,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};


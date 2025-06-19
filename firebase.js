import { initializeApp } from "firebase/app";
import {getAuth, initializeAuth, getReactNativePersistence} from  'firebase/auth'
import {getFirestore} from 'firebase/firestore'
import { getStorage } from "firebase/storage";
import AsyncStorage from '@react-native-async-storage/async-storage'; 



const firebaseConfig = {
  apiKey: "AIzaSyDXL8XPCge4zFIbGyk5hHK0GONtV9gxiio",
  authDomain: "agrihub-2f69e.firebaseapp.com",
  projectId: "agrihub-2f69e",
  storageBucket: "agrihub-2f69e.firebasestorage.app",
  messagingSenderId: "1077386709419",
  appId: "1:1077386709419:web:719b045206860768b46aee",
  measurementId: "G-8L08Y43T3X"
};

// Initialize Firebase
export const FIREBASE_APP = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
// export const FIREBASE_AUTH = getAuth(FIREBASE_APP,{
//   persistence: getReactNativePersistence(AsyncStorage),
// })


// export const FIREBASE_AUTH = initializeAuth(FIREBASE_APP, {
//   persistence: getReactNativePersistence(ReactNativeAsyncStorage),
// });

export const FIREBASE_AUTH = getAuth(FIREBASE_APP)
export const FIREBASE_DB = getFirestore(FIREBASE_APP)
export const FIREBASE_storage = getStorage(FIREBASE_APP);

import { initializeApp } from "firebase/app";
import {getReactNativePersistence, initializeAuth} from 'firebase/auth';
import AsyncStorage from "@react-native-async-storage/async-storage";
import {getFirestore, collection} from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyC8Ap2S3e5GGCx40I-_hgfhS0qLabxEoxs",
  authDomain: "agrihubsystem.firebaseapp.com",
  projectId: "agrihubsystem",
  storageBucket: "agrihubsystem.firebasestorage.app",
  messagingSenderId: "954748591033",
  appId: "1:954748591033:web:e0be13c87cf777941fb468",
  measurementId: "G-7W3MLRLG0Z"
};

const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
});

export const db = getFirestore(app);

export const usersRef = collection(db, 'users');
export const roomRef = collection(db, 'rooms');
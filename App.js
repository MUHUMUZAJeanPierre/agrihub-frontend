import { Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import "./global.css"; 
import StackNavigation from './Navigation/stackNavigation';
// import { StatusBar } from "expo-status-bar";
import { StatusBar } from 'react-native';


const Stack = createStackNavigator();

export default function App() {
  return (
    <>
    <StackNavigation />
    <StatusBar style="black" backgroundColor="#4ba26a" color="color" />
  </>
  );
}



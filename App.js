import { Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import "./global.css"; 
import StackNavigation from './Navigation/stackNavigation';
// import { StatusBar } from "expo-status-bar";
import { StatusBar } from 'react-native';
import FarmerDashboard from './Screens/Farmer/Farmerdash';
import Addproduct from './Screens/Farmer/Addproduct';
import ProfileScreen from './Screens/Profile';
// import {Chat} from './Screens/Farmer/Chat';


const Stack = createStackNavigator();

export default function App() {
  return (
    <>
    {/* <Chat /> */}
    {/* <ProfileScreen /> */}
    {/* <Addproduct /> */}
    {/* <FarmerDashboard /> */}
    <StackNavigation />
    <StatusBar style="black" backgroundColor="#4ba26a" color="color" />
  </>
  );
}



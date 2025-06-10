import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import Onboarding from './Components/onboarding';
import Login from './Screens/Login';
import Register from './Screens/Register';
import BuyerDashboard from './Screens/BuyerDashboard';
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





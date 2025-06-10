// import { NavigationContainer } from '@react-navigation/native';
// import { createStackNavigator } from '@react-navigation/stack';
// import "./global.css"

// import Onboarding from './Components/onboarding';
// import Login from './Screens/Login';
// import Register from './Screens/Register';
// import BuyerDashboard from './Screens/BuyerDashboard';
// import StackNavigation from './Navigation/stackNavigation';

// const Stack = createStackNavigator();

// export default function App() {
//   return (
//     <>

//       <StackNavigation />
//     </>
//   );
// }




import { Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import "./global.css"; // Make sure this is configured correctly for Tailwind to work

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

  





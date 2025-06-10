// // import { NavigationContainer } from '@react-navigation/native';
// // import { createStackNavigator } from '@react-navigation/stack';
// // import "./global.css"

// // import Onboarding from './Components/onboarding';
// // import Login from './Screens/Login';
// // import Register from './Screens/Register';
// // import BuyerDashboard from './Screens/BuyerDashboard';
// // import StackNavigation from './Navigation/stackNavigation';

// // const Stack = createStackNavigator();

// // export default function App() {
// //   return (
// //     <>

// //       <StackNavigation />
// //     </>
// //   );
// // }




// import { Text, View } from 'react-native';
// import { NavigationContainer } from '@react-navigation/native';
// import { createStackNavigator } from '@react-navigation/stack';
// import "./global.css"; // Make sure this is configured correctly for Tailwind to work

// import Onboarding from './Components/onboarding';
// import Login from './Screens/Login';
// import Register from './Screens/Register';
// import BuyerDashboard from './Screens/BuyerDashboard';
// import StackNavigation from './Navigation/stackNavigation';
// // import { StatusBar } from "expo-status-bar";
// import { StatusBar } from 'react-native';


// const Stack = createStackNavigator();

// export default function App() {
//   return (
//     <>
//     <StackNavigation />
//     <StatusBar style="black" backgroundColor="#4ba26a" color="color" />
//   </>
//   );
// }

  


import { Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import "./global.css"; // Make sure this is configured correctly for Tailwind to work

const Stack = createStackNavigator();

export default function App() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-2xl font-bold text-blue-500">Hello Tailwind!</Text>
      <Text className="mt-4 text-lg text-gray-700">This is a simple Tailwind test in React Native.</Text>
      <Text className="mt-2 text-sm text-red-500">If you see this styled, Tailwind is working.</Text>
    </View>
  );
}



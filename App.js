// import { Text, View } from 'react-native';
// import { NavigationContainer } from '@react-navigation/native';
// import { createStackNavigator } from '@react-navigation/stack';
// import "./global.css"; 
// import StackNavigation from './Navigation/stackNavigation';
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


import React from 'react';
import { StatusBar, View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import StackNavigation from './Navigation/stackNavigation';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { CartProvider } from './contexts/CartContext';


export default function App() {
  return (
    <CartProvider>
      <GestureHandlerRootView style={styles.container}>
          <StackNavigation />
        <StatusBar backgroundColor="#4ba26a" barStyle="light-content" />
      </GestureHandlerRootView>
    </CartProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});

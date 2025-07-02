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
import { ThemeProvider } from './contexts/ThemeContext';



export default function App() {
  return (
    <ThemeProvider>
      <CartProvider>
        <GestureHandlerRootView style={styles.container}>
            <StackNavigation />
          <StatusBar backgroundColor="#4ba26a" barStyle="light-content" />
        </GestureHandlerRootView>
      </CartProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});

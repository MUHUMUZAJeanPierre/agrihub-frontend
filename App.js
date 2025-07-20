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

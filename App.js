// import React from 'react';
// import { StatusBar, View, StyleSheet } from 'react-native';
// import { NavigationContainer } from '@react-navigation/native';
// import StackNavigation from './Navigation/stackNavigation';
// import { GestureHandlerRootView } from 'react-native-gesture-handler';
// import { CartProvider } from './contexts/CartContext';
// import { ThemeProvider } from './contexts/ThemeContext';



// export default function App() {
//   return (
//     <ThemeProvider>
//       <CartProvider>
//         <GestureHandlerRootView style={styles.container}>
//             <StackNavigation />
//           <StatusBar backgroundColor="#4ba26a" barStyle="light-content" />
//         </GestureHandlerRootView>
//       </CartProvider>
//     </ThemeProvider>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//   },
// });



import React from 'react';
import { StatusBar, View, StyleSheet, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import StackNavigation from './Navigation/stackNavigation';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { CartProvider } from './contexts/CartContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { useFonts } from '@expo-google-fonts/poppins';
import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_700Bold,
  Poppins_800ExtraBold
} from '@expo-google-fonts/poppins';

export default function App() {
  let [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_700Bold,
    Poppins_800ExtraBold,
  });

  if (!fontsLoaded) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#4ba26a" />
      </View>
    );
  }

  return (
    <LanguageProvider>
      <ThemeProvider>
        <CartProvider>
          <GestureHandlerRootView style={styles.container}>
            <StackNavigation />
            <StatusBar backgroundColor="#4ba26a" barStyle="light-content" />
          </GestureHandlerRootView>
        </CartProvider>
      </ThemeProvider>
    </LanguageProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});

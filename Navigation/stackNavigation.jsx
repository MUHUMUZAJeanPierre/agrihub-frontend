import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

import Login from '../Screens/Login';
import Register from '../Screens/Register';
import Forgot from '../Screens/forgot';
import Onboarding from '../Components/onboarding';
import BottomNav from './Bottomnav';
import Detail from '../Screens/Farmer/description';
import Chat from '../Screens/Farmer/Chat';
import ProductDetailScreen from '../Screens/ProductDetailScreen';
import AgroDetail from '../Screens/Agronome/AgroDetail';
import Security from '../Screens/Security';

const Stack = createNativeStackNavigator();

export default function StackNavigation() {
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        const storedData = await AsyncStorage.getItem('@user_data');
        if (storedData) {
          const userData = JSON.parse(storedData);
          setUserRole(userData?.role || null);
        } else {
          setUserRole(null);
        }
      } catch (error) {
        console.error('❌ Failed to load user data:', error);
        setUserRole(null);
      } finally {
        setIsLoading(false);
      }
    };

    bootstrapAsync();
  }, []);

  if (isLoading) {
    return <Onboarding />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {userRole ? (
          <>
            {userRole === 'farmer' && (
              <>
                <Stack.Screen name="farmer" component={BottomNav} />
                <Stack.Screen name="farmerblog" component={Detail} />
                <Stack.Screen name="chat" component={Chat} />
              </>
            )}
            {userRole === 'buyer' && (
              <>
              <Stack.Screen name="BottomNav" component={BottomNav} />
              <Stack.Screen name="ProductDetailScreen" component={ProductDetailScreen} />
              </>
            )}
            {userRole === 'plant pathologist' && (
              <>
              <Stack.Screen name="agrono" component={BottomNav} />
              <Stack.Screen name="AgroDetail" component={AgroDetail} />
              </>
            )}
          </>
        ) : (
          <>
            <Stack.Screen name="boards" component={Onboarding} />
            <Stack.Screen name="login" component={Login} />
            <Stack.Screen name="register" component={Register} />
            <Stack.Screen name="forgot" component={Forgot} />
          </>
        )}
        <Stack.Screen name="Security" component={Security} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

import React, { useContext} from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BottomNav from './Bottomnav';
import Details from '../Screens/description';



const Stack = createNativeStackNavigator();

export default function StackNavigation() {

  // const { isLog, logged} = useContext(Context)

  return (
    <NavigationContainer>

      <Stack.Navigator >

        
            <Stack.Screen name="farmer" component={BottomNav} options={{ headerShown: false }} />
            <Stack.Screen name="ProductDetail" component={Details} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
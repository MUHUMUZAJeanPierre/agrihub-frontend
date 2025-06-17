import React, { useContext} from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BottomNav from './Bottomnav';
import Details from '../Screens/ProductDetail';
const Stack = createNativeStackNavigator();
import Register from '../Screens/Register';
import Login from '../Screens/Login';
import Onboarding from '../Components/onboarding';
export default function StackNavigation() {
  return (
    <NavigationContainer>
      <Stack.Navigator >        
            <Stack.Screen name="onboarding" component={Onboarding} options={{ headerShown: false }} />
            <Stack.Screen name="login" component={Login} options={{ headerShown: false }} />
            <Stack.Screen name="Register" component={Register} options={{ headerShown: false }} />
            <Stack.Screen name="farmer" component={BottomNav} options={{ headerShown: false }} />
            <Stack.Screen name="ProductDetail" component={Details} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};


// import React, { useContext} from 'react';
// import { NavigationContainer } from '@react-navigation/native';
// import { createNativeStackNavigator } from '@react-navigation/native-stack';
// import BottomNav from './Bottomnav';

// const Stack = createNativeStackNavigator();
// export default function StackNavigation() {
//   return (
//     <NavigationContainer>
//       <Stack.Navigator >        
//             <Stack.Screen name="onboarding" component={BottomNav} options={{ headerShown: false }} />
//             <Stack.Screen name="login" component={Editprofile} options={{ headerShown: false }} />
//             {/* <Stack.Screen name="Register" component={Register} options={{ headerShown: false }} /> */}
//             {/* <Stack.Screen name="farmer" component={BottomNav} options={{ headerShown: false }} /> */}
//             {/* <Stack.Screen name="ProductDetail" component={Details} options={{ headerShown: false }} /> */}
//       </Stack.Navigator>
//     </NavigationContainer>
//   );
// };
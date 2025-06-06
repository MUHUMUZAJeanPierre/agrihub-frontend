import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import Onboarding from './Components/onboarding';
import Login from './Screens/Login';
import Register from './Screens/Register';
import BuyerDashboard from './Screens/BuyerDashboard';
import StackNavigation from './Navigation/stackNavigation';

const Stack = createStackNavigator();

export default function App() {
  return (
    <>
      <StackNavigation />
    </>
  );
}






import React, { useContext } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import BuyerDashboard from '../Screens/BuyerDashboard';

const Tab = createBottomTabNavigator();

export default function BottomNav() {
    // const { isLog, logged, darkmode } = useContext(Context);

    // const tabBarStyle = darkmode ? { backgroundColor: '#333333' } : { backgroundColor: '#FFFFFF' };
    // const tabBarActiveTintColor = darkmode ? '#4BA26A' : '#4BA26A';
    // const tabBarInactiveTintColor = darkmode ? '#AFB2B1' : '#AFB2B1';

    return (
        <Tab.Navigator
            screenOptions={{
                tabBarLabelStyle: { fontSize: 12 }
            }}
        >
                                <Tab.Screen name="Home" component={BuyerDashboard} options={{
                                    headerShown: false,
                                    tabBarIcon: ({ focused }) => <Ionicons name="home-outline" size={20} />
                                }} />
                                {/* <Tab.Screen name="Chat" component={Chat} options={{
                                    headerShown: false,
                                    tabBarActiveTintColor,
                                    tabBarInactiveTintColor,
                                    tabBarIcon: ({ focused }) => <Ionicons name="chatbox-outline" color={focused ? tabBarActiveTintColor : tabBarInactiveTintColor} size={20} />
                                }} />
                                <Tab.Screen name="Add" component={Addproduct} options={{
                                    headerShown: false,
                                    tabBarActiveTintColor,
                                    tabBarInactiveTintColor,
                                    tabBarIcon: ({ focused }) => <MaterialIcons name="add-to-photos" color={focused ? tabBarActiveTintColor : tabBarInactiveTintColor} size={20} />
                                }} /> */}
                               
        </Tab.Navigator>
    )
}

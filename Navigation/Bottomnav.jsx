import React, { useEffect, useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import BuyerDashboard from '../Screens/BuyerDashboard';
import Cart from '../Screens/Cart';
import ProfileScreen from '../Screens/Profile';
import Addproduct from '../Screens/Farmer/Addproduct';
import Farmerdash from '../Screens/Farmer/Farmerdash';
import Agronomistdash from '../Screens/Agronome/Agronomistdash';
import Chat from '../Screens/Farmer/Chat';
import AddBlog from '../Screens/Agronome/AddBlog';
import AgroChat from '../Screens/Agronome/chat';
import OrdersScreen from '../Screens/OrdersScreen';
import SearchScreen from '../Screens/SearchScreen';
import Animated from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/Ionicons';

const AnimatedIcon = Animated.createAnimatedComponent(Icon);

const Tab = createBottomTabNavigator();

const tabBarStyle = {
    height: 60,
    paddingBottom: 8,
    paddingTop: 4,
};

const tabBarActiveTintColor = '#4BA26A';
const tabBarInactiveTintColor = '#aaa';

export default function BottomNav() {
    const [userRole, setUserRole] = useState(null);

    useEffect(() => {
        const fetchUserRole = async () => {
            try {
                const userData = await AsyncStorage.getItem('@user_data');
                const parsed = JSON.parse(userData);
                setUserRole(parsed?.role || null);
            } catch (err) {
                console.error('Error loading user role:', err);
            }
        };
        fetchUserRole();
    }, []);

    if (!userRole) return null;

    return (
        <Tab.Navigator
            screenOptions={{
                tabBarStyle,
                tabBarLabelStyle: { fontSize: 12 },
                tabBarActiveTintColor,
                tabBarInactiveTintColor,
                headerShown: false,
            }}
        >
            {userRole === 'farmer' && (
                <>
                    <Tab.Screen
                        name="FarmerHome"
                        component={Farmerdash}
                        options={{
                            tabBarIcon: ({ focused }) => (
                                <Ionicons name="home-outline" size={20} color={focused ? tabBarActiveTintColor : tabBarInactiveTintColor} />
                            ),
                        }}
                    />
                    <Tab.Screen
                        name="Chat"
                        component={Chat}
                        options={{
                            tabBarIcon: ({ focused }) => (
                                <Ionicons name="chatbox-outline" size={20} color={focused ? tabBarActiveTintColor : tabBarInactiveTintColor} />
                            ),
                        }}
                    />
                    <Tab.Screen
                        name="Add Product"
                        component={Addproduct}
                        options={{
                            tabBarIcon: ({ focused }) => (
                                <MaterialIcons name="add-to-photos" size={20} color={focused ? tabBarActiveTintColor : tabBarInactiveTintColor} />
                            ),
                        }}
                    />
                    <Tab.Screen
                        name="Profile"
                        component={ProfileScreen}
                        options={{
                            tabBarIcon: ({ focused }) => (
                                <MaterialIcons name="person-outline" size={20} color={focused ? tabBarActiveTintColor : tabBarInactiveTintColor} />
                            ),
                        }}
                    />
                </>
            )}

            {userRole === 'plant pathologist' && (
                <>
                    <Tab.Screen
                        name="AgroHome"
                        component={Agronomistdash}
                        options={{
                            tabBarIcon: ({ focused }) => (
                                <Ionicons name="home-outline" size={20} color={focused ? tabBarActiveTintColor : tabBarInactiveTintColor} />
                            ),
                        }}
                    />
                    <Tab.Screen
                        name="Chat"
                        component={AgroChat}
                        options={{
                            tabBarIcon: ({ focused }) => (
                                <Ionicons name="chatbox-outline" size={20} color={focused ? tabBarActiveTintColor : tabBarInactiveTintColor} />
                            ),
                        }}
                    />
                    <Tab.Screen
                        name="Add Blog"
                        component={AddBlog}
                        options={{
                            tabBarIcon: ({ focused }) => (
                                <MaterialIcons name="add-to-photos" size={20} color={focused ? tabBarActiveTintColor : tabBarInactiveTintColor} />
                            ),
                        }}
                    />
                    <Tab.Screen
                        name="Profile"
                        component={ProfileScreen}
                        options={{
                            tabBarIcon: ({ focused }) => (
                                <MaterialIcons name="person-outline" size={20} color={focused ? tabBarActiveTintColor : tabBarInactiveTintColor} />
                            ),
                        }}
                    />
                </>
            )}

            {userRole === 'buyer' && (
                <>
                    <Tab.Screen
                        name="Home"
                        component={BuyerDashboard}
                        options={{
                            tabBarIcon: ({ focused }) => (
                                <Ionicons name="home-outline" size={23} color={focused ? tabBarActiveTintColor : tabBarInactiveTintColor} />
                            ),
                        }}
                    />
                    <Tab.Screen
                        name="Search"
                        component={SearchScreen}
                        options={{
                            tabBarIcon: ({ focused, color }) => (
                                <AnimatedIcon name="search-outline" size={23}  color={focused ? tabBarActiveTintColor : tabBarInactiveTintColor} />
                            ),
                        }}
                    />
                    <Tab.Screen
                        name="Orders"
                        component={OrdersScreen}
                        options={{
                            tabBarIcon: ({ focused, color }) => (
                                <AnimatedIcon name="receipt-outline" size={23}  color={focused ? tabBarActiveTintColor : tabBarInactiveTintColor} />
                            ),
                        }}
                    />
                    <Tab.Screen
                        name="Cart"
                        component={Cart}
                        options={{
                            tabBarIcon: ({ focused }) => (
                                <Ionicons name="cart-outline" size={23} color={focused ? tabBarActiveTintColor : tabBarInactiveTintColor} />
                            ),
                        }}
                    />
                    <Tab.Screen
                        name="Profile"
                        component={ProfileScreen}
                        options={{
                            tabBarIcon: ({ focused }) => (
                                <MaterialIcons name="person-outline" size={23} color={focused ? tabBarActiveTintColor : tabBarInactiveTintColor} />
                            ),
                        }}
                    />
                </>
            )}
        </Tab.Navigator>
    );
}

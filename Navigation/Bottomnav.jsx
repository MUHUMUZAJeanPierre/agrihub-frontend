import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import * as Animatable from 'react-native-animatable';

// Screens
import BuyerDashboard from '../Screens/BuyerDashboard';
import SearchScreen from '../Screens/SearchScreen';
import CartScreen from '../Screens/Cart';
import OrdersScreen from '../Screens/OrdersScreen';
import ProfileScreen from '../Screens/Profile';

const Tab = createBottomTabNavigator();

const AnimatedIcon = ({ name, focused, color }) => (
  <Animatable.View
    animation={focused ? 'bounceIn' : undefined}
    duration={800}
    useNativeDriver
  >
    <Ionicons name={name} size={22} color={color} />
  </Animatable.View>
);

export default function BottomNav() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarLabelStyle: { fontSize: 12 },
        tabBarActiveTintColor: '#4CAF50',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          elevation: 8,
          height: 60,
          paddingBottom: 5,
        },
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={BuyerDashboard}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <AnimatedIcon name="home-outline" focused={focused} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <AnimatedIcon name="search-outline" focused={focused} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Cart"
        component={CartScreen}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <AnimatedIcon name="cart-outline" focused={focused} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Orders"
        component={OrdersScreen}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <AnimatedIcon name="receipt-outline" focused={focused} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <AnimatedIcon name="person-outline" focused={focused} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

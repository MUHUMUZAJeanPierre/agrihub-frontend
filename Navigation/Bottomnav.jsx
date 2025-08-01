import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import BuyerDashboard from '../Screens/BuyerDashboard';
import Cart from '../Screens/Cart';
import ProfileScreen from '../Screens/Profile';
// import Addproduct from '../Screens/Farmer/Addproduct';
import Farmerdash from '../Screens/Farmer/Farmerdash';
import Agronomistdash from '../Screens/Agronome/Agronomistdash';
import Chat from '../Screens/Farmer/Chat';
import AddBlog from '../Screens/Agronome/AddBlog';
// import AgroChat from '../Screens/Agronome/chat';
import OrdersScreen from '../Screens/OrdersScreen';
import SearchScreen from '../Screens/SearchScreen';
import { useCart } from '../contexts/CartContext';
import { useTheme } from '../contexts/ThemeContext';
import Animated from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/Ionicons';
import FarmerOrderDashboard from '../Screens/Farmer/FarmerOrderDashboard';
import ProductManagementScreen from '../Screens/Farmer/ProductManagementScreen';
const AnimatedIcon = Animated.createAnimatedComponent(Icon);

const Tab = createBottomTabNavigator();

// Color Schemes
const LightColors = {
    primary: '#4A90E2',
    primaryDark: '#2D5AA0',
    secondary: '#FF6B35',
    accent: '#FFA726',
    background: '#FFFFFF',
    surface: '#F8F9FA',
    surfaceLight: '#F0F0F0',
    textPrimary: '#000000',
    textSecondary: '#666666',
    textTertiary: '#999999',
    success: '#4CAF50',
    warning: '#FF9800',
    error: '#F44336',
    cardBackground: '#FFFFFF',
    inputBackground: '#F5F5F5',
    borderColor: '#E0E0E0',
    gradient: ['#4A90E2', '#357ABD'],
    orangeGradient: ['#FF6B35', '#FF8A50'],
};

const DarkColors = {
    primary: '#4A90E2',
    primaryDark: '#2D5AA0',
    secondary: '#FF6B35',
    accent: '#FFA726',
    background: '#121212',
    surface: '#1E1E1E',
    surfaceLight: '#2C2C2C',
    textPrimary: '#FFFFFF',
    textSecondary: '#B0B0B0',
    textTertiary: '#808080',
    success: '#4CAF50',
    warning: '#FF9800',
    error: '#F44336',
    cardBackground: '#1A1A1A',
    inputBackground: '#2C2C2C',
    borderColor: '#3A3A3A',
    gradient: ['#4A90E2', '#357ABD'],
    orangeGradient: ['#FF6B35', '#FF8A50'],
};

// Custom Cart Icon with Badge Component
const CartIconWithBadge = ({ focused, size = 24, theme }) => {
    const { cartItems } = useCart();
    const itemCount = cartItems.length;
    const Colors = theme === 'dark' ? DarkColors : LightColors;
    const styles = getStyles(Colors);

    return (
        <View style={styles.iconContainer}>
            <Ionicons
                name="cart-outline"
                size={size}
                color={focused ? Colors.success : Colors.textTertiary}
            />
            {itemCount > 0 && (
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>
                        {itemCount > 99 ? '99+' : itemCount.toString()}
                    </Text>
                </View>
            )}
        </View>
    );
};

// Custom Orders Icon with Badge Component
const OrdersIconWithBadge = ({ focused, size = 24, pendingOrdersCount = 0, theme }) => {
    const Colors = theme === 'dark' ? DarkColors : LightColors;
    const styles = getStyles(Colors);

    return (
        <View style={styles.iconContainer}>
            <AnimatedIcon
                name="receipt-outline"
                size={size}
                color={focused ? Colors.success : Colors.textTertiary}
            />
            {pendingOrdersCount > 0 && (
                <View style={[styles.badge, styles.ordersBadge]}>
                    <Text style={styles.badgeText}>
                        {pendingOrdersCount > 99 ? '99+' : pendingOrdersCount.toString()}
                    </Text>
                </View>
            )}
        </View>
    );
};

// Custom Tab Bar Icon Component
const TabBarIcon = ({ iconName, iconType = 'Ionicons', focused, size = 24, theme }) => {
    const Colors = theme === 'dark' ? DarkColors : LightColors;
    const styles = getStyles(Colors);
    const IconComponent = iconType === 'MaterialIcons' ? MaterialIcons : Ionicons;

    return (
        <View style={styles.iconContainer}>
            <IconComponent
                name={iconName}
                size={size}
                color={focused ? Colors.success : Colors.textTertiary}
            />
        </View>
    );
};

export default function BottomNav() {
    const [userRole, setUserRole] = useState(null);
    const [pendingOrdersCount, setPendingOrdersCount] = useState(0);
    const { theme } = useTheme();
    const Colors = theme === 'dark' ? DarkColors : LightColors;
    const styles = getStyles(Colors);

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

    useEffect(() => {
        const fetchPendingOrders = async () => {
            try {
                // Replace with your actual API call to get pending orders
                // const response = await fetch('your-api-endpoint/pending-orders');
                // const data = await response.json();
                // setPendingOrdersCount(data.count || 0);

                // For now, using mock data - remove this when implementing real API
                setPendingOrdersCount(0);
            } catch (error) {
                console.error('Error fetching pending orders:', error);
            }
        };

        if (userRole === 'buyer') {
            fetchPendingOrders();
        }
    }, [userRole]);



    return (
        <Tab.Navigator
            screenOptions={{
                tabBarStyle: styles.tabBarStyle,
                tabBarLabelStyle: styles.tabBarLabelStyle,
                tabBarActiveTintColor: Colors.success,
                tabBarInactiveTintColor: Colors.textTertiary,
                headerShown: false,
                initialRouteName: userRole === 'farmer' ? 'Home' : 'BuyerDashboard',
                tabBarBackground: () => (
                    <View style={styles.tabBarBackground} />
                ),
            }}
        >
            {userRole === 'farmer' && (
                <>
                    <Tab.Screen
                        name="Home"
                        component={Farmerdash}
                        options={{
                            tabBarIcon: ({ focused }) => (
                                <TabBarIcon
                                    iconName="home-outline"
                                    focused={focused}
                                    theme={theme}
                                />
                            ),
                        }}
                    />

                    <Tab.Screen
                        name="Orders"
                        component={FarmerOrderDashboard}
                        options={{
                            tabBarIcon: ({ focused }) => (
                                <TabBarIcon
                                    iconName="receipt"
                                    iconType="MaterialIcons"
                                    focused={focused}
                                    theme={theme}
                                />
                            ),
                        }}
                    />
                    <Tab.Screen
                        name="chat"
                        component={Chat}
                        options={{
                            tabBarIcon: ({ focused }) => (
                                <TabBarIcon
                                    iconName="receipt"
                                    iconType="MaterialIcons"
                                    focused={focused}
                                    theme={theme}
                                />
                            ),
                        }}
                    />
                    <Tab.Screen
                        name="Product Detail"
                        component={ProductManagementScreen}
                        options={{
                            tabBarIcon: ({ focused }) => (
                                <TabBarIcon
                                    iconName="inventory"
                                    iconType="MaterialIcons"
                                    focused={focused}
                                    theme={theme}
                                />
                            ),
                        }}
                    />
                    <Tab.Screen
                        name="Profile"
                        component={ProfileScreen}
                        options={{
                            tabBarIcon: ({ focused }) => (
                                <TabBarIcon
                                    iconName="person-outline"
                                    iconType="MaterialIcons"
                                    focused={focused}
                                    theme={theme}
                                />
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
                                <TabBarIcon
                                    iconName="home-outline"
                                    focused={focused}
                                    theme={theme}
                                />
                            ),
                        }}
                    />
                    <Tab.Screen
                        name="chat"
                        component={Chat}
                        options={{
                            tabBarIcon: ({ focused }) => (
                                <TabBarIcon
                                    iconName="receipt"
                                    iconType="MaterialIcons"
                                    focused={focused}
                                    theme={theme}
                                />
                            ),
                        }}
                    />

                    <Tab.Screen
                        name="Add Blog"
                        component={AddBlog}
                        options={{
                            tabBarIcon: ({ focused }) => (
                                <TabBarIcon
                                    iconName="add-to-photos"
                                    iconType="MaterialIcons"
                                    focused={focused}
                                    theme={theme}
                                />
                            ),
                        }}
                    />
                    <Tab.Screen
                        name="Profile"
                        component={ProfileScreen}
                        options={{
                            tabBarIcon: ({ focused }) => (
                                <TabBarIcon
                                    iconName="person-outline"
                                    iconType="MaterialIcons"
                                    focused={focused}
                                    theme={theme}
                                />
                            ),
                        }}
                    />
                </>
            )}

            {(userRole === 'buyer' || !userRole) && (
                <>
                    <Tab.Screen
                        name="Home"
                        component={BuyerDashboard}
                        options={{
                            tabBarIcon: ({ focused }) => (
                                <TabBarIcon
                                    iconName="home-outline"
                                    focused={focused}
                                    theme={theme}
                                />
                            ),
                        }}
                    />
                    <Tab.Screen
                        name="Search"
                        component={SearchScreen}
                        options={{
                            tabBarIcon: ({ focused }) => (
                                <TabBarIcon
                                    iconName="search-outline"
                                    focused={focused}
                                    theme={theme}
                                />
                            ),
                        }}
                    />
                    <Tab.Screen
                        name="Orders"
                        component={OrdersScreen}
                        options={{
                            tabBarIcon: ({ focused }) => (
                                <OrdersIconWithBadge
                                    focused={focused}
                                    pendingOrdersCount={pendingOrdersCount}
                                    theme={theme}
                                />
                            ),
                        }}
                    />
                    <Tab.Screen
                        name="Cart"
                        component={Cart}
                        options={{
                            tabBarIcon: ({ focused }) => (
                                <CartIconWithBadge
                                    focused={focused}
                                    theme={theme}
                                />
                            ),
                        }}
                    />
                    <Tab.Screen
                        name="Profile"
                        component={ProfileScreen}
                        options={{
                            tabBarIcon: ({ focused }) => (
                                <TabBarIcon
                                    iconName="person-outline"
                                    iconType="MaterialIcons"
                                    focused={focused}
                                    theme={theme}
                                />
                            ),
                        }}
                    />
                </>
            )}
        </Tab.Navigator>
    );
}

const getStyles = (Colors) => {
    return StyleSheet.create({
        tabBarStyle: {
            height: Platform.OS === 'ios' ? 85 : 65,
            paddingBottom: Platform.OS === 'ios' ? 20 : 8,
            paddingTop: 3,
            backgroundColor: Colors.cardBackground,
            borderTopWidth: 0.1,
            borderTopColor: Colors.borderColor,
            shadowColor: '#000000',
            shadowOffset: {
                width: 0,
                height: -2,
            },
            shadowOpacity: 0.15,
            shadowRadius: 8,
            elevation: 10,
        },
        tabBarBackground: {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: Colors.cardBackground,
            borderTopWidth: 1,
            borderTopColor: Colors.borderColor,
        },
        tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '500',
            marginTop: 3,
            fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
        },
        iconContainer: {
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            paddingVertical: 4,
        },
        badge: {
            position: 'absolute',
            top: -6,
            right: -8,
            backgroundColor: Colors.error,
            borderRadius: 12,
            minWidth: 20,
            height: 20,
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 4,
            borderWidth: 2,
            borderColor: Colors.cardBackground,
            shadowColor: '#000000',
            shadowOffset: {
                width: 0,
                height: 2,
            },
            shadowOpacity: 0.25,
            shadowRadius: 3,
            elevation: 5,
        },
        ordersBadge: {
            backgroundColor: Colors.warning,
        },
        badgeText: {
            color: Colors.textPrimary,
            fontSize: 11,
            fontWeight: '700',
            textAlign: 'center',
            includeFontPadding: false,
            textAlignVertical: 'center',
            fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
        },
    });
};
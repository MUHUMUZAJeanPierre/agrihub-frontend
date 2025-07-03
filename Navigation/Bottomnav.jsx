// import React, { useEffect, useState } from 'react';
// import { View, Text, StyleSheet } from 'react-native';
// import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import Ionicons from 'react-native-vector-icons/Ionicons';
// import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

// import BuyerDashboard from '../Screens/BuyerDashboard';
// import Cart from '../Screens/Cart';
// import ProfileScreen from '../Screens/Profile';
// import Addproduct from '../Screens/Farmer/Addproduct';
// import Farmerdash from '../Screens/Farmer/Farmerdash';
// import Agronomistdash from '../Screens/Agronome/Agronomistdash';
// import Chat from '../Screens/Farmer/Chat';
// import AddBlog from '../Screens/Agronome/AddBlog';
// import AgroChat from '../Screens/Agronome/chat';
// import OrdersScreen from '../Screens/OrdersScreen';
// import SearchScreen from '../Screens/SearchScreen';
// import { useCart } from '../contexts/CartContext'; // Import the cart context
// import Animated from 'react-native-reanimated';
// import Icon from 'react-native-vector-icons/Ionicons';

// const AnimatedIcon = Animated.createAnimatedComponent(Icon);

// const Tab = createBottomTabNavigator();

// const tabBarStyle = {
//     height: 60,
//     paddingBottom: 8,
//     paddingTop: 4,
// };

// const tabBarActiveTintColor = '#4BA26A';
// const tabBarInactiveTintColor = '#aaa';

// // Custom Cart Icon with Badge Component
// const CartIconWithBadge = ({ focused, size = 23 }) => {
//     const { cartItems } = useCart();
//     const itemCount = cartItems.length;

//     return (
//         <View style={styles.cartIconContainer}>
//             <Ionicons 
//                 name="cart-outline" 
//                 size={size} 
//                 color={focused ? tabBarActiveTintColor : tabBarInactiveTintColor} 
//             />
//             {itemCount > 0 && (
//                 <View style={styles.badge}>
//                     <Text style={styles.badgeText}>
//                         {itemCount > 99 ? '99+' : itemCount.toString()}
//                     </Text>
//                 </View>
//             )}
//         </View>
//     );
// };

// // Custom Orders Icon with Badge Component (if you want to show pending orders count)
// const OrdersIconWithBadge = ({ focused, size = 23, pendingOrdersCount = 0 }) => {
//     return (
//         <View style={styles.cartIconContainer}>
//             <AnimatedIcon 
//                 name="receipt-outline" 
//                 size={size} 
//                 color={focused ? tabBarActiveTintColor : tabBarInactiveTintColor} 
//             />
//             {pendingOrdersCount > 0 && (
//                 <View style={[styles.badge, styles.ordersBadge]}>
//                     <Text style={styles.badgeText}>
//                         {pendingOrdersCount > 99 ? '99+' : pendingOrdersCount.toString()}
//                     </Text>
//                 </View>
//             )}
//         </View>
//     );
// };

// export default function BottomNav() {
//     const [userRole, setUserRole] = useState(null);
//     const [pendingOrdersCount, setPendingOrdersCount] = useState(0);

//     useEffect(() => {
//         const fetchUserRole = async () => {
//             try {
//                 const userData = await AsyncStorage.getItem('@user_data');
//                 const parsed = JSON.parse(userData);
//                 setUserRole(parsed?.role || null);
//             } catch (err) {
//                 console.error('Error loading user role:', err);
//             }
//         };
//         fetchUserRole();
//     }, []);

//     // Optional: Fetch pending orders count for orders tab
//     useEffect(() => {
//         const fetchPendingOrders = async () => {
//             try {
//                 // Replace with your actual API call to get pending orders
//                 // const response = await fetch('your-api-endpoint/pending-orders');
//                 // const data = await response.json();
//                 // setPendingOrdersCount(data.count || 0);
                
//                 // For now, using mock data - remove this when implementing real API
//                 setPendingOrdersCount(0);
//             } catch (error) {
//                 console.error('Error fetching pending orders:', error);
//             }
//         };

//         if (userRole === 'buyer') {
//             fetchPendingOrders();
//         }
//     }, [userRole]);

//     if (!userRole) return null;

//     return (
//         <Tab.Navigator
//             screenOptions={{
//                 tabBarStyle,
//                 tabBarLabelStyle: { fontSize: 12 },
//                 tabBarActiveTintColor,
//                 tabBarInactiveTintColor,
//                 headerShown: false,
//             }}
//         >
//             {userRole === 'farmer' && (
//                 <>
//                     <Tab.Screen
//                         name="Home"
//                         component={Farmerdash}
//                         options={{
//                             tabBarIcon: ({ focused }) => (
//                                 <Ionicons name="home-outline" size={20} color={focused ? tabBarActiveTintColor : tabBarInactiveTintColor} />
//                             ),
//                         }}
//                     />
//                     <Tab.Screen
//                         name="Chat"
//                         component={Chat}
//                         options={{
//                             tabBarIcon: ({ focused }) => (
//                                 <Ionicons name="chatbox-outline" size={20} color={focused ? tabBarActiveTintColor : tabBarInactiveTintColor} />
//                             ),
//                         }}
//                     />
//                     <Tab.Screen
//                         name="Add Product"
//                         component={Addproduct}
//                         options={{
//                             tabBarIcon: ({ focused }) => (
//                                 <MaterialIcons name="add-to-photos" size={20} color={focused ? tabBarActiveTintColor : tabBarInactiveTintColor} />
//                             ),
//                         }}
//                     />
//                     <Tab.Screen
//                         name="Profile"
//                         component={ProfileScreen}
//                         options={{
//                             tabBarIcon: ({ focused }) => (
//                                 <MaterialIcons name="person-outline" size={20} color={focused ? tabBarActiveTintColor : tabBarInactiveTintColor} />
//                             ),
//                         }}
//                     />
//                 </>
//             )}

//             {userRole === 'plant pathologist' && (
//                 <>
//                     <Tab.Screen
//                         name="AgroHome"
//                         component={Agronomistdash}
//                         options={{
//                             tabBarIcon: ({ focused }) => (
//                                 <Ionicons name="home-outline" size={20} color={focused ? tabBarActiveTintColor : tabBarInactiveTintColor} />
//                             ),
//                         }}
//                     />
//                     <Tab.Screen
//                         name="Chat"
//                         component={AgroChat}
//                         options={{
//                             tabBarIcon: ({ focused }) => (
//                                 <Ionicons name="chatbox-outline" size={20} color={focused ? tabBarActiveTintColor : tabBarInactiveTintColor} />
//                             ),
//                         }}
//                     />
//                     <Tab.Screen
//                         name="Add Blog"
//                         component={AddBlog}
//                         options={{
//                             tabBarIcon: ({ focused }) => (
//                                 <MaterialIcons name="add-to-photos" size={20} color={focused ? tabBarActiveTintColor : tabBarInactiveTintColor} />
//                             ),
//                         }}
//                     />
//                     <Tab.Screen
//                         name="Profile"
//                         component={ProfileScreen}
//                         options={{
//                             tabBarIcon: ({ focused }) => (
//                                 <MaterialIcons name="person-outline" size={20} color={focused ? tabBarActiveTintColor : tabBarInactiveTintColor} />
//                             ),
//                         }}
//                     />
//                 </>
//             )}

//             {userRole === 'buyer' && (
//                 <>
//                     <Tab.Screen
//                         name="Home"
//                         component={BuyerDashboard}
//                         options={{
//                             tabBarIcon: ({ focused }) => (
//                                 <Ionicons name="home-outline" size={23} color={focused ? tabBarActiveTintColor : tabBarInactiveTintColor} />
//                             ),
//                         }}
//                     />
//                     <Tab.Screen
//                         name="Search"
//                         component={SearchScreen}
//                         options={{
//                             tabBarIcon: ({ focused, color }) => (
//                                 <AnimatedIcon name="search-outline" size={23} color={focused ? tabBarActiveTintColor : tabBarInactiveTintColor} />
//                             ),
//                         }}
//                     />
//                     <Tab.Screen
//                         name="Orders"
//                         component={OrdersScreen}
//                         options={{
//                             tabBarIcon: ({ focused, color }) => (
//                                 <OrdersIconWithBadge 
//                                     focused={focused} 
//                                     pendingOrdersCount={pendingOrdersCount}
//                                 />
//                             ),
//                         }}
//                     />
//                     <Tab.Screen
//                         name="Cart"
//                         component={Cart}
//                         options={{
//                             tabBarIcon: ({ focused }) => (
//                                 <CartIconWithBadge focused={focused} />
//                             ),
//                         }}
//                     />
//                     <Tab.Screen
//                         name="Profile"
//                         component={ProfileScreen}
//                         options={{
//                             tabBarIcon: ({ focused }) => (
//                                 <MaterialIcons name="person-outline" size={23} color={focused ? tabBarActiveTintColor : tabBarInactiveTintColor} />
//                             ),
//                         }}
//                     />
//                 </>
//             )}
//         </Tab.Navigator>
//     );
// }

// const styles = StyleSheet.create({
//     cartIconContainer: {
//         position: 'relative',
//         alignItems: 'center',
//         justifyContent: 'center',
//     },
//     badge: {
//         position: 'absolute',
//         top: -8,
//         right: -8,
//         backgroundColor: '#FF4444',
//         borderRadius: 10,
//         minWidth: 20,
//         height: 20,
//         justifyContent: 'center',
//         alignItems: 'center',
//         paddingHorizontal: 4,
//         borderWidth: 2,
//         borderColor: '#FFFFFF',
//     },
//     ordersBadge: {
//         backgroundColor: '#FF8C42', 
//     },
//     badgeText: {
//         color: '#FFFFFF',
//         fontSize: 11,
//         fontWeight: '700',
//         textAlign: 'center',
//         includeFontPadding: false,
//         textAlignVertical: 'center',
//     },
// });





import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
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
import { useCart } from '../contexts/CartContext';
import { useTheme } from '../contexts/ThemeContext';
import Animated from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/Ionicons';

const AnimatedIcon = Animated.createAnimatedComponent(Icon);

const Tab = createBottomTabNavigator();

// Custom Cart Icon with Badge Component
const CartIconWithBadge = ({ focused, size = 24, theme }) => {
    const { cartItems } = useCart();
    const itemCount = cartItems.length;
    const styles = getStyles(theme);
    const isDark = theme === 'dark';

    return (
        <View style={styles.iconContainer}>
            <Ionicons 
                name="cart-outline" 
                size={size} 
                color={focused ? styles.activeColor : styles.inactiveColor} 
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
    const styles = getStyles(theme);
    
    return (
        <View style={styles.iconContainer}>
            <AnimatedIcon 
                name="receipt-outline" 
                size={size} 
                color={focused ? styles.activeColor : styles.inactiveColor} 
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
    const styles = getStyles(theme);
    const IconComponent = iconType === 'MaterialIcons' ? MaterialIcons : Ionicons;
    
    return (
        <View style={styles.iconContainer}>
            <IconComponent 
                name={iconName} 
                size={size} 
                color={focused ? styles.activeColor : styles.inactiveColor} 
            />
        </View>
    );
};

export default function BottomNav() {
    const [userRole, setUserRole] = useState(null);
    const [pendingOrdersCount, setPendingOrdersCount] = useState(0);
    const { theme } = useTheme();
    const styles = getStyles(theme);
    const isDark = theme === 'dark';

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

    if (!userRole) return null;

    return (
        <Tab.Navigator
            screenOptions={{
                tabBarStyle: styles.tabBarStyle,
                tabBarLabelStyle: styles.tabBarLabelStyle,
                tabBarActiveTintColor: styles.activeColor,
                tabBarInactiveTintColor: styles.inactiveColor,
                headerShown: false,
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
                        name="Chat"
                        component={Chat}
                        options={{
                            tabBarIcon: ({ focused }) => (
                                <TabBarIcon 
                                    iconName="chatbox-outline" 
                                    focused={focused} 
                                    theme={theme}
                                />
                            ),
                        }}
                    />
                    <Tab.Screen
                        name="Add Product"
                        component={Addproduct}
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
                        name="Chat"
                        component={AgroChat}
                        options={{
                            tabBarIcon: ({ focused }) => (
                                <TabBarIcon 
                                    iconName="chatbox-outline" 
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

            {userRole === 'buyer' && (
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

const getStyles = (theme) => {
    const isDark = theme === 'dark';
    
    return StyleSheet.create({
        tabBarStyle: {
            height: Platform.OS === 'ios' ? 85 : 65,
            paddingBottom: Platform.OS === 'ios' ? 20 : 8,
            paddingTop: 8,
            backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
            borderTopWidth: 1,
            borderTopColor: isDark ? '#2C2C2E' : '#E5E5E5',
            shadowColor: isDark ? '#000000' : '#000000',
            shadowOffset: {
                width: 0,
                height: -2,
            },
            shadowOpacity: isDark ? 0.25 : 0.1,
            shadowRadius: 8,
            elevation: 10,
        },
        tabBarBackground: {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
            borderTopWidth: 1,
            borderTopColor: isDark ? '#2C2C2E' : '#E5E5E5',
        },
        tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '500',
            marginTop: 2,
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
            backgroundColor: '#FF4444',
            borderRadius: 12,
            minWidth: 20,
            height: 20,
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 4,
            borderWidth: 2,
            borderColor: isDark ? '#1C1C1E' : '#FFFFFF',
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
            backgroundColor: '#FF8C42',
        },
        badgeText: {
            color: '#FFFFFF',
            fontSize: 11,
            fontWeight: '700',
            textAlign: 'center',
            includeFontPadding: false,
            textAlignVertical: 'center',
            fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
        },
        activeColor: isDark ? '#4BA26A' : '#4BA26A',
        inactiveColor: isDark ? '#8E8E93' : '#999999',
    });
};




// import React, { useEffect, useState } from 'react';
// import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
// import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import Ionicons from 'react-native-vector-icons/Ionicons';
// import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

// import BuyerDashboard from '../Screens/BuyerDashboard';
// import Cart from '../Screens/Cart';
// import ProfileScreen from '../Screens/Profile';
// import Addproduct from '../Screens/Farmer/Addproduct';
// import Farmerdash from '../Screens/Farmer/Farmerdash';
// import Agronomistdash from '../Screens/Agronome/Agronomistdash';
// import Chat from '../Screens/Farmer/Chat';
// import AddBlog from '../Screens/Agronome/AddBlog';
// import AgroChat from '../Screens/Agronome/chat';
// import OrdersScreen from '../Screens/OrdersScreen';
// import SearchScreen from '../Screens/SearchScreen';
// import { useCart } from '../contexts/CartContext'; // Import the cart context

// const Tab = createBottomTabNavigator();

// // Custom Cart Icon with Badge Component
// const CartIconWithBadge = ({ focused, color, size = 20 }) => {
//     const { cartItems } = useCart();
//     const itemCount = cartItems.length;

//     return (
//         <View style={styles.iconContainer}>
//             <Ionicons 
//                 name="cart" 
//                 size={size} 
//                 color={color} 
//             />
//             {itemCount > 0 && (
//                 <View style={styles.badge}>
//                     <Text style={styles.badgeText}>
//                         {itemCount > 99 ? '99+' : itemCount.toString()}
//                     </Text>
//                 </View>
//             )}
//         </View>
//     );
// };

// // Custom Orders Icon with Badge Component
// const OrdersIconWithBadge = ({ focused, color, size = 24, pendingOrdersCount = 0 }) => {
//     return (
//         <View style={styles.iconContainer}>
//             <Ionicons 
//                 name="heart" 
//                 size={size} 
//                 color={color} 
//             />
//             {pendingOrdersCount > 0 && (
//                 <View style={[styles.badge, styles.ordersBadge]}>
//                     <Text style={styles.badgeText}>
//                         {pendingOrdersCount > 99 ? '99+' : pendingOrdersCount.toString()}
//                     </Text>
//                 </View>
//             )}
//         </View>
//     );
// };

// // Custom Tab Bar Component
// function CustomTabBar({ state, descriptors, navigation }) {
//     return (
//         <View style={styles.tabBarContainer}>
//             <View style={styles.tabBar}>
//                 {state.routes.map((route, index) => {
//                     const { options } = descriptors[route.key];
//                     const isFocused = state.index === index;
//                     const isMiddle = index === Math.floor(state.routes.length / 2);

//                     const onPress = () => {
//                         const event = navigation.emit({
//                             type: 'tabPress',
//                             target: route.key,
//                             canPreventDefault: true,
//                         });

//                         if (!isFocused && !event.defaultPrevented) {
//                             navigation.navigate(route.name);
//                         }
//                     };

//                     // Get the icon component from options
//                     const iconComponent = options.tabBarIcon ? 
//                         options.tabBarIcon({ focused: isFocused, color: isFocused ? '#fff' : '#666' }) : 
//                         null;

//                     return (
//                         <TouchableOpacity
//                             key={route.key}
//                             onPress={onPress}
//                             style={[
//                                 styles.tabButton,
//                                 isMiddle && styles.centerButton,
//                                 isFocused && !isMiddle && styles.activeButton
//                             ]}
//                             activeOpacity={0.7}
//                         >
//                             {iconComponent}
//                         </TouchableOpacity>
//                     );
//                 })}
//             </View>
//         </View>
//     );
// }

// export default function BottomNav() {
//     const [userRole, setUserRole] = useState(null);
//     const [pendingOrdersCount, setPendingOrdersCount] = useState(0);

//     useEffect(() => {
//         const fetchUserRole = async () => {
//             try {
//                 const userData = await AsyncStorage.getItem('@user_data');
//                 const parsed = JSON.parse(userData);
//                 setUserRole(parsed?.role || null);
//             } catch (err) {
//                 console.error('Error loading user role:', err);
//             }
//         };
//         fetchUserRole();
//     }, []);

//     // Optional: Fetch pending orders count for orders tab
//     useEffect(() => {
//         const fetchPendingOrders = async () => {
//             try {
//                 // Replace with your actual API call to get pending orders
//                 // const response = await fetch('your-api-endpoint/pending-orders');
//                 // const data = await response.json();
//                 // setPendingOrdersCount(data.count || 0);
                
//                 // For now, using mock data - remove this when implementing real API
//                 setPendingOrdersCount(0);
//             } catch (error) {
//                 console.error('Error fetching pending orders:', error);
//             }
//         };

//         if (userRole === 'buyer') {
//             fetchPendingOrders();
//         }
//     }, [userRole]);

//     if (!userRole) return null;

//     return (
//         <Tab.Navigator
//             tabBar={(props) => <CustomTabBar {...props} />}
//             screenOptions={{
//                 headerShown: false,
//             }}
//         >
//             {userRole === 'farmer' && (
//                 <>
//                     <Tab.Screen
//                         name="Home"
//                         component={Farmerdash}
//                         options={{
//                             tabBarIcon: ({ focused, color }) => (
//                                 <Ionicons name="home" size={22} color={color} />
//                             ),
//                         }}
//                     />
//                     <Tab.Screen
//                         name="Chat"
//                         component={Chat}
//                         options={{
//                             tabBarIcon: ({ focused, color }) => (
//                                 <Ionicons name="chatbox" size={20} color={color} />
//                             ),
//                         }}
//                     />
//                     <Tab.Screen
//                         name="Add Product"
//                         component={Addproduct}
//                         options={{
//                             tabBarIcon: ({ focused, color }) => (
//                                 <MaterialIcons name="add-to-photos" size={24} color="#fff" />
//                             ),
//                         }}
//                     />
//                     <Tab.Screen
//                         name="Orders"
//                         component={OrdersScreen}
//                         options={{
//                             tabBarIcon: ({ focused, color }) => (
//                                 <Ionicons name="receipt" size={20} color={color} />
//                             ),
//                         }}
//                     />
//                     <Tab.Screen
//                         name="Profile"
//                         component={ProfileScreen}
//                         options={{
//                             tabBarIcon: ({ focused, color }) => (
//                                 <Ionicons name="person" size={20} color={color} />
//                             ),
//                         }}
//                     />
//                 </>
//             )}

//             {userRole === 'plant pathologist' && (
//                 <>
//                     <Tab.Screen
//                         name="AgroHome"
//                         component={Agronomistdash}
//                         options={{
//                             tabBarIcon: ({ focused, color }) => (
//                                 <Ionicons name="home" size={22} color={color} />
//                             ),
//                         }}
//                     />
//                     <Tab.Screen
//                         name="Chat"
//                         component={AgroChat}
//                         options={{
//                             tabBarIcon: ({ focused, color }) => (
//                                 <Ionicons name="chatbox" size={20} color={color} />
//                             ),
//                         }}
//                     />
//                     <Tab.Screen
//                         name="Add Blog"
//                         component={AddBlog}
//                         options={{
//                             tabBarIcon: ({ focused, color }) => (
//                                 <MaterialIcons name="add-to-photos" size={24} color="#fff" />
//                             ),
//                         }}
//                     />
//                     <Tab.Screen
//                         name="Orders"
//                         component={OrdersScreen}
//                         options={{
//                             tabBarIcon: ({ focused, color }) => (
//                                 <OrdersIconWithBadge 
//                                     focused={focused} 
//                                     color={color}
//                                     pendingOrdersCount={pendingOrdersCount}
//                                 />
//                             ),
//                         }}
//                     />
//                     <Tab.Screen
//                         name="Profile"
//                         component={ProfileScreen}
//                         options={{
//                             tabBarIcon: ({ focused, color }) => (
//                                 <Ionicons name="person" size={20} color={color} />
//                             ),
//                         }}
//                     />
//                 </>
//             )}

//             {userRole === 'buyer' && (
//                 <>
//                     <Tab.Screen
//                         name="Home"
//                         component={BuyerDashboard}
//                         options={{
//                             tabBarIcon: ({ focused, color }) => (
//                                 <Ionicons name="home" size={22} color={color} />
//                             ),
//                         }}
//                     />
//                     <Tab.Screen
//                         name="Search"
//                         component={SearchScreen}
//                         options={{
//                             tabBarIcon: ({ focused, color }) => (
//                                 <Ionicons name="search" size={20} color={color} />
//                             ),
//                         }}
//                     />
//                     <Tab.Screen
//                         name="Orders"
//                         component={OrdersScreen}
//                         options={{
//                             tabBarIcon: ({ focused, color }) => (
//                                 <OrdersIconWithBadge 
//                                     focused={focused} 
//                                     color={color}
//                                     pendingOrdersCount={pendingOrdersCount}
//                                 />
//                             ),
//                         }}
//                     />
//                     <Tab.Screen
//                         name="Cart"
//                         component={Cart}
//                         options={{
//                             tabBarIcon: ({ focused, color }) => (
//                                 <CartIconWithBadge 
//                                     focused={focused} 
//                                     color={color}
//                                 />
//                             ),
//                         }}
//                     />
//                     <Tab.Screen
//                         name="Profile"
//                         component={ProfileScreen}
//                         options={{
//                             tabBarIcon: ({ focused, color }) => (
//                                 <Ionicons name="person" size={20} color={color} />
//                             ),
//                         }}
//                     />
//                 </>
//             )}
//         </Tab.Navigator>
//     );
// }

// const styles = StyleSheet.create({
//     tabBarContainer: {
//         position: 'absolute',
//         bottom: 5,
//         left: 10,
//         right: 10,
//     },
//     tabBar: {
//         flexDirection: 'row',
//         backgroundColor: 'rgba(26, 26, 26, 0.9)',
//         borderRadius: 35,
//         paddingVertical: 8,
//         paddingHorizontal: 20,
//         alignItems: 'center',
//         justifyContent: 'space-between',
//         shadowColor: 'rgba(0, 0, 0, 0.6)',
//         shadowOffset: {
//             width: 0,
//             height: 4,
//         },
//         shadowOpacity: 0.3,
//         shadowRadius: 8,
//         elevation: 8,
//         minWidth: 280,
//     },
//     tabButton: {
//         paddingVertical: 8,
//         paddingHorizontal: 12,
//         borderRadius: 20,
//         alignItems: 'center',
//         justifyContent: 'center',
//         minWidth: 40,
//         minHeight: 40,
//     },
//     centerButton: {
//         backgroundColor: '#fff',
//         borderRadius: 25,
//         width: 50,
//         height: 50,
//         marginHorizontal: 5,
//         shadowColor: '#000',
//         shadowOffset: {
//             width: 0,
//             height: 2,
//         },
//         shadowOpacity: 0.2,
//         shadowRadius: 4,
//         elevation: 4,
//     },
//     activeButton: {
//         backgroundColor: 'rgba(255, 255, 255, 0.1)',
//         borderRadius: 25,
//         width: 50,
//         height: 50,
//     },
//     iconContainer: {
//         position: 'relative',
//         alignItems: 'center',
//         justifyContent: 'center',
//     },
//     badge: {
//         position: 'absolute',
//         top: -8,
//         right: -8,
//         backgroundColor: '#FF4444',
//         borderRadius: 10,
//         minWidth: 20,
//         height: 20,
//         justifyContent: 'center',
//         alignItems: 'center',
//         paddingHorizontal: 4,
//         borderWidth: 2,
//         borderColor: '#FFFFFF',
//     },
//     ordersBadge: {
//         backgroundColor: '#FF8C42',
//     },
//     badgeText: {
//         color: '#FFFFFF',
//         fontSize: 11,
//         fontWeight: '700',
//         textAlign: 'center',
//         includeFontPadding: false,
//         textAlignVertical: 'center',
//     },
// });
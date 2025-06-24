// import React, { useEffect, useState } from 'react';
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

// export default function BottomNav() {
//     const [userRole, setUserRole] = useState(null);

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
//                                 <AnimatedIcon name="search-outline" size={23}  color={focused ? tabBarActiveTintColor : tabBarInactiveTintColor} />
//                             ),
//                         }}
//                     />
//                     <Tab.Screen
//                         name="Orders"
//                         component={OrdersScreen}
//                         options={{
//                             tabBarIcon: ({ focused, color }) => (
//                                 <AnimatedIcon name="receipt-outline" size={23}  color={focused ? tabBarActiveTintColor : tabBarInactiveTintColor} />
//                             ),
//                         }}
//                     />
//                     <Tab.Screen
//                         name="Cart"
//                         component={Cart}
//                         options={{
//                             tabBarIcon: ({ focused }) => (
//                                 <Ionicons name="cart-outline" size={23} color={focused ? tabBarActiveTintColor : tabBarInactiveTintColor} />
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




import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
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

const Tab = createBottomTabNavigator();

// Custom Tab Bar Component
function CustomTabBar({ state, descriptors, navigation }) {
    return (
        <View style={styles.tabBarContainer}>
            <View style={styles.tabBar}>
                {state.routes.map((route, index) => {
                    const { options } = descriptors[route.key];
                    const isFocused = state.index === index;
                    const isMiddle = index === Math.floor(state.routes.length / 2);

                    const onPress = () => {
                        const event = navigation.emit({
                            type: 'tabPress',
                            target: route.key,
                            canPreventDefault: true,
                        });

                        if (!isFocused && !event.defaultPrevented) {
                            navigation.navigate(route.name);
                        }
                    };

                    // Get the icon component from options
                    const iconComponent = options.tabBarIcon ? 
                        options.tabBarIcon({ focused: isFocused, color: isFocused ? '#fff' : '#666' }) : 
                        null;

                    return (
                        <TouchableOpacity
                            key={route.key}
                            onPress={onPress}
                            style={[
                                styles.tabButton,
                                isMiddle && styles.centerButton,
                                isFocused && !isMiddle && styles.activeButton
                            ]}
                            activeOpacity={0.7}
                        >
                            {iconComponent}
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
}

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
            tabBar={(props) => <CustomTabBar {...props} />}
            screenOptions={{
                headerShown: false,
            }}
        >
            {userRole === 'farmer' && (
                <>
                    <Tab.Screen
                        name="Home"
                        component={Farmerdash}
                        options={{
                            tabBarIcon: ({ focused, color }) => (
                                <Ionicons name="home" size={22} color={color} />
                            ),
                        }}
                    />
                    <Tab.Screen
                        name="Chat"
                        component={Chat}
                        options={{
                            tabBarIcon: ({ focused, color }) => (
                                <Ionicons name="chatbox" size={20} color={color} />
                            ),
                        }}
                    />
                    <Tab.Screen
                        name="Add Product"
                        component={Addproduct}
                        options={{
                            tabBarIcon: ({ focused, color }) => (
                                <Ionicons name="heart" size={24} color="#fff" />
                            ),
                        }}
                    />
                    <Tab.Screen
                        name="Orders"
                        component={OrdersScreen}
                        options={{
                            tabBarIcon: ({ focused, color }) => (
                                <Ionicons name="receipt" size={20} color={color} />
                            ),
                        }}
                    />
                    <Tab.Screen
                        name="Profile"
                        component={ProfileScreen}
                        options={{
                            tabBarIcon: ({ focused, color }) => (
                                <Ionicons name="person" size={20} color={color} />
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
                            tabBarIcon: ({ focused, color }) => (
                                <Ionicons name="home" size={22} color={color} />
                            ),
                        }}
                    />
                    <Tab.Screen
                        name="Chat"
                        component={AgroChat}
                        options={{
                            tabBarIcon: ({ focused, color }) => (
                                <Ionicons name="chatbox" size={20} color={color} />
                            ),
                        }}
                    />
                    <Tab.Screen
                        name="Add Blog"
                        component={AddBlog}
                        options={{
                            tabBarIcon: ({ focused, color }) => (
                                <Ionicons name="heart" size={24} color="#fff" />
                            ),
                        }}
                    />
                    <Tab.Screen
                        name="Orders"
                        component={OrdersScreen}
                        options={{
                            tabBarIcon: ({ focused, color }) => (
                                <Ionicons name="receipt" size={20} color={color} />
                            ),
                        }}
                    />
                    <Tab.Screen
                        name="Profile"
                        component={ProfileScreen}
                        options={{
                            tabBarIcon: ({ focused, color }) => (
                                <Ionicons name="person" size={20} color={color} />
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
                            tabBarIcon: ({ focused, color }) => (
                                <Ionicons name="home" size={22} color={color} />
                            ),
                        }}
                    />
                    <Tab.Screen
                        name="Search"
                        component={SearchScreen}
                        options={{
                            tabBarIcon: ({ focused, color }) => (
                                <Ionicons name="lock-closed" size={20} color={color} />
                            ),
                        }}
                    />
                    <Tab.Screen
                        name="Orders"
                        component={OrdersScreen}
                        options={{
                            tabBarIcon: ({ focused, color }) => (
                                <Ionicons name="heart" size={24} color="#fff" />
                            ),
                        }}
                    />
                    <Tab.Screen
                        name="Cart"
                        component={Cart}
                        options={{
                            tabBarIcon: ({ focused, color }) => (
                                <Ionicons name="chatbox" size={20} color={color} />
                            ),
                        }}
                    />
                    <Tab.Screen
                        name="Profile"
                        component={ProfileScreen}
                        options={{
                            tabBarIcon: ({ focused, color }) => (
                                <Ionicons name="person" size={20} color={color} />
                            ),
                        }}
                    />
                </>
            )}
        </Tab.Navigator>
    );
}

const styles = StyleSheet.create({
    tabBarContainer: {
        position: 'absolute',
        bottom: 5,
        left: 10,
        right: 10,
    },
    tabBar: {
        flexDirection: 'row',
        backgroundColor: 'rgba(26, 26, 26, 0.9)',
        borderRadius: 35,
        paddingVertical: 8,
        paddingHorizontal: 20,
        alignItems: 'center',
        justifyContent: 'space-between',
        shadowColor: 'rgba(0, 0, 0, 0.6)',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
        minWidth: 280,
    },
    tabButton: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 40,
        minHeight: 40,
    },
    // centerButton: {
    //     backgroundColor: '#fff',
    //     borderRadius: 25,
    //     width: 50,
    //     height: 50,
    //     marginHorizontal: 5,
    //     shadowColor: '#000',
    //     shadowOffset: {
    //         width: 0,
    //         height: 2,
    //     },
    //     shadowOpacity: 0.2,
    //     shadowRadius: 4,
    //     elevation: 4,
    // },
    activeButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 25,
        width: 50,
        height: 50,
    },
});
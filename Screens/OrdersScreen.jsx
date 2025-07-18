import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  Dimensions,
  StatusBar,
  Animated,
  Easing,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import * as SecureStore from 'expo-secure-store';
import { useTheme } from '../contexts/ThemeContext';

const { width } = Dimensions.get('window');
const API_CONFIG = {
  ORDERS_URL: 'https://agrihub-backend-4z99.onrender.com/api/orders/get-order-by-user',
};

const AUTH_KEYS = {
  TOKEN: 'auth_token',
  USER_ID: 'user_id',
};

const OrdersScreen = () => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState('current');
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const tabAnimationValue = useRef(new Animated.Value(0)).current;
  const refreshRotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setIsLoading(true);
        const token = await SecureStore.getItemAsync(AUTH_KEYS.TOKEN);
        const userId = await SecureStore.getItemAsync(AUTH_KEYS.USER_ID);
        
        if (!token) {
          Alert.alert('Authentication Required', 'Please log in to view orders.');
          setIsLoading(false);
          return;
        }

        if (!userId) {
          Alert.alert('User ID Required', 'Unable to fetch user orders. Please log in again.');
          setIsLoading(false);
          return;
        }

        // Create URL with user ID as query parameter
        const url = `${API_CONFIG.ORDERS_URL}?userId=${userId}`;
        
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          console.log('API Response:', data);

          if (Array.isArray(data)) {
            setOrders(data);
          } else {
            console.error('Expected an array but received:', data);
            setOrders([]);
          }
        } else {
          const errorData = await response.json().catch(() => ({}));
          console.error('API Response Error:', errorData);
          
          if (response.status === 404) {
            setOrders([]);
          } else {
            Alert.alert(
              'Error fetching orders', 
              errorData.message || errorData.error || 'Something went wrong. Please try again.'
            );
          }
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
        Alert.alert('Network Error', 'Failed to fetch orders. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Animate tab change
  useEffect(() => {
    Animated.timing(tabAnimationValue, {
      toValue: activeTab === 'current' ? 0 : 1,
      duration: 300,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [activeTab]);

  const parsePrice = (priceString) => {
    if (typeof priceString === 'number') return priceString;
    if (typeof priceString === 'string') {
      const numericValue = priceString.replace(/[^\d]/g, '');
      return parseInt(numericValue, 10) || 0;
    }
    return 0;
  };

  const calculateOrderTotal = (order) => {
    if (order.totalAmount && typeof order.totalAmount === 'number') {
      return order.totalAmount;
    }
    
    return order.items.reduce((total, item) => {
      if (!item || !item.product) {
        return total;
      }
      const price = parsePrice(item.product.current_price);
      return total + (price * (item.quantity || 0));
    }, 0);
  };

  const getStatusBadgeColor = (status) => {
    const statusLower = status.toLowerCase();
    const isDark = theme === 'dark';
    
    switch (statusLower) {
      case 'pending':
        return isDark
          ? { bg: '#3A2E1A', text: '#FFD700', border: '#5A4A2A' }
          : { bg: '#FFF3CD', text: '#856404', border: '#FFEAA7' };
      case 'processing':
        return isDark
          ? { bg: '#1A2E3A', text: '#87CEEB', border: '#2A4A5A' }
          : { bg: '#D1ECF1', text: '#0C5460', border: '#BEE5EB' };
      case 'shipped':
        return isDark
          ? { bg: '#2A2A3A', text: '#C8C8D0', border: '#3A3A4A' }
          : { bg: '#E2E3F1', text: '#383D41', border: '#C5C6D0' };
      case 'delivered':
        return isDark
          ? { bg: '#1A3A1A', text: '#90EE90', border: '#2A5A2A' }
          : { bg: '#D4EDDA', text: '#155724', border: '#C3E6CB' };
      case 'cancelled':
        return isDark
          ? { bg: '#3A1A1A', text: '#FFB6C1', border: '#5A2A2A' }
          : { bg: '#F8D7DA', text: '#721C24', border: '#F5C6CB' };
      default:
        return isDark
          ? { bg: '#2A2A2A', text: '#B0B0B0', border: '#3A3A3A' }
          : { bg: '#F8F9FA', text: '#6C757D', border: '#DEE2E6' };
    }
  };

  const getStatusIcon = (status) => {
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case 'pending':
        return 'time-outline';
      case 'processing':
        return 'sync-outline';
      case 'shipped':
        return 'car-outline';
      case 'delivered':
        return 'checkmark-circle-outline';
      case 'cancelled':
        return 'close-circle-outline';
      default:
        return 'help-circle-outline';
    }
  };

  const filterOrders = () => {
    if (!orders || !Array.isArray(orders)) return [];

    if (activeTab === 'current') {
      return orders.filter(order => {
        const status = order.status?.toLowerCase() || 'pending';
        return ['pending', 'processing', 'shipped'].includes(status);
      });
    } else {
      return orders.filter(order => {
        const status = order.status?.toLowerCase() || 'pending';
        return ['delivered', 'cancelled'].includes(status);
      });
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getItemDisplayName = (item) => {
    if (!item) return 'Unknown item';
    if (!item.product) return 'Product unavailable';
    return item.product.title || 'Untitled product';
  };

  const getValidItemsCount = (items) => {
    return items.filter(item => item && item.product).length;
  };

  const AnimatedOrderCard = ({ item, index }) => {
    const slideAnim = useRef(new Animated.Value(50)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.95)).current;

    useEffect(() => {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 600,
          delay: index * 100,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 600,
          delay: index * 100,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 600,
          delay: index * 100,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    }, []);

    const orderTotal = calculateOrderTotal(item);
    const statusColors = getStatusBadgeColor(item.status);
    const statusIcon = getStatusIcon(item.status);
    const validItemsCount = getValidItemsCount(item.items);
    const isDark = theme === 'dark';

    return (
      <Animated.View
        style={[
          {
            transform: [
              { translateY: slideAnim },
              { scale: scaleAnim }
            ],
            opacity: opacityAnim,
          }
        ]}
      >
        <TouchableOpacity 
          style={[
            styles.orderCard,
            { 
              backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
              shadowColor: isDark ? '#000000' : '#000000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: isDark ? 0.3 : 0.1,
              shadowRadius: 12,
              elevation: 8,
            }
          ]} 
          activeOpacity={0.9}
          onPress={() => {
            // Add haptic feedback or navigation here
            console.log('Order pressed:', item._id);
          }}
        >
          <View style={styles.orderHeader}>
            <View style={styles.orderInfo}>
              <Text style={[
                styles.orderNumber,
                { color: isDark ? '#FFFFFF' : '#1C1C1E' }
              ]}>
                Order #{item._id.slice(-8)}
              </Text>
              <View style={styles.dateContainer}>
                <Ionicons 
                  name="calendar-outline" 
                  size={14} 
                  color={isDark ? '#8E8E93' : '#8E8E93'} 
                />
                <Text style={[
                  styles.orderDate,
                  { color: isDark ? '#8E8E93' : '#8E8E93' }
                ]}>
                  {formatDate(item.createdAt)}
                </Text>
              </View>
            </View>
            <Animated.View style={[
              styles.statusBadge, 
              { 
                backgroundColor: statusColors.bg,
                borderColor: statusColors.border,
                transform: [{ scale: 1 }]
              }
            ]}>
              <Ionicons name={statusIcon} size={16} color={statusColors.text} />
              <Text style={[styles.statusText, { color: statusColors.text }]}>
                {item.status}
              </Text>
            </Animated.View>
          </View>

          <View style={styles.orderDetails}>
            <View style={styles.orderSummary}>
              <View style={styles.itemsContainer}>
                <View style={[
                  styles.itemsIconContainer,
                  { backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7' }
                ]}>
                  <Ionicons 
                    name="basket-outline" 
                    size={18} 
                    color="#2E7D31" 
                  />
                </View>
                <Text style={[
                  styles.itemsText,
                  { color: isDark ? '#8E8E93' : '#8E8E93' }
                ]}>
                  {validItemsCount} item{validItemsCount > 1 ? 's' : ''}
                </Text>
              </View>
              <View style={styles.totalContainer}>
                <Text style={[
                  styles.totalLabel,
                  { color: isDark ? '#8E8E93' : '#8E8E93' }
                ]}>
                  Total
                </Text>
                <Text style={styles.orderTotal}>
                  RWF {orderTotal.toLocaleString()}
                </Text>
              </View>
            </View>

            <View style={styles.itemsPreviewContainer}>
              <Text style={[
                styles.itemsPreviewLabel,
                { color: isDark ? '#8E8E93' : '#8E8E93' }
              ]}>
                Items:
              </Text>
              <Text style={[
                styles.itemsPreview,
                { color: isDark ? '#AEAEB2' : '#3A3A3C' }
              ]} numberOfLines={2}>
                {item.items
                  .filter(i => i && i.product)
                  .map(i => `${getItemDisplayName(i)} (${i.quantity || 0})`)
                  .join(' • ') || 'No valid items'}
              </Text>
            </View>
          </View>

          {item.status.toLowerCase() === 'delivered' && (
            <View style={styles.actionContainer}>
              <TouchableOpacity 
                style={[
                  styles.reorderButton,
                  { 
                    backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7',
                    borderColor: '#2E7D31'
                  }
                ]} 
                activeOpacity={0.8}
                onPress={() => console.log('Reorder pressed')}
              >
                <Ionicons name="refresh-outline" size={18} color="#2E7D31" />
                <Text style={styles.reorderButtonText}>Reorder</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Progress indicator for active orders */}
          {['pending', 'processing', 'shipped'].includes(item.status.toLowerCase()) && (
            <View style={styles.progressContainer}>
              <View style={[
                styles.progressBar,
                { backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7' }
              ]}>
                <Animated.View 
                  style={[
                    styles.progressFill,
                    { 
                      width: item.status.toLowerCase() === 'pending' ? '33%' : 
                            item.status.toLowerCase() === 'processing' ? '66%' : '100%',
                      backgroundColor: statusColors.text
                    }
                  ]}
                />
              </View>
              <Text style={[
                styles.progressText,
                { color: statusColors.text }
              ]}>
                {item.status.toLowerCase() === 'pending' ? 'Order confirmed' : 
                 item.status.toLowerCase() === 'processing' ? 'Being prepared' : 'On the way'}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderOrder = ({ item, index }) => (
    <AnimatedOrderCard item={item} index={index} />
  );

  const refreshOrders = async () => {
    // Animate refresh button
    Animated.timing(refreshRotation, {
      toValue: 1,
      duration: 1000,
      easing: Easing.linear,
      useNativeDriver: true,
    }).start(() => {
      refreshRotation.setValue(0);
    });

    try {
      setIsLoading(true);
      const token = await SecureStore.getItemAsync(AUTH_KEYS.TOKEN);
      const userId = await SecureStore.getItemAsync(AUTH_KEYS.USER_ID);
      
      if (!token || !userId) {
        console.error('Token or User ID not found');
        return;
      }

      // Create URL with user ID as query parameter
      const url = `${API_CONFIG.ORDERS_URL}?userId=${userId}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          setOrders(data);
        }
      }
    } catch (error) {
      console.error('Error refreshing orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentOrdersCount = () => {
    return orders.filter(order => {
      const status = order.status.toLowerCase();
      return ['pending', 'processing', 'shipped'].includes(status);
    }).length;
  };

  const getHistoryOrdersCount = () => {
    return orders.filter(order => {
      const status = order.status.toLowerCase();
      return ['delivered', 'cancelled'].includes(status);
    }).length;
  };

  const isDark = theme === 'dark';

  const tabIndicatorPosition = tabAnimationValue.interpolate({
    inputRange: [0, 1],
    outputRange: [8, width / 2 + 4],
  });

  const spinValue = refreshRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <SafeAreaView style={[
      styles.container,
      { backgroundColor: isDark ? '#000000' : '#F2F2F7' }
    ]}>
      <StatusBar 
        barStyle={isDark ? "light-content" : "dark-content"} 
        backgroundColor={isDark ? "#1C1C1E" : "#2E7D31"} 
      />
      
      <View style={[
        styles.header,
        { 
          backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
          borderBottomColor: isDark ? '#38383A' : '#E5E5EA'
        }
      ]}>
        <Text style={[
          styles.title,
          { color: isDark ? '#FFFFFF' : '#1C1C1E' }
        ]}>
          My Orders
        </Text>
        <TouchableOpacity 
          style={[
            styles.refreshButton,
            { backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7' }
          ]} 
          onPress={refreshOrders}
        >
          <Animated.View style={{ transform: [{ rotate: spinValue }] }}>
            <Ionicons name="refresh-outline" size={20} color="#2E7D31" />
          </Animated.View>
        </TouchableOpacity>
      </View>

      <View style={[
        styles.tabContainer,
        { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }
      ]}>
        <View style={[
          styles.tabBackground,
          { backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7' }
        ]}>
          <Animated.View 
            style={[
              styles.tabIndicator,
              { 
                left: tabIndicatorPosition,
                backgroundColor: '#2E7D31'
              }
            ]}
          />
          <TouchableOpacity
            style={styles.tab}
            onPress={() => setActiveTab('current')}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.tabText,
              { color: isDark ? '#AEAEB2' : '#8E8E93' },
              activeTab === 'current' && styles.activeTabText
            ]}>
              Current
            </Text>
            {getCurrentOrdersCount() > 0 && (
              <View style={styles.tabBadge}>
                <Text style={styles.tabBadgeText}>{getCurrentOrdersCount()}</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.tab}
            onPress={() => setActiveTab('history')}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.tabText,
              { color: isDark ? '#AEAEB2' : '#8E8E93' },
              activeTab === 'history' && styles.activeTabText
            ]}>
              History
            </Text>
            {getHistoryOrdersCount() > 0 && (
              <View style={[styles.tabBadge, { backgroundColor: '#8E8E93' }]}>
                <Text style={styles.tabBadgeText}>{getHistoryOrdersCount()}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.content}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <View style={styles.loadingSpinner}>
              <ActivityIndicator size="large" color="#2E7D31" />
            </View>
            <Text style={[
              styles.loadingText,
              { color: isDark ? '#8E8E93' : '#8E8E93' }
            ]}>
              Loading your orders...
            </Text>
          </View>
        ) : filterOrders().length === 0 ? (
          <View style={styles.emptyState}>
            <Animated.View 
              style={[
                styles.emptyIconContainer,
                { backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7' }
              ]}
            >
              <Ionicons 
                name={activeTab === 'current' ? 'receipt-outline' : 'time-outline'} 
                size={80} 
                color={isDark ? '#48484A' : '#C7C7CC'} 
              />
            </Animated.View>
            <Text style={[
              styles.emptyText,
              { color: isDark ? '#FFFFFF' : '#1C1C1E' }
            ]}>
              {activeTab === 'current' ? 'No Current Orders' : 'No Order History'}
            </Text>
            <Text style={[
              styles.emptySubtext,
              { color: isDark ? '#8E8E93' : '#8E8E93' }
            ]}>
              {activeTab === 'current'
                ? 'Your active orders will appear here once you place them'
                : 'Your completed and cancelled orders will appear here'}
            </Text>
            <TouchableOpacity 
              style={styles.emptyActionButton} 
              activeOpacity={0.8}
              onPress={() => console.log('Browse products pressed')}
            >
              <Text style={styles.emptyActionText}>Browse Products</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={filterOrders()}
            renderItem={renderOrder}
            keyExtractor={(item) => item._id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.ordersList}
            refreshing={isLoading}
            onRefresh={refreshOrders}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  refreshButton: {
    padding: 12,
    borderRadius: 24,
  },
  tabContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  tabBackground: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 4,
    position: 'relative',
  },
  tabIndicator: {
    position: 'absolute',
    top: 4,
    width: (width - 48) / 2,
    height: 44,
    borderRadius: 12,
    zIndex: 1,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    zIndex: 2,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  tabBadge: {
    backgroundColor: '#2E7D31',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  tabBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingTop: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  loadingSpinner: {
    marginBottom: 20,
  },
  loadingText: {
    fontSize: 16,
    textAlign: 'center',
  },
  ordersList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  orderCard: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  orderInfo: {
    flex: 1,
  },
  orderNumber: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orderDate: {
    fontSize: 14,
    marginLeft: 6,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'capitalize',
    marginLeft: 6,
  },
  orderDetails: {
    marginBottom: 16,
  },
  orderSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  itemsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemsIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  itemsText: {
    fontSize: 15,
    fontWeight: '500',
  },
  totalContainer: {
    alignItems: 'flex-end',
  },
  totalLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 2,
  },
  orderTotal: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2E7D31',
  },
  itemsPreviewContainer: {
    backgroundColor: 'rgba(46, 125, 49, 0.05)',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#2E7D31',
  },
  itemsPreviewLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  itemsPreview: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
  actionContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  reorderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#2E7D31',
  },
  reorderButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E7D31',
    marginLeft: 8,
  },
  progressContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyText: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  emptyActionButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    backgroundColor: '#2E7D31',
  },
  emptyActionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default OrdersScreen;
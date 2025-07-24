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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

const { width } = Dimensions.get('window');
const FONT_FAMILY = 'Poppins_400Regular';
const API_CONFIG = {
  ORDERS_URL: 'https://agrihub-backend-4z99.onrender.com/api/orders/',
  CANCEL_ORDER_URL: 'https://agrihub-backend-4z99.onrender.com/api/orders/cancel-order',
};

const AUTH_KEYS = {
  TOKEN: '@auth_token',
  USER_ID: '@user_id',
  USER_DATA: '@user_data',
};

const OrdersScreen = ({setPendingOrdersCount }) => {
  const { theme } = useTheme();
  const { language, changeLanguage, t } = useLanguage();
  const [activeTab, setActiveTab] = useState('current');
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cancellingOrderId, setCancellingOrderId] = useState(null);
  const tabAnimationValue = useRef(new Animated.Value(0)).current;
  const refreshRotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
const fetchOrders = async () => {
  try {
    setIsLoading(true);
    const token = await AsyncStorage.getItem(AUTH_KEYS.TOKEN);  

    if (!token) {
      Alert.alert(t('authRequired'), t('loginToViewOrders'));
      setIsLoading(false);
      return;
    }

    const response = await fetch(API_CONFIG.ORDERS_URL, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,  
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      setOrders(data);
      const pendingCount = data.filter(order => ['Pending', 'Processed', 'Shipped', 'Delivered'].includes(order.status?.toLowerCase())).length;
      setPendingOrdersCount(pendingCount);  
    } else {
      const errorData = await response.json().catch(() => ({}));
      console.error('Error response:', errorData); 
      Alert.alert(t('errorFetchingOrders'), errorData.message || errorData.error || t('somethingWentWrong'));
    }
  } catch (error) {
    console.error('Error fetching orders:', error);
    Alert.alert(t('networkError'), t('fetchOrdersFailed'));
  } finally {
    setIsLoading(false);
  }
};

    fetchOrders();
  }, []);

  const cancelOrder = async (orderId) => {
  try {
    const token = await AsyncStorage.getItem('@auth_token');
    if (!token) {
      Alert.alert(t('authRequired'), t('loginToCancelOrder'));
      return;
    }

    const response = await fetch(`https://agrihub-backend-4z99.onrender.com/api/orders/cancel-order/${orderId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    if (response.ok) {
      Alert.alert(t('success'), t('orderCanceled'));
      setOrders((prevOrders) => prevOrders.filter(order => order._id !== orderId));
    } else {
      console.error('Error response:', data);  
      Alert.alert(t('error'), data.message || t('cancelOrderFailed'));
    }
  } catch (error) {
    console.error('Error cancelling order:', error);
    Alert.alert(t('networkError'), t('cancelOrderFailed'));
  }
};


  const handleCancelOrder = (orderId, orderNumber) => {
    Alert.alert(
      t('cancelOrder'),
      t('cancelOrderConfirm', { orderNumber }),
      [
        {
          text: t('noKeepOrder'),
          style: 'cancel',
        },
        {
          text: t('yesCancelOrder'),
          style: 'destructive',
          onPress: () => cancelOrder(orderId),
        },
      ],
      { cancelable: true }
    );
  };

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
      case 'processed':
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
      case 'canceled':
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
      case 'processed':
        return 'sync-outline';
      case 'shipped':
        return 'car-outline';
      case 'delivered':
        return 'checkmark-circle-outline';
      case 'cancelled':
      case 'canceled':
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
        return status === 'pending';
      });
    } else {
      // History tab shows all orders EXCEPT Pending
      return orders.filter(order => {
        const status = order.status?.toLowerCase() || 'pending';
        return status !== 'pending';
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

  const canCancelOrder = (status) => {
    const statusLower = status.toLowerCase();
    return ['pending', 'processing', 'processed'].includes(statusLower);
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
    const orderNumber = item._id.slice(-8);
    const isCancelling = cancellingOrderId === item._id;

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
            console.log('Order pressed:', item._id);
          }}
        >
          <View style={styles.orderHeader}>
            <View style={styles.orderInfo}>
              <Text style={[
                styles.orderNumber,
                { color: isDark ? '#FFFFFF' : '#1C1C1E' }
              ]}>
                Order #{orderNumber}
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
                <Text style={styles.itemsText}>
                  {t('itemsCount', { count: validItemsCount })}
                </Text>
              </View>
              <View style={styles.totalContainer}>
                <Text style={styles.totalLabel}>
                  {t('total')}
                </Text>
                <Text style={styles.orderTotal}>
                  RWF {orderTotal.toLocaleString()}
                </Text>
              </View>
            </View>

            <View style={styles.itemsPreviewContainer}>
              <Text style={styles.itemsPreviewLabel}>
                {t('items')}
              </Text>
              <Text style={[
                styles.itemsPreview,
                { color: isDark ? '#AEAEB2' : '#3A3A3C' }
              ]} numberOfLines={2}>
                {item.items
                  .filter(i => i && i.product)
                  .map(i => `${getItemDisplayName(i)} (${i.quantity || 0})`)
                  .join(' • ') || t('noValidItems')}
              </Text>
            </View>
          </View>

          {/* Action buttons container */}
          <View style={styles.actionContainer}>
            {/* Reorder button for delivered orders */}
            {item.status.toLowerCase() === 'delivered' && (
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
                <Text style={styles.reorderButtonText}>{t('reorder')}</Text>
              </TouchableOpacity>
            )}

            {/* Cancel button for pending/processing orders */}
            {canCancelOrder(item.status) && (
              <TouchableOpacity
                style={[
                  styles.cancelButton,
                  {
                    backgroundColor: isDark ? '#3A1A1A' : '#FFF5F5',
                    borderColor: '#DC2626',
                    opacity: isCancelling ? 0.6 : 1,
                  }
                ]}
                activeOpacity={0.8}
                disabled={isCancelling}
                onPress={() => handleCancelOrder(item._id, orderNumber)}
              >
                {isCancelling ? (
                  <ActivityIndicator size="small" color="#DC2626" />
                ) : (
                  <Ionicons name="close-circle-outline" size={18} color="#DC2626" />
                )}
                <Text style={[styles.cancelButtonText, { marginLeft: isCancelling ? 8 : 8 }]}>
                  {isCancelling ? t('cancelling') : t('cancelOrder')}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Progress indicator for orders that are not delivered/cancelled */}
          {!['delivered', 'cancelled', 'canceled'].includes(item.status.toLowerCase()) && (
            <View style={styles.progressContainer}>
              <View style={[
                styles.progressBar,
                { backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7' }
              ]}>
                <Animated.View
                  style={[
                    styles.progressFill,
                    {
                      width: 
                        item.status.toLowerCase() === 'pending' ? '25%' :
                        ['processing', 'processed'].includes(item.status.toLowerCase()) ? '75%' : '100%',
                      backgroundColor: statusColors.text
                    }
                  ]}
                />
              </View>
              <Text style={[
                styles.progressText,
                { color: statusColors.text }
              ]}>
                {item.status.toLowerCase() === 'pending' ? t('orderConfirmed') :
                  ['processing', 'processed'].includes(item.status.toLowerCase()) ? t('beingPrepared') : t('onTheWay')}
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
      const token = await AsyncStorage.getItem(AUTH_KEYS.TOKEN);

      if (!token) {
        console.error('Token not found');
        Alert.alert(t('authRequired'), t('loginToViewOrders'));
        return;
      }

      // Use the same URL as the initial fetch - no userId parameter needed
      const response = await fetch(API_CONFIG.ORDERS_URL, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Refreshed orders:', data); // Debug log
        if (Array.isArray(data)) {
          setOrders(data);
          // Updated to only count pending orders for the pending count
          const pendingCount = data.filter(order => order.status?.toLowerCase() === 'pending').length;
          setPendingOrdersCount(pendingCount);
        } else {
          console.error('Expected array but got:', typeof data);
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Refresh error:', errorData);
        Alert.alert(t('error'), t('refreshOrdersFailed'));
      }
    } catch (error) {
      console.error('Error refreshing orders:', error);
      Alert.alert(t('networkError'), t('refreshOrdersFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentOrdersCount = () => {
    return orders.filter(order => {
      const status = order.status?.toLowerCase() || 'pending';
      return status === 'pending';
    }).length;
  };

  const getHistoryOrdersCount = () => {
    return orders.filter(order => {
      const status = order.status?.toLowerCase() || 'pending';
      return status !== 'pending';
    }).length;
  };

  const isDark = theme === 'dark';

  const tabIndicatorPosition = tabAnimationValue.interpolate({
    inputRange: [0, 1],
    outputRange: [8, width / 2 + 4],
  });

  // Spinner animation hooks (must be at top level)
  const spinValue = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      })
    ).start();
  }, [spinValue]);
  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const renderLoadingSpinner = (styles, isLoading) => (
    <View style={styles.loadingContainer}>
      <View style={styles.spinnerContainer}>
        <Animated.View style={[styles.spinner, { transform: [{ rotate: spin }] }]}> 
          <View style={styles.spinnerOuter}>
            <View style={styles.spinnerInner} />
          </View>
        </Animated.View>
        <Text style={styles.loadingText}>
          {isLoading ? t('loadingOrders') : t('searching')}
        </Text>
      </View>
    </View>
  );

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
          {t('myOrders')}
        </Text>
        <TouchableOpacity
          style={[
            styles.refreshButton,
            { backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7' }
          ]}
          onPress={refreshOrders}
        >
          <Animated.View style={{ transform: [{ rotate: spin }] }}>
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
              {t('current')}
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
              {t('history')}
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
          renderLoadingSpinner(styles, isLoading)
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
              {activeTab === 'current' ? t('noCurrentOrders') : t('noOrderHistory')}
            </Text>
            <Text style={[
              styles.emptySubtext,
              { color: isDark ? '#8E8E93' : '#8E8E93' }
            ]}>
              {activeTab === 'current'
                ? t('pendingOrdersAppearHere')
                : t('historyOrdersAppearHere')}
            </Text>
            <TouchableOpacity
              style={styles.emptyActionButton}
              activeOpacity={0.8}
              onPress={() => console.log('Browse products pressed')}
            >
              <Text style={styles.emptyActionText}>{t('browseProducts')}</Text>
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
    fontSize: 25,
    fontWeight: '600',
    fontFamily: FONT_FAMILY, 
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
    fontFamily: FONT_FAMILY, 
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
    fontFamily: FONT_FAMILY, 
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
    fontWeight: '600',
    marginBottom: 6,
    fontFamily: FONT_FAMILY,  
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orderDate: {
    fontSize: 14,
    marginLeft: 6,
    fontFamily: FONT_FAMILY, 
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
    textTransform: 'capitalize',
    fontFamily: FONT_FAMILY, 
  },
  orderDetails: {
    marginBottom: 20,
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
    fontSize: 14,
    fontWeight: '500',
    fontFamily: FONT_FAMILY, 
  },
  totalContainer: {
    alignItems: 'flex-end',
  },
  totalLabel: {
    fontSize: 12,
    marginBottom: 2,
    fontFamily: FONT_FAMILY, 
  },
  orderTotal: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2E7D31',
    fontFamily: FONT_FAMILY,
  },
  itemsPreviewContainer: {
    marginTop: 8,
  },
  itemsPreviewLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
    fontFamily: FONT_FAMILY,  
  },
  itemsPreview: {
    fontSize: 14,
    lineHeight: 18,
    fontFamily: FONT_FAMILY,
  },
  actionContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
    marginBottom: 16,
  },
  reorderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    flex: 1,
    justifyContent: 'center',
  },
  reorderButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2E7D31',
    marginLeft: 8,
    fontFamily: FONT_FAMILY,
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    flex: 1,
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#DC2626',
    fontFamily: FONT_FAMILY,
  },
  progressContainer: {
    marginTop: 8,
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
    transition: 'width 0.3s ease',
  },
  progressText: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
    fontFamily: FONT_FAMILY,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingBottom: 80,
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
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
    fontFamily: FONT_FAMILY,
  },
  emptySubtext: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
     fontFamily: FONT_FAMILY, 
  },
  emptyActionButton: {
    backgroundColor: '#2E7D31',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
  },
  emptyActionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: FONT_FAMILY, 
  },
  spinnerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinner: {
    width: 50,
    height: 50,
    marginBottom: 16,
  },
  spinnerOuter: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 3,
    borderColor: '#E5E5EA',
    borderTopColor: '#2E7D31',
    justifyContent: 'center',
    alignItems: 'center',
  },
  spinnerInner: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#2E7D31',
    opacity: 0.6,
  },
});

export default OrdersScreen;
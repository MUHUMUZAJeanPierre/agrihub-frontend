
import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import * as SecureStore from 'expo-secure-store';

const { width } = Dimensions.get('window');
const API_CONFIG = {
  ORDERS_URL: 'https://agrihub-backend-4z99.onrender.com/api/orders/get-order',
};

const AUTH_KEYS = {
  TOKEN: 'auth_token',
};

const OrdersScreen = () => {
  const [activeTab, setActiveTab] = useState('current');
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setIsLoading(true);
        const token = await SecureStore.getItemAsync(AUTH_KEYS.TOKEN);
        if (!token) {
          Alert.alert('Authentication Required', 'Please log in to view orders.');
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
          console.log('API Response:', data);

          if (Array.isArray(data)) {
            setOrders(data);
          } else {
            console.error('Expected an array but received:', data);
            setOrders([]);
          }
        } else {
          const errorText = await response.text();
          console.error('API Response Error:', errorText);
          Alert.alert('Error fetching orders', 'Something went wrong. Please try again.');
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
    
    // Fallback: calculate from items (with null checks)
    return order.items.reduce((total, item) => {
      // Check if item and product exist
      if (!item || !item.product) {
        return total;
      }
      const price = parsePrice(item.product.current_price);
      return total + (price * (item.quantity || 0));
    }, 0);
  };

  const getStatusBadgeColor = (status) => {
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case 'pending':
        return { bg: '#FFF3CD', text: '#856404', border: '#FFEAA7' };
      case 'processing':
        return { bg: '#D1ECF1', text: '#0C5460', border: '#BEE5EB' };
      case 'shipped':
        return { bg: '#E2E3F1', text: '#383D41', border: '#C5C6D0' };
      case 'delivered':
        return { bg: '#D4EDDA', text: '#155724', border: '#C3E6CB' };
      case 'cancelled':
        return { bg: '#F8D7DA', text: '#721C24', border: '#F5C6CB' };
      default:
        return { bg: '#F8F9FA', text: '#6C757D', border: '#DEE2E6' };
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
        const status = order.status.toLowerCase();
        return ['pending', 'processing', 'shipped'].includes(status);
      });
    } else {
      return orders.filter(order => {
        const status = order.status.toLowerCase();
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

  // Helper function to get item display name safely
  const getItemDisplayName = (item) => {
    if (!item) return 'Unknown item';
    if (!item.product) return 'Product unavailable';
    return item.product.title || 'Untitled product';
  };

  // Helper function to count valid items
  const getValidItemsCount = (items) => {
    return items.filter(item => item && item.product).length;
  };

  const renderOrder = ({ item }) => {
    const orderTotal = calculateOrderTotal(item);
    const statusColors = getStatusBadgeColor(item.status);
    const statusIcon = getStatusIcon(item.status);
    const validItemsCount = getValidItemsCount(item.items);

    return (
      <TouchableOpacity style={styles.orderCard} activeOpacity={0.7}>
        <View style={styles.orderHeader}>
          <View style={styles.orderInfo}>
            <Text style={styles.orderNumber}>#{item._id.slice(-8)}</Text>
            <View style={styles.dateContainer}>
              <Ionicons name="calendar-outline" size={14} color="#8E8E93" />
              <Text style={styles.orderDate}>{formatDate(item.createdAt)}</Text>
            </View>
          </View>
          <View style={[styles.statusBadge, { 
            backgroundColor: statusColors.bg,
            borderColor: statusColors.border 
          }]}>
            <Ionicons name={statusIcon} size={16} color={statusColors.text} />
            <Text style={[styles.statusText, { color: statusColors.text }]}>
              {item.status}
            </Text>
          </View>
        </View>

        <View style={styles.orderSummary}>
          <View style={styles.itemsContainer}>
            <Ionicons name="basket-outline" size={18} color="#8E8E93" />
            <Text style={styles.itemsText}>
              {validItemsCount} item{validItemsCount > 1 ? 's' : ''}
            </Text>
          </View>
          <Text style={styles.orderTotal}>RWF {orderTotal.toLocaleString()}</Text>
        </View>

        <View style={styles.itemsPreviewContainer}>
          <Text style={styles.itemsPreview} numberOfLines={2}>
            {item.items
              .filter(i => i && i.product) // Filter out null/invalid items
              .map(i => `${getItemDisplayName(i)} × ${i.quantity || 0}`)
              .join(' • ') || 'No valid items'}
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.orderActions}>
          <TouchableOpacity style={styles.primaryButton} activeOpacity={0.8}>
            <Ionicons name="eye-outline" size={16} color="#FFFFFF" />
            <Text style={styles.primaryButtonText}>View Details</Text>
          </TouchableOpacity>
          {item.status.toLowerCase() === 'delivered' && (
            <TouchableOpacity style={styles.secondaryButton} activeOpacity={0.8}>
              <Ionicons name="refresh-outline" size={16} color="#4CAF50" />
              <Text style={styles.secondaryButtonText}>Reorder</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const refreshOrders = async () => {
    try {
      setIsLoading(true);
      const token = await SecureStore.getItemAsync(AUTH_KEYS.TOKEN);
      if (!token) return;

      const response = await fetch(API_CONFIG.ORDERS_URL, {
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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#4CAF50" />
      
      <View style={styles.header}>
        <Text style={styles.title}>My Orders</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={refreshOrders}>
          <Ionicons name="refresh-outline" size={20} color="#4CAF50" />
        </TouchableOpacity>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'current' && styles.activeTab]}
          onPress={() => setActiveTab('current')}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabText, activeTab === 'current' && styles.activeTabText]}>
            Current
          </Text>
          {getCurrentOrdersCount() > 0 && (
            <View style={styles.tabBadge}>
              <Text style={styles.tabBadgeText}>{getCurrentOrdersCount()}</Text>
            </View>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'history' && styles.activeTab]}
          onPress={() => setActiveTab('history')}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabText, activeTab === 'history' && styles.activeTabText]}>
            History
          </Text>
          {getHistoryOrdersCount() > 0 && (
            <View style={[styles.tabBadge, { backgroundColor: '#8E8E93' }]}>
              <Text style={styles.tabBadgeText}>{getHistoryOrdersCount()}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <View style={styles.loadingSpinner}>
              <ActivityIndicator size="large" color="#4CAF50" />
            </View>
            <Text style={styles.loadingText}>Loading your orders...</Text>
          </View>
        ) : filterOrders().length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <Ionicons 
                name={activeTab === 'current' ? 'receipt-outline' : 'time-outline'} 
                size={80} 
                color="#C7C7CC" 
              />
            </View>
            <Text style={styles.emptyText}>
              {activeTab === 'current' ? 'No Current Orders' : 'No Order History'}
            </Text>
            <Text style={styles.emptySubtext}>
              {activeTab === 'current'
                ? 'Your active orders will appear here once you place them'
                : 'Your completed and cancelled orders will appear here'}
            </Text>
            <TouchableOpacity style={styles.emptyActionButton} activeOpacity={0.8}>
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
    backgroundColor: '#F2F2F7',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  refreshButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#F2F2F7',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    marginHorizontal: 4,
    backgroundColor: '#F2F2F7',
  },
  activeTab: {
    backgroundColor: '#4CAF50',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8E8E93',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  tabBadge: {
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
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
    color: '#8E8E93',
    textAlign: 'center',
  },
  ordersList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  orderInfo: {
    flex: 1,
  },
  orderNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orderDate: {
    fontSize: 14,
    color: '#8E8E93',
    marginLeft: 4,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'capitalize',
    marginLeft: 4,
  },
  orderSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  itemsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemsText: {
    fontSize: 15,
    color: '#8E8E93',
    marginLeft: 6,
  },
  orderTotal: {
    fontSize: 20,
    fontWeight: '700',
    color: '#4CAF50',
  },
  itemsPreviewContainer: {
    marginBottom: 16,
  },
  itemsPreview: {
    fontSize: 15,
    color: '#3A3A3C',
    lineHeight: 22,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E5EA',
    marginBottom: 16,
  },
  orderActions: {
    flexDirection: 'row',
    gap: 12,
  },
  primaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: '#4CAF50',
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 6,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: '#F2F2F7',
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#4CAF50',
    marginLeft: 6,
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
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  emptyActionButton: {
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
    backgroundColor: '#4CAF50',
  },
  emptyActionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default OrdersScreen;
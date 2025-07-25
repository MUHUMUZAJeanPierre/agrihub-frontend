import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  Alert, 
  StyleSheet,
  Dimensions,
  RefreshControl,
  StatusBar,
  Animated,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from "../../contexts/ThemeContext";

const { width } = Dimensions.get('window');
const FONTS = {
  regular: "Poppins_400Regular",
  semiBold: "Poppins_600SemiBold",
  bold: "Poppins_700Bold",
};

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

const FarmerOrderDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const { theme } = useTheme();
  const Colors = theme === 'dark' ? DarkColors : LightColors;
  const styles = createStyles(Colors);

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

  const fetchOrders = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      
      const token = await AsyncStorage.getItem('@auth_token');
      if (!token) {
        Alert.alert('Authentication required', 'Please log in to view orders.');
        return;
      }

      const response = await fetch('https://agrihub-backend-4z99.onrender.com/api/orders/farmer-orders', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      } else {
        Alert.alert('Error', 'Failed to fetch orders');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      Alert.alert('Network Error', 'Failed to fetch orders');
    } finally {
      setIsLoading(false);
      if (isRefresh) setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Handle pull to refresh
  const onRefresh = () => {
    fetchOrders(true);
  };

  // Handle status change for each order
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const token = await AsyncStorage.getItem('@auth_token');
      const response = await fetch(`https://agrihub-backend-4z99.onrender.com/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        const data = await response.json();
        Alert.alert('Success', data.message);
        // Update the orders list after changing the status
        setOrders(orders.map(order => (order._id === orderId ? { ...order, status: newStatus } : order)));
      } else {
        const data = await response.json();
        Alert.alert('Error', data.message || 'Failed to update order status');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      Alert.alert('Error', 'Failed to update order status');
    }
  };

  // Get status color based on order status
  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return Colors.warning;
      case 'Processed': return Colors.primary;
      case 'Shipped': return Colors.accent;
      case 'Delivered': return Colors.success;
      case 'Canceled': return Colors.error;
      default: return Colors.textTertiary;
    }
  };

  // Get status display text with icon
  const getStatusDisplay = (status) => {
    const icons = {
      'Pending': '⏳',
      'Processed': '⚙️',
      'Shipped': '🚚',
      'Delivered': '✅',
      'Canceled': '❌'
    };
    return `${icons[status] || ''} ${status}`;
  };

  // Render order details and status change buttons
  const renderOrder = ({ item, index }) => (
    <View style={[styles.orderCard, { marginTop: index === 0 ? 20 : 10 }]}>
      {/* Order Header */}
      <View style={styles.orderHeader}>
        <View style={styles.orderTitleContainer}>
          <Text style={styles.orderTitle}>Order #{item._id.slice(-8)}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
            <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
              {getStatusDisplay(item.status)}
            </Text>
          </View>
        </View>
      </View>

      {/* Order Details */}
      <View style={styles.orderDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Total Amount:</Text>
          <Text style={styles.detailValue}>{item.totalAmount} RWF</Text>
        </View>
        
        {item.createdAt && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Order Date:</Text>
            <Text style={styles.detailValue}>
              {new Date(item.createdAt).toLocaleDateString()}
            </Text>
          </View>
        )}

        {item.items && item.items.length > 0 && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Items:</Text>
            <Text style={styles.detailValue}>{item.items.length} item(s)</Text>
          </View>
        )}
      </View>

      {/* Action Buttons for Pending Orders */}
      {item.status === 'Pending' && (
        <View style={styles.actionsContainer}>
          <Text style={styles.actionsTitle}>Update Order Status:</Text>
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: Colors.primary }]}
              onPress={() => handleStatusChange(item._id, 'Processed')}
            >
              <Text style={styles.buttonText}>⚙️ Process</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: Colors.accent }]}
              onPress={() => handleStatusChange(item._id, 'Shipped')}
            >
              <Text style={styles.buttonText}>🚚 Ship</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: Colors.success }]}
              onPress={() => handleStatusChange(item._id, 'Delivered')}
            >
              <Text style={styles.buttonText}>✅ Deliver</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.actionButton, styles.cancelButton]}
              onPress={() => handleStatusChange(item._id, 'Canceled')}
            >
              <Text style={styles.buttonText}>❌ Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Status Message for Non-Pending Orders */}
      {['Processed', 'Shipped', 'Delivered', 'Canceled'].includes(item.status) && (
        <View style={styles.statusMessage}>
          <Text style={styles.statusMessageText}>
            {item.status === 'Canceled' 
              ? '🚫 This order has been canceled' 
              : '🔒 Order status cannot be modified further'
            }
          </Text>
        </View>
      )}
    </View>
  );

  // Empty state component
  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateIcon}>📦</Text>
      <Text style={styles.emptyStateTitle}>No Orders Found</Text>
      <Text style={styles.emptyStateMessage}>
        You don't have any orders yet. Orders will appear here when customers place them.
      </Text>
      <TouchableOpacity style={styles.refreshButton} onPress={() => fetchOrders()}>
        <Text style={styles.refreshButtonText}>Refresh</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar 
        barStyle={theme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={Colors.background}
      />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Order Management</Text>
        <Text style={styles.headerSubtitle}>
          {orders.length > 0 ? `${orders.length} order(s)` : 'Manage your orders'}
        </Text>
      </View>

      {/* Content */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <View style={styles.spinnerContainer}>
            <Animated.View style={[styles.spinner, { transform: [{ rotate: spin }] }]}> 
              <View style={styles.spinnerOuter}>
                <View style={styles.spinnerInner} />
              </View>
            </Animated.View>
            <Text style={styles.loadingText}>
              Loading orders...
            </Text>
          </View>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item._id}
          renderItem={renderOrder}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[Colors.primary]}
              tintColor={Colors.primary}
            />
          }
          ListEmptyComponent={renderEmptyState}
        />
      )}
    </View>
  );
};

const createStyles = (Colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderColor,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '500',
    color: Colors.textPrimary,
    marginBottom: 4,
    fontFamily: FONTS.regular,

  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  orderCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: Colors.textPrimary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: Colors.borderColor,
  },
  orderHeader: {
    marginBottom: 12,
  },
  orderTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  orderTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    flex: 1,
    marginRight: 10,
    fontFamily: FONTS.semiBold,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: FONTS.regular,
  },
  orderDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    flex: 1,
    fontFamily: FONTS.regular,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    textAlign: 'right',
    fontFamily: FONTS.semiBold,
  },
  actionsContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.borderColor,
  },
  actionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 12,
    fontFamily: FONTS.regular,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  actionButton: {
    flex: 0.48,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: Colors.error,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    fontFamily: FONTS.bold,
  },
  statusMessage: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.borderColor,
    alignItems: 'center',
  },
  statusMessageText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    fontFamily: FONTS.regular,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.textSecondary,
     fontFamily: FONTS.regular,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 60,
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateMessage: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  refreshButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  refreshButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
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
    borderTopColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  spinnerInner: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#4CAF50',
    opacity: 0.6,
  },
});

export default FarmerOrderDashboard;
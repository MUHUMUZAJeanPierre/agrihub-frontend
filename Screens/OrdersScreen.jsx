import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const OrdersScreen = () => {
  const [activeTab, setActiveTab] = useState('current');
  
  const [orders] = useState([
    {
      id: '1',
      orderNumber: '#ORD-001',
      date: '2024-01-15',
      status: 'delivered',
      total: 119.98,
      items: ['Wireless Headphones', 'Smartphone Case'],
      itemCount: 2,
    },
    {
      id: '2',
      orderNumber: '#ORD-002',
      date: '2024-01-10',
      status: 'shipped',
      total: 59.99,
      items: ['Bluetooth Speaker'],
      itemCount: 1,
    },
    {
      id: '3',
      orderNumber: '#ORD-003',
      date: '2024-01-05',
      status: 'processing',
      total: 199.97,
      items: ['Laptop Stand', 'USB Cable', 'Power Bank'],
      itemCount: 3,
    },
    {
      id: '4',
      orderNumber: '#ORD-004',
      date: '2023-12-28',
      status: 'cancelled',
      total: 79.99,
      items: ['Gaming Mouse'],
      itemCount: 1,
    },
  ]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered':
        return '#34C759';
      case 'shipped':
        return '#007AFF';
      case 'processing':
        return '#FF9500';
      case 'cancelled':
        return '#FF3B30';
      default:
        return '#666';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'delivered':
        return 'checkmark-circle';
      case 'shipped':
        return 'car';
      case 'processing':
        return 'time';
      case 'cancelled':
        return 'close-circle';
      default:
        return 'help-circle';
    }
  };

  const filterOrders = () => {
    if (activeTab === 'current') {
      return orders.filter(order => ['processing', 'shipped'].includes(order.status));
    } else {
      return orders.filter(order => ['delivered', 'cancelled'].includes(order.status));
    }
  };

  const renderOrder = ({ item }) => (
    <TouchableOpacity style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <View>
          <Text style={styles.orderNumber}>{item.orderNumber}</Text>
          <Text style={styles.orderDate}>{item.date}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
          <Ionicons 
            name={getStatusIcon(item.status)} 
            size={16} 
            color={getStatusColor(item.status)} 
          />
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </Text>
        </View>
      </View>

      <View style={styles.orderDetails}>
        <Text style={styles.itemsText}>
          {item.itemCount} item{item.itemCount > 1 ? 's' : ''}
        </Text>
        <Text style={styles.orderTotal}>${item.total.toFixed(2)}</Text>
      </View>

      <View style={styles.itemsList}>
        <Text style={styles.itemsPreview} numberOfLines={1}>
          {item.items.join(', ')}
        </Text>
      </View>

      <View style={styles.orderActions}>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonText}>View Details</Text>
        </TouchableOpacity>
        {item.status === 'delivered' && (
          <TouchableOpacity style={[styles.actionButton, styles.reorderButton]}>
            <Text style={[styles.actionButtonText, styles.reorderText]}>Reorder</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Orders</Text>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'current' && styles.activeTab]}
          onPress={() => setActiveTab('current')}
        >
          <Text style={[styles.tabText, activeTab === 'current' && styles.activeTabText]}>
            Current Orders
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'history' && styles.activeTab]}
          onPress={() => setActiveTab('history')}
        >
          <Text style={[styles.tabText, activeTab === 'history' && styles.activeTabText]}>
            Order History
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {filterOrders().length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="receipt-outline" size={80} color="#ccc" />
            <Text style={styles.emptyText}>
              {activeTab === 'current' ? 'No current orders' : 'No order history'}
            </Text>
            <Text style={styles.emptySubtext}>
              {activeTab === 'current' 
                ? 'Your active orders will appear here' 
                : 'Your completed orders will appear here'
              }
            </Text>
          </View>
        ) : (
          <FlatList
            data={filterOrders()}
            renderItem={renderOrder}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.ordersList}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#4CAF50',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
  },
  activeTabText: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  ordersList: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  orderCard: {
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  orderDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  orderDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  itemsText: {
    fontSize: 14,
    color: '#666',
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  itemsList: {
    marginBottom: 15,
  },
  itemsPreview: {
    fontSize: 14,
    color: '#333',
  },
  orderActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  reorderButton: {
    backgroundColor: '#4CAF50',
  },
  actionButtonText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
  },
  reorderText: {
    color: '#fff',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 20,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
    textAlign: 'center',
  },
});

export default OrdersScreen;
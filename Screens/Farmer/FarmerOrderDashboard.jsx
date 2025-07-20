// import React, { useState, useEffect } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   FlatList,
//   TouchableOpacity,
//   Alert,
//   RefreshControl,
//   Modal,
//   ScrollView,
//   StatusBar,
//   SafeAreaView,
// } from 'react-native';
// import { Ionicons } from '@expo/vector-icons';
// import axios from 'axios';
// import AsyncStorage from '@react-native-async-storage/async-storage';

// const FarmerOrderDashboard = () => {
//   const [orders, setOrders] = useState([]);
//   const [refreshing, setRefreshing] = useState(false);
//   const [selectedOrder, setSelectedOrder] = useState(null);
//   const [modalVisible, setModalVisible] = useState(false);
//   const [filterStatus, setFilterStatus] = useState('all');

//   // Sample orders data - In real app, this would come from API
//   const sampleOrders = [
//     {
//       id: 'ORD-001',
//       buyerId: 'B001',
//       buyerName: 'John Smith',
//       buyerPhone: '+1234567890',
//       buyerAddress: '123 Main St, City, State 12345',
//       products: [
//         { id: 1, name: 'Organic Tomatoes', quantity: 5, unit: 'kg', price: 15.00 },
//         { id: 2, name: 'Fresh Lettuce', quantity: 3, unit: 'heads', price: 9.00 }
//       ],
//       totalAmount: 24.00,
//       status: 'pending',
//       orderDate: '2024-07-15T10:30:00Z',
//       deliveryDate: '2024-07-17',
//       paymentMethod: 'Cash on Delivery'
//     },
//     {
//       id: 'ORD-002',
//       buyerId: 'B002',
//       buyerName: 'Alice Johnson',
//       buyerPhone: '+1234567891',
//       buyerAddress: '456 Oak Ave, City, State 12345',
//       products: [
//         { id: 3, name: 'Fresh Carrots', quantity: 2, unit: 'kg', price: 8.00 },
//         { id: 4, name: 'Organic Spinach', quantity: 1, unit: 'bunch', price: 6.00 }
//       ],
//       totalAmount: 14.00,
//       status: 'confirmed',
//       orderDate: '2024-07-14T14:20:00Z',
//       deliveryDate: '2024-07-16',
//       paymentMethod: 'Mobile Money'
//     },
//     {
//       id: 'ORD-003',
//       buyerId: 'B003',
//       buyerName: 'Maria Garcia',
//       buyerPhone: '+1234567892',
//       buyerAddress: '789 Pine St, City, State 12345',
//       products: [
//         { id: 5, name: 'Organic Apples', quantity: 10, unit: 'kg', price: 30.00 }
//       ],
//       totalAmount: 30.00,
//       status: 'delivered',
//       orderDate: '2024-07-13T09:15:00Z',
//       deliveryDate: '2024-07-15',
//       paymentMethod: 'Bank Transfer'
//     },
//     {
//       id: 'ORD-004',
//       buyerId: 'B004',
//       buyerName: 'Robert Wilson',
//       buyerPhone: '+1234567893',
//       buyerAddress: '321 Elm St, City, State 12345',
//       products: [
//         { id: 6, name: 'Organic Potatoes', quantity: 8, unit: 'kg', price: 24.00 },
//         { id: 7, name: 'Fresh Onions', quantity: 3, unit: 'kg', price: 12.00 }
//       ],
//       totalAmount: 36.00,
//       status: 'pending',
//       orderDate: '2024-07-16T11:45:00Z',
//       deliveryDate: '2024-07-18',
//       paymentMethod: 'Cash on Delivery'
//     }
//   ];

//   useEffect(() => {
//     fetchOrders();
//   }, []);

//   const fetchOrders = async () => {
//   try {
//     setRefreshing(true);

//     const token = await AsyncStorage.getItem('@auth_token');
//     const response = await axios.get(
//       'https://agrihub-backend-4z99.onrender.com/api/orders/grouped-orders-by-product',
//       {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       }
//     );

//     const transformedOrders = response.data.flatMap((group, index) =>
//       group.orders.map((order, idx) => ({
//         id: `ORD-${index}${idx}`,
//         buyerId: order.buyer._id || '',
//         buyerName: order.buyer.name,
//         buyerPhone: order.buyer.phone || '',
//         buyerAddress: order.buyer.address || 'N/A',
//         products: [
//           {
//             id: index + idx,
//             name: group.product,
//             quantity: order.quantity,
//             unit: 'unit', // adjust if you have units in DB
//             price: 0, // update if you want price info too
//           }
//         ],
//         totalAmount: 0, // can be calculated if needed
//         status: 'pending',
//         orderDate: order.date,
//         deliveryDate: '', // optional
//         paymentMethod: 'Cash on Delivery'
//       }))
//     );

//     setOrders(transformedOrders);
//   } catch (error) {
//     console.error('Error fetching orders:', error);
//     Alert.alert('Error', 'Failed to fetch orders');
//   } finally {
//     setRefreshing(false);
//   }
// };

//   const updateOrderStatus = async (orderId, newStatus) => {
//     try {
//       // Simulate API call
//       await new Promise(resolve => setTimeout(resolve, 500));
      
//       setOrders(prevOrders =>
//         prevOrders.map(order =>
//           order.id === orderId ? { ...order, status: newStatus } : order
//         )
//       );
      
//       Alert.alert(
//         'Success',
//         `Order ${orderId} has been ${newStatus}`,
//         [{ text: 'OK', style: 'default' }]
//       );
//     } catch (error) {
//       Alert.alert('Error', 'Failed to update order status');
//     }
//   };

//   const handleStatusUpdate = (orderId, currentStatus) => {
//     if (currentStatus === 'pending') {
//       Alert.alert(
//         'Update Order Status',
//         'What would you like to do with this order?',
//         [
//           { text: 'Cancel', style: 'cancel' },
//           {
//             text: 'Confirm Order',
//             style: 'default',
//             onPress: () => updateOrderStatus(orderId, 'confirmed')
//           },
//           {
//             text: 'Reject Order',
//             style: 'destructive',
//             onPress: () => updateOrderStatus(orderId, 'rejected')
//           }
//         ]
//       );
//     } else if (currentStatus === 'confirmed') {
//       Alert.alert(
//         'Mark as Delivered',
//         'Has this order been delivered?',
//         [
//           { text: 'Cancel', style: 'cancel' },
//           {
//             text: 'Yes, Delivered',
//             style: 'default',
//             onPress: () => updateOrderStatus(orderId, 'delivered')
//           }
//         ]
//       );
//     }
//   };

//   const getStatusColor = (status) => {
//     switch (status) {
//       case 'pending': return '#FFA500';
//       case 'confirmed': return '#4CAF50';
//       case 'delivered': return '#2196F3';
//       case 'rejected': return '#F44336';
//       default: return '#9E9E9E';
//     }
//   };

//   const getStatusIcon = (status) => {
//     switch (status) {
//       case 'pending': return 'time-outline';
//       case 'confirmed': return 'checkmark-circle-outline';
//       case 'delivered': return 'checkmark-done-circle-outline';
//       case 'rejected': return 'close-circle-outline';
//       default: return 'help-circle-outline';
//     }
//   };

//   const formatDate = (dateString) => {
//     const date = new Date(dateString);
//     return date.toLocaleDateString('en-US', {
//       year: 'numeric',
//       month: 'short',
//       day: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit'
//     });
//   };

//   const filteredOrders = orders.filter(order => 
//     filterStatus === 'all' || order.status === filterStatus
//   );

//   const getOrderCounts = () => {
//     return {
//       all: orders.length,
//       pending: orders.filter(o => o.status === 'pending').length,
//       confirmed: orders.filter(o => o.status === 'confirmed').length,
//       delivered: orders.filter(o => o.status === 'delivered').length,
//       rejected: orders.filter(o => o.status === 'rejected').length
//     };
//   };

//   const counts = getOrderCounts();

//   const renderOrderItem = ({ item }) => (
//     <View style={styles.orderCard}>
//       <View style={styles.orderHeader}>
//         <Text style={styles.orderId}>Order #{item.id}</Text>
//         <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
//           <Ionicons name={getStatusIcon(item.status)} size={12} color="white" />
//           <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
//         </View>
//       </View>

//       <View style={styles.orderContent}>
//         <View style={styles.buyerInfo}>
//           <Ionicons name="person-outline" size={16} color="#666" />
//           <Text style={styles.buyerName}>{item.buyerName}</Text>
//         </View>
        
//         <View style={styles.buyerInfo}>
//           <Ionicons name="call-outline" size={16} color="#666" />
//           <Text style={styles.buyerPhone}>{item.buyerPhone}</Text>
//         </View>

//         <View style={styles.orderDetails}>
//           <Text style={styles.productCount}>
//             {item.products.length} {item.products.length === 1 ? 'Product' : 'Products'}
//           </Text>
//           <Text style={styles.totalAmount}>${item.totalAmount.toFixed(2)}</Text>
//         </View>

//         <Text style={styles.orderDate}>
//           Ordered: {formatDate(item.orderDate)}
//         </Text>
//       </View>

//       <View style={styles.orderActions}>
//         <TouchableOpacity
//           style={styles.viewButton}
//           onPress={() => {
//             setSelectedOrder(item);
//             setModalVisible(true);
//           }}
//         >
//           <Ionicons name="eye-outline" size={16} color="#2196F3" />
//           <Text style={styles.viewButtonText}>View Details</Text>
//         </TouchableOpacity>

//         {(item.status === 'pending' || item.status === 'confirmed') && (
//           <TouchableOpacity
//             style={[styles.actionButton, { backgroundColor: getStatusColor(item.status) }]}
//             onPress={() => handleStatusUpdate(item.id, item.status)}
//           >
//             <Text style={styles.actionButtonText}>
//               {item.status === 'pending' ? 'Update Status' : 'Mark Delivered'}
//             </Text>
//           </TouchableOpacity>
//         )}
//       </View>
//     </View>
//   );

//   const renderOrderModal = () => (
//     <Modal
//       animationType="slide"
//       transparent={true}
//       visible={modalVisible}
//       onRequestClose={() => setModalVisible(false)}
//     >
//       <View style={styles.modalContainer}>
//         <View style={styles.modalContent}>
//           <View style={styles.modalHeader}>
//             <Text style={styles.modalTitle}>Order Details</Text>
//             <TouchableOpacity onPress={() => setModalVisible(false)}>
//               <Ionicons name="close-outline" size={24} color="#666" />
//             </TouchableOpacity>
//           </View>

//           {selectedOrder && (
//             <ScrollView style={styles.modalBody}>
//               <View style={styles.modalSection}>
//                 <Text style={styles.modalSectionTitle}>Order Information</Text>
//                 <Text style={styles.modalText}>Order ID: {selectedOrder.id}</Text>
//                 <Text style={styles.modalText}>Date: {formatDate(selectedOrder.orderDate)}</Text>
//                 <Text style={styles.modalText}>Delivery Date: {selectedOrder.deliveryDate}</Text>
//                 <Text style={styles.modalText}>Payment: {selectedOrder.paymentMethod}</Text>
//               </View>

//               <View style={styles.modalSection}>
//                 <Text style={styles.modalSectionTitle}>Buyer Information</Text>
//                 <Text style={styles.modalText}>Name: {selectedOrder.buyerName}</Text>
//                 <Text style={styles.modalText}>Phone: {selectedOrder.buyerPhone}</Text>
//                 <Text style={styles.modalText}>Address: {selectedOrder.buyerAddress}</Text>
//               </View>

//               <View style={styles.modalSection}>
//                 <Text style={styles.modalSectionTitle}>Products</Text>
//                 {selectedOrder.products.map((product) => (
//                   <View key={product.id} style={styles.productItem}>
//                     <Text style={styles.productName}>{product.name}</Text>
//                     <Text style={styles.productDetails}>
//                       {product.quantity} {product.unit} - ${product.price.toFixed(2)}
//                     </Text>
//                   </View>
//                 ))}
//               </View>

//               <View style={styles.modalSection}>
//                 <View style={styles.totalSection}>
//                   <Text style={styles.totalText}>Total Amount: ${selectedOrder.totalAmount.toFixed(2)}</Text>
//                 </View>
//               </View>

//               {(selectedOrder.status === 'pending' || selectedOrder.status === 'confirmed') && (
//                 <View style={styles.modalActions}>
//                   <TouchableOpacity
//                     style={[styles.modalActionButton, { backgroundColor: getStatusColor(selectedOrder.status) }]}
//                     onPress={() => {
//                       setModalVisible(false);
//                       handleStatusUpdate(selectedOrder.id, selectedOrder.status);
//                     }}
//                   >
//                     <Text style={styles.modalActionButtonText}>
//                       {selectedOrder.status === 'pending' ? 'Update Status' : 'Mark as Delivered'}
//                     </Text>
//                   </TouchableOpacity>
//                 </View>
//               )}
//             </ScrollView>
//           )}
//         </View>
//       </View>
//     </Modal>
//   );

//   const renderFilterButton = (status, label) => (
//     <TouchableOpacity
//       style={[
//         styles.filterButton,
//         filterStatus === status && styles.activeFilterButton
//       ]}
//       onPress={() => setFilterStatus(status)}
//     >
//       <Text style={[
//         styles.filterButtonText,
//         filterStatus === status && styles.activeFilterButtonText
//       ]}>
//         {label} ({counts[status]})
//       </Text>
//     </TouchableOpacity>
//   );

//   return (
//     <SafeAreaView style={styles.container}>
//       <StatusBar barStyle="light-content" backgroundColor="#4CAF50" />
      
//       <View style={styles.header}>
//         <Text style={styles.headerTitle}>Farmer Dashboard</Text>
//         <TouchableOpacity onPress={fetchOrders}>
//           <Ionicons name="refresh-outline" size={24} color="white" />
//         </TouchableOpacity>
//       </View>

//       <View style={styles.filterContainer}>
//         <ScrollView horizontal showsHorizontalScrollIndicator={false}>
//           {renderFilterButton('all', 'All')}
//           {renderFilterButton('pending', 'Pending')}
//           {renderFilterButton('confirmed', 'Confirmed')}
//           {renderFilterButton('delivered', 'Delivered')}
//           {renderFilterButton('rejected', 'Rejected')}
//         </ScrollView>
//       </View>

//       <FlatList
//         data={filteredOrders}
//         renderItem={renderOrderItem}
//         keyExtractor={(item) => item.id}
//         refreshControl={
//           <RefreshControl refreshing={refreshing} onRefresh={fetchOrders} />
//         }
//         contentContainerStyle={styles.ordersList}
//         ListEmptyComponent={
//           <View style={styles.emptyState}>
//             <Ionicons name="document-outline" size={48} color="#ccc" />
//             <Text style={styles.emptyText}>No orders found</Text>
//           </View>
//         }
//       />

//       {renderOrderModal()}
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#f5f5f5',
//   },
//   header: {
//     backgroundColor: '#4CAF50',
//     paddingHorizontal: 16,
//     paddingVertical: 16,
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     elevation: 4,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//   },
//   headerTitle: {
//     color: 'white',
//     fontSize: 20,
//     fontWeight: 'bold',
//   },
//   filterContainer: {
//     backgroundColor: 'white',
//     paddingVertical: 12,
//     paddingHorizontal: 16,
//     borderBottomWidth: 1,
//     borderBottomColor: '#eee',
//   },
//   filterButton: {
//     paddingHorizontal: 16,
//     paddingVertical: 8,
//     marginRight: 8,
//     borderRadius: 20,
//     backgroundColor: '#f0f0f0',
//   },
//   activeFilterButton: {
//     backgroundColor: '#4CAF50',
//   },
//   filterButtonText: {
//     color: '#666',
//     fontSize: 12,
//     fontWeight: '500',
//   },
//   activeFilterButtonText: {
//     color: 'white',
//   },
//   ordersList: {
//     padding: 16,
//   },
//   orderCard: {
//     backgroundColor: 'white',
//     borderRadius: 8,
//     padding: 16,
//     marginBottom: 12,
//     elevation: 2,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.1,
//     shadowRadius: 2,
//   },
//   orderHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 12,
//   },
//   orderId: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: '#333',
//   },
//   statusBadge: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//     borderRadius: 12,
//   },
//   statusText: {
//     color: 'white',
//     fontSize: 10,
//     fontWeight: 'bold',
//     marginLeft: 4,
//   },
//   orderContent: {
//     marginBottom: 12,
//   },
//   buyerInfo: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 4,
//   },
//   buyerName: {
//     fontSize: 14,
//     color: '#333',
//     marginLeft: 8,
//     fontWeight: '500',
//   },
//   buyerPhone: {
//     fontSize: 14,
//     color: '#666',
//     marginLeft: 8,
//   },
//   orderDetails: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginTop: 8,
//   },
//   productCount: {
//     fontSize: 12,
//     color: '#666',
//   },
//   totalAmount: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: '#4CAF50',
//   },
//   orderDate: {
//     fontSize: 12,
//     color: '#999',
//     marginTop: 4,
//   },
//   orderActions: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },
//   viewButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 12,
//     paddingVertical: 8,
//     borderRadius: 6,
//     borderWidth: 1,
//     borderColor: '#2196F3',
//   },
//   viewButtonText: {
//     color: '#2196F3',
//     fontSize: 12,
//     marginLeft: 4,
//   },
//   actionButton: {
//     paddingHorizontal: 12,
//     paddingVertical: 8,
//     borderRadius: 6,
//   },
//   actionButtonText: {
//     color: 'white',
//     fontSize: 12,
//     fontWeight: '500',
//   },
//   modalContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: 'rgba(0, 0, 0, 0.5)',
//   },
//   modalContent: {
//     backgroundColor: 'white',
//     borderRadius: 12,
//     padding: 0,
//     margin: 20,
//     maxHeight: '80%',
//     width: '90%',
//   },
//   modalHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     padding: 16,
//     borderBottomWidth: 1,
//     borderBottomColor: '#eee',
//   },
//   modalTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#333',
//   },
//   modalBody: {
//     padding: 16,
//   },
//   modalSection: {
//     marginBottom: 16,
//   },
//   modalSectionTitle: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: '#333',
//     marginBottom: 8,
//   },
//   modalText: {
//     fontSize: 14,
//     color: '#666',
//     marginBottom: 4,
//   },
//   productItem: {
//     backgroundColor: '#f9f9f9',
//     padding: 12,
//     borderRadius: 6,
//     marginBottom: 8,
//   },
//   productName: {
//     fontSize: 14,
//     fontWeight: '500',
//     color: '#333',
//   },
//   productDetails: {
//     fontSize: 12,
//     color: '#666',
//     marginTop: 2,
//   },
//   totalSection: {
//     borderTopWidth: 1,
//     borderTopColor: '#eee',
//     paddingTop: 12,
//   },
//   totalText: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#4CAF50',
//     textAlign: 'center',
//   },
//   modalActions: {
//     marginTop: 16,
//   },
//   modalActionButton: {
//     paddingVertical: 12,
//     paddingHorizontal: 24,
//     borderRadius: 6,
//     alignItems: 'center',
//   },
//   modalActionButtonText: {
//     color: 'white',
//     fontSize: 16,
//     fontWeight: '500',
//   },
//   emptyState: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingTop: 50,
//   },
//   emptyText: {
//     fontSize: 16,
//     color: '#999',
//     marginTop: 16,
//   },
// });

// export default FarmerOrderDashboard;



import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FarmerOrderDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch orders when the screen loads
  useEffect(() => {
    const fetchOrders = async () => {
      try {
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
      }
    };

    fetchOrders();
  }, []);

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
        body: JSON.stringify({ status: newStatus }),  // Pass the new status in the body
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

  // Render order details and status change buttons
  const renderOrder = ({ item }) => (
    <View style={{ padding: 16, marginBottom: 10, backgroundColor: '#f9f9f9', borderRadius: 8 }}>
      <Text>Order #{item._id}</Text>
      <Text>Status: {item.status}</Text>
      <Text>Total: {item.totalAmount} RWF</Text>

      {/* If the order status is 'Pending', show action buttons */}
      {item.status === 'Pending' && (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
          <TouchableOpacity
            style={{ backgroundColor: '#4CAF50', padding: 8, borderRadius: 4 }}
            onPress={() => handleStatusChange(item._id, 'Processed')}
          >
            <Text style={{ color: '#fff' }}>Process</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{ backgroundColor: '#2196F3', padding: 8, borderRadius: 4 }}
            onPress={() => handleStatusChange(item._id, 'Shipped')}
          >
            <Text style={{ color: '#fff' }}>Ship</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{ backgroundColor: '#FF9800', padding: 8, borderRadius: 4 }}
            onPress={() => handleStatusChange(item._id, 'Delivered')}
          >
            <Text style={{ color: '#fff' }}>Deliver</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{ backgroundColor: '#f44336', padding: 8, borderRadius: 4 }}
            onPress={() => handleStatusChange(item._id, 'Canceled')}
          >
            <Text style={{ color: '#fff' }}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* If the order status is already 'Processed', 'Shipped', or 'Delivered', show an info message */}
      {['Processed', 'Shipped', 'Delivered'].includes(item.status) && (
        <Text style={{ marginTop: 10, color: '#757575' }}>You cannot modify this order further.</Text>
      )}
    </View>
  );

  return (
    <View style={{ flex: 1, padding: 16 }}>
      {isLoading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item._id}
          renderItem={renderOrder}
        />
      )}
    </View>
  );
};

export default FarmerOrderDashboard;

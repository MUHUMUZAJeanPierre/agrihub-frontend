// import React from 'react';
// import {
//   View, Text, FlatList, Image, TouchableOpacity,
//   StyleSheet, SafeAreaView, Alert
// } from 'react-native';
// import { Ionicons } from '@expo/vector-icons';
// import { useCart } from '../contexts/CartContext';

// const CartScreen = ({ navigation }) => {
//   const { cartItems, removeFromCart, updateQuantity, clearCart } = useCart();

//   const extractPrice = (price) => parseFloat(price?.replace(/[^\d.]/g, '') || 0);

//   const total = cartItems.reduce((sum, item) => {
//     const price = extractPrice(item.current_price || item.price);
//     return sum + price * item.quantity;
//   }, 0);

//   const renderItem = ({ item }) => (
//     <View style={styles.itemCard}>
//       <Image source={{ uri: item.img }} style={styles.image} />
//       <View style={styles.info}>
//         <Text style={styles.name}>{item.title}</Text>
//         <Text style={styles.price}>RWF {item.current_price || item.price}</Text>
//         <View style={styles.controls}>
//           <TouchableOpacity onPress={() => updateQuantity(item._id, item.quantity - 1)}>
//             <Ionicons name="remove-circle-outline" size={24} color="#4A90E2" />
//           </TouchableOpacity>
//           <Text style={styles.qty}>{item.quantity}</Text>
//           <TouchableOpacity onPress={() => updateQuantity(item._id, item.quantity + 1)}>
//             <Ionicons name="add-circle-outline" size={24} color="#4A90E2" />
//           </TouchableOpacity>
//         </View>
//         <TouchableOpacity onPress={() => removeFromCart(item._id)}>
//           <Text style={styles.remove}>Remove</Text>
//         </TouchableOpacity>
//       </View>
//     </View>
//   );

//   return (
//     <SafeAreaView style={styles.container}>
//       <View style={styles.header}>
//         <TouchableOpacity onPress={() => navigation.goBack()}>
//           <Ionicons name="arrow-back" size={24} color="#000" />
//         </TouchableOpacity>
//         <Text style={styles.headerText}>Cart</Text>
//         <TouchableOpacity onPress={clearCart}>
//           <Text style={styles.clear}>Clear</Text>
//         </TouchableOpacity>
//       </View>

//       {cartItems.length === 0 ? (
//         <Text style={styles.empty}>Your cart is empty</Text>
//       ) : (
//         <FlatList
//           data={cartItems}
//           keyExtractor={(item) => item._id}
//           renderItem={renderItem}
//           contentContainerStyle={styles.list}
//         />
//       )}

//       <View style={styles.totalBox}>
//         <Text style={styles.totalText}>Total: RWF {total.toLocaleString()}</Text>
//         <TouchableOpacity style={styles.checkoutBtn} onPress={() => Alert.alert('Checkout', 'Proceeding to checkout...')}>
//           <Text style={styles.checkoutText}>Checkout</Text>
//         </TouchableOpacity>
//       </View>
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: '#fff' },
//   header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
//   headerText: { fontSize: 20, fontWeight: 'bold' },
//   clear: { color: 'red' },
//   list: { padding: 16 },
//   itemCard: { flexDirection: 'row', marginBottom: 16, backgroundColor: '#f9f9f9', borderRadius: 10, overflow: 'hidden' },
//   image: { width: 100, height: 100 },
//   info: { flex: 1, padding: 10 },
//   name: { fontSize: 16, fontWeight: 'bold' },
//   price: { fontSize: 14, color: 'green' },
//   controls: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 5 },
//   qty: { fontSize: 16 },
//   remove: { color: 'red', marginTop: 5 },
//   empty: { textAlign: 'center', marginTop: 100, color: '#666' },
//   totalBox: { borderTopWidth: 1, borderColor: '#ccc', padding: 16 },
//   totalText: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
//   checkoutBtn: { backgroundColor: '#4A90E2', padding: 12, borderRadius: 6 },
//   checkoutText: { color: '#fff', textAlign: 'center', fontWeight: '600' },
// });

// export default CartScreen;

import React from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  Dimensions,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../contexts/CartContext';

const { width } = Dimensions.get('window');

const CartScreen = ({ navigation }) => {
  const { cartItems, removeFromCart, updateQuantity, clearCart } = useCart();

  // Helper function to extract numeric price from string
  const extractPrice = (price) => {
    if (!price) return 0;
    const numericPrice = parseFloat(price.toString().replace(/[^\d.]/g, ''));
    return isNaN(numericPrice) ? 0 : numericPrice;
  };

  // Calculate total price
  const total = cartItems.reduce((sum, item) => {
    const price = extractPrice(item.current_price || item.price);
    return sum + (price * item.quantity);
  }, 0);

  // Handle quantity update with validation
  const handleQuantityUpdate = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      Alert.alert(
        'Remove Item',
        'Do you want to remove this item from cart?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Remove', style: 'destructive', onPress: () => removeFromCart(itemId) }
        ]
      );
    } else {
      updateQuantity(itemId, newQuantity);
    }
  };

  // Handle remove item with confirmation
  const handleRemoveItem = (itemId, itemName) => {
    Alert.alert(
      'Remove Item',
      `Remove "${itemName}" from cart?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => removeFromCart(itemId) }
      ]
    );
  };

  // Handle clear cart
  const handleClearCart = () => {
    Alert.alert(
      'Clear Cart',
      'Are you sure you want to remove all items from cart?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear All', style: 'destructive', onPress: clearCart }
      ]
    );
  };

  // Handle checkout
  const handleCheckout = () => {
    if (cartItems.length === 0) {
      Alert.alert('Empty Cart', 'Please add items to cart before checkout.');
      return;
    }
    
    Alert.alert(
      'Checkout',
      `Total: $${total.toFixed(2)}\nProceed to payment?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Proceed', onPress: () => navigation.navigate('Checkout') }
      ]
    );
  };

  // Render individual cart item
  const renderCartItem = ({ item, index }) => {
    const itemPrice = extractPrice(item.current_price || item.price);
    const itemTotal = itemPrice * item.quantity;

    return (
      <View style={[styles.itemCard, { marginTop: index === 0 ? 8 : 6 }]}>
        {/* Product Image */}
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: item.img || item.image }} 
            style={styles.productImage}
            resizeMode="cover"
          />
        </View>

        {/* Product Details */}
        <View style={styles.itemContent}>
          <View style={styles.itemHeader}>
            <Text style={styles.itemName} numberOfLines={2}>
              {item.title || item.name || 'Product'}
            </Text>
            <TouchableOpacity 
              style={styles.removeButton}
              onPress={() => handleRemoveItem(item._id, item.title)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="trash-outline" size={18} color="#FF6B6B" />
            </TouchableOpacity>
          </View>

          {/* Price and Total */}
          <View style={styles.priceContainer}>
            <Text style={styles.unitPrice}>
              ${itemPrice.toFixed(2)} each
            </Text>
            <Text style={styles.itemTotal}>
              ${itemTotal.toFixed(2)}
            </Text>
          </View>

          {/* Quantity Controls */}
          <View style={styles.quantitySection}>
            <View style={styles.quantityControls}>
              <TouchableOpacity 
                style={[styles.quantityButton, styles.decreaseButton]}
                onPress={() => handleQuantityUpdate(item._id, item.quantity - 1)}
                disabled={item.quantity <= 1}
              >
                <Ionicons 
                  name="remove" 
                  size={16} 
                  color={item.quantity <= 1 ? '#CCC' : '#666'} 
                />
              </TouchableOpacity>
              
              <View style={styles.quantityDisplay}>
                <Text style={styles.quantityText}>
                  {item.quantity % 1 === 0 ? item.quantity.toString() : item.quantity.toFixed(1)}
                </Text>
              </View>
              
              <TouchableOpacity 
                style={[styles.quantityButton, styles.increaseButton]}
                onPress={() => handleQuantityUpdate(item._id, item.quantity + 1)}
              >
                <Ionicons name="add" size={16} color="#666" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    );
  };

  // Empty cart component
  const EmptyCart = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Ionicons name="bag-outline" size={80} color="#DDD" />
      </View>
      <Text style={styles.emptyTitle}>Your cart is empty</Text>
      <Text style={styles.emptySubtitle}>
        Add some products to get started
      </Text>
      <TouchableOpacity 
        style={styles.shopButton}
        onPress={() => navigation.navigate('Home')}
      >
        <Text style={styles.shopButtonText}>Start Shopping</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>My Cart</Text>
          {cartItems.length > 0 && (
            <Text style={styles.itemCount}>
              {cartItems.length} item{cartItems.length !== 1 ? 's' : ''}
            </Text>
          )}
        </View>
        
        {cartItems.length > 0 && (
          <TouchableOpacity 
            style={styles.clearButton}
            onPress={handleClearCart}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.clearButtonText}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Cart Content */}
      {cartItems.length === 0 ? (
        <EmptyCart />
      ) : (
        <>
          <FlatList
            data={cartItems}
            keyExtractor={(item) => item._id?.toString() || Math.random().toString()}
            renderItem={renderCartItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            bounces={true}
            style={styles.cartList}
          />

          {/* Cart Summary */}
          <View style={styles.summaryContainer}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>
                Subtotal ({cartItems.length} item{cartItems.length !== 1 ? 's' : ''})
              </Text>
              <Text style={styles.summaryValue}>${total.toFixed(2)}</Text>
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
            </View>
            
            <TouchableOpacity 
              style={styles.checkoutButton}
              onPress={handleCheckout}
              activeOpacity={0.8}
            >
              <Text style={styles.checkoutButtonText}>
                Proceed to Checkout • ${total.toFixed(2)}
              </Text>
              <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  
  // Header Styles
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  headerTitleContainer: {
    flex: 1,
    marginLeft: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#212529',
    marginBottom: 2,
  },
  itemCount: {
    fontSize: 14,
    color: '#6C757D',
    fontWeight: '500',
  },
  clearButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  clearButtonText: {
    fontSize: 14,
    color: '#FF6B6B',
    fontWeight: '600',
  },
  
  // Cart List Styles
  cartList: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  
  // Item Card Styles
  itemCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  imageContainer: {
    width: 90,
    height: 90,
    borderRadius: 12,
    backgroundColor: '#F8F9FA',
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  itemContent: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'space-between',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  itemName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    lineHeight: 22,
    marginRight: 8,
  },
  removeButton: {
    padding: 4,
    borderRadius: 6,
  },
  
  // Price Styles
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  unitPrice: {
    fontSize: 14,
    color: '#6C757D',
    fontWeight: '500',
  },
  itemTotal: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FF8C42',
  },
  
  // Quantity Styles
  quantitySection: {
    alignItems: 'flex-start',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 10,
    padding: 2,
  },
  quantityButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  decreaseButton: {
    backgroundColor: '#E9ECEF',
  },
  increaseButton: {
    backgroundColor: '#E9ECEF',
  },
  quantityDisplay: {
    minWidth: 50,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
  },
  
  // Empty State Styles
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyIconContainer: {
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#495057',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6C757D',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  shopButton: {
    backgroundColor: '#FF8C42',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 25,
    elevation: 2,
    shadowColor: '#FF8C42',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  shopButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  
  // Summary Styles
  summaryContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 32,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#6C757D',
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 16,
    color: '#212529',
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#E9ECEF',
    marginVertical: 16,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  totalLabel: {
    fontSize: 20,
    fontWeight: '700',
    color: '#212529',
  },
  totalValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FF8C42',
  },
  checkoutButton: {
    flexDirection: 'row',
    backgroundColor: '#FF8C42',
    borderRadius: 25,
    paddingVertical: 18,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#FF8C42',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  checkoutButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginRight: 8,
  },
});

export default CartScreen;
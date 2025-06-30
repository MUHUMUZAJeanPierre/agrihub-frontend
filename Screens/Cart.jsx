import React, { useState, useEffect } from 'react';
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
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../contexts/CartContext';
import * as SecureStore from 'expo-secure-store';

const { width } = Dimensions.get('window');

const API_CONFIG = {
  ORDER_URL: 'https://agrihub-backend-4z99.onrender.com/orders/place-order',
};

const AUTH_KEYS = {
  TOKEN: 'auth_token',
  USER_ID: 'user_id',
  USER_DATA: 'user_data',
};

const CartScreen = ({ navigation }) => {
  const [authToken, setAuthToken] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const { cartItems, removeFromCart, updateQuantity, clearCart } = useCart();

  useEffect(() => {
    loadAuthToken();
  }, []);

  const loadAuthToken = async () => {
    try {
      const token = await SecureStore.getItemAsync('auth_token');
      setAuthToken(token);
    } catch (error) {
      console.log('Token load error:', error);
    }
  };

  const handlePlaceOrder = async () => {
    if (isPlacingOrder) return; // Prevent double submission

    try {
      setIsPlacingOrder(true);
      
      const token = await SecureStore.getItemAsync('auth_token');

      if (!token) {
        Alert.alert('Authentication Required', 'Please log in to place an order.');
        navigation.navigate('Login'); // Navigate to login if not authenticated
        return;
      }

      if (cartItems.length === 0) {
        Alert.alert('Cart is Empty', 'Add items to cart before placing order.');
        return;
      }

      // Prepare order data
      const orderData = {
        items: cartItems.map(item => ({
          productId: item._id,
          name: item.title || item.name,
          price: extractPrice(item.current_price || item.price),
          quantity: item.quantity,
          total: extractPrice(item.current_price || item.price) * item.quantity
        })),
        totalAmount: total,
        timestamp: new Date().toISOString()
      };

      const response = await fetch(API_CONFIG.ORDER_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert(
          '✅ Order Placed Successfully', 
          'Your order has been submitted and will be processed soon.',
          [
            {
              text: 'Continue Shopping',
              onPress: () => {
                clearCart();
                navigation.navigate('Home');
              }
            }
          ]
        );
      } else {
        console.error('❌ Order failed:', data);
        Alert.alert(
          '❌ Order Failed', 
          data?.message || data?.error || 'Unable to place order. Please try again.'
        );
      }
    } catch (error) {
      console.error('❌ Network/order error:', error);
      Alert.alert(
        'Network Error', 
        'Unable to place your order. Please check your connection and try again.'
      );
    } finally {
      setIsPlacingOrder(false);
    }
  };

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
          { 
            text: 'Remove', 
            style: 'destructive', 
            onPress: () => removeFromCart(itemId) 
          }
        ]
      );
    } else if (newQuantity > 99) {
      Alert.alert('Quantity Limit', 'Maximum quantity per item is 99.');
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
        { 
          text: 'Remove', 
          style: 'destructive', 
          onPress: () => removeFromCart(itemId) 
        }
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
        { 
          text: 'Clear All', 
          style: 'destructive', 
          onPress: clearCart 
        }
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
            source={{ 
              uri: item.img || item.image || 'https://via.placeholder.com/90x90?text=No+Image'
            }}
            style={styles.productImage}
            resizeMode="cover"
            onError={(e) => {
              console.log('Image load error:', e.nativeEvent.error);
            }}
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
              onPress={() => handleRemoveItem(item._id, item.title || item.name)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessibilityLabel="Remove item"
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
                style={[
                  styles.quantityButton, 
                  styles.decreaseButton,
                  item.quantity <= 1 && styles.disabledButton
                ]}
                onPress={() => handleQuantityUpdate(item._id, item.quantity - 1)}
                disabled={item.quantity <= 1}
                accessibilityLabel="Decrease quantity"
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
                accessibilityLabel="Increase quantity"
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
        activeOpacity={0.8}
      >
        <Text style={styles.shopButtonText}>Start Shopping</Text>
      </TouchableOpacity>
    </View>
  );

  // Loading overlay
  const LoadingOverlay = () => (
    <View style={styles.loadingOverlay}>
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF8C42" />
        <Text style={styles.loadingText}>Placing your order...</Text>
      </View>
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
          accessibilityLabel="Go back"
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
            accessibilityLabel="Clear cart"
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
            keyExtractor={(item, index) => item._id?.toString() || index.toString()}
            renderItem={renderCartItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            bounces={true}
            style={styles.cartList}
            removeClippedSubviews={true}
            maxToRenderPerBatch={10}
            windowSize={10}
          />

          {/* Cart Summary */}
          <View style={styles.summaryContainer}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>
                Subtotal ({cartItems.length} item{cartItems.length !== 1 ? 's' : ''})
              </Text>
              <Text style={styles.summaryValue}>${total.toFixed(2)}</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Delivery Fee</Text>
              <Text style={styles.summaryValue}>FREE</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
            </View>

            <TouchableOpacity
              style={[
                styles.checkoutButton,
                (isPlacingOrder || total === 0) && styles.disabledCheckoutButton
              ]}
              onPress={handlePlaceOrder}
              activeOpacity={0.8}
              disabled={isPlacingOrder || total === 0}
            >
              {isPlacingOrder ? (
                <>
                  <ActivityIndicator size="small" color="#FFFFFF" />
                  <Text style={styles.checkoutButtonText}>Processing...</Text>
                </>
              ) : (
                <>
                  <Text style={styles.checkoutButtonText}>
                    Place Order • ${total.toFixed(2)}
                  </Text>
                  <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
                </>
              )}
            </TouchableOpacity>
          </View>
        </>
      )}

      {/* Loading Overlay */}
      {isPlacingOrder && <LoadingOverlay />}
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

  cartList: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },

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
    color: '#2E7D31',
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
    backgroundColor: '#E9ECEF',
  },
  decreaseButton: {
    backgroundColor: '#E9ECEF',
  },
  increaseButton: {
    backgroundColor: '#E9ECEF',
  },
  disabledButton: {
    backgroundColor: '#F8F9FA',
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
    backgroundColor: '#2E7D31',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 25,
    elevation: 2,
    shadowColor: '#bbf7d0',
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
    color: '#2E7D31',
  },
  checkoutButton: {
    flexDirection: 'row',
    backgroundColor: '#2E7D31',
    borderRadius: 25,
    paddingVertical: 18,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#2E7D31',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  disabledCheckoutButton: {
    backgroundColor: '#CCC',
    elevation: 0,
    shadowOpacity: 0,
  },
  checkoutButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginRight: 8,
  },

  // Loading Styles
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingContainer: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
  },
});

export default CartScreen;
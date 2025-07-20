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
import { useTheme } from '../contexts/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

// Color Schemes
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

const API_CONFIG = {
  ORDER_URL: 'https://agrihub-backend-4z99.onrender.com/api/orders/place-order',
};

const AUTH_KEYS = {
  TOKEN: '@auth_token',
  USER_ID: '@user_id',
  USER_DATA: '@user_data',
};

const CartScreen = ({ navigation }) => {
  const [authToken, setAuthToken] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const { cartItems, removeFromCart, updateQuantity, clearCart, refreshCart } = useCart();
  const { theme } = useTheme();
  const Colors = theme === 'dark' ? DarkColors : LightColors;

  useEffect(() => {
    loadAuthToken();
  }, []);

  const loadAuthToken = async () => {
    try {
      const token = await AsyncStorage.getItem(AUTH_KEYS.TOKEN);
      setAuthToken(token);
    } catch (error) {
      console.log('Token load error:', error);
    }
  };

  const handleRefreshCart = async () => {
    if (isUpdating) return;
    
    setIsUpdating(true);
    try {
      if (refreshCart) {
        await refreshCart();
      }
    } catch (error) {
      console.error('Error refreshing cart:', error);
      Alert.alert('Update Failed', 'Unable to refresh cart. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  // const handlePlaceOrder = async () => {
  //   if (isPlacingOrder) return; 

  //   try {
  //     setIsPlacingOrder(true);

  //     const token = await AsyncStorage.getItem(AUTH_KEYS.TOKEN);
  //     if (!token) {
  //       Alert.alert('Authentication Required', 'Please log in to place an order.');
  //       navigation.navigate('Login');
  //       return;
  //     }

  //     if (cartItems.length === 0) {
  //       Alert.alert('Cart is Empty', 'Add items to cart before placing an order.');
  //       return;
  //     }

  //     console.log('Cart Items:', cartItems);

  //     const totalAmount = cartItems.reduce((sum, item) => {
  //       const price = extractPrice(item.current_price || item.price);
  //       return sum + price * item.quantity;
  //     }, 0);

  //     if (totalAmount <= 0) {
  //       Alert.alert('Error', 'Total amount calculation failed.');
  //       return;
  //     }

  //     const orderData = {
  //       items: cartItems.map(item => ({
  //         product: item._id,  
  //         quantity: item.quantity,
  //       })),
  //       totalAmount: totalAmount,  
  //     };

  //     console.log("Sending order data:", JSON.stringify(orderData));

  //     const response = await fetch(API_CONFIG.ORDER_URL, {
  //       method: 'POST',
  //       headers: {
  //         'Authorization': `Bearer ${token}`,
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify(orderData),
  //     });

  //     const data = await response.json();
  //     if (response.ok) {
  //       Alert.alert(
  //         '✅ Order Placed Successfully',
  //         'Your order has been submitted and will be processed soon.',
  //         [
  //           {
  //             text: 'Continue Shopping',
  //             onPress: () => {
  //               clearCart();
  //               navigation.navigate('Home');
  //             }
  //           }
  //         ]
  //       );
  //     } else {
  //       console.error('❌ Order failed:', data);
  //       Alert.alert(
  //         '❌ Order Failed',
  //         data?.message || data?.error || 'Unable to place order. Please try again.'
  //       );
  //     }
  //   } catch (error) {
  //     console.error('❌ Network/order error:', error);
  //     Alert.alert(
  //       'Network Error',
  //       'Unable to place your order. Please check your connection and try again.'
  //     );
  //   } finally {
  //     setIsPlacingOrder(false);
  //   }
  // };

  const handlePlaceOrder = async () => {
  if (isPlacingOrder) return;

  try {
    setIsPlacingOrder(true);

    const token = await AsyncStorage.getItem(AUTH_KEYS.TOKEN);
    if (!token) {
      Alert.alert('Authentication Required', 'Please log in to place an order.');
      navigation.navigate('Login');
      return;
    }

    if (cartItems.length === 0) {
      Alert.alert('Cart is Empty', 'Add items to cart before placing an order.');
      return;
    }

    const totalAmount = cartItems.reduce((sum, item) => {
      const price = extractPrice(item.current_price || item.price);
      return sum + price * item.quantity;
    }, 0);

    if (totalAmount <= 0) {
      Alert.alert('Error', 'Total amount calculation failed.');
      return;
    }

    const orderData = {
      items: cartItems.map(item => ({
        product: item._id,  // Ensure that you are sending the correct product ID
        quantity: item.quantity,
      })),
      totalAmount: totalAmount,  
    };

    console.log("Sending order data:", JSON.stringify(orderData));

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

  const total = cartItems.reduce((sum, item) => {
    const price = extractPrice(item.current_price || item.price);
    return sum + (price * item.quantity);
  }, 0);

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

  const renderCartItem = ({ item, index }) => {
    const itemPrice = extractPrice(item.current_price || item.price);
    const itemTotal = itemPrice * item.quantity;

    return (
      <View style={[
        styles.itemCard, 
        { marginTop: index === 0 ? 8 : 6, backgroundColor: Colors.cardBackground }
      ]}>
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

        <View style={styles.itemContent}>
          <View style={styles.itemHeader}>
            <Text style={[styles.itemName, { color: Colors.textPrimary }]} numberOfLines={2}>
              {item.title || item.name || 'Product'}
            </Text>
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => handleRemoveItem(item._id, item.title || item.name)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessibilityLabel="Remove item"
            >
              <Ionicons name="trash-outline" size={18} color={Colors.error} />
            </TouchableOpacity>
          </View>

          <View style={styles.priceContainer}>
            <Text style={[styles.unitPrice, { color: Colors.textSecondary }]}>
              ${itemPrice.toFixed(2)} each
            </Text>
            <Text style={[styles.itemTotal, { color: Colors.success }]}>
              ${itemTotal.toFixed(2)}
            </Text>
          </View>

          <View style={styles.quantitySection}>
            <View style={[styles.quantityControls, { backgroundColor: Colors.surfaceLight }]}>
              <TouchableOpacity
                style={[
                  styles.quantityButton, 
                  styles.decreaseButton, 
                  item.quantity <= 1 && styles.disabledButton,
                  { backgroundColor: item.quantity <= 1 ? Colors.surfaceLight : Colors.surface }
                ]}
                onPress={() => handleQuantityUpdate(item._id, item.quantity - 1)}
                disabled={item.quantity <= 1}
                accessibilityLabel="Decrease quantity"
              >
                <Ionicons 
                  name="remove" 
                  size={16} 
                  color={item.quantity <= 1 ? Colors.textTertiary : Colors.textSecondary} 
                />
              </TouchableOpacity>

              <View style={styles.quantityDisplay}>
                <Text style={[styles.quantityText, { color: Colors.textPrimary }]}>
                  {item.quantity}
                </Text>
              </View>

              <TouchableOpacity
                style={[
                  styles.quantityButton, 
                  styles.increaseButton,
                  { backgroundColor: Colors.surface }
                ]}
                onPress={() => handleQuantityUpdate(item._id, item.quantity + 1)}
                accessibilityLabel="Increase quantity"
              >
                <Ionicons 
                  name="add" 
                  size={16} 
                  color={Colors.textSecondary} 
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const EmptyCart = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Ionicons 
          name="bag-outline" 
          size={80} 
          color={Colors.textTertiary} 
        />
      </View>
      <Text style={[styles.emptyTitle, { color: Colors.textPrimary }]}>
        Your cart is empty
      </Text>
      <Text style={[styles.emptySubtitle, { color: Colors.textSecondary }]}>
        Add some products to get started
      </Text>
      <TouchableOpacity
        style={[styles.shopButton, { backgroundColor: Colors.success }]}
        onPress={() => navigation.navigate('Home')}
        activeOpacity={0.8}
      >
        <Text style={styles.shopButtonText}>Start Shopping</Text>
      </TouchableOpacity>
    </View>
  );

  const LoadingOverlay = () => (
    <View style={styles.loadingOverlay}>
      <View style={[styles.loadingContainer, { backgroundColor: Colors.cardBackground }]}>
        <ActivityIndicator size="large" color={Colors.success} />
        <Text style={[styles.loadingText, { color: Colors.textPrimary }]}>
          Placing your order...
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors.background }]}>
      <StatusBar 
        barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} 
        backgroundColor={Colors.background} 
      />
      <View style={[styles.header, { backgroundColor: Colors.cardBackground, borderBottomColor: Colors.borderColor }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityLabel="Go back"
        >
          <Ionicons 
            name="arrow-back" 
            size={24} 
            color={Colors.textPrimary} 
          />
        </TouchableOpacity>

        <View style={styles.headerTitleContainer}>
          <Text style={[styles.headerTitle, { color: Colors.textPrimary }]}>
            My Cart
          </Text>
          {cartItems.length > 0 && (
            <Text style={[styles.itemCount, { color: Colors.textSecondary }]}>
              {cartItems.length} item{cartItems.length !== 1 ? 's' : ''}
            </Text>
          )}
        </View>

        {cartItems.length > 0 && (
          <TouchableOpacity
            style={[styles.updateButton, { backgroundColor: Colors.surfaceLight }]}
            onPress={handleRefreshCart}
            disabled={isUpdating}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityLabel="Refresh cart"
          >
            {isUpdating ? (
              <ActivityIndicator size="small" color={Colors.success} />
            ) : (
              <Ionicons name="refresh-outline" size={20} color={Colors.success} />
            )}
          </TouchableOpacity>
        )}

        {cartItems.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={handleClearCart}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityLabel="Clear cart"
          >
            <Text style={[styles.clearButtonText, { color: Colors.success }]}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>


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

          <View style={[styles.summaryContainer, { backgroundColor: Colors.cardBackground }]}>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: Colors.textSecondary }]}>
                Subtotal ({cartItems.length} item{cartItems.length !== 1 ? 's' : ''})
              </Text>
              <Text style={[styles.summaryValue, { color: Colors.textPrimary }]}>
                ${total.toFixed(2)}
              </Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: Colors.textSecondary }]}>
                Delivery Fee
              </Text>
              <Text style={[styles.summaryValue, { color: Colors.textPrimary }]}>
                FREE
              </Text>
            </View>

            <View style={[styles.divider, { backgroundColor: Colors.borderColor }]} />

            <View style={styles.totalRow}>
              <Text style={[styles.totalLabel, { color: Colors.textPrimary }]}>
                Total
              </Text>
              <Text style={[styles.totalValue, { color: Colors.success }]}>${total.toFixed(2)}</Text>
            </View>

            <TouchableOpacity
              style={[
                styles.checkoutButton, 
                { backgroundColor: (isPlacingOrder || total === 0) ? Colors.textTertiary : Colors.success },
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
                  <Text style={styles.checkoutButtonText}>Place Order • ${total.toFixed(2)}</Text>
                  <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
                </>
              )}
            </TouchableOpacity>
          </View>
        </>
      )}
      {isPlacingOrder && <LoadingOverlay />}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  containerDark: {
    backgroundColor: '#111827',
  },

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
  headerDark: {
    backgroundColor: '#1F2937',
    borderBottomColor: '#374151',
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
  headerTitleDark: {
    color: '#F3F4F6',
  },
  itemCount: {
    fontSize: 14,
    color: '#6C757D',
    fontWeight: '500',
  },
  itemCountDark: {
    color: '#9CA3AF',
  },
  updateButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 18,
    backgroundColor: '#F8F9FA',
    marginRight: 8,
  },
  updateButtonDark: {
    backgroundColor: '#374151',
  },
  clearButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  clearButtonText: {
    fontSize: 14,
    color: '#2E7D31',
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
  itemCardDark: {
    backgroundColor: '#1F2937',
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
  itemNameDark: {
    color: '#F3F4F6',
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
  unitPriceDark: {
    color: '#9CA3AF',
  },
  itemTotal: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2E7D31',
  },

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
  quantityControlsDark: {
    backgroundColor: '#374151',
  },
  quantityButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#E9ECEF',
  },
  quantityButtonDark: {
    backgroundColor: '#4B5563',
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
  disabledButtonDark: {
    backgroundColor: '#374151',
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
  quantityTextDark: {
    color: '#F3F4F6',
  },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#495057',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyTitleDark: {
    color: '#E5E7EB',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6C757D',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  emptySubtitleDark: {
    color: '#9CA3AF',
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
  summaryContainerDark: {
    backgroundColor: '#1F2937',
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
  summaryLabelDark: {
    color: '#9CA3AF',
  },
  summaryValue: {
    fontSize: 16,
    color: '#212529',
    fontWeight: '600',
  },
  summaryValueDark: {
    color: '#F3F4F6',
  },
  divider: {
    height: 1,
    backgroundColor: '#E9ECEF',
    marginVertical: 16,
  },
  dividerDark: {
    backgroundColor: '#374151',
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
  totalLabelDark: {
    color: '#F3F4F6',
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
  loadingContainerDark: {
    backgroundColor: '#1F2937',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
  },
  loadingTextDark: {
    color: '#F3F4F6',
  },
});

export default CartScreen;
import React from 'react';
import { 
  Modal, 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  Alert,
  StyleSheet,
  SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const Colors = {
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

const CartItemCard = ({ item, onUpdateQuantity, onRemove }) => (
  <View style={styles.cartItem}>
    <Image source={{ uri: item.img }} style={styles.cartItemImage} />
    <View style={styles.cartItemInfo}>
      <Text style={styles.cartItemTitle}>{item.title}</Text>
      <Text style={styles.cartItemPrice}>{item.current_price || item.price}</Text>
      <View style={styles.quantityContainer}>
        <TouchableOpacity
          style={styles.quantityButton}
          onPress={() => onUpdateQuantity(item._id, item.quantity - 1)}
        >
          <Ionicons name="remove" size={16} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.quantityText}>{item.quantity}</Text>
        <TouchableOpacity
          style={styles.quantityButton}
          onPress={() => onUpdateQuantity(item._id, item.quantity + 1)}
        >
          <Ionicons name="add" size={16} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>
    </View>
    <TouchableOpacity
      style={styles.removeButton}
      onPress={() => onRemove(item._id)}
    >
      <Ionicons name="trash-outline" size={20} color={Colors.error} />
    </TouchableOpacity>
  </View>
);

const CartModal = ({ 
  visible, 
  onClose, 
  cartItems, 
  cartTotal, 
  cartItemCount,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onCheckout
}) => {
  const handleClearCart = () => {
    Alert.alert(
      'Clear Cart',
      'Are you sure you want to remove all items from your cart?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear', style: 'destructive', onPress: onClearCart }
      ]
    );
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Shopping Cart ({cartItemCount})</Text>
          <TouchableOpacity onPress={onClose} style={styles.modalCloseButton}>
            <Ionicons name="close" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {cartItems.length === 0 ? (
          <View style={styles.emptyCart}>
            <Ionicons name="bag-outline" size={80} color={Colors.textSecondary} />
            <Text style={styles.emptyCartTitle}>Your cart is empty</Text>
            <Text style={styles.emptyCartSubtitle}>Add items to get started</Text>
            <TouchableOpacity style={styles.shopNowBtn} onPress={onClose}>
              <Text style={styles.shopNowBtnText}>Continue Shopping</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.cartContent}>
            <ScrollView style={styles.cartItems}>
              {cartItems.map((item) => (
                <CartItemCard
                  key={item._id}
                  item={item}
                  onUpdateQuantity={onUpdateQuantity}
                  onRemove={onRemoveItem}
                />
              ))}
            </ScrollView>

            <View style={styles.cartFooter}>
              <View style={styles.cartSummary}>
                <View style={styles.cartTotal}>
                  <Text style={styles.cartTotalLabel}>Total ({cartItemCount} items):</Text>
                  <Text style={styles.cartTotalAmount}>RWF {cartTotal.toLocaleString()}</Text>
                </View>
                <TouchableOpacity style={styles.clearCartButton} onPress={handleClearCart}>
                  <Text style={styles.clearCartText}>Clear Cart</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity style={styles.checkoutBtn} onPress={onCheckout}>
                <Text style={styles.checkoutBtnText}>Order Now</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderColor,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  modalCloseButton: {
    padding: 4,
  },
  emptyCart: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    gap: 16,
  },
  emptyCartTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  emptyCartSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  shopNowBtn: {
    backgroundColor: '#2E7D31',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  shopNowBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  cartContent: {
    flex: 1,
  },
  cartItems: {
    flex: 1,
    paddingHorizontal: 20,
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cartItemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  cartItemInfo: {
    flex: 1,
  },
  cartItemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  cartItemPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2E7D31',
    marginBottom: 8,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    minWidth: 20,
    textAlign: 'center',
  },
  removeButton: {
    padding: 8,
  },
  cartFooter: {
    borderTopWidth: 1,
    borderTopColor: Colors.borderColor,
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.cardBackground,
  },
  cartSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cartTotal: {
    flex: 1,
  },
  cartTotalLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  cartTotalAmount: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  clearCartButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: Colors.surface,
  },
  clearCartText: {
    fontSize: 12,
    color: Colors.error,
    fontWeight: '500',
  },
  checkoutBtn: {
    backgroundColor: '#2E7D31',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  checkoutBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

export default CartModal;
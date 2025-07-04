
// components/BuyerDashboard/FloatingCartButton.js
import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from './styles';

const FloatingCartButton = ({ cartItemCount, onPress }) => {
  return (
    <TouchableOpacity
      style={styles.cartIcon}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.cartIconContainer}>
        <Ionicons name="bag-outline" size={24} color="#fff" />
        {cartItemCount > 0 && (
          <View style={styles.cartBadge}>
            <Text style={styles.cartBadgeText}>
              {cartItemCount > 99 ? '99+' : cartItemCount}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cartIcon: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    zIndex: 1000,
  },
  cartIconContainer: {
    width: 50,
    height: 50,
    backgroundColor: '#2E7D31',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  cartBadge: {
    position: 'absolute',
    top: -5,
    right: -4,
    backgroundColor: Colors.error,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  cartBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
  },
});x

export default FloatingCartButton;

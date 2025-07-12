
import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../styles';

const CartItem = ({ item, updateCartQuantity, removeFromCart, navigation }) => {
  return (
    <TouchableOpacity
      style={styles.cartItem}
      onPress={() => navigation.navigate('ProductDetail', { product: item })}
    >
      {item.img ? (
        <Image source={{ uri: item.img }} style={styles.cartItemImage} />
      ) : (
        <View style={styles.cartItemPlaceholder}>
          <Ionicons name="image-outline" size={24} color="#ccc" />
        </View>
      )}
      <View style={styles.cartItemInfo}>
        <Text style={styles.cartItemTitle}>{item.title}</Text>
        <Text style={styles.cartItemPrice}>{item.price}</Text>
        <View style={styles.quantityContainer}>
          <TouchableOpacity
            onPress={() =>
              item.quantity > 1
                ? updateCartQuantity(item.id, item.quantity - 1)
                : removeFromCart(item.id)
            }
            style={styles.quantityButton}
          >
            <Ionicons
              name={item.quantity > 1 ? 'remove' : 'trash-outline'}
              size={16}
              color={item.quantity > 1 ? '#333' : 'red'}
            />
          </TouchableOpacity>
          <Text style={styles.quantityText}>{item.quantity}</Text>
          <TouchableOpacity
            onPress={() => updateCartQuantity(item.id, item.quantity + 1)}
            style={styles.quantityButton}
          >
            <Ionicons name="add" size={16} color="#333" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default CartItem;

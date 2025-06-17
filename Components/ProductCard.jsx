// File: components/ProductCard.js
import React from 'react';
import { View, Text, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../styles';

const ProductCard = ({ item, navigation, addToCart, toggleFavorite, addingToCart, favorites }) => {
  return (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => navigation.navigate('ProductDetail', { product: item })}
    >
      <View style={styles.imageContainer}>
        {item.img ? (
          <Image source={{ uri: item.img }} style={styles.productImage} />
        ) : (
          <View style={styles.placeholderImage}>
            <Ionicons name="image-outline" size={48} color="#ccc" />
            <Text>No Image</Text>
          </View>
        )}
        <TouchableOpacity
          style={styles.addButton}
          onPress={(e) => {
            e.stopPropagation();
            addToCart(item);
          }}
          disabled={addingToCart}
        >
          {addingToCart ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ionicons name="add" size={18} color="#fff" />
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={(e) => {
            e.stopPropagation();
            toggleFavorite(item._id);
          }}
        >
          <Ionicons
            name={favorites.includes(item._id) ? 'heart' : 'heart-outline'}
            size={18}
            color={favorites.includes(item._id) ? 'red' : '#aaa'}
          />
        </TouchableOpacity>
      </View>
      <View style={styles.productInfo}>
        <Text style={styles.productTitle}>{item.title}</Text>
        <Text style={styles.productPrice}>{item.price}</Text>
      </View>
    </TouchableOpacity>
  );
};

export default ProductCard;
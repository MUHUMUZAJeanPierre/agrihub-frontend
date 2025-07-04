
// components/BuyerDashboard/ProductSection.js
import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ProductCard from './ProductCard';
import { Colors } from './styles';

const ProductSection = ({ 
  title, 
  products, 
  onSeeAll, 
  showSeeAll = true,
  favorites = [],
  onAddToCart,
  onToggleFavorite,
  addingToCart,
  onProductPress
}) => {
  const EmptyResults = () => (
    <View style={styles.emptyResults}>
      <Ionicons name="search-outline" size={60} color={Colors.textSecondary} />
      <Text style={styles.emptyResultsTitle}>No products found</Text>
      <Text style={styles.emptyResultsText}>
        Try adjusting your search or browse different categories
      </Text>
    </View>
  );

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {showSeeAll && onSeeAll && (
          <TouchableOpacity onPress={onSeeAll}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        )}
      </View>

      {products.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.productsContainer}
        >
          {products.map((product) => (
            <ProductCard
              key={product._id}
              item={product}
              onPress={() => onProductPress(product)}
              onAddToCart={onAddToCart}
              onToggleFavorite={onToggleFavorite}
              isFavorite={favorites.includes(product._id)}
              isAddingToCart={addingToCart === product._id}
            />
          ))}
        </ScrollView>
      ) : (
        <EmptyResults />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  seeAllText: {
    fontSize: 14,
    color: '#2E7D31',
    fontWeight: '500',
  },
  productsContainer: {
    paddingHorizontal: 20,
    paddingRight: 40,
  },
  emptyResults: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyResultsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyResultsText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default ProductSection;

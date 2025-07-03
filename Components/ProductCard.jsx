// // File: components/ProductCard.js
// import React from 'react';
// import { View, Text, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
// import { Ionicons } from '@expo/vector-icons';
// import { styles } from '../styles';

// const ProductCard = ({ item, navigation, addToCart, toggleFavorite, addingToCart, favorites }) => {
//   return (
//     <TouchableOpacity
//       style={styles.productCard}
//       onPress={() => navigation.navigate('ProductDetail', { product: item })}
//     >
//       <View style={styles.imageContainer}>
//         {item.img ? (
//           <Image source={{ uri: item.img }} style={styles.productImage} />
//         ) : (
//           <View style={styles.placeholderImage}>
//             <Ionicons name="image-outline" size={48} color="#ccc" />
//             <Text>No Image</Text>
//           </View>
//         )}
//         <TouchableOpacity
//           style={styles.addButton}
//           onPress={(e) => {
//             e.stopPropagation();
//             addToCart(item);
//           }}
//           disabled={addingToCart}
//         >
//           {addingToCart ? (
//             <ActivityIndicator size="small" color="#fff" />
//           ) : (
//             <Ionicons name="add" size={18} color="#fff" />
//           )}
//         </TouchableOpacity>
//         <TouchableOpacity
//           style={styles.favoriteButton}
//           onPress={(e) => {
//             e.stopPropagation();
//             toggleFavorite(item._id);
//           }}
//         >
//           <Ionicons
//             name={favorites.includes(item._id) ? 'heart' : 'heart-outline'}
//             size={18}
//             color={favorites.includes(item._id) ? 'red' : '#aaa'}
//           />
//         </TouchableOpacity>
//       </View>
//       <View style={styles.productInfo}>
//         <Text style={styles.productTitle}>{item.title}</Text>
//         <Text style={styles.productPrice}>{item.price}</Text>
//       </View>
//     </TouchableOpacity>
//   );
// };

// export default ProductCard;



// Add this import at the top of your file
import * as Animatable from 'react-native-animatable';
import { StyleSheet } from 'react-native';

// Update the ProductCard component to include animation
const ProductCard = React.memo(({ item, index }) => (
  <Animatable.View
    animation="fadeInUp"
    delay={index * 100}
    duration={600}
    useNativeDriver
  >
    <TouchableOpacity
      style={styles.productCard}
      activeOpacity={0.8}
      onPress={() =>
        navigation.navigate('ProductDetailScreen', {
          product: item,
          allProducts: products,
        })
      }
    >
      <View style={styles.imageContainer}>
        {item.img ? (
          <Image
            source={{ uri: item.img }}
            style={styles.productImage}
          />
        ) : (
          <View style={styles.placeholderImage}>
            <Ionicons name="image-outline" size={48} color={Colors.textTertiary} />
          </View>
        )}

        {item.past_price && item.current_price && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>
              {Math.round(((parseFloat(item.past_price.replace(/[^\d.]/g, '')) -
                parseFloat(item.current_price.replace(/[^\d.]/g, ''))) /
                parseFloat(item.past_price.replace(/[^\d.]/g, ''))) * 100)}% OFF
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.addButton}
          onPress={(e) => {
            e.stopPropagation();
            handleAddToCart(item);
          }}
          disabled={addingToCart === item._id}
          activeOpacity={0.8}
        >
          {addingToCart === item._id ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ionicons name="add" size={14} color="#10b981" />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={(e) => {
            e.stopPropagation();
            toggleFavorite(item._id);
          }}
          activeOpacity={0.8}
        >
          <Ionicons
            name={favorites.includes(item._id) ? "heart" : "heart-outline"}
            size={16}
            color={favorites.includes(item._id) ? Colors.error : Colors.textSecondary}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.productInfo}>
        <Text style={styles.productTitle} numberOfLines={1}>{item.title}</Text>
        <View style={styles.priceContainer}>
          <Text style={styles.productPrice}>
            {item.current_price || item.price}
            {item.pricePerKg && <Text style={styles.priceUnit}> /{item.pricePerKg}</Text>}
          </Text>
          {item.past_price && (
            <Text style={styles.oldPrice}>{item.past_price}</Text>
          )}
        </View>
        {item.region && (
          <Text style={styles.productRegion} numberOfLines={1}>
            📍 {item.region}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  </Animatable.View>
));

// In your map over filteredProducts or popularFruits
{filteredProducts.map((product, index) => (
  <ProductCard key={product._id} item={product} index={index} />
))}

// Similarly for promotions banner
{promotions.map((promo, index) => (
  <Animatable.View
    key={index}
    animation="slideInLeft"
    delay={index * 200}
    duration={600}
    useNativeDriver
  >
    <View style={[styles.promotionBanner, { width }]}> 
      {/* your promotion card code here */}
    </View>
  </Animatable.View>
))}

// Sample StyleSheet entries for the animation components
const styles = StyleSheet.create({
  productCard: {
    width: 160,
    backgroundColor: '#fff',
    borderRadius: 5,
    marginRight: 16,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  imageContainer: {
    position: 'relative',
    height: 100,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'red',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  discountText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
  },
  addButton: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 28,
    height: 28,
    backgroundColor: '#dcfce7',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productInfo: {
    padding: 12,
  },
  productTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 2,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 2,
  },
  productPrice: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2E7D31',
  },
  priceUnit: {
    fontSize: 10,
    fontWeight: '400',
    color: '#999',
  },
  oldPrice: {
    fontSize: 12,
    color: '#999',
    textDecorationLine: 'line-through',
  },
  productRegion: {
    fontSize: 12,
    color: '#666',
  },
  promotionBanner: {
    marginHorizontal: 20,
    marginBottom: 24,
    backgroundColor: '#FF6B35',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
});

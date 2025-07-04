// // components/BuyerDashboard/ProductCard.js
// import React from 'react';
// import { View, Text, Image, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
// import { Ionicons } from '@expo/vector-icons';
// import { Colors } from './styles';

// const ProductCard = ({ 
//   item, 
//   onPress, 
//   onAddToCart, 
//   onToggleFavorite, 
//   isFavorite, 
//   isAddingToCart 
// }) => {
//   const calculateDiscount = () => {
//     if (item.past_price && item.current_price) {
//       const pastPrice = parseFloat(item.past_price.replace(/[^\d.]/g, ''));
//       const currentPrice = parseFloat(item.current_price.replace(/[^\d.]/g, ''));
//       return Math.round(((pastPrice - currentPrice) / pastPrice) * 100);
//     }
//     return 0;
//   };

//   return (
//     <TouchableOpacity
//       style={styles.productCard}
//       activeOpacity={0.8}
//       onPress={onPress}
//     >
//       <View style={styles.imageContainer}>
//         {item.img ? (
//           <Image
//             source={{ uri: item.img }}
//             style={styles.productImage}
//           />
//         ) : (
//           <View style={styles.placeholderImage}>
//             <Ionicons name="image-outline" size={48} color={Colors.textTertiary} />
//           </View>
//         )}

//         {calculateDiscount() > 0 && (
//           <View style={styles.discountBadge}>
//             <Text style={styles.discountText}>
//               {calculateDiscount()}% OFF
//             </Text>
//           </View>
//         )}

//         <TouchableOpacity
//           style={styles.addButton}
//           onPress={(e) => {
//             e.stopPropagation();
//             onAddToCart(item);
//           }}
//           disabled={isAddingToCart}
//           activeOpacity={0.8}
//         >
//           {isAddingToCart ? (
//             <ActivityIndicator size="small" color="#fff" />
//           ) : (
//             <Ionicons name="add" size={14} color="#10b981" />
//           )}
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={styles.favoriteButton}
//           onPress={(e) => {
//             e.stopPropagation();
//             onToggleFavorite(item._id);
//           }}
//           activeOpacity={0.8}
//         >
//           <Ionicons
//             name={isFavorite ? "heart" : "heart-outline"}
//             size={16}
//             color={isFavorite ? Colors.error : Colors.textSecondary}
//           />
//         </TouchableOpacity>
//       </View>

//       <View style={styles.productInfo}>
//         <Text style={styles.productTitle} numberOfLines={1}>{item.title}</Text>
//         <View style={styles.priceContainer}>
//           <Text style={styles.productPrice}>
//             {item.current_price || item.price}
//             {item.pricePerKg && <Text style={styles.priceUnit}>/{item.pricePerKg}</Text>}
//           </Text>
//           {item.past_price && (
//             <Text style={styles.oldPrice}>{item.past_price}</Text>
//           )}
//         </View>
//         {item.region && (
//           <Text style={styles.productRegion} numberOfLines={1}>
//             📍 {item.region}
//           </Text>
//         )}
//       </View>
//     </TouchableOpacity>
//   );
// };

// const styles = StyleSheet.create({
//   productCard: {
//     width: 200,
//     backgroundColor: Colors.cardBackground,
//     borderRadius: 10,
//     marginRight: 16,
//     borderWidth: 1,
//     borderColor: '#F0F0F0',
//   },
//   imageContainer: {
//     position: 'relative',
//     height: 130,
//     borderRadius: 10,
//     overflow: 'hidden',
//     backgroundColor: Colors.surface,
//     elevation: 3,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//   },
//   productImage: {
//     width: '100%',
//     height: '100%',
//     resizeMode: 'cover',
//     borderRadius: 10,
//   },
//   placeholderImage: {
//     width: '100%',
//     height: '100%',
//     backgroundColor: Colors.surfaceLight,
//     justifyContent: 'center',
//     alignItems: 'center',
//     borderRadius: 10,
//   },
//   discountBadge: {
//     position: 'absolute',
//     top: 8,
//     left: 8,
//     backgroundColor: Colors.error,
//     paddingHorizontal: 6,
//     paddingVertical: 2,
//     borderRadius: 4,
//     zIndex: 1,
//   },
//   discountText: {
//     color: '#fff',
//     fontSize: 10,
//     fontWeight: 'bold',
//   },
//   addButton: {
//     position: 'absolute',
//     bottom: 8,
//     right: 8,
//     width: 28,
//     height: 28,
//     backgroundColor: '#dcfce7',
//     borderRadius: 14,
//     justifyContent: 'center',
//     alignItems: 'center',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.2,
//     shadowRadius: 4,
//     elevation: 4,
//   },
//   favoriteButton: {
//     position: 'absolute',
//     top: 8,
//     right: 8,
//     width: 24,
//     height: 24,
//     backgroundColor: 'rgba(255, 255, 255, 0.9)',
//     borderRadius: 12,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   productInfo: {
//     padding: 12,
//   },
//   productTitle: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: Colors.textPrimary,
//     marginBottom: 2,
//   },
//   priceContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 50,
//     marginBottom: 2,
//   },
//   productPrice: {
//     fontSize: 12,
//     fontWeight: '700',
//     color: '#2E7D31',
//   },
//   priceUnit: {
//     fontSize: 10,
//     fontWeight: '400',
//     color: Colors.textSecondary,
//   },
//   oldPrice: {
//     fontSize: 12,
//     color: Colors.textSecondary,
//     textDecorationLine: 'line-through',
//   },
//   productRegion: {
//     fontSize: 12,
//     color: Colors.textSecondary,
//   },
// });

// export default ProductCard;
// components/BuyerDashboard/ProductCard.js
import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Image, 
  StyleSheet,
  ActivityIndicator 
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
};

const ProductCard = ({ 
  item, 
  onPress,
  onAddToCart,
  onToggleFavorite,
  favorites = [],
  addingToCart = null 
}) => {
  const isFavorite = favorites.includes(item._id);
  const isAdding = addingToCart === item._id;

  const calculateDiscountPercentage = () => {
    if (item.past_price && item.current_price) {
      const pastPrice = parseFloat(item.past_price.replace(/[^\d.]/g, ''));
      const currentPrice = parseFloat(item.current_price.replace(/[^\d.]/g, ''));
      return Math.round(((pastPrice - currentPrice) / pastPrice) * 100);
    }
    return 0;
  };

  const discountPercentage = calculateDiscountPercentage();

  return (
    <TouchableOpacity
      style={styles.productCard}
      activeOpacity={0.8}
      onPress={() => onPress(item)}
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

        {discountPercentage > 0 && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>
              {discountPercentage}% OFF
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.addButton}
          onPress={(e) => {
            e.stopPropagation();
            onAddToCart(item);
          }}
          disabled={isAdding}
          activeOpacity={0.8}
        >
          {isAdding ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ionicons name="add" size={14} color="#10b981" />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={(e) => {
            e.stopPropagation();
            onToggleFavorite(item._id);
          }}
          activeOpacity={0.8}
        >
          <Ionicons
            name={isFavorite ? "heart" : "heart-outline"}
            size={16}
            color={isFavorite ? Colors.error : Colors.textSecondary}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.productInfo}>
        <Text style={styles.productTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <View style={styles.priceContainer}>
          <Text style={styles.productPrice}>
            {item.current_price || item.price}
            {item.pricePerKg && <Text style={styles.priceUnit}>/{item.pricePerKg}</Text>}
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
  );
};

const styles = StyleSheet.create({
  productCard: {
    width: 200,
    backgroundColor: Colors.cardBackground,
    borderRadius: 10,
    marginRight: 16,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  imageContainer: {
    position: 'relative',
    height: 130,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: Colors.surface,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    borderRadius: 10,
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: Colors.error,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    zIndex: 1,
  },
  discountText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
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
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  productInfo: {
    padding: 12,
  },
  productTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
    color: Colors.textSecondary,
  },
  oldPrice: {
    fontSize: 12,
    color: Colors.textSecondary,
    textDecorationLine: 'line-through',
  },
  productRegion: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
});

export default ProductCard;
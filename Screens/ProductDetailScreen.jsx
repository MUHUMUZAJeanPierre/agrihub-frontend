import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Share,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Dimensions
} from 'react-native';
import {
  ArrowLeft, Heart, Share2, Plus, Minus,
  ShoppingBag, Star, MapPin, MoreHorizontal, User
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function ProductDetailScreen({ navigation, route }) {
  const product = route.params?.product;
  const allProducts = route.params?.allProducts || [];

  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [favorited, setFavorited] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Mock multiple images for the product
  const productImages = [
    product?.img,
    product?.img,
    product?.img,
    product?.img
  ].filter(Boolean);

  // Related products from the same category
  const relatedProducts = allProducts
    .filter(p => p.category === product?.category && p._id !== product?._id)
    .slice(0, 6);

  if (!product) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ fontSize: 16, color: '#6b7280' }}>Product data not found.</Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={{ marginTop: 12, fontSize: 16, color: '#10b981' }}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const displayPrice = product.current_price || product.price || '$0.00';
  const basePrice = parseFloat(displayPrice.replace(/[^\d.]/g, '')) || 0;
  const totalPrice = basePrice * quantity;

  // Format price helper function
  const formatPrice = (price) => {
    const currency = displayPrice.replace(/[\d.,]/g, '')[0] || '$';
    return `${currency}${price.toFixed(2)}`;
  };

  const addToCart = () => {
    setAddingToCart(true);
    setTimeout(() => {
      setAddingToCart(false);
      Alert.alert(
        'Added to Cart', 
        `${quantity} x ${product.title} has been added to your cart.\nTotal: ${formatPrice(totalPrice)}`
      );
    }, 1000);
  };

  const shareProduct = async () => {
    try {
      await Share.share({
        message: `Check out this product: ${product.title} - ${displayPrice}`,
        title: product.title,
      });
    } catch (error) {
      console.error('Share failed:', error);
    }
  };

  const toggleFavorite = () => {
    setFavorited(!favorited);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
          <ArrowLeft size={20} color="#333" />
        </TouchableOpacity>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerButton} onPress={toggleFavorite}>
            <Heart 
              size={20} 
              color={favorited ? "#ef4444" : "#333"} 
              fill={favorited ? "#ef4444" : "none"}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton} onPress={shareProduct}>
            <Share2 size={20} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <View style={styles.cartBadge}>
              <ShoppingBag size={20} color="#fff" />
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Main Product Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: product.img }}
            style={styles.mainImage}
            resizeMode="contain"
          />
        </View>

        {/* Thumbnail Images */}
        <View style={styles.thumbnailContainer}>
          {productImages.map((image, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.thumbnail,
                selectedImageIndex === index && styles.selectedThumbnail
              ]}
              onPress={() => setSelectedImageIndex(index)}
            >
              <Image
                source={{ uri: image }}
                style={styles.thumbnailImage}
                resizeMode="cover"
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* Product Info */}
        <View style={styles.productInfo}>
          <Text style={styles.productTitle}>{product.title}</Text>
          
          {/* Price and Quantity */}
          <View style={styles.priceQuantityRow}>
            <View style={styles.priceContainer}>
              <Text style={styles.productPrice}>{formatPrice(totalPrice)}</Text>
              {quantity > 1 && (
                <Text style={styles.unitPrice}>
                  {formatPrice(basePrice)} each
                </Text>
              )}
            </View>
            <View style={styles.quantityContainer}>
              <TouchableOpacity 
                style={[styles.quantityButton, quantity <= 1 && styles.quantityButtonDisabled]}
                onPress={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
              >
                <Minus size={16} color={quantity <= 1 ? "#d1d5db" : "#666"} />
              </TouchableOpacity>
              <Text style={styles.quantityText}>{quantity}</Text>
              <TouchableOpacity 
                style={styles.quantityButton}
                onPress={() => setQuantity(quantity + 1)}
              >
                <Plus size={16} color="#666" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Seller Info */}
          <View style={styles.sellerInfo}>
            <View style={styles.sellerAvatar}>
              <Text style={styles.sellerInitial}>
                {(product.farmer || 'Fanny Fruits')[0]}
              </Text>
            </View>
            <View style={styles.sellerDetails}>
              <Text style={styles.sellerName}>{product.farmer || 'Fanny Fruits'}</Text>
              <View style={styles.locationRow}>
                <MapPin size={12} color="#6b7280" />
                <Text style={styles.sellerLocation}>{product.region || 'Nyaruguru'}</Text>
              </View>
            </View>
            <View style={styles.ratingContainer}>
              <Star size={14} color="#fbbf24" fill="#fbbf24" />
              <Text style={styles.ratingText}>4.5</Text>
              <Text style={styles.reviewCount}>• 78 Reviews</Text>
            </View>
          </View>

          {/* Description */}
          <View style={styles.descriptionContainer}>
            <Text style={styles.descriptionTitle}>Description</Text>
            <Text style={styles.description}>
              {product.description || 
               "Fresh, high-quality produce sourced directly from local farmers. Rich in nutrients and harvested at peak ripeness to ensure maximum flavor and freshness. Perfect for healthy meals and nutritious snacking."}
            </Text>
          </View>
        </View>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <View style={styles.relatedSection}>
            <Text style={styles.relatedTitle}>You might also like</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.relatedScrollContent}
            >
              {relatedProducts.map((item) => (
                <TouchableOpacity
                  key={item._id}
                  style={styles.relatedItem}
                  onPress={() => navigation.push('ProductDetailScreen', {
                    product: item,
                    allProducts,
                  })}
                >
                  <View style={styles.relatedImageContainer}>
                    <Image 
                      source={{ uri: item.img }} 
                      style={styles.relatedImage} 
                      resizeMode="cover"
                    />
                    <TouchableOpacity style={styles.relatedFavoriteButton}>
                      <Heart size={12} color="#fff" />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.relatedInfo}>
                    <Text style={styles.relatedItemTitle} numberOfLines={2}>
                      {item.title}
                    </Text>
                    <View style={styles.relatedSellerInfo}>
                      <User size={10} color="#6b7280" />
                      <Text style={styles.relatedSeller} numberOfLines={1}>
                        {item.farmer || 'Local Farmer'}
                      </Text>
                    </View>
                    <View style={styles.relatedBottomRow}>
                      <Text style={styles.relatedPrice}>
                        {item.current_price || item.price}
                      </Text>
                      <View style={styles.relatedRating}>
                        <Star size={10} color="#fbbf24" fill="#fbbf24" />
                        <Text style={styles.relatedRatingText}>4.5</Text>
                      </View>
                    </View>
                    <TouchableOpacity style={styles.relatedAddButton}>
                      <Plus size={12} color="#10b981" />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Buy Button */}
      <View style={styles.bottomContainer}>
        <View style={styles.bottomPriceInfo}>
          <Text style={styles.bottomTotalLabel}>Total Price</Text>
          <Text style={styles.bottomTotalPrice}>{formatPrice(totalPrice)}</Text>
        </View>
        <TouchableOpacity
          style={[styles.buyButton, addingToCart && styles.buyButtonDisabled]}
          onPress={addToCart}
          disabled={addingToCart}
        >
          {addingToCart ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <ShoppingBag size={20} color="#fff" />
              <Text style={styles.buyButtonText}>
                Add to Cart ({quantity})
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#f8f9fa',
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cartBadge: {
    backgroundColor: '#10b981',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  imageContainer: {
    height: 280,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  thumbnailContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
    gap: 12,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedThumbnail: {
    borderColor: '#10b981',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  productInfo: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 25,
    paddingBottom: 20,
    marginTop: 10,
  },
  productTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 15,
  },
  priceQuantityRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  priceContainer: {
    flex: 1,
  },
  productPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#10b981',
  },
  unitPrice: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 25,
    paddingHorizontal: 4,
  },
  quantityButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    margin: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  quantityButtonDisabled: {
    backgroundColor: '#f9fafb',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginHorizontal: 16,
    minWidth: 20,
    textAlign: 'center',
  },
  sellerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
  },
  sellerAvatar: {
    width: 44,
    height: 44,
    backgroundColor: '#10b981',
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sellerInitial: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  sellerDetails: {
    flex: 1,
  },
  sellerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sellerLocation: {
    fontSize: 13,
    color: '#6b7280',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#fff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1f2937',
  },
  reviewCount: {
    fontSize: 11,
    color: '#6b7280',
  },
  descriptionContainer: {
    marginBottom: 8,
  },
  descriptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 22,
  },
  bottomContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 30,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  bottomPriceInfo: {
    flex: 1,
  },
  bottomTotalLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 2,
  },
  bottomTotalPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  buyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10b981',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 25,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    minWidth: 160,
  },
  buyButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  buyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  relatedSection: {
    backgroundColor: '#fff',
    marginTop: 12,
    paddingVertical: 24,
  },
  relatedTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  relatedScrollContent: {
    paddingHorizontal: 20,
  },
  relatedItem: {
    width: 160,
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  relatedImageContainer: {
    position: 'relative',
  },
  relatedImage: {
    width: '100%',
    height: 120,
    backgroundColor: '#f8f9fa',
  },
  relatedFavoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  relatedInfo: {
    padding: 16,
    position: 'relative',
  },
  relatedItemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
    lineHeight: 18,
    minHeight: 36,
  },
  relatedSellerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 12,
  },
  relatedSeller: {
    fontSize: 11,
    color: '#6b7280',
    flex: 1,
  },
  relatedBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  relatedPrice: {
    fontSize: 16,
    color: '#10b981',
    fontWeight: 'bold',
  },
  relatedRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  relatedRatingText: {
    fontSize: 11,
    color: '#6b7280',
    fontWeight: '500',
  },
  relatedAddButton: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    width: 28,
    height: 28,
    backgroundColor: '#f0fdf4',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
});
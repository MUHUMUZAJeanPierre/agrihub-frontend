import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';

const { width, height } = Dimensions.get('window');
const BASE_URL = 'https://agrihub-backend-4z99.onrender.com/api';

const ProductDetailScreen = ({ route, navigation }) => {
  const { product } = route.params;
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loadingRelated, setLoadingRelated] = useState(true);
  const [imageLoading, setImageLoading] = useState(true);
  const [favorited, setFavorited] = useState(false);

  useEffect(() => {
    fetchRelatedProducts();
  }, []);

  const fetchRelatedProducts = async () => {
    try {
      setLoadingRelated(true);
      const res = await axios.get(`${BASE_URL}/products`);
      // Filter products by same category, excluding current product
      const related = res.data
        .filter(p => p.category === product.category && p._id !== product._id)
        .slice(0, 4); // Limit to 4 related products
      setRelatedProducts(related);
    } catch (err) {
      console.error('❌ Related products fetch error:', err.message);
    } finally {
      setLoadingRelated(false);
    }
  };

  const addToCart = async () => {
    try {
      setAddingToCart(true);
      await axios.post(`${BASE_URL}/cart/add`, {
        productId: product._id,
        quantity: quantity,
      });
      Alert.alert(
        '✅ Byongeywe mu gikoni',
        `${product.title} byongeywe mu gikoni cyawe.`,
        [
          { text: 'Komeza ugure', style: 'cancel' },
          { text: 'Reba igikoni', onPress: () => navigation.navigate('Cart') }
        ]
      );
    } catch (err) {
      console.error('❌ Add to cart error:', err.message);
      Alert.alert('Ikosa', 'Byanze kongera mu gikoni. Ongera ugerageze.');
    } finally {
      setAddingToCart(false);
    }
  };

  const shareProduct = async () => {
    try {
      await Share.share({
        message: `Reba iki gicuruzwa ku AgriHub: ${product.title} - ${product.price}`,
        url: product.img,
      });
    } catch (error) {
      console.error('Share error:', error.message);
    }
  };

  const getDisplayPrice = () => {
    // Extract number from price like "RWF 3,500/L"
    const priceMatch = product.price?.match(/RWF\s*([\d,]+)/);
    const basePrice = priceMatch ? parseFloat(priceMatch[1].replace(/,/g, '')) : 0;
    const totalPrice = (basePrice * quantity).toLocaleString('en-US');
    return `RWF ${totalPrice}`;
  };

  const getCategoryDisplayName = (category) => {
    const categoryMap = {
      'organic': 'Kamere (Organic)',
      'vegetables': 'Imboga (Vegetables)', 
      'fruits': 'Imbuto (Fruits)',
      'seeds': 'Imbuto (Seeds)',
      'dairy': 'Amata (Dairy)',
      'grains': 'Ingano (Grains)',
      'meat': 'Inyama (Meat)',
      'beverages': 'Ibinyobwa (Beverages)'
    };
    return categoryMap[category] || category.charAt(0).toUpperCase() + category.slice(1);
  };

  const renderRelatedProduct = ({ item }) => (
    <TouchableOpacity 
      style={styles.relatedProductCard}
      onPress={() => navigation.push('ProductDetail', { product: item })}
    >
      <Image source={{ uri: item.img }} style={styles.relatedProductImage} />
      <Text style={styles.relatedProductTitle} numberOfLines={2}>{item.title}</Text>
      <Text style={styles.relatedProductPrice}>{item.price}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.headerButton} 
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Amakuru y'igicuruzwa</Text>
        
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerButton} onPress={shareProduct}>
            <Ionicons name="share-outline" size={22} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.headerButton} 
            onPress={() => setFavorited(!favorited)}
          >
            <Ionicons 
              name={favorited ? "heart" : "heart-outline"} 
              size={22} 
              color={favorited ? "#e74c3c" : "#333"} 
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Product Image */}
        <View style={styles.imageSection}>
          {product.isFlashDeal && (
            <View style={styles.flashDealBadge}>
              <Ionicons name="flash" size={16} color="#fff" />
              <Text style={styles.flashDealText}>FLASH DEAL</Text>
            </View>
          )}
          
          <View style={styles.imageContainer}>
            {imageLoading && (
              <View style={styles.imageLoadingContainer}>
                <ActivityIndicator size="large" color="#4CAF50" />
              </View>
            )}
            {product.img ? (
              <Image 
                source={{ uri: product.img }}
                style={styles.productImage}
                onLoad={() => setImageLoading(false)}
                onError={() => setImageLoading(false)}
              />
            ) : (
              <View style={styles.placeholderImage}>
                <Ionicons name="image-outline" size={80} color="#ccc" />
              </View>
            )}
          </View>

          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{getCategoryDisplayName(product.category)}</Text>
          </View>
        </View>

        {/* Product Info */}
        <View style={styles.productInfo}>
          <Text style={styles.productTitle}>{product.title}</Text>
          <Text style={styles.productPrice}>{product.price}</Text>
          
          {product.discount && (
            <View style={styles.descriptionContainer}>
              <Ionicons name="information-circle-outline" size={18} color="#4CAF50" />
              <Text style={styles.productDescription}>{product.discount}</Text>
            </View>
          )}

          {/* Farmer and Location Info */}
          <View style={styles.infoGrid}>
            {product.farmer && (
              <View style={styles.infoItem}>
                <View style={styles.infoIcon}>
                  <Ionicons name="people-outline" size={20} color="#4CAF50" />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Umuhinzi/Koperative</Text>
                  <Text style={styles.infoValue}>{product.farmer}</Text>
                </View>
              </View>
            )}

            <View style={styles.infoItem}>
              <View style={styles.infoIcon}>
                <Ionicons name="location-outline" size={20} color="#4CAF50" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Ahantu</Text>
                <Text style={styles.infoValue}>{product.region}, Rwanda</Text>
              </View>
            </View>

            <View style={styles.infoItem}>
              <View style={styles.infoIcon}>
                <Ionicons name="cube-outline" size={20} color="#4CAF50" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Uburyo bwo kugura</Text>
                <Text style={styles.infoValue}>{product.minOrder}</Text>
              </View>
            </View>

            <View style={styles.infoItem}>
              <View style={styles.infoIcon}>
                <Ionicons name="shield-checkmark-outline" size={20} color="#4CAF50" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Ubwiza</Text>
                <Text style={styles.infoValue}>Byemejwe na AgriHub</Text>
              </View>
            </View>
          </View>

          {/* Features */}
          <View style={styles.featuresSection}>
            <Text style={styles.sectionTitle}>Ibiranga iki gicuruzwa</Text>
            <View style={styles.featuresList}>
              <View style={styles.featureItem}>
                <Ionicons name="leaf-outline" size={16} color="#4CAF50" />
                <Text style={styles.featureText}>100% kamere</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="time-outline" size={16} color="#4CAF50" />
                <Text style={styles.featureText}>Gishya cyane</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="star-outline" size={16} color="#4CAF50" />
                <Text style={styles.featureText}>Ubwiza bwemewe</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="car-outline" size={16} color="#4CAF50" />
                <Text style={styles.featureText}>Biragurishwa vuba</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <View style={styles.relatedSection}>
            <Text style={styles.sectionTitle}>Ibindi bicuruzwa bifite isano</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.relatedProductsList}
            >
              {relatedProducts.map((item, index) => (
                <View key={index}>
                  {renderRelatedProduct({ item })}
                </View>
              ))}
            </ScrollView>
          </View>
        )}
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={styles.bottomActionBar}>
        <View style={styles.quantitySection}>
          <Text style={styles.quantityLabel}>Umubare:</Text>
          <View style={styles.quantityControls}>
            <TouchableOpacity 
              style={styles.quantityButton}
              onPress={() => setQuantity(Math.max(1, quantity - 1))}
            >
              <Ionicons name="remove" size={18} color="#666" />
            </TouchableOpacity>
            <Text style={styles.quantityText}>{quantity}</Text>
            <TouchableOpacity 
              style={styles.quantityButton}
              onPress={() => setQuantity(quantity + 1)}
            >
              <Ionicons name="add" size={18} color="#666" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.priceAndAction}>
          <View style={styles.totalPriceSection}>
            <Text style={styles.totalLabel}>Igiciro:</Text>
            <Text style={styles.totalPrice}>{getDisplayPrice()}</Text>
          </View>
          
          <TouchableOpacity 
            style={[styles.addToCartButton, addingToCart && styles.addToCartDisabled]}
            onPress={addToCart}
            disabled={addingToCart}
          >
            {addingToCart ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="bag-add-outline" size={20} color="#fff" />
                <Text style={styles.addToCartText}>Shyira mu gikoni</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default ProductDetailScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
  },
  headerRight: {
    flexDirection: 'row',
    gap: 8,
  },
  
  scrollView: {
    flex: 1,
  },
  
  // Image Section
  imageSection: {
    position: 'relative',
    backgroundColor: '#fff',
    marginBottom: 12,
  },
  flashDealBadge: {
    position: 'absolute',
    top: 20,
    left: 20,
    backgroundColor: '#ff4757',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    zIndex: 2,
    gap: 4,
  },
  flashDealText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  imageContainer: {
    position: 'relative',
    height: height * 0.4,
  },
  imageLoadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryBadge: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: 'rgba(76, 175, 80, 0.95)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  categoryText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  
  // Product Info
  productInfo: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 12,
  },
  productTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
    lineHeight: 32,
  },
  productPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2d5016',
    marginBottom: 16,
  },
  descriptionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f8f0',
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
    gap: 8,
  },
  productDescription: {
    flex: 1,
    fontSize: 14,
    color: '#2d5016',
    fontStyle: 'italic',
  },
  
  // Info Grid
  infoGrid: {
    gap: 16,
    marginBottom: 24,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f8f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
  },
  
  // Features
  featuresSection: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 16,
  },
  featuresList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f8f0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  featureText: {
    fontSize: 13,
    color: '#2d5016',
    fontWeight: '500',
  },
  
  // Related Products
  relatedSection: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 100,
  },
  relatedProductsList: {
    paddingVertical: 8,
    gap: 12,
  },
  relatedProductCard: {
    width: 140,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 1,
  },
  relatedProductImage: {
    width: '100%',
    height: 100,
    resizeMode: 'cover',
  },
  relatedProductTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2c3e50',
    padding: 8,
    paddingBottom: 4,
    lineHeight: 16,
  },
  relatedProductPrice: {
    fontSize: 12,
    color: '#2d5016',
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
  
  // Bottom Action Bar
  bottomActionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  quantitySection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  quantityLabel: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 25,
    paddingHorizontal: 4,
  },
  quantityButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginHorizontal: 16,
    minWidth: 20,
    textAlign: 'center',
  },
  priceAndAction: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
  },
  totalPriceSection: {
    flex: 1,
  },
  totalLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  totalPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2d5016',
  },
  addToCartButton: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 25,
    gap: 8,
    elevation: 2,
  },
  addToCartDisabled: {
    backgroundColor: '#a5d6a7',
  },
  addToCartText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
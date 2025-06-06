import React, { useState } from "react";
import { 
  View, 
  Text, 
  Image, 
  ScrollView, 
  TouchableOpacity, 
  StyleSheet, 
  Dimensions,
  Alert 
} from "react-native";
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const Details = ({ route, navigation }) => {
    const { product } = route.params; 


  const [language, setLanguage] = useState('kinyarwanda');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(5);
  const [isFavorite, setIsFavorite] = useState(false);

  const getTranslation = (kinyarwanda, english) => {
    return language === 'kinyarwanda' ? kinyarwanda : english;
  };

  const calculatePrice = (qty) => {
    if (qty >= 100) return product.pricing.bulk100kg;
    if (qty >= 50) return product.pricing.bulk50kg;
    if (qty >= 10) return product.pricing.bulk10kg;
    return product.pricing.basePrice;
  };

  const handleAddToCart = () => {
    Alert.alert(
      getTranslation("Byongeyeho mu gitebo", "Added to Cart"),
      `${product.title} - ${quantity}kg\n${getTranslation("Igiciro:", "Total:")} RWF ${(calculatePrice(quantity) * quantity).toLocaleString()}`,
      [{ text: "OK" }]
    );
  };

  const handleContactFarmer = () => {
    Alert.alert(
      getTranslation("Vugana n'umuhinzi", "Contact Farmer"),
      getTranslation("Ushaka guvugana na " + product.farmer.name + "?", "Would you like to contact " + product.farmer.name + "?"),
      [
        { text: getTranslation("Siga", "Cancel"), style: "cancel" },
        { text: getTranslation("Vugana", "Contact"), onPress: () => console.log("Contact farmer") }
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation?.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#2d5016" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.languageButton}
          onPress={() => setLanguage(language === 'kinyarwanda' ? 'english' : 'kinyarwanda')}
        >
          <Text style={styles.languageText}>
            {language === 'kinyarwanda' ? 'EN' : 'KIN'}
          </Text>
        </TouchableOpacity>

        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.favoriteButton}
            onPress={() => setIsFavorite(!isFavorite)}
          >
            <Ionicons 
              name={isFavorite ? "heart" : "heart-outline"} 
              size={24} 
              color={isFavorite ? "#2d5016" : "#2d5016"} 
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.shareButton}>
            <Ionicons name="share-outline" size={24} color="#2d5016" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Product Images */}
      <View style={styles.imageSection}>
        <ScrollView 
          horizontal 
          pagingEnabled 
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(event) => {
            const index = Math.round(event.nativeEvent.contentOffset.x / width);
            setSelectedImageIndex(index);
          }}
        >
          {product.images.map((image, index) => (
            <Image key={index} source={{ uri: image }} style={styles.productImage} />
          ))}
        </ScrollView>
        
        {/* Image Indicators */}
        <View style={styles.imageIndicators}>
          {product.images.map((_, index) => (
            <View 
              key={index} 
              style={[
                styles.indicator, 
                selectedImageIndex === index && styles.activeIndicator
              ]} 
            />
          ))}
        </View>

        {/* Availability Badge */}
        <View style={[styles.availabilityBadge, product.availability.inStock ? styles.inStock : styles.outOfStock]}>
          <Text style={styles.availabilityText}>
            {product.availability.inStock 
              ? getTranslation("Birahari", "In Stock") 
              : getTranslation("Birabura", "Out of Stock")
            }
          </Text>
        </View>
      </View>

      {/* Product Info */}
      <View style={styles.productInfo}>
        <View style={styles.titleSection}>
          <Text style={styles.productTitle}>
            {language === 'kinyarwanda' ? product.title : product.titleEn}
          </Text>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>
              {getTranslation("Imboga", "Vegetables")}
            </Text>
          </View>
        </View>

        <View style={styles.priceSection}>
          <Text style={styles.price}>RWF {calculatePrice(quantity).toLocaleString()}/kg</Text>
          <Text style={styles.minOrder}>{product.minOrder}</Text>
        </View>

        {/* Bulk Pricing */}
        <View style={styles.bulkPricing}>
          <Text style={styles.bulkTitle}>
            {getTranslation("Ibiciro by'umubare munini", "Bulk Pricing")}
          </Text>
          <View style={styles.bulkOptions}>
            <View style={styles.bulkOption}>
              <Text style={styles.bulkQuantity}>10+ kg</Text>
              <Text style={styles.bulkPrice}>RWF {product.pricing.bulk10kg}/kg</Text>
            </View>
            <View style={styles.bulkOption}>
              <Text style={styles.bulkQuantity}>50+ kg</Text>
              <Text style={styles.bulkPrice}>RWF {product.pricing.bulk50kg}/kg</Text>
            </View>
            <View style={styles.bulkOption}>
              <Text style={styles.bulkQuantity}>100+ kg</Text>
              <Text style={styles.bulkPrice}>RWF {product.pricing.bulk100kg}/kg</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Description */}
      <View style={styles.descriptionSection}>
        <Text style={styles.sectionTitle}>
          {getTranslation("Ibisobanuro", "Description")}
        </Text>
        <Text style={styles.description}>
          {language === 'kinyarwanda' ? product.description.kinyarwanda : product.description.english}
        </Text>
      </View>

      {/* Specifications */}
      <View style={styles.specsSection}>
        <Text style={styles.sectionTitle}>
          {getTranslation("Amakuru arambuye", "Specifications")}
        </Text>
        <View style={styles.specsList}>
          <View style={styles.specItem}>
            <Text style={styles.specLabel}>{getTranslation("Inkomoko", "Origin")}:</Text>
            <Text style={styles.specValue}>{product.specifications.origin}</Text>
          </View>
          <View style={styles.specItem}>
            <Text style={styles.specLabel}>{getTranslation("Itariki y'umusaruro", "Harvest Date")}:</Text>
            <Text style={styles.specValue}>{product.specifications.harvestDate}</Text>
          </View>
          <View style={styles.specItem}>
            <Text style={styles.specLabel}>{getTranslation("Organic", "Organic")}:</Text>
            <Text style={[styles.specValue, styles.organicText]}>
              {product.specifications.organic ? "✓ " + getTranslation("Yego", "Yes") : getTranslation("Oya", "No")}
            </Text>
          </View>
          <View style={styles.specItem}>
            <Text style={styles.specLabel}>{getTranslation("Igihe cyo kubika", "Shelf Life")}:</Text>
            <Text style={styles.specValue}>{product.specifications.shelfLife}</Text>
          </View>
        </View>
      </View>

      {/* Farmer Info */}
      <View style={styles.farmerSection}>
        <Text style={styles.sectionTitle}>
          {getTranslation("Amakuru y'umuhinzi", "Farmer Information")}
        </Text>
        <View style={styles.farmerCard}>
          <View style={styles.farmerHeader}>
            <View style={styles.farmerAvatar}>
              <Text style={styles.farmerInitials}>
                {product.farmer.name.split(' ').map(n => n[0]).join('')}
              </Text>
            </View>
            <View style={styles.farmerDetails}>
              <Text style={styles.farmerName}>{product.farmer.name}</Text>
              <Text style={styles.cooperativeName}>{product.farmer.cooperative}</Text>
              <View style={styles.locationRow}>
                <Ionicons name="location" size={14} color="#666" />
                <Text style={styles.farmerLocation}>{product.farmer.location}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.contactButton} onPress={handleContactFarmer}>
              <Ionicons name="chatbubble-outline" size={20} color="#2d5016" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.farmerStats}>
            <View style={styles.statItem}>
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={16} color="#ffa500" />
                <Text style={styles.rating}>{product.farmer.rating}</Text>
              </View>
              <Text style={styles.statLabel}>{getTranslation("Igipimo", "Rating")}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{product.farmer.completedOrders}</Text>
              <Text style={styles.statLabel}>{getTranslation("Ibicuruzwa byagurishijwe", "Orders")}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{product.farmer.yearsExperience}+</Text>
              <Text style={styles.statLabel}>{getTranslation("Imyaka", "Years")}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Quantity Selector */}
      <View style={styles.quantitySection}>
        <Text style={styles.sectionTitle}>
          {getTranslation("Hitamo umubare", "Select Quantity")}
        </Text>
        <View style={styles.quantitySelector}>
          <TouchableOpacity 
            style={styles.quantityButton}
            onPress={() => setQuantity(Math.max(5, quantity - 1))}
          >
            <Ionicons name="remove" size={20} color="#2d5016" />
          </TouchableOpacity>
          <View style={styles.quantityDisplay}>
            <Text style={styles.quantityText}>{quantity} kg</Text>
          </View>
          <TouchableOpacity 
            style={styles.quantityButton}
            onPress={() => setQuantity(quantity + 1)}
          >
            <Ionicons name="add" size={20} color="#2d5016" />
          </TouchableOpacity>
        </View>
        <Text style={styles.totalPrice}>
          {getTranslation("Igiciro cyose:", "Total Price:")} RWF {(calculatePrice(quantity) * quantity).toLocaleString()}
        </Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.addToCartButton} onPress={handleAddToCart}>
          <Ionicons name="cart" size={20} color="white" style={styles.buttonIcon} />
          <Text style={styles.addToCartText}>
            {getTranslation("Shyira mu gitebo", "Add to Cart")}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.buyNowButton}>
          <Text style={styles.buyNowText}>
            {getTranslation("Gura ubu", "Buy Now")}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
  },
  languageButton: {
    backgroundColor: '#f0f7e8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  languageText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2d5016',
  },
  headerActions: {
    flexDirection: 'row',
  },
  favoriteButton: {
    padding: 8,
    marginRight: 8,
  },
  shareButton: {
    padding: 8,
  },
  imageSection: {
    position: 'relative',
    backgroundColor: 'white',
  },
  productImage: {
    width: width,
    height: 300,
    resizeMode: 'cover',
  },
  imageIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ddd',
    marginHorizontal: 4,
  },
  activeIndicator: {
    backgroundColor: '#2d5016',
  },
  availabilityBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  inStock: {
    backgroundColor: '#d4edda',
  },
  outOfStock: {
    backgroundColor: '#f8d7da',
  },
  availabilityText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2d5016',
  },
  productInfo: {
    backgroundColor: 'white',
    padding: 16,
    marginTop: 8,
  },
  titleSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  productTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 12,
  },
  categoryBadge: {
    backgroundColor: '#f0f7e8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 12,
    color: '#2d5016',
    fontWeight: '500',
  },
  priceSection: {
    marginBottom: 16,
  },
  price: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2d5016',
    marginBottom: 4,
  },
  minOrder: {
    fontSize: 14,
    color: '#666',
  },
  bulkPricing: {
    marginTop: 16,
  },
  bulkTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  bulkOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  bulkOption: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  bulkQuantity: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  bulkPrice: {
    fontSize: 14,
    color: '#2d5016',
    fontWeight: '500',
  },
  descriptionSection: {
    backgroundColor: 'white',
    padding: 16,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  specsSection: {
    backgroundColor: 'white',
    padding: 16,
    marginTop: 8,
  },
  specsList: {
    marginTop: 8,
  },
  specItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  specLabel: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  specValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  organicText: {
    color: '#2d5016',
  },
  farmerSection: {
    backgroundColor: 'white',
    padding: 16,
    marginTop: 8,
  },
  farmerCard: {
    marginTop: 12,
  },
  farmerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  farmerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#2d5016',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  farmerInitials: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  farmerDetails: {
    flex: 1,
  },
  farmerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  cooperativeName: {
    fontSize: 14,
    color: '#2d5016',
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  farmerLocation: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  contactButton: {
    padding: 8,
    backgroundColor: '#f0f7e8',
    borderRadius: 20,
  },
  farmerStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
  },
  statItem: {
    alignItems: 'center',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  rating: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2d5016',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  quantitySection: {
    backgroundColor: 'white',
    padding: 16,
    marginTop: 8,
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
  },
  quantityButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f0f7e8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityDisplay: {
    marginHorizontal: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  quantityText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  totalPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2d5016',
    textAlign: 'center',
    marginTop: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  addToCartButton: {
    flex: 1,
    backgroundColor: '#2d5016',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 12,
  },
  buttonIcon: {
    marginRight: 8,
  },
  addToCartText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  buyNowButton: {
    flex: 1,
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#2d5016',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 12,
  },
  buyNowText: {
    color: '#2d5016',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomSpacing: {
    height: 20,
  },
});

export default Details;
import React, { useState } from "react";
import { View, Text, Image, TextInput, ScrollView, TouchableOpacity, FlatList, StyleSheet } from "react-native";
import { Ionicons } from '@expo/vector-icons';

const products = [
  { id: 1, title: "Ubwoba (Tomatoes)", price: "RWF 800/kg", minOrder: "Min. order: 5 kg", img: "https://images.unsplash.com/photo-1592841200221-a6898f307baa?w=300&h=300&fit=crop", category: "vegetables" },
  { id: 2, title: "Ibirayi (Potatoes)", price: "RWF 450/kg", minOrder: "Min. order: 10 kg", img: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=300&h=300&fit=crop", category: "tubers" },
  { id: 3, title: "Ibinyomoro (Carrots)", price: "RWF 600/kg", minOrder: "Min. order: 3 kg", img: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=300&h=300&fit=crop", category: "vegetables" },
  { id: 4, title: "Ubwiyunge (Onions)", price: "RWF 1,200/kg", minOrder: "Min. order: 2 kg", img: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=300&h=300&fit=crop", category: "vegetables" },
  { id: 5, title: "Amasaka (Maize)", price: "RWF 350/kg", minOrder: "Min. order: 20 kg", img: "https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=300&h=300&fit=crop", category: "cereals" },
  { id: 6, title: "Ubuki (Honey)", price: "RWF 3,500/L", minOrder: "Min. order: 1 L", img: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=300&h=300&fit=crop", category: "organic" },
];

const topDeals = [
  { id: 1, title: "Inyama (Fresh Meat)", price: "RWF 2,800/kg", discount: "Fresh from local farms", isFlashDeal: true, img: "https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=300&h=300&fit=crop", farmer: "Cooperative Rwamagana" },
  { id: 2, title: "Amata (Fresh Milk)", price: "RWF 400/L", discount: "Daily fresh delivery", img: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=300&h=300&fit=crop", farmer: "Nyamirambo Dairy" },
  { id: 3, title: "Amagi (Eggs)", price: "RWF 2,500/tray", discount: "Organic free-range", img: "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=300&h=300&fit=crop", farmer: "Huye Poultry Farm" },
];

const newArrivals = [
  { id: 1, title: "Icyayi (Tea Leaves)", price: "RWF 1,800/kg", img: "https://images.unsplash.com/photo-1597318236755-d12d1e2f6c18?w=300&h=300&fit=crop", region: "Nyungwe" },
  { id: 2, title: "Ikawa (Coffee Beans)", price: "RWF 4,500/kg", img: "https://images.unsplash.com/photo-1497515114629-f71d768fd07c?w=300&h=300&fit=crop", region: "Huye Mountains" },
  { id: 3, title: "Ubwoba bw'amahoro (Passion Fruits)", price: "RWF 1,200/kg", img: "https://images.unsplash.com/photo-1547504055-7da8db4c24f2?w=300&h=300&fit=crop", region: "Musanze" },
];

const categories = [
  { name: 'Byose (All)', key: 'all' },
  { name: 'Imboga (Vegetables)', key: 'vegetables' },
  { name: 'Imbuto (Cereals)', key: 'cereals' },
  { name: 'Ibirayi (Tubers)', key: 'tubers' },
  { name: 'Organic', key: 'organic' }
];

const BuyerDashboard = ({navigation}) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [language, setLanguage] = useState('kinyarwanda'); 
  const [searchQuery, setSearchQuery] = useState('');

  const getTranslation = (kinyarwanda, english) => {
    return language === 'kinyarwanda' ? kinyarwanda : english;
  };

  const filteredProducts = products.filter(product => 
    (selectedCategory === 'all' || product.category === selectedCategory) &&
    (searchQuery === '' || product.title.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const renderProduct = ({ item }) => (
    <TouchableOpacity 
    style={styles.productCard}
    onPress={() => navigation.navigate("ProductDetail", {
  product: {
    ...item,
    titleEn: item.title,
    images: [item.img], 
    farmer: {
      name: "Jean Uwimana",
      cooperative: "Rwamagana Coop",
      location: "Rwamagana",
      rating: 4.7,
      completedOrders: 152,
      yearsExperience: 6
    },
    description: {
      kinyarwanda: "Ibisobanuro birambuye ku bicuruzwa.",
      english: "Detailed product description."
    },
    specifications: {
      origin: "Rwanda",
      harvestDate: "2024-06-01",
      organic: true,
      certifications: ["Certified"],
      shelfLife: "7 days",
      storageTemp: "10-15°C"
    },
    availability: {
      inStock: true,
      quantity: "100 kg",
      nextHarvest: "2024-06-20"
    },
    pricing: {
      basePrice: parseInt(item.price.replace(/\D/g, '')) || 800,
      bulk10kg: 750,
      bulk50kg: 700,
      bulk100kg: 650
    }
  }
})}

    >
      <Image source={{ uri: item.img }} style={styles.productImage} />
      <View style={styles.productInfo}>
        <Text style={styles.productTitle}>{item.title}</Text>
        <Text style={styles.productPrice}>{item.price}</Text>
        <Text style={styles.minOrder}>{item.minOrder}</Text>
        <View style={styles.locationBadge}>
          <Ionicons name="location" size={12} color="#666" />
          <Text style={styles.locationText}>Kigali, Rwanda</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderTopDeal = ({ item }) => (
    <TouchableOpacity style={styles.dealCard}>
      {item.isFlashDeal && (
        <View style={styles.flashDealBadge}>
          <Text style={styles.flashDealText}>⚡ {getTranslation('Igiciro Gito', 'Flash Deal')}</Text>
        </View>
      )}
      <Image source={{ uri: item.img }} style={styles.dealImage} />
      <View style={styles.dealInfo}>
        <Text style={styles.dealPrice}>{item.price}</Text>
        <Text style={styles.dealDiscount}>{item.discount}</Text>
        <Text style={styles.farmerName}>{item.farmer}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderNewArrival = ({ item }) => (
    <TouchableOpacity style={styles.arrivalCard}>
      <Image source={{ uri: item.img }} style={styles.arrivalImage} />
      <View style={styles.arrivalInfo}>
        <Text style={styles.arrivalTitle}>{item.title}</Text>
        <Text style={styles.arrivalPrice}>{item.price}</Text>
        <View style={styles.regionBadge}>
          <Text style={styles.regionText}>{item.region}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.appName}>AgriHub</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={styles.languageButton}
              onPress={() => setLanguage(language === 'kinyarwanda' ? 'english' : 'kinyarwanda')}
            >
              <Text style={styles.languageText}>
                {language === 'kinyarwanda' ? 'EN' : 'KIN'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.notificationButton}>
              <Ionicons name="notifications-outline" size={24} color="#2d5016" />
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Header Tabs */}
        <View style={styles.headerTabs}>
          <TouchableOpacity style={styles.activeTab}>
            <Text style={styles.activeTabText}>
              {getTranslation('Ibicuruzwa', 'Products')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.inactiveTab}>
            <Text style={styles.inactiveTabText}>
              {getTranslation('Abahinzi', 'Farmers')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.inactiveTab}>
            <Text style={styles.inactiveTabText}>
              {getTranslation('Amakoperative', 'Cooperatives')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder={getTranslation('Shakisha ibicuruzwa...', 'Search products...')}
            placeholderTextColor="#666"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity style={styles.searchButton}>
            <Ionicons name="search" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.categoryContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {categories.map((category, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.categoryButton,
                selectedCategory === category.key && styles.activeCategoryButton
              ]}
              onPress={() => setSelectedCategory(category.key)}
            >
              <Text style={[
                styles.categoryText,
                selectedCategory === category.key && styles.activeCategoryText
              ]}>
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          {getTranslation('Ibicuruzwa Bishya', 'Fresh Products Available')}
        </Text>
        <View style={styles.productsGrid}>
          {filteredProducts.map((item) => (
            <View key={item.id} style={styles.gridItem}>
              {renderProduct({ item })}
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {getTranslation('Ibiciro Byiza', 'Best Deals')}
          </Text>
          <TouchableOpacity>
            <Ionicons name="arrow-forward" size={24} color="#2d5016" />
          </TouchableOpacity>
        </View>
        <Text style={styles.sectionSubtitle}>
          {getTranslation('Ibiciro byiza kuva mu bahinzi', 'Great prices directly from farmers')}
        </Text>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={topDeals}
          renderItem={renderTopDeal}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.horizontalList}
        />
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {getTranslation('Bishya Bihageze', 'New Arrivals')}
          </Text>
          <TouchableOpacity>
            <Ionicons name="arrow-forward" size={24} color="#2d5016" />
          </TouchableOpacity>
        </View>
        <Text style={styles.sectionSubtitle}>
          {getTranslation('Ibicuruzwa bishya biva mu turere', 'Fresh products from different regions')}
        </Text>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={newArrivals}
          renderItem={renderNewArrival}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.horizontalList}
        />
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
    backgroundColor: 'white',
    paddingTop: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2d5016',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  languageButton: {
    backgroundColor: '#f0f7e8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginRight: 12,
  },
  languageText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2d5016',
  },
  notificationButton: {
    padding: 4,
  },
  headerTabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
  },
  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: '#2d5016',
    paddingBottom: 12,
    marginRight: 24,
  },
  inactiveTab: {
    paddingBottom: 12,
    marginRight: 24,
  },
  activeTabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d5016',
  },
  inactiveTabText: {
    fontSize: 16,
    color: '#666',
  },
  searchContainer: {
    backgroundColor: 'white',
    padding: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 25,
    paddingHorizontal: 16,
    height: 50,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  searchButton: {
    backgroundColor: '#2d5016',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryContainer: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
  },
  activeCategoryButton: {
    backgroundColor: '#2d5016',
  },
  categoryText: {
    fontSize: 14,
    color: '#666',
  },
  activeCategoryText: {
    color: 'white',
    fontWeight: '500',
  },
  section: {
    backgroundColor: 'white',
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2d5016',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  gridItem: {
    width: '50%',
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  productCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  productImage: {
    width: '100%',
    height: 120,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  productInfo: {
    padding: 12,
  },
  productTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2d5016',
    marginBottom: 4,
  },
  minOrder: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  locationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 11,
    color: '#666',
    marginLeft: 4,
  },
  horizontalList: {
    paddingRight: 16,
  },
  dealCard: {
    width: 160,
    marginRight: 16,
    position: 'relative',
    backgroundColor: 'white',
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  flashDealBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#2d5016',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    zIndex: 1,
  },
  flashDealText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  dealImage: {
    width: '100%',
    height: 120,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  dealInfo: {
    padding: 12,
  },
  dealPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2d5016',
    marginBottom: 4,
  },
  dealDiscount: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  farmerName: {
    fontSize: 12,
    color: '#2d5016',
    fontWeight: '500',
  },
  arrivalCard: {
    width: 140,
    marginRight: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  arrivalImage: {
    width: '100%',
    height: 100,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  arrivalInfo: {
    padding: 12,
  },
  arrivalTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  arrivalPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2d5016',
    marginBottom: 8,
  },
  regionBadge: {
    backgroundColor: '#f0f7e8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  regionText: {
    fontSize: 11,
    color: '#2d5016',
    fontWeight: '500',
  },
  bottomSpacing: {
    height: 20,
  },
});

export default BuyerDashboard;
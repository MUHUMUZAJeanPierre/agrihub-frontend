
// // components/BuyerDashboard/PromotionBanner.js
// import React, { useRef, useEffect, useState } from 'react';
// import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet, Dimensions } from 'react-native';
// import { Colors} from '../../styles/BuyerDashboardStyles.js'

// const PromotionBanner = ({ promotions, onOrderNow }) => {
//   const [currentSlide, setCurrentSlide] = useState(0);
//   const promoScrollRef = useRef(null);
//   const { width } = Dimensions.get('window');

//   useEffect(() => {
//     const interval = setInterval(() => {
//       const nextIndex = (currentSlide + 1) % promotions.length;
//       setCurrentSlide(nextIndex);
//       promoScrollRef.current?.scrollTo({ x: nextIndex * width, animated: true });
//     }, 4000);

//     return () => clearInterval(interval);
//   }, [currentSlide, promotions.length, width]);

//   const handleIndicatorPress = (index) => {
//     setCurrentSlide(index);
//     promoScrollRef.current?.scrollTo({ x: index * width, animated: true });
//   };

//   return (
//     <View style={styles.promotionSection}>
//       <ScrollView
//         ref={promoScrollRef}
//         horizontal
//         pagingEnabled
//         showsHorizontalScrollIndicator={false}
//         onScroll={(e) => {
//           const index = Math.round(e.nativeEvent.contentOffset.x / width);
//           setCurrentSlide(index);
//         }}
//         scrollEventThrottle={16}
//         style={styles.promotionScrollView}
//       >
//         {promotions.map((promo, index) => (
//           <View key={index} style={[styles.promotionBanner, { width }]}>
//             <View style={styles.promotionCard}>
//               <View style={styles.promotionContent}>
//                 <View style={styles.promotionBadge}>
//                   <Text style={styles.promotionDiscount}>{promo.discount}</Text>
//                 </View>
//                 <Text style={styles.promotionText}>{promo.text}</Text>
//                 <TouchableOpacity
//                   style={styles.orderNowButton}
//                   onPress={() => onOrderNow(promo)}
//                   activeOpacity={0.8}
//                 >
//                   <Text style={styles.orderNowText}>Order Now</Text>
//                 </TouchableOpacity>
//               </View>
//               <View style={styles.promotionImageContainer}>
//                 <View style={styles.imageWrapper}>
//                   <Image
//                     source={{ uri: promo.image }}
//                     style={styles.promotionImage}
//                     resizeMode="cover"
//                   />
//                 </View>
//               </View>
//             </View>
//           </View>
//         ))}
//       </ScrollView>
//       <View style={styles.indicatorContainer}>
//         {promotions.map((_, index) => (
//           <TouchableOpacity
//             key={index}
//             style={[
//               styles.indicator,
//               {
//                 backgroundColor: index === currentSlide ? '#2E7D31' : 'rgba(255, 255, 255, 0.4)',
//                 width: index === currentSlide ? 24 : 8,
//               }
//             ]}
//             onPress={() => handleIndicatorPress(index)}
//             activeOpacity={0.7}
//           />
//         ))}
//       </View>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   promotionSection: {
//     marginBottom: 5,
//   },
//   promotionScrollView: {
//     marginBottom: 10,
//   },
//   promotionBanner: {
//     paddingHorizontal: 20,
//   },
//   promotionCard: {
//     backgroundColor: '#F1F8E9',
//     borderRadius: 20,
//     padding: 20,
//     flexDirection: 'row',
//     alignItems: 'center',   
//     overflow: 'hidden',
//     position: 'relative',
//     borderWidth: 1,
//     borderColor: '#E8F5E8'
//   },
//   promotionContent: {
//     flex: 1,
//     zIndex: 2,
//   },
//   promotionBadge: {
//     backgroundColor: '#2E7D31',
//     paddingHorizontal: 10,
//     paddingVertical: 4,
//     borderRadius: 20,
//     alignSelf: 'flex-start',
//     marginBottom: 12,
//     borderWidth: 1,
//     borderColor: 'rgba(255, 255, 255, 0.3)',
//   },
//   promotionDiscount: {
//     fontSize: 10,
//     fontWeight: '500',
//     color: '#fff',
//     letterSpacing: 0.5,
//   },
//   promotionText: {
//     fontSize: 15,
//     color: '#2E7D31',
//     opacity: 0.95,
//     marginBottom: 20,
//     lineHeight: 22,
//     fontWeight: '500',
//   },
//   orderNowButton: {
//     backgroundColor: '#2E7D31',
//     paddingHorizontal: 20,
//     paddingVertical: 12,
//     borderRadius: 25,
//     alignSelf: 'flex-start',
//     flexDirection: 'row',
//     alignItems: 'center',
//     borderWidth: 1,
//     borderColor: 'rgba(255, 255, 255, 0.3)',
//   },
//   orderNowText: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: '#fff',
//   },
//   promotionImageContainer: {
//     width: 100,
//     height: 100,
//     justifyContent: 'center',
//     alignItems: 'center',
//     position: 'relative',
//   },
//   imageWrapper: {
//     width: 90,
//     height: 90,
//     borderRadius: 45,
//     overflow: 'hidden',
//     borderWidth: 3,
//     borderColor: 'rgba(255, 255, 255, 0.3)',
//   },
//   promotionImage: {
//     width: '100%',
//     height: '100%',
//   },
//   indicatorContainer: {
//     flexDirection: 'row',
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingHorizontal: 20,
//     gap: 8,
//   },
//   indicator: {
//     height: 8,
//     borderRadius: 4,
//   },
// });

// export default PromotionBanner;

// components/BuyerDashboard/PromotionBanner.js
import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Image, 
  ScrollView, 
  StyleSheet,
  Dimensions 
} from 'react-native';

const { width } = Dimensions.get('window');

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

const PromotionBanner = ({ 
  promotions = [],
  onOrderNow 
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const scrollRef = useRef(null);

  const defaultPromotions = [
    {
      discount: '35% OFF',
      text: 'On your first order from the app and get discount',
      image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=200',
    },
    {
      discount: '20% OFF',
      text: 'Fresh veggies this week only! above RWF 10,000',
      image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=200',
    },
    {
      discount: 'Free Delivery',
      text: 'Enjoy free delivery on orders above RWF 10,000',
      image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=200',
    },
  ];

  const promoData = promotions.length > 0 ? promotions : defaultPromotions;

  useEffect(() => {
    const interval = setInterval(() => {
      const nextIndex = (currentSlide + 1) % promoData.length;
      setCurrentSlide(nextIndex);
      scrollRef.current?.scrollTo({ x: nextIndex * width, animated: true });
    }, 4000);

    return () => clearInterval(interval);
  }, [currentSlide, promoData.length]);

  const handleScroll = (event) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / width);
    setCurrentSlide(index);
  };

  const handleIndicatorPress = (index) => {
    setCurrentSlide(index);
    scrollRef.current?.scrollTo({ x: index * width, animated: true });
  };

  return (
    <View style={styles.promotionSection}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={styles.promotionScrollView}
      >
        {promoData.map((promo, index) => (
          <View key={index} style={[styles.promotionBanner, { width }]}>
            <View style={styles.promotionCard}>
              <View style={styles.promotionContent}>
                <View style={styles.promotionBadge}>
                  <Text style={styles.promotionDiscount}>{promo.discount}</Text>
                </View>
                <Text style={styles.promotionText}>{promo.text}</Text>
                <TouchableOpacity
                  style={styles.orderNowButton}
                  onPress={() => onOrderNow && onOrderNow(promo)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.orderNowText}>Order Now</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.promotionImageContainer}>
                <View style={styles.imageWrapper}>
                  <Image
                    source={{ uri: promo.image }}
                    style={styles.promotionImage}
                    resizeMode="cover"
                  />
                </View>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
      
      <View style={styles.indicatorContainer}>
        {promoData.map((_, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.indicator,
              {
                backgroundColor: index === currentSlide ? '#2E7D31' : 'rgba(255, 255, 255, 0.4)',
                width: index === currentSlide ? 24 : 8,
              }
            ]}
            onPress={() => handleIndicatorPress(index)}
            activeOpacity={0.7}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  promotionSection: {
    marginBottom: 24,
  },
  promotionScrollView: {
    marginBottom: 10,
  },
  promotionBanner: {
    paddingHorizontal: 20,
  },
  promotionCard: {
    backgroundColor: '#F1F8E9',
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',   
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: '#E8F5E8'
  },
  promotionContent: {
    flex: 1,
    zIndex: 2,
  },
  promotionBadge: {
    backgroundColor: '#2E7D31',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  promotionDiscount: {
    fontSize: 10,
    fontWeight: '500',
    color: '#fff',
    letterSpacing: 0.5,
  },
  promotionText: {
    fontSize: 15,
    color: '#2E7D31',
    opacity: 0.95,
    marginBottom: 20,
    lineHeight: 22,
    fontWeight: '500',
  },
  orderNowButton: {
    backgroundColor: '#2E7D31',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  orderNowText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  promotionImageContainer: {
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  imageWrapper: {
    width: 90,
    height: 90,
    borderRadius: 45,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  promotionImage: {
    width: '100%',
    height: '100%',
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    gap: 8,
  },
  indicator: {
    height: 8,
    borderRadius: 4,
  },
});

export default PromotionBanner;
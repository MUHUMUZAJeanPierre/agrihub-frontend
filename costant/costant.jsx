import { Ionicons } from '@expo/vector-icons';

export const API_CONFIG = {
  PRODUCT_BASE_URL: 'https://agrihub-backend-4z99.onrender.com/product',
  CART_BASE_URL: 'https://agrihub-backend-4z99.onrender.com/cart',
  ORDER_URL: 'https://agrihub-backend-4z99.onrender.com/api/orders/place-order',
  TIMEOUT: 10000,
};

export const AUTH_KEYS = {
  TOKEN: '@auth_token',
  USER_ID: '@user_id',
  USER_DATA: '@user_data',
};

export const CATEGORIES = [
  { id: 'all', name: 'All', icon: 'grid-outline', color: '#4A90E2' },
  { id: 'fruits', name: 'Fruits', icon: 'nutrition-outline', color: '#FFA726' },
  { id: 'dairy', name: 'Dairy', icon: 'water-outline', color: '#4A90E2' },
  { id: 'vegetables', name: 'Veggies', icon: 'leaf-outline', color: '#4CAF50' },
  { id: 'meat', name: 'Meat', icon: 'restaurant-outline', color: '#F44336' },
  { id: 'tubers', name: 'Tubers', icon: 'flower-outline', color: '#FF9800' },
];

export const PROMOTIONS = [
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

export const ANIMATION_CONFIGS = {
  FADE_DURATION: 300,
  SLIDE_DURATION: 400,
  SCALE_DURATION: 200,
  SPRING_CONFIG: {
    tension: 200,
    friction: 8,
  },
  PROMOTION_INTERVAL: 4000,
};
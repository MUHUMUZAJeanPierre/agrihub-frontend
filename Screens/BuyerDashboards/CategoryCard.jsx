import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet 
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

const CategoryCard = ({ 
  item, 
  isSelected = false,
  onPress 
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.categoryCard,
        isSelected && styles.selectedCategoryCard
      ]}
      onPress={() => onPress(item.id)}
      activeOpacity={0.8}
    >
      <View style={[
        styles.categoryIcon,
        { backgroundColor: item.color + '20' },
        isSelected && { backgroundColor: item.color }
      ]}>
        <Ionicons
          name={item.icon}
          size={24}
          color={isSelected ? '#fff' : item.color}
        />
      </View>
      <Text style={[
        styles.categoryName,
        isSelected && styles.selectedCategoryName
      ]}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  categoryCard: {
    alignItems: 'center',
    marginRight: 20,
    paddingVertical: 8,
  },
  selectedCategoryCard: {
    // Additional styling for selected category if needed
  },
  categoryIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  selectedCategoryName: {
    color: Colors.textPrimary,
    fontWeight: '600',
  },
});

export default CategoryCard;
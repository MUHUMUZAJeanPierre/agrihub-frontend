import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

const CATEGORY_ICONS = {
  'All': '⊞',
  'Fruits': '🍎',
  'Dairy': '💧',
  'Veggies': '🌿',
  'Meat': '🍖',
  'AI Technology': '🤖',
  'Sustainability': '🌱',
  'Smart Farming': '📡',
  'Climate Science': '🌡️',
  'Irrigation': '💧',
  'Pest Control': '🐛',
  'Soil Health': '🌱',
  'Fertilizers': '🧪',
  'Crop Management': '🌾',
  'Weather': '⛅',
  'Market Analysis': '📈',
  'Equipment': '🚜',
  'Organic Farming': '🌿',
  'Seeds': '🌱',
  'Harvesting': '🌾',
  'General': '📚',
  'System': '⚙️',
};

const CATEGORY_COLORS = {
  'All': '#5B82F6',
  'Fruits': '#F59E0B',
  'Dairy': '#3B82F6',
  'Veggies': '#10B981',
  'Meat': '#EF4444',
  'AI Technology': '#8B5CF6',
  'Sustainability': '#10B981',
  'Smart Farming': '#3B82F6',
  'Climate Science': '#F59E0B',
  'Irrigation': '#06B6D4',
  'Pest Control': '#EF4444',
  'Soil Health': '#84CC16',
  'Fertilizers': '#F59E0B',
  'Crop Management': '#10B981',
  'Weather': '#3B82F6',
  'Market Analysis': '#8B5CF6',
  'Equipment': '#F59E0B',
  'Organic Farming': '#10B981',
  'Seeds': '#84CC16',
  'Harvesting': '#F59E0B',
  'General': '#6B7280',
  'System': '#6B7280',
};

// Add font family to your font styles
const FONTS = {
  regular: "Poppins_400Regular",
  semiBold: "Poppins_600SemiBold",
  bold: "Poppins_700Bold",
};

export default function CategoryFilter({ categories, selectedCategory, onSelect, Colors }) {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {categories.map((category) => {
          const isSelected = selectedCategory === category.name;
          const categoryColor = CATEGORY_COLORS[category.name] || '#6B7280';
          
          return (
            <TouchableOpacity
              key={category.name}
              style={styles.categoryItem}
              onPress={() => onSelect(category.name)}
              activeOpacity={0.7}
            >
              <View
                style={[ 
                  styles.iconContainer,
                  {
                    backgroundColor: isSelected ? categoryColor : `${categoryColor}30`,
                  },
                ]}
              >
                <Text style={[
                  styles.icon, 
                  { 
                    color: isSelected ? '#FFFFFF' : categoryColor,
                    fontFamily: FONTS.regular // Apply regular font to icon
                  }
                ]}>
                  {CATEGORY_ICONS[category.name] || '📚'}
                </Text>
              </View>
              <Text
                style={[ 
                  styles.categoryText, 
                  {
                    color: isSelected ? (Colors?.text || '#000000') : (Colors?.textSecondary || '#6B7280'),
                    fontWeight: isSelected ? '600' : '500',
                    fontFamily: isSelected ? FONTS.semiBold : FONTS.regular, 
                  },
                ]}
              >
                {category.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
  },
  scrollContainer: {
    paddingHorizontal: 20,
    gap: 24,
  },
  categoryItem: {
    alignItems: 'center',
    minWidth: 70,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  icon: {
    fontSize: 20,
    fontWeight: '500',
  },
  categoryText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 16,
  },
});

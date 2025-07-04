// components/BuyerDashboard/CategoryList.js
import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from './styles';

const CategoryCard = ({ item, isSelected, onSelect }) => (
  <TouchableOpacity
    style={[
      styles.categoryCard,
      isSelected && styles.selectedCategoryCard
    ]}
    onPress={() => onSelect(item.id)}
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

const CategoryList = ({ categories, selectedCategory, onCategorySelect }) => {
  return (
    <View style={styles.section}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesContainer}
      >
        {categories.map((category) => (
          <CategoryCard
            key={category.id}
            item={category}
            isSelected={selectedCategory === category.id}
            onSelect={onCategorySelect}
          />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: 24,
  },
  categoriesContainer: {
    paddingHorizontal: 20,
    paddingRight: 40,
  },
  categoryCard: {
    alignItems: 'center',
    marginRight: 20,
    paddingVertical: 8,
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

export default CategoryList;

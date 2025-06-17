// File: components/EmptyState.js
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../styles';

const EmptyState = ({ query, onClear, title }) => {
  return (
    <View style={styles.emptyState}>
      <Ionicons name="leaf-outline" size={64} color="#aaa" style={{ marginBottom: 12 }} />
      <Text style={styles.emptyStateTitle}>{title || (query ? 'No products found' : 'No products available')}</Text>
      <Text style={styles.emptyStateSubtitle}>
        {query ? 'Try different keywords or categories.' : 'New items coming soon.'}
      </Text>
      {query && (
        <TouchableOpacity onPress={onClear} style={styles.clearSearchBtn}>
          <Text style={styles.clearSearchText}>Clear Search</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default EmptyState;

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { 
  wp, 
  hp, 
  fontSize, 
  padding, 
  margin, 
  borderRadius, 
  iconSize, 
  fontSizes, 
  spacing,
  isPhone,
  isTablet,
  getResponsiveValue,
  imageDimensions,
  buttonDimensions
} from '../utils/responsive';

const ResponsiveExample = () => {
  return (
    <View style={styles.container}>
      {/* Responsive Text */}
      <Text style={styles.title}>Responsive Design Example</Text>
      
      {/* Responsive Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.smallButton}>
          <Text style={styles.buttonText}>Small</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.mediumButton}>
          <Text style={styles.buttonText}>Medium</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.largeButton}>
          <Text style={styles.buttonText}>Large</Text>
        </TouchableOpacity>
      </View>
      
      {/* Responsive Cards */}
      <View style={styles.cardContainer}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Card 1</Text>
          <Text style={styles.cardText}>This card adapts to screen size</Text>
        </View>
        
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Card 2</Text>
          <Text style={styles.cardText}>Responsive spacing and fonts</Text>
        </View>
      </View>
      
      {/* Device Info */}
      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>
          Device Type: {isPhone() ? 'Phone' : isTablet() ? 'Tablet' : 'Desktop'}
        </Text>
        <Text style={styles.infoText}>
          Screen Width: {wp(100)}px
        </Text>
        <Text style={styles.infoText}>
          Screen Height: {hp(100)}px
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: padding.lg,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: fontSizes['3xl'],
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: spacing[6],
    color: '#333',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing[6],
  },
  smallButton: {
    ...buttonDimensions.small,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mediumButton: {
    ...buttonDimensions.medium,
    backgroundColor: '#34C759',
    justifyContent: 'center',
    alignItems: 'center',
  },
  largeButton: {
    ...buttonDimensions.large,
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: fontSizes.sm,
    fontWeight: '600',
  },
  cardContainer: {
    marginBottom: spacing[6],
  },
  card: {
    ...cardDimensions.medium,
    backgroundColor: 'white',
    marginBottom: spacing[3],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: fontSizes.lg,
    fontWeight: '600',
    marginBottom: spacing[2],
    color: '#333',
  },
  cardText: {
    fontSize: fontSizes.base,
    color: '#666',
    lineHeight: fontSizes.base * 1.4,
  },
  infoContainer: {
    backgroundColor: 'white',
    padding: padding.md,
    borderRadius: borderRadius.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  infoText: {
    fontSize: fontSizes.sm,
    color: '#666',
    marginBottom: spacing[1],
  },
});

export default ResponsiveExample; 
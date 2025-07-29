import { View, Image, StyleSheet } from 'react-native'
import React from 'react'

export default function Loading({ size }) {
  return (
    <View style={[styles.container, { height: size, aspectRatio: 1 }]}>
      <Image
        source={require('../../assets/logo.png')}
        style={[
          styles.image,
          { width: size || 50, height: size || 50 }
        ]}
        resizeMode="contain"
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    // width and height are set dynamically
  },
});
import React, { useState } from 'react';
import {
  Text,
  View,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

// Import color sets
const LightColors = {
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

  gradient: ['#4A90E2', '#357ABD'],
  orangeGradient: ['#FF6B35', '#FF8A50'],
};

const DarkColors = {
  primary: '#4A90E2',
  primaryDark: '#2D5AA0',
  secondary: '#FF6B35',
  accent: '#FFA726',

  background: '#121212',
  surface: '#1E1E1E',
  surfaceLight: '#2C2C2C',

  textPrimary: '#FFFFFF',
  textSecondary: '#B0B0B0',
  textTertiary: '#808080',

  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',

  cardBackground: '#1A1A1A',
  inputBackground: '#2C2C2C',
  borderColor: '#3A3A3A',

  gradient: ['#4A90E2', '#357ABD'],
  orangeGradient: ['#FF6B35', '#FF8A50'],
};

export default function Forgot() {
  const { theme } = useTheme();
  const Colors = theme === 'dark' ? DarkColors : LightColors;

  const [email, setEmail] = useState('');

  const handleForgotPassword = () => {
    if (!email.includes('@')) {
      Alert.alert('Invalid email', 'Please enter a valid email address');
      return;
    }

    console.log(`Password reset link sent to: ${email}`);
    Alert.alert('Success', 'Password reset link sent to your email.');
  };

  return (
    <View style={[styles.container, { backgroundColor: Colors.background }]}>
      <Image
        style={{ width: '95%', height: 280 }}
        source={require('../assets/forgote.png')}
      />

      <Text style={[styles.text, { color: Colors.textSecondary }]}>
        Enter the email address you used when you
      </Text>
      <Text style={[styles.text, { color: Colors.textSecondary }]}>
        joined and we'll send you instructions to
      </Text>
      <Text style={[styles.text, { color: Colors.textSecondary }]}>
        reset your password.
      </Text>

      <View style={{ paddingVertical: 25 }}>
        <TextInput
          placeholder="Email"
          placeholderTextColor={Colors.textTertiary}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          style={[
            styles.input,
            {
              backgroundColor: Colors.inputBackground,
              borderColor: Colors.borderColor,
              color: Colors.textPrimary,
            },
          ]}
        />
      </View>

      <View style={{ paddingVertical: 50 }}>
        <TouchableOpacity
          onPress={handleForgotPassword}
          style={[styles.button, { backgroundColor: Colors.success }]}
        >
          <Text style={styles.buttonText}>Send Link</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 30,
    paddingHorizontal: 30,
  },
  text: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
  },
  button: {
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

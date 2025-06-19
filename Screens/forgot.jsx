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

export default function Forgot() {
  const [email, setEmail] = useState('');

  const handleForgotPassword = () => {
    if (!email.includes('@')) {
      Alert.alert('Invalid email', 'Please enter a valid email address');
      return;
    }

    // Simulate sending email
    console.log(`Password reset link sent to: ${email}`);
    Alert.alert('Success', 'Password reset link sent to your email.');
  };

  return (
    <View style={styles.container}>
      <Image
        style={{ width: '95%', height: 280 }}
        source={require('../assets/forgote.png')}
      />

      <Text style={styles.text}>
        Enter the email address you used when you
      </Text>
      <Text style={styles.text}>
        joined and we'll send you instructions to
      </Text>
      <Text style={styles.text}>reset your password.</Text>

      <View style={{ paddingVertical: 25 }}>
        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          style={styles.input}
        />
      </View>

      <View style={{ paddingVertical: 50 }}>
        <TouchableOpacity onPress={handleForgotPassword} style={styles.button}>
          <Text style={styles.buttonText}>Send Link</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingVertical: 30,
    paddingHorizontal: 30,
  },
  text: {
    color: '#B0ABAB',
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
  },
  input: {
    borderColor: '#cccccc',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#F5F5F5',
  },
  button: {
    backgroundColor: '#4ba26a',
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

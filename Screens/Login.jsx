import React, { useState } from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
} from 'react-native';
import StandardTextInput from '../Components/StandardTextInput';
import Button from '../Components/Button';
import FlashMessage, { showMessage } from 'react-native-flash-message';

export default function Login({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    let valid = true;

    if (email.trim() === '') {
      setEmailError('Email is required');
      valid = false;
    } else if (!isValidEmail(email)) {
      setEmailError('Invalid email format');
      valid = false;
    } else {
      setEmailError('');
    }

    if (password.trim() === '') {
      setPasswordError('Password is required');
      valid = false;
    } else {
      setPasswordError('');
    }

    return valid;
  };

  const signin = async (email, password) => {
    try {
      setLoading(true);
      const response = await fetch('https://agrihub-backend-4z99.onrender.com/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        const message = data?.message || 'Login failed';
        throw new Error(message);
      }

      showMessage({
        message: 'Login Successful',
        type: 'success',
        icon: 'success',
      });

      // Navigate based on user type if returned (optional)
      // Example: if (data.userType === 'farmer') navigation.navigate('farmer');

      navigation.navigate('farmer'); // Or navigate to appropriate screen
    } catch (error) {
      showMessage({
        message: 'Login Error',
        description: error.message,
        type: 'danger',
        icon: 'danger',
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    if (validateForm()) {
      signin(email, password);
    }
  };

  return (
    <View style={{ height: '100%' }}>
      <FlashMessage position="top" />
      <View style={styles.container}>
        <KeyboardAvoidingView>
          <Image style={{ width: '95%', height: 280 }} source={require('../assets/logo.jpg')} />
          <Text style={styles.title}>Log In</Text>
          <Text style={styles.subtitle}>Please sign in to continue</Text>

          <View style={{ paddingVertical: 25 }}>
            <StandardTextInput
              label="Email"
              icon2="email"
              onChangeText={setEmail}
              value={email}
              error={emailError}
            />
            {emailError && <Text style={styles.errorText}>{emailError}</Text>}

            <StandardTextInput
              label="Password"
              icon2="lock"
              icon1={showPassword ? 'eye-off-outline' : 'eye-outline'}
              onChangeText={setPassword}
              value={password}
              error={passwordError}
              onPress={togglePasswordVisibility}
              secureTextEntry={!showPassword}
            />
            {passwordError && <Text style={styles.errorText}>{passwordError}</Text>}

            <Text
              onPress={() => navigation.navigate('forgot')}
              style={styles.forgotText}
            >
              Forgot password
            </Text>
          </View>

          <TouchableOpacity>
            <Button title="Sign In" onPress={handleSubmit} loading={loading} />
          </TouchableOpacity>

          <View style={styles.bottomText}>
            <Text>Don't have an Account?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.signupText}>Sign up</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    paddingVertical: 30,
    paddingHorizontal: 30,
    height: '100%',
  },
  title: {
    fontSize: 30,
    fontFamily: 'Poppins_600SemiBold',
    textAlign: 'center',
  },
  subtitle: {
    color: '#B0ABAB',
    textAlign: 'center',
  },
  errorText: {
    color: 'red',
    paddingVertical: 4,
    fontSize: 12,
  },
  forgotText: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: '#4BA26A',
    alignSelf: 'flex-end',
    marginTop: 15,
  },
  bottomText: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 15,
  },
  signupText: {
    color: '#4BA26A',
    fontFamily: 'Poppins_600SemiBold',
    marginLeft: 4,
  },
});

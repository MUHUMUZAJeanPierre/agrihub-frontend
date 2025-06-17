import React, { useState } from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  SafeAreaView,
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

  const togglePasswordVisibility = () => setShowPassword(prev => !prev);

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validateForm = () => {
    let valid = true;
    if (!email.trim()) {
      setEmailError('Email is required');
      valid = false;
    } else if (!isValidEmail(email)) {
      setEmailError('Invalid email format');
      valid = false;
    } else {
      setEmailError('');
    }

    if (!password.trim()) {
      setPasswordError('Password is required');
      valid = false;
    } else {
      setPasswordError('');
    }

    return valid;
  };

  const signin = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://agrihub-backend-4z99.onrender.com/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data?.message || 'Login failed');

      showMessage({
        message: 'Login Successful',
        type: 'success',
        icon: 'success',
      });

      navigation.navigate('farmer');
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
    if (validateForm()) signin();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <FlashMessage position="top" />
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : null}
          style={styles.container}
        >
          <Image source={require('../assets/logo.jpg')} style={styles.logo} resizeMode="contain" />

          <Text style={styles.title}>Log In</Text>
          <Text style={styles.subtitle}>Please sign in to continue</Text>

          <View style={{ paddingVertical: 25 }}>
            <StandardTextInput
              label="Email"
              icon2="email"
              value={email}
              onChangeText={setEmail}
              error={emailError}
            />
            {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

            <StandardTextInput
              label="Password"
              icon2="lock"
              icon1={showPassword ? 'eye-off-outline' : 'eye-outline'}
              value={password}
              onChangeText={setPassword}
              onPress={togglePasswordVisibility}
              secureTextEntry={!showPassword}
              error={passwordError}
            />
            {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}

            <TouchableOpacity onPress={() => navigation.navigate('forgot')}>
              <Text style={styles.forgotText}>Forgot password?</Text>
            </TouchableOpacity>
          </View>

          <Button title="Sign In" onPress={handleSubmit} loading={loading} />

          <View style={styles.bottomText}>
            <Text>Don't have an Account?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.signupText}> Sign up</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 30,
    paddingTop: 20,
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  logo: {
    width: '100%',
    height: 200,
    marginBottom: 10,
    alignSelf: 'center',
  },
  title: {
    fontSize: 28,
    fontFamily: 'Poppins_600SemiBold',
    textAlign: 'center',
    marginTop: 10,
  },
  subtitle: {
    color: '#B0ABAB',
    textAlign: 'center',
    fontSize: 14,
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 4,
    marginBottom: 8,
  },
  forgotText: {
    fontSize: 14,
    fontFamily: 'Poppins_500Medium',
    color: '#4BA26A',
    alignSelf: 'flex-end',
    marginTop: 10,
  },
  bottomText: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 25,
  },
  signupText: {
    color: '#4BA26A',
    fontFamily: 'Poppins_600SemiBold',
    marginLeft: 4,
  },
});

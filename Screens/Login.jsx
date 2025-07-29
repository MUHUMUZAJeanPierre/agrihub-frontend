import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import StandardTextInput from '../Components/StandardTextInput';
import Button from '../Components/Button';
import FlashMessage from 'react-native-flash-message';

const FONTS = {
  regular: 'Poppins_400Regular',
  semiBold: 'Poppins_600SemiBold',
  bold: 'Poppins_700Bold',
};

export default function Login({ navigation }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { login, loading } = useAuth();
  const { language, t } = useLanguage();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [logged, setLogged] = useState('');
  const [isLog, setIsLog] = useState(false);


  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validateForm = () => {
    let valid = true;
    setEmailError('');
    setPasswordError('');

    if (!email.trim()) {
      setEmailError('Email is required');
      valid = false;
    } else if (!isValidEmail(email)) {
      setEmailError('Invalid email format');
      valid = false;
    }

    if (!password.trim()) {
      setPasswordError('Password is required');
      valid = false;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      valid = false;
    }

    return valid;
  };

  const handleLogin = () => {
  if (validateForm()) {
    login(email, password, (userData) => {
      if (userData) {
        if (userData.usertype === "farmer") {
          setLogged("farmer");
          setIsLog(true);
        } else if (userData.usertype === "buyer") {
          setLogged("buyer");
          setIsLog(true);
        } else if (userData.usertype === "plant pathologist") {
          setLogged("plant pathologist");
          setIsLog(true);
        } else {
          console.log("Invalid account");
        }
      } else {
        console.log("Document doesn't exist");
      }
    });
  }
};


  // const handleLogin = () => {
  //   login(email, password, (role) => {
  //     const routeMap = {
  //       farmer: 'farmer',
  //       buyer: 'BottomNav',
  //       'plant pathologist': 'plant pathologist',
  //     };
  
  //     navigation.reset({
  //       index: 0,
  //       routes: [{ name: routeMap[role] || 'login' }],
  //     });
  //   });
  // };

  const bgColor = isDark ? '#121212' : '#fff';
  const textColor = isDark ? '#f0f0f0' : '#2D5016';
  const subTextColor = isDark ? '#aaaaaa' : '#B0ABAB';
  const placeholderTextColor = isDark ? '#888' : '#999';
  const inputBg = isDark ? '#1e1e1e' : '#f8f8f8';
  const inputBorder = isDark ? '#444' : '#e0e0e0';
  const linkColor = '#4BA26A';

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: bgColor }]}>
      <StatusBar
        backgroundColor={bgColor}
        barStyle={isDark ? 'light-content' : 'dark-content'}
      />
      <FlashMessage position="top" />
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={[styles.container, { backgroundColor: bgColor }]}
        >
          <Image
            source={require('../assets/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={[styles.title, { color: textColor }]}>Log In</Text>
          <Text style={[styles.subtitle, { color: subTextColor }]}>Please sign in to continue</Text>

          <View style={styles.formContainer}>
            <StandardTextInput
              label="Email"
              icon2="email"
              value={email}
              onChangeText={(t) => {
                setEmail(t);
                if (emailError) setEmailError('');
              }}
              error={emailError}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="Enter your email"
              placeholderTextColor={placeholderTextColor}
              style={{ backgroundColor: inputBg, borderColor: inputBorder }}
            />

            <StandardTextInput
              label="Password"
              icon2="lock"
              icon1={showPassword ? 'eye-off-outline' : 'eye-outline'}
              value={password}
              onChangeText={(t) => {
                setPassword(t);
                if (passwordError) setPasswordError('');
              }}
              onPress={togglePasswordVisibility}
              secureTextEntry={!showPassword}
              error={passwordError}
              autoCapitalize="none"
              placeholder="Enter your password"
              placeholderTextColor={placeholderTextColor}
              style={{ backgroundColor: inputBg, borderColor: inputBorder }}
            />

            <TouchableOpacity
              onPress={() => navigation.navigate('forgot')}
              style={styles.forgotPasswordContainer}
            >
              <Text style={[styles.forgotText, { color: linkColor }]}>Forgot password?</Text>
            </TouchableOpacity>
          </View>

          <Button
            title={loading ? 'Signing In...' : 'Sign In'}
            onPress={handleLogin}
            loading={loading}
            disabled={loading}
          />

          <View style={styles.bottomText}>
            <Text style={[styles.signupPrompt, { color: subTextColor }]}>Don't have an account?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('register')}>
              <Text style={[styles.signupText, { color: linkColor }]}> Sign up</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: {
    paddingHorizontal: 30,
    paddingTop: 20,
    flex: 1,
    justifyContent: 'center',
  },
  logo: {
    width: '100%',
    height: 200,
    marginBottom: 10,
    alignSelf: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    textAlign: 'center',
    fontFamily: FONTS.semiBold,
  },
  subtitle: {
    textAlign: 'center',
    fontSize: 14,
    marginBottom: 10,
    fontFamily: FONTS.regular,
  },
  formContainer: {
    paddingVertical: 25,
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginTop: 10,
  },
  forgotText: {
    fontSize: 14,
    fontFamily: FONTS.regular,
  },
  bottomText: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 25,
  },
  signupPrompt: {
    fontSize: 14,
    fontFamily: FONTS.regular,
  },
  signupText: {
    fontWeight: '600',
    fontSize: 14,
    fontFamily: FONTS.semiBold,
  },
});
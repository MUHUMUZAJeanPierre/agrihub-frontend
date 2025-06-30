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
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import StandardTextInput from '../Components/StandardTextInput';
import Button from '../Components/Button';
import FlashMessage, { showMessage } from 'react-native-flash-message';

const AUTH_KEYS = {
  TOKEN: '@auth_token',
  USER_ID: '@user_id',
  USER_DATA: '@user_data',
};

export default function Login({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const togglePasswordVisibility = () => setShowPassword(prev => !prev);

  const isValidEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

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

  const storeAuthData = async (data) => {
    const { token, user } = data;
    if (!token || !user?._id) throw new Error('Invalid user data');

    await AsyncStorage.setItem(AUTH_KEYS.TOKEN, token);
    await AsyncStorage.setItem(AUTH_KEYS.USER_ID, user._id);
    await AsyncStorage.setItem(AUTH_KEYS.USER_DATA, JSON.stringify(user));
  };

  const navigateToRoleDashboard = (role) => {
    switch (role) {
      case 'farmer':
        navigation.reset({ index: 0, routes: [{ name: 'farmer' }] });
        break;
      case 'buyer':
        navigation.reset({ index: 0, routes: [{ name: 'buyer' }] });
        break;
      case 'plant pathologist':
        navigation.reset({ index: 0, routes: [{ name: 'agrono' }] });
        break;
      default:
        showMessage({
          message: 'Unknown Role',
          description: `No screen configured for role: ${role}`,
          type: 'danger',
          icon: 'danger',
        });
    }
  };

  const signin = async () => {
    try {
      setLoading(true);

      const response = await fetch('https://agrihub-backend-4z99.onrender.com/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data?.message || 'Login failed');

      await storeAuthData(data);
      await storeAuthData(data);

      showMessage({
        message: 'Login Successful',
        description: `Welcome, ${data.user.name}`,
        type: 'success',
        icon: 'success',
      });

      navigateToRoleDashboard(data.user.role);
    } catch (error) {
      console.error('❌ Login error:', error);

      showMessage({
        message: 'Login Error',
        description:
          error.message.includes('Network')
            ? 'Please check your internet connection.'
            : error.message,
        type: 'danger',
        icon: 'danger',
        duration: 5000,
      });

      await AsyncStorage.multiRemove([
        AUTH_KEYS.TOKEN,
        AUTH_KEYS.USER_ID,
        AUTH_KEYS.USER_DATA,
      ]);
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
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : null}
          style={styles.container}
        >
          <Image
            source={require('../assets/logo.jpg')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>Log In</Text>
          <Text style={styles.subtitle}>Please sign in to continue</Text>

          <View style={styles.formContainer}>
            <StandardTextInput
              label="Email"
              icon2="email"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (emailError) setEmailError('');
              }}
              error={emailError}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="Enter your email"
            />

            <StandardTextInput
              label="Password"
              icon2="lock"
              icon1={showPassword ? 'eye-off-outline' : 'eye-outline'}
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (passwordError) setPasswordError('');
              }}
              onPress={togglePasswordVisibility}
              secureTextEntry={!showPassword}
              error={passwordError}
              autoCapitalize="none"
              placeholder="Enter your password"
            />

            <TouchableOpacity
              onPress={() => navigation.navigate('forgot')}
              style={styles.forgotPasswordContainer}
            >
              <Text style={styles.forgotText}>Forgot password?</Text>
            </TouchableOpacity>
          </View>

          <Button
            title="Sign In"
            onPress={handleSubmit}
            loading={loading}
            disabled={loading}
          />

          <View style={styles.bottomText}>
            <Text style={styles.signupPrompt}>Don't have an account?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('register')}>
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
    fontWeight: '600',
    textAlign: 'center',
    color: '#2D5016',
  },
  subtitle: {
    color: '#B0ABAB',
    textAlign: 'center',
    fontSize: 14,
    marginBottom: 10,
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
    color: '#4BA26A',
  },
  bottomText: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 25,
  },
  signupPrompt: {
    color: '#666',
    fontSize: 14,
  },
  signupText: {
    color: '#4BA26A',
    fontWeight: '600',
    fontSize: 14,
  },
});




// import React, { useState } from 'react';
// import {
//   View,
//   Text,
//   ScrollView,
//   Image,
//   StyleSheet,
//   TouchableOpacity,
//   SafeAreaView,
//   KeyboardAvoidingView,
//   Platform,
//   TextInput,
//   Dimensions,
//   StatusBar,
//   Alert,
// } from 'react-native';
// import { ImageBackground } from 'react-native';
// import Icon from 'react-native-vector-icons/Ionicons';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import FlashMessage, { showMessage } from 'react-native-flash-message';

// const AUTH_KEYS = {
//   TOKEN: '@auth_token',
//   USER_ID: '@user_id',
//   USER_DATA: '@user_data',
// };

// const Login = ({ navigation }) => {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [showPassword, setShowPassword] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);
//   const [emailFocused, setEmailFocused] = useState(false);
//   const [passwordFocused, setPasswordFocused] = useState(false);
  
//   // Validation states
//   const [emailError, setEmailError] = useState('');
//   const [passwordError, setPasswordError] = useState('');

//   const isValidEmail = (email) =>
//     /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

//   const validateForm = () => {
//     let valid = true;
//     setEmailError('');
//     setPasswordError('');

//     if (!email.trim()) {
//       setEmailError('Email is required');
//       valid = false;
//     } else if (!isValidEmail(email)) {
//       setEmailError('Invalid email format');
//       valid = false;
//     }

//     if (!password.trim()) {
//       setPasswordError('Password is required');
//       valid = false;
//     } else if (password.length < 6) {
//       setPasswordError('Password must be at least 6 characters');
//       valid = false;
//     }

//     return valid;
//   };

//   const storeAuthData = async (data) => {
//     const { token, user } = data;
//     if (!token || !user?._id) throw new Error('Invalid user data');

//     await AsyncStorage.setItem(AUTH_KEYS.TOKEN, token);
//     await AsyncStorage.setItem(AUTH_KEYS.USER_ID, user._id);
//     await AsyncStorage.setItem(AUTH_KEYS.USER_DATA, JSON.stringify(user));
//   };

//   const navigateToRoleDashboard = (role) => {
//     switch (role) {
//       case 'farmer':
//         navigation.reset({ index: 0, routes: [{ name: 'farmer' }] });
//         break;
//       case 'buyer':
//         navigation.reset({ index: 0, routes: [{ name: 'buyer' }] });
//         break;
//       case 'plant pathologist':
//         navigation.reset({ index: 0, routes: [{ name: 'agrono' }] });
//         break;
//       default:
//         showMessage({
//           message: 'Unknown Role',
//           description: `No screen configured for role: ${role}`,
//           type: 'danger',
//           icon: 'danger',
//         });
//     }
//   };

//   const signin = async () => {
//     try {
//       setIsLoading(true);

//       const response = await fetch('https://agrihub-backend-4z99.onrender.com/login', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           email: email.trim().toLowerCase(),
//           password,
//         }),
//       });

//       const data = await response.json();

//       if (!response.ok) throw new Error(data?.message || 'Login failed');

//       await storeAuthData(data);

//       showMessage({
//         message: 'Login Successful',
//         description: `Welcome, ${data.user.name}`,
//         type: 'success',
//         icon: 'success',
//       });

//       navigateToRoleDashboard(data.user.role);
//     } catch (error) {
//       console.error('❌ Login error:', error);

//       showMessage({
//         message: 'Login Error',
//         description:
//           error.message.includes('Network')
//             ? 'Please check your internet connection.'
//             : error.message,
//         type: 'danger',
//         icon: 'danger',
//         duration: 5000,
//       });

//       await AsyncStorage.multiRemove([
//         AUTH_KEYS.TOKEN,
//         AUTH_KEYS.USER_ID,
//         AUTH_KEYS.USER_DATA,
//       ]);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleLogin = async () => {
//     if (validateForm()) {
//       await signin();
//     }
//   };

//   const handleForgotPassword = () => {
//     navigation.navigate('forgot');
//   };

//   const handleSignUp = () => {
//     navigation.navigate('register');
//   };

//   const handleSocialLogin = (provider) => {
//     Alert.alert(`${provider} Login`, `${provider} authentication will be implemented`);
//   };

//   return (
//     <SafeAreaView style={styles.container}>
//       <FlashMessage position="top" />
//       <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
//       <KeyboardAvoidingView
//         behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//         style={styles.keyboardAvoidingView}
//       >
//         <ScrollView
//           style={styles.scrollView}
//           showsVerticalScrollIndicator={false}
//           contentContainerStyle={styles.scrollContent}
//           bounces={false}
//           keyboardShouldPersistTaps="handled"
//         >
//           {/* Enhanced Header Section with Original Image */}
//           <ImageBackground
//             source={require('../assets/logo.jpg')}
//             style={styles.headerBackground}
//             imageStyle={styles.backgroundImage}
//           >
//             <View style={styles.overlay} />
//             <View style={styles.brandView}>
//               <View style={styles.logoContainer}>
//                 <Icon 
//                   name="leaf"
//                   style={styles.locationIcon}
//                 />
//               </View>
//               <Text style={styles.brandTitle}>AGRIHUB</Text>
//               <Text style={styles.brandSubtitle}>Cultivate Your Digital Harvest</Text>
//             </View>
//           </ImageBackground>

//           {/* Enhanced Login Form Section */}
//           <View style={styles.formContainer}>
//             <View style={styles.welcomeSection}>
//               <Text style={styles.welcomeTitle}>Welcome Back! </Text>
//               <Text style={styles.welcomeSubtitle}>
//                 Ready to grow your agricultural journey?
//               </Text>
//             </View>

//             {/* Enhanced Email Input */}
//             <View style={styles.inputGroup}>
//               <Text style={styles.inputLabel}>Email Address</Text>
//               <View style={[
//                 styles.inputContainer,
//                 emailFocused && styles.inputContainerFocused,
//                 email && styles.inputContainerFilled,
//                 emailError && styles.inputContainerError
//               ]}>
//                 <Icon 
//                   name="mail-outline" 
//                   style={[styles.inputIcon, emailFocused && styles.inputIconFocused]} 
//                 />
//                 <TextInput
//                   style={styles.textInput}
//                   placeholder="Enter your email"
//                   placeholderTextColor="#999"
//                   value={email}
//                   onChangeText={(text) => {
//                     setEmail(text);
//                     if (emailError) setEmailError('');
//                   }}
//                   onFocus={() => setEmailFocused(true)}
//                   onBlur={() => setEmailFocused(false)}
//                   keyboardType="email-address"
//                   autoCapitalize="none"
//                   autoCorrect={false}
//                 />
//                 {email && (
//                   <TouchableOpacity onPress={() => setEmail('')} style={styles.clearButton}>
//                     <Icon name="close-circle" size={20} color="#ccc" />
//                   </TouchableOpacity>
//                 )}
//               </View>
//               {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
//             </View>

//             {/* Enhanced Password Input */}
//             <View style={styles.inputGroup}>
//               <Text style={styles.inputLabel}>Password</Text>
//               <View style={[
//                 styles.inputContainer,
//                 passwordFocused && styles.inputContainerFocused,
//                 password && styles.inputContainerFilled,
//                 passwordError && styles.inputContainerError
//               ]}>
//                 <Icon 
//                   name="lock-closed-outline" 
//                   style={[styles.inputIcon, passwordFocused && styles.inputIconFocused]} 
//                 />
//                 <TextInput
//                   style={[styles.textInput, styles.passwordInput]}
//                   placeholder="Enter your password"
//                   placeholderTextColor="#999"
//                   value={password}
//                   onChangeText={(text) => {
//                     setPassword(text);
//                     if (passwordError) setPasswordError('');
//                   }}
//                   onFocus={() => setPasswordFocused(true)}
//                   onBlur={() => setPasswordFocused(false)}
//                   secureTextEntry={!showPassword}
//                   autoCapitalize="none"
//                   autoCorrect={false}
//                 />
//                 <TouchableOpacity
//                   style={styles.eyeIcon}
//                   onPress={() => setShowPassword(!showPassword)}
//                 >
//                   <Icon
//                     name={showPassword ? "eye-outline" : "eye-off-outline"}
//                     size={20}
//                     color={passwordFocused ? "#4BA26A" : "#666"}
//                   />
//                 </TouchableOpacity>
//               </View>
//               {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
//             </View>

//             <TouchableOpacity 
//               style={styles.forgotPasswordContainer} 
//               onPress={handleForgotPassword}
//               activeOpacity={0.7}
//             >
//               <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
//             </TouchableOpacity>

//             <TouchableOpacity
//               style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
//               onPress={handleLogin}
//               disabled={isLoading}
//               activeOpacity={0.8}
//             >
//               <View style={styles.loginButtonContent}>
//                 {isLoading && (
//                   <View style={styles.loadingSpinner}>
//                     <Icon name="refresh" size={20} color="#fff" />
//                   </View>
//                 )}
//                 <Text style={styles.loginButtonText}>
//                   {isLoading ? 'Signing In...' : 'Sign In'}
//                 </Text>
//                 {!isLoading && (
//                   <Icon name="arrow-forward" size={20} color="#fff" style={styles.buttonArrow} />
//                 )}
//               </View>
//             </TouchableOpacity>

//             {/* Enhanced Divider */}
//             <View style={styles.dividerContainer}>
//               <View style={styles.dividerLine} />
//               <View style={styles.dividerTextContainer}>
//                 <Text style={styles.dividerText}>or continue with</Text>
//               </View>
//               <View style={styles.dividerLine} />
//             </View>

//             {/* Enhanced Social Buttons */}
//             <View style={styles.socialButtonsContainer}>
//               <TouchableOpacity 
//                 style={styles.socialButton}
//                 onPress={() => handleSocialLogin('Google')}
//                 activeOpacity={0.7}
//               >
//                 <Icon name="logo-google" size={22} color="#DB4437" />
//                 <Text style={styles.socialButtonText}>Google</Text>
//               </TouchableOpacity>
              
//               <TouchableOpacity 
//                 style={styles.socialButton}
//                 onPress={() => handleSocialLogin('Apple')}
//                 activeOpacity={0.7}
//               >
//                 <Icon name="logo-apple" size={22} color="#000" />
//                 <Text style={styles.socialButtonText}>Apple</Text>
//               </TouchableOpacity>
//             </View>

//             {/* Enhanced Sign Up Link */}
//             <View style={styles.signUpContainer}>
//               <Text style={styles.signUpText}>New to AgriHub? </Text>
//               <TouchableOpacity onPress={handleSignUp} activeOpacity={0.7}>
//                 <Text style={styles.signUpLink}>Create Account</Text>
//               </TouchableOpacity>
//             </View>

//             {/* App Version */}
//             <Text style={styles.versionText}>Version 1.0.0</Text>
//           </View>
//         </ScrollView>
//       </KeyboardAvoidingView>
//     </SafeAreaView>
//   );
// };

// export default Login;

// const { width, height } = Dimensions.get('window');

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#ffffff',
//   },
//   keyboardAvoidingView: {
//     flex: 1,
//   },
//   scrollView: {
//     flex: 1,
//   },
//   scrollContent: {
//     flexGrow: 1,
//   },
//   headerBackground: {
//     height: height / 2.3,
//     justifyContent: 'center',
//     alignItems: 'center',
//     position: 'relative',
//   },
//   backgroundImage: {
//     opacity: 0.9,
//   },
//   overlay: {
//     ...StyleSheet.absoluteFillObject,
//     backgroundColor: 'rgba(0, 0, 0, 0.75)',
//   },
//   brandView: {
//     justifyContent: 'center',
//     alignItems: 'center',
//     zIndex: 1,
//     paddingHorizontal: 20,
//   },
//   logoContainer: {
//     position: 'relative',
//     marginBottom: 20,
//   },
//   locationIcon: {
//     color: '#ffffff',
//     fontSize: 75,
//     textShadowColor: 'rgba(0, 0, 0, 0.4)',
//     textShadowOffset: { width: 2, height: 2 },
//     textShadowRadius: 6,
//   },
//   logoBadge: {
//     position: 'absolute',
//     top: -8,
//     right: -8,
//     backgroundColor: '#FF5722',
//     borderRadius: 12,
//     width: 24,
//     height: 24,
//     justifyContent: 'center',
//     alignItems: 'center',
//     borderWidth: 2,
//     borderColor: '#fff',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.3,
//     shadowRadius: 4,
//     elevation: 4,
//   },
//   brandTitle: {
//     fontSize: 38,
//     fontWeight: '800',
//     color: '#ffffff',
//     textAlign: 'center',
//     letterSpacing: 3,
//     textShadowColor: 'rgba(0, 0, 0, 0.4)',
//     textShadowOffset: { width: 2, height: 2 },
//     textShadowRadius: 6,
//     marginBottom: 8,
//   },
//   brandSubtitle: {
//     fontSize: 17,
//     color: '#ffffff',
//     textAlign: 'center',
//     opacity: 0.95,
//     fontWeight: '400',
//     letterSpacing: 1,
//     textShadowColor: 'rgba(0, 0, 0, 0.4)',
//     textShadowOffset: { width: 1, height: 1 },
//     textShadowRadius: 4,
//   },
//   decorativeElements: {
//     flexDirection: 'row',
//     marginTop: 20,
//   },
//   decorativeDot: {
//     width: 8,
//     height: 8,
//     borderRadius: 4,
//     backgroundColor: '#fff',
//     marginHorizontal: 4,
//     opacity: 0.9,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.3,
//     shadowRadius: 2,
//     elevation: 2,
//   },
//   decorativeDotDelay: {
//     opacity: 0.7,
//   },
//   decorativeDotDelay2: {
//     opacity: 0.5,
//   },
//   formContainer: {
//     flex: 1,
//     paddingHorizontal: 28,
//     paddingVertical: 36,
//     backgroundColor: '#ffffff',
//     borderTopLeftRadius: 40,
//     borderTopRightRadius: 40,
//     marginTop: -28,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: -3 },
//     shadowOpacity: 0.1,
//     shadowRadius: 12,
//     elevation: 12,
//   },
//   welcomeSection: {
//     marginBottom: 32,
//     alignItems: 'center',
//   },
//   welcomeTitle: {
//     fontSize: 29,
//     fontWeight: '500',
//     color: '#1A1A1A',
//     marginBottom: 10,
//     textAlign: 'center',
//   },
//   welcomeSubtitle: {
//     fontSize: 16,
//     color: '#666',
//     textAlign: 'center',
//     lineHeight: 24,
//     paddingHorizontal: 15,
//     fontWeight: '400',
//   },
//   inputGroup: {
//     marginBottom: 22,
//   },
//   inputLabel: {
//     fontSize: 15,
//     fontWeight: '600',
//     color: '#333',
//     marginBottom: 10,
//     marginLeft: 6,
//   },
//   inputContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#f8f9fa',
//     borderRadius: 16,
//     paddingHorizontal: 18,
//     borderWidth: 2,
//     borderColor: '#e9ecef',
//     minHeight: 58,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.04,
//     shadowRadius: 3,
//     elevation: 2,
//   },
//   inputContainerFocused: {
//     borderColor: '#4BA26A',
//     backgroundColor: '#f8fff8',
//     shadowOpacity: 0.08,
//     shadowRadius: 6,
//     elevation: 4,
//   },
//   inputContainerFilled: {
//     backgroundColor: '#f0f8f0',
//     borderColor: '#d4edda',
//   },
//   inputContainerError: {
//     borderColor: '#dc3545',
//     backgroundColor: '#fff5f5',
//   },
//   inputIcon: {
//     fontSize: 22,
//     color: '#666',
//     marginRight: 14,
//   },
//   inputIconFocused: {
//     color: '#4BA26A',
//   },
//   textInput: {
//     flex: 1,
//     paddingVertical: 16,
//     fontSize: 16,
//     color: '#333',
//     fontWeight: '400',
//   },
//   passwordInput: {
//     paddingRight: 50,
//   },
//   clearButton: {
//     padding: 6,
//     marginLeft: 4,
//   },
//   eyeIcon: {
//     padding: 10,
//     marginLeft: 4,
//   },
//   errorText: {
//     color: '#dc3545',
//     fontSize: 12,
//     marginTop: 6,
//     marginLeft: 6,
//     fontWeight: '500',
//   },
//   forgotPasswordContainer: {
//     alignSelf: 'flex-end',
//     marginBottom: 28,
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingVertical: 6,
//     paddingHorizontal: 4,
//   },
//   forgotPasswordText: {
//     color: '#4BA26A',
//     fontSize: 15,
//     fontWeight: '600',
//     marginRight: 6,
//   },
//   forgotArrow: {
//     marginTop: 1,
//   },
//   loginButton: {
//     borderRadius: 18,
//     marginBottom: 26,
//     backgroundColor: '#4BA26A',
//     shadowColor: '#4BA26A',
//     shadowOffset: { width: 0, height: 6 },
//     shadowOpacity: 0.35,
//     shadowRadius: 10,
//     elevation: 8,
//     overflow: 'hidden',
//   },
//   loginButtonDisabled: {
//     backgroundColor: '#ccc',
//     shadowOpacity: 0,
//     elevation: 0,
//   },
//   loginButtonContent: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingVertical: 18,
//     minHeight: 58,
//   },
//   loadingSpinner: {
//     marginRight: 12,
//   },
//   loginButtonText: {
//     color: '#ffffff',
//     fontSize: 17,
//     fontWeight: '700',
//     letterSpacing: 0.8,
//   },
//   buttonArrow: {
//     marginLeft: 10,
//   },
//   dividerContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginVertical: 26,
//   },
//   dividerLine: {
//     flex: 1,
//     height: 1,
//     backgroundColor: '#e0e0e0',
//   },
//   dividerTextContainer: {
//     backgroundColor: '#fff',
//     paddingHorizontal: 18,
//   },
//   dividerText: {
//     color: '#666',
//     fontSize: 14,
//     fontWeight: '500',
//   },
//   socialButtonsContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: 32,
//     gap: 14,
//   },
//   socialButton: {
//     flex: 1,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: '#ffffff',
//     paddingVertical: 16,
//     borderRadius: 16,
//     borderWidth: 2,
//     borderColor: '#f0f0f0',
//     minHeight: 54,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 3 },
//     shadowOpacity: 0.06,
//     shadowRadius: 6,
//     elevation: 3,
//   },
//   socialButtonText: {
//     marginLeft: 12,
//     fontSize: 15,
//     fontWeight: '600',
//     color: '#333',
//   },
//   signUpContainer: {
//     flexDirection: 'row',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginBottom: 20,
//     paddingVertical: 4,
//   },
//   signUpText: {
//     color: '#666',
//     fontSize: 15,
//     fontWeight: '400',
//   },
//   signUpLink: {
//     color: '#4BA26A',
//     fontSize: 15,
//     fontWeight: '700',
//   },
//   versionText: {
//     textAlign: 'center',
//     color: '#999',
//     fontSize: 12,
//     fontWeight: '400',
//     opacity: 0.7,
//     marginTop: 8,
//   },
// });
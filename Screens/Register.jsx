import React, { useState } from "react";
import {
  Text,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  KeyboardAvoidingView,
  StyleSheet,
  Platform,
} from "react-native";
import StandardTextInput from "../Components/StandardTextInput";
import Button from "../Components/Button";
import Dropdown from "../Components/Dropdown";
import { showMessage } from "react-native-flash-message";
import { useTheme } from "../contexts/ThemeContext";
import { useLanguage } from "../contexts/LanguageContext";
import { useAuth } from "../contexts/AuthContext";

const FONTS = {
  regular: "Poppins_400Regular",
  semiBold: "Poppins_600SemiBold",
  bold: "Poppins_700Bold",
};

const ROLES = [
  { label: "Farmer", value: "farmer" },
  { label: "Buyer", value: "buyer" },
  { label: "Plant Pathologist", value: "plant pathologist" },
];

export default function Register({ navigation }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { register, loading } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Full name is required";
    else if (formData.name.trim().length < 2) newErrors.name = "Name must be at least 2 characters";

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!emailRegex.test(formData.email.trim())) newErrors.email = "Enter a valid email address";

    if (!formData.password.trim()) newErrors.password = "Password is required";
    else if (formData.password.length < 6) newErrors.password = "Password must be at least 6 characters";
    else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password))
      newErrors.password = "Password must contain uppercase, lowercase, and number";

    if (!formData.role) newErrors.role = "Please select a role";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = () => {
    if (!validateForm()) {
      showMessage({
        message: "Validation Error",
        description: "Please fix the errors below",
        type: "warning",
        icon: "warning",
      });
      return;
    }
    register(formData, () => navigation.navigate("login"));
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.container, { backgroundColor: isDark ? "#121212" : "#ffffff" }]}>          
          <View style={styles.imageContainer}>
            <Image source={require("../assets/logo.png")} style={styles.image} />
            <Text style={[styles.title, { color: isDark ? "#ffffff" : "#1a1a1a" }]}>Create Account</Text>
            <Text style={[styles.subtitle, { color: isDark ? "#999" : "#b0abab" }]}>Join AgriHub to get started</Text>
          </View>

          <View style={styles.formContainer}>
            <StandardTextInput
              label="Full Name"
              icon2="account-circle"
              value={formData.name}
              onChangeText={(value) => updateFormData('name', value)}
              error={errors.name}
              placeholder="Enter your full name"
              autoCapitalize="words"
            />
            <StandardTextInput
              label="Email Address"
              icon2="email"
              value={formData.email}
              onChangeText={(value) => updateFormData('email', value)}
              error={errors.email}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <StandardTextInput
              label="Password"
              icon2="lock"
              secureTextEntry={!showPassword}
              value={formData.password}
              onChangeText={(value) => updateFormData('password', value)}
              error={errors.password}
              icon1={showPassword ? "eye-outline" : "eye-off-outline"}
              onPress={togglePasswordVisibility}
              placeholder="Create a strong password"
              autoCapitalize="none"
            />
            <Text style={[styles.roleLabel, { color: isDark ? "#ccc" : "#333" }]}>Select Your Role</Text>
            <Dropdown
              options={ROLES.map(role => role.value)}
              selectedOption={formData.role}
              onSelect={(value) => updateFormData('role', value)}
              placeholder="Choose your role"
              error={errors.role}
            />
            {errors.role && <Text style={styles.errorText}>{errors.role}</Text>}
          </View>

          <View style={styles.buttonContainer}>
            <Button
              title={loading ? "Creating Account..." : "Create Account"}
              onPress={handleRegister}
              loading={loading}
              disabled={loading}
            />
          </View>

          <View style={styles.loginContainer}>
            <Text style={[styles.loginText, { color: isDark ? "#ccc" : "#000" }]}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate("login")}>                
              <Text style={styles.loginLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 25,
    paddingVertical: 20,
  },
  imageContainer: {
    marginBottom: 30,
    alignItems: 'center',
  },
  image: {
    height: 200,
    width: 200,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "600",
    textAlign: "center",
    fontFamily: FONTS.semiBold,
    marginBottom: 8,
  },
  subtitle: {
    textAlign: "center",
    fontFamily: FONTS.regular,
    fontSize: 16,
  },
  formContainer: {
    marginBottom: 30,
  },
  roleLabel: {
    fontSize: 15,
    padding: 10,
    fontFamily: FONTS.regular,
    marginTop: 10,
  },
  errorText: {
    color: "#e74c3c",
    fontSize: 13,
    paddingLeft: 10,
    paddingTop: 5,
    fontFamily: FONTS.regular,
  },
  buttonContainer: {
    paddingVertical: 10,
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    paddingVertical: 20,
  },
  loginText: {
    fontFamily: FONTS.regular,
    fontSize: 15,
  },
  loginLink: {
    color: "#4ba26a",
    fontWeight: "bold",
    fontFamily: FONTS.semiBold,
    fontSize: 15,
  },
});
import React, { useState } from "react"; 
import {
  Text,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  KeyboardAvoidingView,
  StyleSheet,
} from "react-native";
import StandardTextInput from "../Components/StandardTextInput";
import Button from "../Components/Button";
import { showMessage } from "react-native-flash-message";
import Dropdown from "../Components/Dropdown";
import { useTheme } from "../contexts/ThemeContext";
import { useLanguage } from '../contexts/LanguageContext';

 
const registerUser = async (name, email, password, role) => {
  
  const response = await fetch("https://agrihub-backend-4z99.onrender.com/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password, role }),
  });

  const data = await response.json();




  if (!response.ok) {
    const message = data?.message || data?.error || "Registration failed. Please try again.";
    throw new Error(message);
  }

  return data;
};

const FONTS = {
regular: "Poppins_400Regular",
semiBold: "Poppins_600SemiBold",
bold: "Poppins_700Bold",
};
export default function Register({ navigation }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { language, t } = useLanguage();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const roles = ["farmer", "buyer", "plant pathologist"];

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleValidation = () => {
    let valid = true;

    if (!name.trim()) {
      showMessage({
        message: "Name Required",
        description: "Please enter your full name.",
        type: "warning",
        icon: "warning",
      });
      valid = false;
    }

    if (!email.trim()) {
      setEmailError("Email is required");
      valid = false;
    } else if (!isValidEmail(email)) {
      setEmailError("Invalid email format");
      valid = false;
    } else {
      setEmailError("");
    }

    if (!password.trim()) {
      setPasswordError("Password is required");
      valid = false;
    } else if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      valid = false;
    } else {
      setPasswordError("");
    }

    if (!role) {
      showMessage({
        message: "Role Required",
        description: "Please select a role (farmer, buyer, or plant pathologist).",
        type: "warning",
        icon: "warning",
      });
      valid = false;
    }

    return valid;
  };

  const handleRegister = async () => {
    if (!handleValidation()) return;

    try {
      setLoading(true);
      await registerUser(name, email, password, role);
      showMessage({ message: "Registration Successful", type: "success", icon: "success" });
      navigation.navigate("login");
    } catch (error) {
      showMessage({
        message: "Registration Error",
        description: error.message || "Something went wrong",
        type: "danger",
        icon: "danger",
        duration: 5000,
      });
    } finally {
      setLoading(false);
      setName("");
      setEmail("");
      setPassword("");
      setRole("");
    }
  };

  return (
    <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View
          style={[
            styles.container,
            { backgroundColor: isDark ? "#121212" : "#ffffff" },
          ]}
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.imageContainer}>
              <Image
                source={require("../assets/logo.png")}
                style={styles.image}
              />
              <Text style={[styles.title, { color: isDark ? "#ffffff" : "#1a1a1a" }]}>
                Sign Up
              </Text>
              <Text style={{ color: isDark ? "#999" : "#b0abab", textAlign: "center", fontFamily: FONTS.regular, }}>
                Create an account to continue
              </Text>
            </View>

            <StandardTextInput
              label="Full Name"
              icon2="account-circle"
              value={name}
              onChangeText={setName}
            />

            <StandardTextInput
              label="Email"
              icon2="email"
              value={email}
              onChangeText={setEmail}
              error={emailError}
            />
            {emailError ? <Text style={styles.error}>{emailError}</Text> : null}

            <StandardTextInput
              label="Password"
              icon2="lock"
              secureTextEntry={!showPassword}
              onChangeText={setPassword}
              error={passwordError}
              icon1={showPassword ? "eye-outline" : "eye-off-outline"}
              onPress={togglePasswordVisibility}
            />
            {passwordError ? <Text style={styles.error}>{passwordError}</Text> : null}

            <Text
              style={{
                fontSize: 15,
                padding: 10,
                color: isDark ? "#ccc" : "#333",
                 fontFamily: FONTS.regular, 
              }}
            >
              Select Role
            </Text>
            <Dropdown
              options={roles}
              selectedOption={role}
              onSelect={setRole}
              placeholder="Select your role"
            />
          </ScrollView>

          <TouchableOpacity style={{ paddingVertical: 10 }}>
            <Button title="Sign Up" onPress={handleRegister} loading={loading} />
          </TouchableOpacity>

          <View style={styles.loginContainer}>
            <Text style={{ color: isDark ? "#ccc" : "#000", fontFamily: FONTS.regular,  }}>
              Already have an account?{" "}
            </Text>
            <TouchableOpacity onPress={() => {
              navigation.navigate("login");
              }}>
              <Text style={{ color: "#4ba26a", fontWeight: "bold" }}>Login</Text>
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
    marginBottom: 20,
  },
  image: {
    height: 280,
    width: 250,
    alignSelf: "center",
  },
  title: {
    fontSize: 35,
    fontWeight: "600",
    textAlign: "center",
    fontFamily: FONTS.semiBold, 
  },
  error: {
    color: "red",
    fontSize: 13,
    paddingLeft: 5,
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    paddingBottom: 10,
  },
});

import React, { useState } from "react";
import {
  Text,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  KeyboardAvoidingView,
} from "react-native";
import StandardTextInput from "../Components/StandardTextInput";
import Button from "../Components/Button";
import { showMessage } from "react-native-flash-message";
import Dropdown from "../Components/Dropdown";

// 🔁 Registration API function
const registerUser = async (name, email, password, role) => {
  const response = await fetch("https://agrihub-backend-4z99.onrender.com/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password, role }),
  });

  const data = await response.json();
  // console.log("✅ Registration Response:", data);

  if (!response.ok) {
    const message = data?.message || data?.error || "Registration failed. Please try again.";
    throw new Error(message);
  }

  return data;
};

export default function Register({ navigation }) {
  const [name, setName] = useState("");         // ✅ name (was username)
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");         // ✅ renamed from userType
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const roles = ["farmer", "buyer", "plant pathologist"];

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleValidation = () => {
    let valid = true;

    if (!name.trim()) {
      showMessage({
        message: "Name Required",
        description: "Please enter your full name.",
        type: "warning",
        icon: "warning",
        position: "top",
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
        position: "top",
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

      showMessage({
        message: "Registration Successful",
        type: "success",
        icon: "success",
      });

      navigation.navigate("login");
    } catch (error) {
      console.error("❌ Registration error:", error);
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
        <View style={{ flex: 1, backgroundColor: "white", paddingHorizontal: 25, paddingVertical: 20 }}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={{ marginBottom: 20 }}>
              <Image
                source={require("../assets/register.png")}
                style={{ height: 280, width: 300, alignSelf: "center" }}
              />
              <Text style={{ fontSize: 35, fontWeight: "bold", textAlign: "center" }}>
                Sign Up
              </Text>
              <Text style={{ color: "#b0abab", textAlign: "center" }}>
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
            {emailError ? <Text style={{ color: "red" }}>{emailError}</Text> : null}

            <StandardTextInput
              label="Password"
              icon2="lock"
              secureTextEntry={!showPassword}
              onChangeText={setPassword}
              error={passwordError}
              icon1={showPassword ? "eye-outline" : "eye-off-outline"}
              onPress={togglePasswordVisibility}
            />
            {passwordError ? <Text style={{ color: "red" }}>{passwordError}</Text> : null}

            <Text style={{ fontSize: 15, padding: 10 }}>Select Role</Text>
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

          <View style={{ flexDirection: "row", justifyContent: "center", paddingBottom: 9 }}>
            <Text>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate("login")}>
              <Text style={{ color: "#4ba26a", fontWeight: "bold" }}>Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

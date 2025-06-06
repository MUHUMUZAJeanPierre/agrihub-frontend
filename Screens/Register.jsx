import React, {  useState } from "react";
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

export default function Register({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [userType, setUserType] = useState("");
  const [loading, setLoading] = useState(false);
  const useTypes = ["farmer", "buyer", "plant pathologist"];


  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleValidation = () => {
    let valid = true;
    if (email.trim() === "") {
      setEmailError("Email is required");
      valid = false;
    } else if (!isValidEmail(email)) {
      setEmailError("Your email is not valid");
      valid = false;
      showMessage({
        message: "Invalid Email",
        description: "Please enter a valid email address.",
        type: "warning",
        icon: "warning",
        position: "top",
      });
    } else {
      setEmailError("");
    }
    if (password.trim() === "") {
      setPasswordError("Password is required");
      valid = false;
    } else {
      setPasswordError("");
    }
    return valid;
  };

  const handleRegister = async () => {
    if (handleValidation()) {
      try {
        setLoading(true);
        await Regist(email, password, username, userType);
        navigation.navigate("login");
      } catch (error) {
        showMessage({
          message: `${error}`,
          hideStatusBar: true,
          type: "danger",
          icon: "danger",
          duration: 6000,
        });
      } finally {
        setLoading(false);
        setEmail("");
        setPassword("");
        setUsername("");
        setUserType("");
      }
    }
  };

  return (
    <KeyboardAvoidingView behavior="padding" >
    {/* style={{ flex: 1 }} */}
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View
          style={{
            flex: 1,
            backgroundColor: "white",
            paddingHorizontal: 25,
            paddingVertical: 20, // Adjust as needed
          }}
        >
          <ScrollView>
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
              label={"Full Names"}
              icon2={"account-circle"}
              value={username}
              onChangeText={setUsername}
            />
            <StandardTextInput
              label={"Email"}
              icon2={"email"}
              value={email}
              onChangeText={setEmail}
              error={emailError}
            />
            {emailError ? <Text style={{ color: "red" }}>{emailError}</Text> : null}
            <StandardTextInput
              label={"Password"}
              icon2={"lock"}
              secureTextEntry={!showPassword}
              onChangeText={setPassword}
              error={passwordError}
              icon1={showPassword ? "eye-outline" : "eye-off-outline"}
              onPress={togglePasswordVisibility}
            />
            {passwordError ? (
              <Text style={{ color: "red" }}>{passwordError}</Text>
            ) : null}
            <Text style={{ fontSize: 15, padding: 10 }}>UserType</Text>
            <Dropdown
              options={useTypes}
              selectedOption={userType}
              onSelect={(option) => setUserType(option)}
            />
          </ScrollView>

          <TouchableOpacity style={{ paddingVertical: 10 }}>
            <Button
              title={"Sign Up"}
              style={{ fontSize: 30 }}
              onPress={handleRegister}
              loading={loading}
            />
          </TouchableOpacity>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              paddingBottom: 9,
            }}
          >
            <Text>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate("login")}>
              <Text style={{ color: "#4ba26a", fontWeight: "bold" }}>
                Login
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}


import React from "react";
import { StyleSheet, View } from "react-native";
import { TextInput } from "react-native-paper";

export default function UploadTextInput({ 
  label,
  value, 
  onChangeText,
  secureTextEntry,
  error,
  keyboardType,
  placeholder
}) {
  return (
    <View>
      <TextInput 
        label={label} 
        value={value} 
        placeholder={placeholder}
        placeholderTextColor="darkgrey"
        onChangeText={onChangeText} 
        secureTextEntry={secureTextEntry} 
        error={error} 
        keyboardType={keyboardType}
        style={[styles.textInput, { backgroundColor: "white" }]} 
        textColor="black"
        underlineColor='transparent'
        theme={{
          colors: { primary: "rgba(000,000,000,0.2)" }, 
          roundness: 10
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  textInput: { 
    height: 50,
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    marginTop: 10,
    marginBottom: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#A9A9A9",
  },
});
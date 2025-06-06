import React, { useContext } from "react";
import { StyleSheet, View } from "react-native";
import { TextInput } from "react-native-paper";
import { Context } from "../Context/context";

export default function SearchTextInput({
  value,
  onChangeText,
  secureTextEntry,
  error,
  keyboardType,
  onPress,
}) {
  const { darkmode } = useContext(Context);
  return (
    <View>
      <TextInput
        placeholder="Search in here"
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        placeholderTextColor={darkmode ? "grey" : "darkgrey"}
        error={error}
        keyboardType={keyboardType}
        style={[
          styles.textInput,
          { backgroundColor: darkmode ? "#242526" : "white" },
        ]}
        underlineColor="white"
        textColor={darkmode ? "white" : "black"}
        theme={{ colors: { primary: "#C4c0c0" }, roundness: 10 }}
        right={
          <TextInput.Icon
            size={40}
            icon="magnify"
            color="#d9d9d9"
            onPress={onPress}
          ></TextInput.Icon>
        }
      />
    </View>
  );
}
const styles = StyleSheet.create({
  textInput: {
    height: 50,
    width: "100%",
    fontSize: 15,
    borderRadius: 8,
    elevation: 0.5,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.1,
  },
});

import React from "react";
import { StyleSheet, View, } from "react-native";
import { TextInput } from "react-native-paper";

export default function StandardTextInput ({ label,value, onChangeText,icon1,icon2,secureTextEntry,error,keyboardType,onPress,}){
  return (
    <View>
    <TextInput 
    label={label} 
    value={value} 
    mode="flat"
    onChangeText={onChangeText} 
    secureTextEntry={secureTextEntry} 
    error={error} 
    keyboardType={keyboardType}
    style={styles.textInput} 
    underlineColor='white' 
    textColor='black'
    theme={{colors:{primary:"#C4c0c0"}}}
    right={<TextInput.Icon size={19} icon={icon1} color="#333333" onPress={onPress}></TextInput.Icon>}
    left={<TextInput.Icon size={19} icon={icon2} color={error&&error?"#bc3433":"#333333"} onPress={onPress}></TextInput.Icon>}
    />
    </View>
  );
};
const styles = StyleSheet.create({
  textInput: { 
   height: 50,
   fontSize:15,
   backgroundColor:"white",
   marginTop:5,
   borderBottomWidth: 1,
  borderColor: "#C4c0c0",
  },
});


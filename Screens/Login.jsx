import { Image, StyleSheet, Text, TouchableOpacity, View,KeyboardAvoidingView } from 'react-native';
import React, {  useState } from 'react';
import StandardTextInput from '../Components/StandardTextInput';
import Button from '../Components/Button';
import FlashMessage, { showMessage } from "react-native-flash-message";
export default function Login({ navigation }) {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [emailError, setEmailError] = useState('')
    const [passwordError, setPasswordError] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const[loaded,setloaded] = useState (false)

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const validateForm = () => {
        let valid = true

       
        if (email.trim() == '') {
            setEmailError('Email is required')
            valid = false
        } else if (!isValidEmail(email)) {
            setEmailError('Invalid email format')
            valid = false
        } else {
            setEmailError('')
        }
        
        if (password.trim() == '') {
            setPasswordError('Password is required')
            valid = false
        } else {
            setPasswordError('')
        }

        return valid
    }

    const handleSubmit = async () => {
        
        if (validateForm()) {

        signin(email, password)
           setloaded(true) 
      if(error.length!=0) {
        setloaded(false)
        showMessage({
          message: `${error}`,
          hideStatusBar: true,
          type: "danger",
          icon: "danger",
          duration: 6000,
        });
    }

        }
    }

    const isValidEmail = (email) => {
        

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return emailRegex.test(email)
    }


    return (
        <View style={{height:"100%"}}>
            <FlashMessage position="top"/>
        <View style={styles.container}>
            <KeyboardAvoidingView>
            
            <Image style={{ width: '95%', height: 280 }} source={require('../assets/logo.jpg')} />
            <Text style={{ fontSize: 30, fontFamily: 'Poppins_600SemiBold', textAlign: "center"  }}>Log In</Text>

            <Text style={{ color: '#B0ABAB', textAlign: 'center' }}>Please Sign in to continue</Text>

            <View style={{ paddingVertical: 25 }}>
                <StandardTextInput label={"Email"} icon2={"email"} onChangeText={setEmail} value={email} error={emailError}/>
                {emailError ? (
                <Text
                  style={{
                    color: "red",
                    paddingVertical: 4,
                    height: 30,
                    fontSize: 12,
                  }}
                >
                  {emailError}
                </Text>
              ) : null}
                <StandardTextInput label={"Password"} icon2={"lock"} icon1={showPassword ?"eye-off-outline" :"eye-outline"} onChangeText={(e)=>setPassword(e)} value={password} error={passwordError} onPress={togglePasswordVisibility} secureTextEntry={!showPassword}/>
                {passwordError ? (
                <Text
                  style={{
                    color: "red",
                    paddingVertical: 2,
                    height: 30,
                    fontSize: 12,
                  }}
                >
                  {passwordError}
                </Text>
              ) : null}
                <Text onPress={()=>navigation.navigate('forgot')} style={{ fontSize: 16, fontFamily: 'Poppins_600SemiBold', color: '#4BA26A', left: 195, marginTop: 15 }}>Forgot password</Text>
            </View>
            <TouchableOpacity  onPress={()=>navigation.navigate('farmer')}>
                <Button title={"Sign In"} onPress={()=>navigation.navigate('farmer')}   loading={loaded}/>
            </TouchableOpacity>
            <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', paddingVertical: 15 }}>
                <Text style={{ textAlign: 'center' }}>Don't have an Account?</Text>
                <TouchableOpacity onPress={()=>navigation.navigate('Register')}>
                    <Text style={{ color: '#4BA26A', fontFamily: 'Poppins_600SemiBold', marginLeft: 2 }}>Sign up</Text></TouchableOpacity>
            </View>
            </KeyboardAvoidingView>
        </View>
        </View>
    );
}
const styles = StyleSheet.create({
    container: {
        backgroundColor: '#ffffff',
        paddingVertical: 30,
        paddingHorizontal: 30,
        height:"100%"
    },
});
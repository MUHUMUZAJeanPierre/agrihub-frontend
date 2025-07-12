import { PermissionsAndroid } from "react-native";

export const confirmLocationPermission = async ()=>{
    try {
        const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCEPT_FINE_LOCATION,
        );
        if(granted === PermissionsAndroid.RESULTS.GRANTED){
            console.log('you can use the location');
        }else{
            throw new error('Location Permission Denied');
        }
    } catch (error) {
        console.warm(error);
    }
}
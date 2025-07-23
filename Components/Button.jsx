import { Text, TouchableOpacity, View,ActivityIndicator } from 'react-native';

const FONTS = {
regular: "Poppins_400Regular",
semiBold: "Poppins_600SemiBold",
bold: "Poppins_700Bold",
};
export default function Button({title,onPress,loading}) {
  return (
    <View>
      <TouchableOpacity style={{backgroundColor:"#4ba26a",borderRadius:7}} onPress={onPress}>
        { loading?(
          <ActivityIndicator size='large' color="white" style={{paddingTop:10}} />
        ):(
        <Text style={{textAlign:"center",paddingVertical:13, fontWeight:"600",color:"white", fontFamily: FONTS.semiBold, }}>{title}</Text>
        )}
        </TouchableOpacity>
    </View>
  );
}


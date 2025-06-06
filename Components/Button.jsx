import { Text, TouchableOpacity, View,ActivityIndicator } from 'react-native';

export default function Button({title,onPress,loading}) {
  return (
    <View>
      <TouchableOpacity style={{backgroundColor:"#4ba26a",borderRadius:7}} onPress={onPress}>
        { loading?(
          <ActivityIndicator size='large' color="white" style={{paddingTop:10}} />
        ):(
        <Text style={{textAlign:"center",paddingVertical:13, fontWeight:"bold",color:"white"}}>{title}</Text>
        )}
        </TouchableOpacity>
    </View>
  );
}


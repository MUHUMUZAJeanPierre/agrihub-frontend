import { ImageBackground, View } from "react-native";

export default function CropCategory({ image }) {
  return (
    <View
      style={{
        borderWidth: 2,
        borderColor: "#4ba26a",
        marginRight: 15,
        borderRadius: 15,
        width: 68,
        height: 60,
      }}
    >
      <ImageBackground
        source={{ uri: image }}
        style={{
          width: "100%",
          height: "100%",
          overflow: "hidden",
          borderRadius: 13,
        }}
      ></ImageBackground>
    </View>
  );
}

import React from "react";
import AppIntroSlider from "react-native-app-intro-slider";
import { Image, View, Text, TouchableOpacity } from "react-native";
import Button from "./Button";

function Onboard({ navigation }) {
  const onboardingSlides = [
    {
      key: 0,
      title: "Grow Smarter, Together",
      subtitle: "Smart Field Observation",
      text: "AgriHub connects farmers with markets, agronomists, and saving groups, all in one app built for Rwandan agriculture.",
      image: require("../assets/boardone.png"),
      color: "#4ba26a",


    },
    {
      key: 1,
      title: "Empowering Farmers with Digital Tools",
      subtitle: "Real-time Plant Health",
      text: "From real-time farming advice to direct selling and group savings, AgriHub gives you control over your harvest and income.",
      image: require("../assets/boardtwo.png"),
      color: "#5cb85c",
    },
    {
      key: 2,
      title: "Your Farm. Your Market. Your Voice",
      subtitle: "AI-Powered Farming",
      text: "AgriHub helps you sell directly, make smarter decisions, and save with your community  in Kinyarwanda or English.",
      image: require("../assets/boardthree.png"),
      color: "#6cc16c",
    },
  ];

  return (
    <View
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: "white",
        paddingTop: 40,
      }}
    >
      <View style={{ display: "flex", width: "100%" }}>
        <TouchableOpacity
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "flex-end",
            paddingHorizontal: 40,
          }}
          onPress={() => navigation.navigate("login")}
        >
          <Text
            style={{
              fontFamily: "Poppins_400Regular",
              display: "flex",
              flexDirection: "row",
              justifyContent: "flex-end",
            }}
          >
            Skip
          </Text>
        </TouchableOpacity>
      </View>
      <View
        style={{
          width: "100%",
          height: "80%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <AppIntroSlider
          data={onboardingSlides}
          renderItem={({ item, index }) => {
            return (
              <View
                key={index}
                style={{
                  paddingHorizontal: 60,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <View
                  style={{ width: "100%", height: "50%", paddingVertical: 2 }}
                >
                  <Image
                    source={item.image}
                    style={{
                      resizeMode: "contain",
                      width: "100%",
                      height: "100%",
                      alignSelf: "center",
                    }}
                  />
                </View>
                <Text
                  style={{
                    fontFamily: "Poppins_600SemiBold",
                    fontSize: 19,
                    paddingVertical: 20,
                    paddingHorizontal: 28,
                    textAlign: "center",
                  }}
                >
                  {item.title}
                </Text>
                <Text
                  style={{
                    fontFamily: "Poppins_400Regular",
                    fontSize: 13,
                    paddingBottom: 60,
                    color: "#A1A1A1",
                  }}
                >
                  {item.text}
                </Text>
              </View>
            );
          }}
          activeDotStyle={{ width: 35, height: 7, backgroundColor: "#4ba26a" }}
          dotStyle={{ width: 35, height: 7, backgroundColor: "#F3F3F3" }}
          dotClickEnabled={true}
          showNextButton={false}
        />
      </View>

      <View
        style={{
          width: "100%",
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          gap: 10,
          paddingHorizontal: 40,
          paddingTop: 15,
        }}
      >
        <TouchableOpacity
          style={{ backgroundColor: "#F3F3F3", borderRadius: 7, width: "47%" }}
        >
          <Text
            style={{
              textAlign: "center",
              paddingVertical: 13,
              fontWeight: "bold",
              color: "#A1A1A1",
            }}
          >
            Back
          </Text>
        </TouchableOpacity>

        <View style={{ width: "47%" }}>
          <Button title="Next" />
        </View>
      </View>
    </View>
  );
}

export default Onboard;

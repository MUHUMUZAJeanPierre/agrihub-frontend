import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import {
  SafeAreaView,
  Image,
  StyleSheet,
  FlatList,
  View,
  Text,
  StatusBar,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { useTheme } from "../contexts/ThemeContext";

const { width, height } = Dimensions.get("window");

const COLORS = {
  primary: "#4ba26a",
  secondary: "#2d5a3d",
  white: "#fff",
  lightGray: "#F8F9FA",
  gray: "#A1A1A1",
  darkGray: "#6C757D",
  accent: "#E8F5E8",
  gradientStart: "#f8fffe",
  gradientEnd: "#e8f5f0",
};

const FONTS = {
  regular: "Poppins_400Regular",
  semiBold: "Poppins_600SemiBold",
  bold: "Poppins_700Bold",
};

const onboardingSlides = [
  {
    key: 0,
    title: "On-demand delivery",
    subtitle: "Smart Field Observation",
    text: "We turn your retail pickup orders into same day delivery with three simple steps.",
    image: require("../assets/1.png"),
    color: "#4ba26a",
    backgroundColor: "#fff",
  },
  {
    key: 1,
    title: "Buy online",
    subtitle: "Real-time Plant Health",
    text: "Shop online at your favorite retail stores as you normally do",
    image: require("../assets/2.png"),
    color: "#5cb85c",
    backgroundColor: "#fff",
  },
  {
    key: 2,
    title: "Schedule with Ourly",
    subtitle: "AI-Powered Farming",
    text: "And we'll bring it straight to your door in the same day",
    image: require("../assets/3.png"),
    color: "#6cc16c",
    backgroundColor: "#fff",
  },
];

const AUTO_ADVANCE_INTERVAL = 2000;

const CustomButton = ({ title, onPress, variant = "primary", disabled = false, style, textStyle }) => {
  const buttonStyle = [
    styles.button,
    variant === "primary" ? styles.primaryButton : styles.secondaryButton,
    disabled && styles.disabledButton,
    style,
  ];

  const buttonTextStyle = [
    styles.buttonText,
    variant === "primary" ? styles.primaryButtonText : styles.secondaryButtonText,
    disabled && styles.disabledButtonText,
    textStyle,
  ];

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={disabled ? 1 : 0.7}
    >
      <Text style={buttonTextStyle}>{title}</Text>
    </TouchableOpacity>
  );
};

const Slide = ({ item, navigation, currentIndex, totalSlides, theme }) => {
  const isDark = theme === "dark";
  const backgroundColor = isDark ? "#121212" : item.backgroundColor;
  const textColor = isDark ? "#f0f0f0" : "#2c3e50";
  const subTextColor = isDark ? "#aaaaaa" : "#7f8c8d";
  const skipTextColor = isDark ? "#ccc" : COLORS.darkGray;
  const skipBackground = isDark ? "#1e1e1e" : "rgba(255, 255, 255, 0.8)";

  return (
    <View style={[styles.slideContainer, { backgroundColor }]}>
      <View style={styles.headerContainer}>
        <TouchableOpacity
          style={[styles.skipButton, { backgroundColor: skipBackground }]}
          onPress={() => navigation.navigate("login")}
        >
          <Text style={[styles.skipText, { color: skipTextColor }]}>Skip</Text>
        </TouchableOpacity>

      </View>

      <View style={styles.contentContainer}>
        <Text style={[styles.title, { color: textColor }]}>{item.title}</Text>
        <Text style={[styles.description, { color: subTextColor }]}>{item.text}</Text>
      </View>

      <View style={styles.imageContainer}>
        <View style={styles.imageWrapper}>
          <Image source={item.image} style={styles.image} />
        </View>
      </View>
    </View>
  );
};

const Onboarding = ({ navigation }) => {
  const [currentSlideIndex, setCurrentSlideIndex] = React.useState(0);
  const [isMounted, setIsMounted] = React.useState(false);
  const ref = React.useRef();
  const intervalRef = React.useRef();
  const { theme } = useTheme();

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  React.useEffect(() => {
    if (isMounted) {
      intervalRef.current = setInterval(() => {
        const nextSlideIndex = currentSlideIndex + 1;
        if (nextSlideIndex < onboardingSlides.length) {
          ref.current?.scrollToOffset({ offset: nextSlideIndex * width });
          setCurrentSlideIndex(nextSlideIndex);
        } else {
          setCurrentSlideIndex(0);
          ref.current?.scrollToOffset({ offset: 0 });
        }
      }, AUTO_ADVANCE_INTERVAL);
    }

    return () => clearInterval(intervalRef.current);
  }, [currentSlideIndex, isMounted]);

  const updateCurrentSlideIndex = (e) => {
    const contentOffsetX = e.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / width);
    setCurrentSlideIndex(index);
  };

  const goToNextSlide = () => {
    const nextSlideIndex = currentSlideIndex + 1;
    if (nextSlideIndex < onboardingSlides.length) {
      ref.current?.scrollToOffset({ offset: nextSlideIndex * width });
      setCurrentSlideIndex(nextSlideIndex);
    } else {
      navigation.replace("BottomNav"); // Navigate to BuyerDashboard tab navigator
    }
  };

  const goToPreviousSlide = () => {
    const prevSlideIndex = currentSlideIndex - 1;
    if (prevSlideIndex >= 0) {
      ref.current?.scrollToOffset({ offset: prevSlideIndex * width });
      setCurrentSlideIndex(prevSlideIndex);
    }
  };

  const goToSlide = (index) => {
    ref.current?.scrollToOffset({ offset: index * width });
    setCurrentSlideIndex(index);
  };

  const Footer = () => {
    const isFirstSlide = currentSlideIndex === 0;
    const isLastSlide = currentSlideIndex === onboardingSlides.length - 1;
    const footerBackground = theme === "dark" ? "#121212" : COLORS.white;

    return (
      <View style={[styles.footerContainer, { backgroundColor: footerBackground }]}>
        <View style={styles.indicatorContainer}>
          {onboardingSlides.map((_, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.indicator,
                {
                  backgroundColor:
                    currentSlideIndex === index ? COLORS.primary : COLORS.lightGray,
                  width: currentSlideIndex === index ? 32 : 8,
                },
              ]}
              onPress={() => goToSlide(index)}
            />
          ))}
        </View>

        <View style={styles.buttonContainer}>
          {!isFirstSlide && (
            <TouchableOpacity style={styles.backButton} onPress={goToPreviousSlide}>
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
          )}

          <View style={[styles.nextButtonContainer, isFirstSlide && styles.fullWidthButton]}>
            <CustomButton
              title={isLastSlide ? "Get Started" : "Next"}
              onPress={goToNextSlide}
              variant="primary"
            />
          </View>
        </View>
      </View>
    );
  };

  const backgroundColor = theme === "dark" ? "#121212" : COLORS.white;
  const barStyle = theme === "dark" ? "light-content" : "dark-content";

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <StatusBar backgroundColor={backgroundColor} barStyle={barStyle} />

      <FlatList
        ref={ref}
        onMomentumScrollEnd={updateCurrentSlideIndex}
        showsHorizontalScrollIndicator={false}
        horizontal
        data={onboardingSlides}
        pagingEnabled
        bounces={false}
        keyExtractor={(item) => item.key.toString()}
        renderItem={({ item }) => (
          <Slide
            item={item}
            navigation={navigation}
            currentIndex={currentSlideIndex}
            totalSlides={onboardingSlides.length}
            theme={theme}
          />
        )}
      />

      <Footer />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  slideContainer: {
    width,
    paddingHorizontal: 24,
    paddingTop: 20,
    flex: 1,
  },
  headerContainer: {
    width: "100%",
    alignItems: "flex-end",
    marginBottom: 40,
  },
  skipButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  skipText: {
    fontFamily: FONTS.regular,
    fontSize: 14,
  },
  contentContainer: {
    alignItems: "center",
    paddingHorizontal: 10,
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: 24,
    textAlign: "center",
    marginBottom: 10,
    lineHeight: 38,
    letterSpacing: 0.5,
  },
  description: {
    fontFamily: FONTS.regular,
    fontSize: 15,
    textAlign: "center",
    lineHeight: 24,
    maxWidth: width * 0.85,
    letterSpacing: 0.2,
  },
  imageContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  imageWrapper: {
    width: width * 0.8,
    height: height * 0.4,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
  },
  image: {
    width: "90%",
    height: "90%",
    resizeMode: "contain",
  },
  footerContainer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 20,
  },
  indicatorContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 32,
  },
  indicator: {
    height: 8,
    borderRadius: 6,
    marginHorizontal: 5,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  backButton: {
    backgroundColor: "transparent",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    minWidth: "30%",
  },
  backButtonText: {
    textAlign: "center",
    fontFamily: FONTS.semiBold,
    fontSize: 16,
    color: COLORS.gray,
  },
  nextButtonContainer: {
    minWidth: "60%",
    marginLeft: 15,
  },
  fullWidthButton: {
    minWidth: "100%",
    marginLeft: 0,
  },
  button: {
    borderRadius: 16,
    paddingVertical: 7,
    paddingHorizontal: 32,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 56,
    shadowColor: COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
  },
  secondaryButton: {
    backgroundColor: COLORS.lightGray,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  disabledButton: {
    backgroundColor: COLORS.lightGray,
    opacity: 0.6,
  },
  buttonText: {
    fontFamily: FONTS.semiBold,
    fontSize: 17,
    textAlign: "center",
    letterSpacing: 0.3,
  },
  primaryButtonText: {
    color: COLORS.white,
  },
  secondaryButtonText: {
    color: COLORS.primary,
  },
  disabledButtonText: {
    color: COLORS.gray,
  },
});

export default Onboarding;



// import React, { useEffect, useRef, useState } from "react";
// import {
//   View,
//   Text,
//   Image,
//   StyleSheet,
//   Dimensions,
//   Animated,
//   StatusBar,
//   SafeAreaView,
// } from "react-native";
// import { useTheme } from "../contexts/ThemeContext";

// const { width, height } = Dimensions.get("window");

// const COLORS = {
//   primary: "#4ba26a",
//   secondary: "#2d5a3d",
//   white: "#fff",
//   lightGray: "#F8F9FA",
//   gray: "#A1A1A1",
//   darkGray: "#6C757D",
//   accent: "#E8F5E8",
//   gradientStart: "#f8fffe",
//   gradientEnd: "#e8f5f0",
// };

// const FONTS = {
//   regular: "Poppins_400Regular",
//   semiBold: "Poppins_600SemiBold",
//   bold: "Poppins_700Bold",
// };

// const onboardingSlides = [
//   {
//     key: 0,
//     title: "On-demand delivery",
//     subtitle: "Smart Field Observation",
//     text: "We turn your retail pickup orders into same day delivery with three simple steps.",
//     image: require("../assets/1.png"),
//   },
//   {
//     key: 1,
//     title: "Buy online",
//     subtitle: "Real-time Plant Health",
//     text: "Shop online at your favorite retail stores as you normally do.",
//     image: require("../assets/2.png"),
//   },
//   {
//     key: 2,
//     title: "Schedule with Ourly",
//     subtitle: "AI-Powered Farming",
//     text: "And we'll bring it straight to your door in the same day.",
//     image: require("../assets/3.png"),
//   },
// ];

// const AUTO_ADVANCE_INTERVAL = 3000;

// export default function Onboarding({ navigation }) {
//   const [currentIndex, setCurrentIndex] = useState(0);
//   const fadeAnim = useRef(new Animated.Value(0)).current;
//   const { theme } = useTheme();

//   const fadeIn = () => {
//     fadeAnim.setValue(0);
//     Animated.timing(fadeAnim, {
//       toValue: 1,
//       duration: 800,
//       useNativeDriver: true,
//     }).start();
//   };

//   useEffect(() => {
//     fadeIn();
//     const interval = setInterval(() => {
//       const nextIndex = (currentIndex + 1) % onboardingSlides.length;
//       setCurrentIndex(nextIndex);
//       fadeIn();
//     }, AUTO_ADVANCE_INTERVAL);
//     return () => clearInterval(interval);
//   }, [currentIndex]);

//   const slide = onboardingSlides[currentIndex];
//   const isDark = theme === "dark";
//   const backgroundColor = isDark ? "#121212" : COLORS.white;
//   const textColor = isDark ? "#F0F0F0" : "#2c3e50";
//   const subTextColor = isDark ? "#AAAAAA" : COLORS.gray;

//   return (
//     <SafeAreaView style={[styles.container, { backgroundColor }]}>
//       <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
//       <Animated.View style={[styles.contentContainer, { opacity: fadeAnim }]}>
//         <Text style={[styles.title, { color: textColor }]}>{slide.title}</Text>
//         <Text style={[styles.description, { color: subTextColor }]}>
//           {slide.text}
//         </Text>
//         <Image source={slide.image} style={styles.image} />
//       </Animated.View>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   contentContainer: {
//     alignItems: "center",
//     justifyContent: "center",
//     paddingHorizontal: 20,
//   },
//   title: {
//     fontFamily: FONTS.bold,
//     fontSize: 24,
//     textAlign: "center",
//     marginBottom: 12,
//   },
//   description: {
//     fontFamily: FONTS.regular,
//     fontSize: 16,
//     textAlign: "center",
//     marginBottom: 24,
//     maxWidth: width * 0.85,
//   },
//   image: {
//     width: width * 0.8,
//     height: height * 0.4,
//     resizeMode: "contain",
//   },
// });




// import React, { useEffect, useRef, useState } from "react";
// import {
//   View,
//   Text,
//   Image,
//   StyleSheet,
//   Dimensions,
//   Animated,
//   StatusBar,
//   SafeAreaView,
// } from "react-native";
// import { useTheme } from "../contexts/ThemeContext";

// const { width, height } = Dimensions.get("window");

// const COLORS = {
//   primary: "#4ba26a",
//   white: "#ffffff",
//   dark: "#121212",
//   lightGray: "#f0f0f0",
//   gray: "#6C757D",
// };

// const FONTS = {
//   regular: "Poppins_400Regular",
//   semiBold: "Poppins_600SemiBold",
//   bold: "Poppins_700Bold",
// };

// const onboardingSlides = [
//   {
//     key: 0,
//     title: "On-demand Delivery",
//     subtitle: "Smart Field Observation",
//     text: "We turn your retail pickup orders into same-day delivery with three simple steps.",
//     image: require("../assets/1.png"),
//   },
//   {
//     key: 1,
//     title: "Buy Online",
//     subtitle: "Real-time Plant Health",
//     text: "Shop online at your favorite retail stores as you normally do.",
//     image: require("../assets/2.png"),
//   },
//   {
//     key: 2,
//     title: "Schedule with Ourly",
//     subtitle: "AI-Powered Farming",
//     text: "We bring it straight to your door the same day you schedule it.",
//     image: require("../assets/3.png"),
//   },
// ];

// const AUTO_ADVANCE_INTERVAL = 4000;

// export default function Onboarding({ navigation }) {
//   const [currentIndex, setCurrentIndex] = useState(0);
//   const fadeAnim = useRef(new Animated.Value(0)).current;
//   const { theme } = useTheme();

//   const isDark = theme === "dark";
//   const backgroundColor = isDark ? COLORS.dark : COLORS.white;
//   const textColor = isDark ? "#f5f5f5" : "#1A202C";
//   const subTextColor = isDark ? "#aaa" : COLORS.gray;

//   const fadeIn = () => {
//     fadeAnim.setValue(0);
//     Animated.timing(fadeAnim, {
//       toValue: 1,
//       duration: 700,
//       useNativeDriver: true,
//     }).start();
//   };

//   const handleFinalRedirect = () => {
//     navigation.replace("buyer");
//   };

//   useEffect(() => {
//     fadeIn();
//     const interval = setInterval(() => {
//       const nextIndex = currentIndex + 1;
//       if (nextIndex < onboardingSlides.length) {
//         setCurrentIndex(nextIndex);
//         fadeIn();
//       } else {
//         clearInterval(interval);
//         setTimeout(handleFinalRedirect, 800); // Delay for smooth fade-out
//       }
//     }, AUTO_ADVANCE_INTERVAL);

//     return () => clearInterval(interval);
//   }, [currentIndex]);

//   const slide = onboardingSlides[currentIndex];

//   return (
//     <SafeAreaView style={[styles.container, { backgroundColor }]}>
//       <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
//       <Animated.View style={[styles.contentContainer, { opacity: fadeAnim }]}>
//         <Image source={slide.image} style={styles.image} />
//         <View style={styles.textContainer}>
//           <Text style={[styles.title, { color: textColor }]}>{slide.title}</Text>
//           <Text style={[styles.subtitle, { color: subTextColor }]}>{slide.subtitle}</Text>
//           <Text style={[styles.description, { color: subTextColor }]}>{slide.text}</Text>
//         </View>
//       </Animated.View>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: "center",
//   },
//   contentContainer: {
//     alignItems: "center",
//     justifyContent: "center",
//     paddingHorizontal: 24,
//     flex: 1,
//   },
//   image: {
//     width: width * 0.8,
//     height: height * 0.4,
//     resizeMode: "contain",
//     marginBottom: 24,
//   },
//   textContainer: {
//     alignItems: "center",
//     marginBottom: 24,
//   },
//   title: {
//     fontFamily: FONTS.bold,
//     fontSize: 26,
//     marginBottom: 6,
//     textAlign: "center",
//   },
//   subtitle: {
//     fontFamily: FONTS.semiBold,
//     fontSize: 18,
//     marginBottom: 12,
//     textAlign: "center",
//   },
//   description: {
//     fontFamily: FONTS.regular,
//     fontSize: 15,
//     textAlign: "center",
//     lineHeight: 22,
//     paddingHorizontal: 10,
//   },
// });

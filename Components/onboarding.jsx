import React from "react";
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

const { width, height } = Dimensions.get("window");

const COLORS = {
  primary: "#4ba26a",
  secondary: "#2d5a3d",
  white: "#fff",
  lightGray: "#F8F9FA",
  gray: "#A1A1A1",
  darkGray: "#6C757D",
  accent: "#E8F5E8",
};

const FONTS = {
  regular: "Poppins_400Regular",
  semiBold: "Poppins_600SemiBold",
  bold: "Poppins_700Bold",
};

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
    {
      key: 3,
      title: "Your Farm. Your Market. Your Voice",
      subtitle: "AI-Powered Farming",
      text: "AgriHub helps you sell directly, make smarter decisions, and save with your community  in Kinyarwanda or English.",
      image: require("../assets/boardthree.png"),
      color: "#6cc16c",
    },
];

// Custom Button Component
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
      activeOpacity={disabled ? 1 : 0.8}
    >
      <Text style={buttonTextStyle}>{title}</Text>
    </TouchableOpacity>
  );
};

const Slide = ({ item, navigation, currentIndex, totalSlides }) => {
  return (
    <View style={styles.slideContainer}>
      <View style={styles.headerContainer}>
        <TouchableOpacity
          style={styles.skipButton}
          onPress={() => navigation.navigate("login")}
          activeOpacity={0.7}
        >
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.imageContainer}>
        <View style={[styles.imageBorder, { borderColor: item.color }]}>
          <Image source={item.image} style={styles.image} />
        </View>
      </View>

      <View style={styles.contentContainer}>
        <Text style={styles.subtitle}>{item.subtitle}</Text>
        <Text style={[styles.title, { color: item.color }]}>{item.title}</Text>
        <Text style={styles.description}>{item.text}</Text>
      </View>

      <View style={styles.progressContainer}>
        <Text style={styles.progressText}>
          {currentIndex + 1} of {totalSlides}
        </Text>
      </View>
    </View>
  );
};

const Onboarding = ({ navigation }) => {
  const [currentSlideIndex, setCurrentSlideIndex] = React.useState(0);
  const ref = React.useRef();

  const updateCurrentSlideIndex = (e) => {
    const contentOffsetX = e.nativeEvent.contentOffset.x;
    const currentIndex = Math.round(contentOffsetX / width);
    setCurrentSlideIndex(currentIndex);
  };

  const goToNextSlide = () => {
    const nextSlideIndex = currentSlideIndex + 1;
    if (nextSlideIndex < onboardingSlides.length) {
      const offset = nextSlideIndex * width;
      ref?.current.scrollToOffset({ offset });
      setCurrentSlideIndex(nextSlideIndex);
    } else {
      navigation.navigate("login");
    }
  };

  const goToPreviousSlide = () => {
    const previousSlideIndex = currentSlideIndex - 1;
    if (previousSlideIndex >= 0) {
      const offset = previousSlideIndex * width;
      ref?.current.scrollToOffset({ offset });
      setCurrentSlideIndex(previousSlideIndex);
    }
  };

  const Footer = () => {
    const isFirstSlide = currentSlideIndex === 0;
    const isLastSlide = currentSlideIndex === onboardingSlides.length - 1;

    return (
      <View style={styles.footerContainer}>
        <View style={styles.indicatorContainer}>
          {onboardingSlides.map((_, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.indicator,
                {
                  backgroundColor:
                    currentSlideIndex === index ? COLORS.primary : COLORS.lightGray,
                  width: currentSlideIndex === index ? 24 : 8,
                },
              ]}
              onPress={() => {
                const offset = index * width;
                ref?.current.scrollToOffset({ offset });
                setCurrentSlideIndex(index);
              }}
              activeOpacity={0.7}
            />
          ))}
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.backButton,
              { opacity: isFirstSlide ? 0.5 : 1 },
            ]}
            onPress={goToPreviousSlide}
            disabled={isFirstSlide}
            activeOpacity={0.7}
          >
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>

          <View style={styles.nextButtonContainer}>
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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />
      
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
    backgroundColor: COLORS.white,
  },
  slideContainer: {
    width,
    paddingHorizontal: 24,
    paddingTop: 20,
    alignItems: "center",
  },
  headerContainer: {
    width: "100%",
    alignItems: "flex-end",
    marginBottom: 20,
  },
  skipButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.lightGray,
  },
  skipText: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: COLORS.darkGray,
  },
  imageContainer: {
    width: "100%",
    height: height * 0.4,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 32,
  },
  imageBorder: {
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: width * 0.35,
    borderWidth: 3,
    padding: 20,
    backgroundColor: COLORS.accent,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
  contentContainer: {
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 32,
  },
  subtitle: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: COLORS.gray,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 8,
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: 28,
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 34,
  },
  description: {
    fontFamily: FONTS.regular,
    fontSize: 16,
    textAlign: "center",
    color: COLORS.darkGray,
    lineHeight: 24,
    maxWidth: width * 0.8,
  },
  progressContainer: {
    marginTop: "auto",
  },
  progressText: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.gray,
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
    borderRadius: 4,
    marginHorizontal: 4,
    backgroundColor: COLORS.lightGray,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  backButton: {
    backgroundColor: COLORS.lightGray,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
    minWidth: "35%",
  },
  backButtonText: {
    textAlign: "center",
    fontFamily: FONTS.semiBold,
    fontSize: 16,
    color: COLORS.darkGray,
  },
  nextButtonContainer: {
    minWidth: "60%",
    marginLeft: 16,
  },
  // Custom Button Styles
  button: {
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 52,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
    fontSize: 16,
    textAlign: "center",
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
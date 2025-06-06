import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  FlatList,
  Dimensions,
  Image,
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
  border: "#E9ECEF",
};

const FONTS = {
  regular: "Poppins_400Regular",
  semiBold: "Poppins_600SemiBold",
  bold: "Poppins_700Bold",
};

// Language data with flags (you can replace with actual flag images)
const languages = [
  {
    id: "en",
    name: "English",
    nativeName: "English",
    flag: "🇺🇸",
    isDefault: true,
  },
  {
    id: "es",
    name: "Spanish",
    nativeName: "Español",
    flag: "🇪🇸",
    isDefault: false,
  },
  {
    id: "fr",
    name: "French",
    nativeName: "Français",
    flag: "🇫🇷",
    isDefault: false,
  },
  {
    id: "de",
    name: "German",
    nativeName: "Deutsch",
    flag: "🇩🇪",
    isDefault: false,
  },
  {
    id: "pt",
    name: "Portuguese",
    nativeName: "Português",
    flag: "🇵🇹",
    isDefault: false,
  },
  {
    id: "zh",
    name: "Chinese",
    nativeName: "中文",
    flag: "🇨🇳",
    isDefault: false,
  },
  {
    id: "ja",
    name: "Japanese",
    nativeName: "日本語",
    flag: "🇯🇵",
    isDefault: false,
  },
  {
    id: "ko",
    name: "Korean",
    nativeName: "한국어",
    flag: "🇰🇷",
    isDefault: false,
  },
  {
    id: "ar",
    name: "Arabic",
    nativeName: "العربية",
    flag: "🇸🇦",
    isDefault: false,
  },
  {
    id: "hi",
    name: "Hindi",
    nativeName: "हिन्दी",
    flag: "🇮🇳",
    isDefault: false,
  },
  {
    id: "ru",
    name: "Russian",
    nativeName: "Русский",
    flag: "🇷🇺",
    isDefault: false,
  },
  {
    id: "rw",
    name: "Kinyarwanda",
    nativeName: "Ikinyarwanda",
    flag: "🇷🇼",
    isDefault: false,
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

// Language Item Component
const LanguageItem = ({ item, isSelected, onSelect }) => {
  return (
    <TouchableOpacity
      style={[
        styles.languageItem,
        isSelected && styles.selectedLanguageItem,
      ]}
      onPress={() => onSelect(item)}
      activeOpacity={0.7}
    >
      <View style={styles.languageContent}>
        <View style={styles.flagContainer}>
          <Text style={styles.flag}>{item.flag}</Text>
        </View>
        
        <View style={styles.languageInfo}>
          <Text style={[
            styles.languageName,
            isSelected && styles.selectedLanguageName,
          ]}>
            {item.name}
          </Text>
          <Text style={[
            styles.nativeLanguageName,
            isSelected && styles.selectedNativeLanguageName,
          ]}>
            {item.nativeName}
          </Text>
        </View>
        
        <View style={styles.checkContainer}>
          {isSelected && (
            <View style={styles.checkmark}>
              <Text style={styles.checkmarkText}>✓</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const LanguageSelection = ({ navigation }) => {
  const [selectedLanguage, setSelectedLanguage] = useState(
    languages.find(lang => lang.isDefault) || languages[0]
  );

  const handleLanguageSelect = (language) => {
    setSelectedLanguage(language);
  };

  const handleContinue = () => {
    console.log("Selected language:", selectedLanguage);
    navigation.navigate("onboarding");
  };

  const handleSkip = () => {
    navigation.navigate("onboarding");
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />
      
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.skipButton}
          onPress={handleSkip}
          activeOpacity={0.7}
        >
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.titleSection}>
        <View style={styles.iconContainer}>
          <Text style={styles.languageIcon}>🌍</Text>
        </View>
        <Text style={styles.title}>Choose Language</Text>
        <Text style={styles.subtitle}>
          Select your preferred language to personalize your experience
        </Text>
      </View>

      {/* Language List */}
      <View style={styles.listContainer}>
        <FlatList
          data={languages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <LanguageItem
              item={item}
              isSelected={selectedLanguage?.id === item.id}
              onSelect={handleLanguageSelect}
            />
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <CustomButton
          title="Continue"
          onPress={handleContinue}
          variant="primary"
          style={styles.continueButton}
        />
        <Text style={styles.footerNote}>
          You can change this later in settings
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    alignItems: "flex-end",
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
  titleSection: {
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.accent,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  languageIcon: {
    fontSize: 36,
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: 28,
    color: COLORS.primary,
    textAlign: "center",
    marginBottom: 12,
  },
  subtitle: {
    fontFamily: FONTS.regular,
    fontSize: 16,
    color: COLORS.darkGray,
    textAlign: "center",
    lineHeight: 24,
    maxWidth: width * 0.8,
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 24,
  },
  listContent: {
    paddingBottom: 20,
  },
  languageItem: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: COLORS.border,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  selectedLanguageItem: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.accent,
  },
  languageContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
  },
  flagContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.lightGray,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  flag: {
    fontSize: 24,
  },
  languageInfo: {
    flex: 1,
  },
  languageName: {
    fontFamily: FONTS.semiBold,
    fontSize: 18,
    color: COLORS.secondary,
    marginBottom: 4,
  },
  selectedLanguageName: {
    color: COLORS.primary,
  },
  nativeLanguageName: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: COLORS.gray,
  },
  selectedNativeLanguageName: {
    color: COLORS.secondary,
  },
  checkContainer: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  checkmarkText: {
    color: COLORS.white,
    fontSize: 14,
    fontFamily: FONTS.bold,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 20,
  },
  continueButton: {
    marginBottom: 16,
  },
  footerNote: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: COLORS.gray,
    textAlign: "center",
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

export default LanguageSelection;
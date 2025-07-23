import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
  ScrollView,
  Alert,
  Dimensions,
  StatusBar,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
const LightColors = {
  primary: '#48BB78',
  primaryDark: '#48BB78',
  primaryLight: '#48BB78',
  secondary: '#FF6B35',
  secondaryLight: '#FF8A50',
  accent: '#FFA726',
  background: '#F8F9FA',
  surface: '#FFFFFF',
  surfaceLight: '#F0F4F8',
  textPrimary: '#1A202C',
  textSecondary: '#4A5568',
  textTertiary: '#718096',
  success: '#48BB78',
  successLight: '#68D391',
  warning: '#ED8936',
  error: '#F56565',
  cardBackground: '#FFFFFF',
  inputBackground: '#F7FAFC',
  borderColor: '#E2E8F0',
  shadowColor: 'rgba(0, 0, 0, 0.1)',
};

const DarkColors = {
  primary: '#48BB78',
  primaryDark: '#3182CE',
  primaryLight: '#90CDF4',
  secondary: '#FF6B35',
  secondaryLight: '#FF8A50',
  accent: '#FBB040',
  background: '#0F0F0F',
  surface: '#1A1A1A',
  surfaceLight: '#2D3748',
  textPrimary: '#F7FAFC',
  textSecondary: '#CBD5E0',
  textTertiary: '#A0AEC0',
  success: '#68D391',
  successLight: '#9AE6B4',
  warning: '#F6AD55',
  error: '#FC8181',
  cardBackground: '#1A1A1A',
  inputBackground: '#2D3748',
  borderColor: '#4A5568',
  shadowColor: 'rgba(255, 255, 255, 0.1)',
};

// Translation object
const translations = {
  en: {
    profile: 'Profile',
    loading: 'Loading profile...',
    editProfile: 'Edit Profile',
    editProfileMsg: 'Edit profile functionality coming soon!',
    changeToKinyarwanda: 'Change to Kinyarwanda',
    changeToEnglish: 'Change to English',
    language: 'Language',
    lightMode: 'Light Mode',
    darkMode: 'Dark Mode',
    switchToLight: 'Switch to light theme',
    switchToDark: 'Switch to dark theme',
    appearance: 'Appearance',
    logout: 'Logout',
    logoutConfirm: 'Are you sure you want to logout?',
    cancel: 'Cancel',
    settings: 'Settings',
    account: 'Account',
    preferences: 'Preferences',
    notAvailable: 'N/A',
    privacy: 'Privacy & Security',
    notifications: 'Notifications',
    help: 'Help & Support',
    about: 'About',
    version: 'Version 1.0.0',
    joinedDate: 'Joined',
    lastActive: 'Last Active',
    profilePicture: 'Profile Picture',
    changePhoto: 'Change Photo',
  },
  rw: {
    profile: 'Profil',
    loading: 'Gupakurura profil...',
    editProfile: 'Hindura Profil',
    editProfileMsg: 'Ibikorwa byo guhindura profil bizaza vuba!',
    changeToKinyarwanda: 'Hinduka ku Kinyarwanda',
    changeToEnglish: 'Hinduka ku Cyongereza',
    language: 'Ururimi',
    lightMode: 'Urumuri Ruke',
    darkMode: 'Urumuri Runaka',
    switchToLight: 'Hinduka ku murongo mweru',
    switchToDark: 'Hinduka ku murongo wijimye',
    appearance: 'Isura',
    logout: 'Gusohoka',
    logoutConfirm: 'Uzi neza ko ushaka gusohoka?',
    cancel: 'Kuraguza',
    settings: 'Igenamiterere',
    account: 'Konti',
    preferences: 'Ibyo ukunda',
    notAvailable: 'Ntiboneka',
    privacy: 'Ibanga n\'Umutekano',
    notifications: 'Amakuru',
    help: 'Ubufasha n\'Inkunga',
    about: 'Ibyerekeye',
    version: 'Verisiyo 1.0.0',
    joinedDate: 'Yinjiye',
    lastActive: 'Yakoraga bwa nyuma',
    profilePicture: 'Ifoto ya Profil',
    changePhoto: 'Hindura Ifoto',
  }
};

const AUTH_KEYS = {
  TOKEN: '@auth_token',
  USER_ID: '@user_id',
  USER_DATA: '@user_data',
};

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const ProfileScreen = () => {
  const navigation = useNavigation();
  const [user, setUser] = useState(null);
  const { theme, toggleTheme } = useTheme();
  const { language, changeLanguage } = useLanguage();
  const Colors = theme === 'dark' ? DarkColors : LightColors;
  const t = translations[language] || translations.en;

  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem(AUTH_KEYS.USER_DATA);
      if (userData) {
        const parsedUser = JSON.parse(userData);
        setUser({
          name: parsedUser.name,
          email: parsedUser.email,
          avatar: parsedUser.avatar || 'https://via.placeholder.com/150',
          phone: parsedUser.phone || t.notAvailable,
          joinDate: parsedUser.joinDate || '2024-01-01',
          lastActive: parsedUser.lastActive || 'Today',
        });
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const handleLogout = async () => {
    Alert.alert(t.logout, t.logoutConfirm, [
      { text: t.cancel, style: 'cancel' },
      {
        text: t.logout,
        style: 'destructive',
        onPress: async () => {
          try {
            await AsyncStorage.multiRemove([
              AUTH_KEYS.TOKEN,
              AUTH_KEYS.USER_ID,
              AUTH_KEYS.USER_DATA,
            ]);
            navigation.reset({
              index: 0,
              routes: [{ name: 'login' }],
            });
          } catch (err) {
            console.error('Logout error:', err);
          }
        },
      },
    ]);
  };

  useEffect(() => {
    loadUserData();
  }, []);

  // Enhanced menu items with complete translations
  const menuItems = [
    {
      id: '1',
      title: t.editProfile,
      icon: 'person-outline',
      iconColor: Colors.primary,
      onPress: () => Alert.alert(t.editProfile, t.editProfileMsg)
    },
    {
      id: '2',
      title: t.privacy,
      icon: 'shield-checkmark-outline',
      iconColor: Colors.success,
      onPress: () => Alert.alert(t.privacy, 'Coming soon!')
    },
    {
      id: '3',
      title: t.notifications,
      icon: 'notifications-outline',
      iconColor: Colors.warning,
      onPress: () => Alert.alert(t.notifications, 'Coming soon!')
    },
    {
      id: '4',
      title: t.help,
      icon: 'help-circle-outline',
      iconColor: Colors.secondary,
      onPress: () => Alert.alert(t.help, 'Coming soon!')
    },
    {
      id: '5',
      title: t.about,
      icon: 'information-circle-outline',
      iconColor: Colors.accent,
      onPress: () => Alert.alert(t.about, t.version)
    },
  ];

  const renderMenuItem = (item) => (
    <TouchableOpacity 
      key={item.id} 
      style={[styles.menuItem, { backgroundColor: Colors.cardBackground }]} 
      onPress={item.onPress}
      activeOpacity={0.7}
    >
      <View style={styles.menuItemLeft}>
        <View
          style={[styles.iconContainer, { backgroundColor: item.iconColor + '20' }]}
        >
          <Ionicons name={item.icon} size={22} color={item.iconColor} />
        </View>
        <Text style={[styles.menuItemText, { color: Colors.textPrimary }]}>{item.title}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={Colors.textTertiary} />
    </TouchableOpacity>
  );

  if (!user) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: Colors.background }]}>
        <StatusBar backgroundColor={Colors.background} barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} />
        <View style={styles.loadingContainer}>
          <View
            style={[styles.loadingIcon, { backgroundColor: Colors.primary }]}
          >
            <Ionicons name="person-circle-outline" size={50} color="#fff" />
          </View>
          <Text style={[styles.loadingText, { color: Colors.textSecondary }]}>{t.loading}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors.background }]}>
      <StatusBar backgroundColor={Colors.background} barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} />
      <ScrollView showsVerticalScrollIndicator={false} bounces={true}>
        {/* Enhanced Header with Background */}
        <View
          style={[styles.headerBackground, { backgroundColor: Colors.primary }]}
        >
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>{t.profile}</Text>
            <TouchableOpacity style={styles.settingsButton} onPress={() => Alert.alert(t.settings, 'Coming soon!')}>
              <Ionicons name="settings-outline" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Enhanced Profile Section */}
        <View style={styles.profileSection}>
          <View
            style={[styles.profileCard, { backgroundColor: Colors.primary }]}
          >
            <View style={styles.avatarContainer}>
              <Image 
                source={{ uri: user.avatar }} 
                style={styles.avatar}
              />
              <TouchableOpacity style={styles.editAvatarButton}>
                <Ionicons name="camera" size={16} color="#fff" />
              </TouchableOpacity>
            </View>

            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user.name}</Text>
              <Text style={styles.userEmail}>{user.email}</Text>
              <Text style={styles.userPhone}>{user.phone}</Text>
            </View>

            {/* User Stats */}
            <View style={styles.userStats}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>12</Text>
                <Text style={styles.statLabel}>{t.joinedDate}</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>245</Text>
                <Text style={styles.statLabel}>Active</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>98%</Text>
                <Text style={styles.statLabel}>Score</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Enhanced Language Selection */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: Colors.textPrimary }]}>{t.language}</Text>
          <TouchableOpacity
            onPress={() => changeLanguage(language === 'en' ? 'rw' : 'en')}
            style={[styles.languageCard, { backgroundColor: Colors.cardBackground }]}
            activeOpacity={0.7}
          >
            <View
              style={[styles.languageIcon, { backgroundColor: Colors.success }]}
            >
              <Ionicons name="language" size={20} color="#fff" />
            </View>
            <View style={styles.languageContent}>
              <Text style={[styles.languageTitle, { color: Colors.textPrimary }]}>
                {language === 'en' ? 'English' : 'Kinyarwanda'}
              </Text>
              <Text style={[styles.languageSubtitle, { color: Colors.textTertiary }]}>
                {language === 'en' ? t.changeToKinyarwanda : t.changeToEnglish}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.textTertiary} />
          </TouchableOpacity>
        </View>

        {/* Enhanced Theme Toggle */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: Colors.textPrimary }]}>{t.appearance}</Text>
          <TouchableOpacity
            onPress={toggleTheme}
            style={[styles.themeCard, { backgroundColor: Colors.cardBackground }]}
            activeOpacity={0.7}
          >
            <View
              style={[styles.themeIcon, { backgroundColor: theme === 'dark' ? Colors.secondary : Colors.primary }]}
            >
              <Ionicons name={theme === 'dark' ? 'sunny' : 'moon'} size={20} color="#fff" />
            </View>
            <View style={styles.themeContent}>
              <Text style={[styles.themeTitle, { color: Colors.textPrimary }]}>
                {theme === 'dark' ? t.lightMode : t.darkMode}
              </Text>
              <Text style={[styles.themeSubtitle, { color: Colors.textTertiary }]}>
                {theme === 'dark' ? t.switchToLight : t.switchToDark}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.textTertiary} />
          </TouchableOpacity>
        </View>

        {/* Enhanced Menu Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: Colors.textPrimary }]}>{t.settings}</Text>
          <View style={[styles.menuContainer, { backgroundColor: Colors.cardBackground }]}>
            {menuItems.map(renderMenuItem)}
          </View>
        </View>

        {/* Enhanced Logout Section */}
        <View style={styles.logoutSection}>
          <TouchableOpacity
            style={[styles.logoutButton, { backgroundColor: Colors.error + '15' }]}
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <View style={styles.logoutContent}>
              <Ionicons name="log-out-outline" size={24} color={Colors.error} />
              <Text style={[styles.logoutText, { color: Colors.error }]}>{t.logout}</Text>
            </View>
          </TouchableOpacity>
        </View>
        
        {/* Bottom Spacing */}
        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Poppins_400Regular',
  },
  headerBackground: {
    paddingTop: 10,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    fontFamily: 'Poppins_700Bold',
  },
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileSection: {
    paddingHorizontal: 20,
    marginTop: -10,
    marginBottom: 30,
  },
  profileCard: {
    borderRadius: 24,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#fff',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FF6B35',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  userInfo: {
    alignItems: 'center',
    marginBottom: 25,
  },
  userName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    fontFamily: 'Poppins_700Bold',
    marginBottom: 6,
  },
  userEmail: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    fontFamily: 'Poppins_400Regular',
    marginBottom: 4,
  },
  userPhone: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    fontFamily: 'Poppins_400Regular',
  },
  userStats: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    paddingVertical: 15,
    paddingHorizontal: 20,
    width: '100%',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    fontFamily: 'Poppins_700Bold',
  },
  statLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
    fontFamily: 'Poppins_400Regular',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginHorizontal: 15,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    fontFamily: 'Poppins_600SemiBold',
    marginBottom: 15,
  },
  languageCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  languageIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  languageContent: {
    flex: 1,
  },
  languageTitle: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Poppins_600SemiBold',
  },
  languageSubtitle: {
    fontSize: 13,
    fontFamily: 'Poppins_400Regular',
    marginTop: 2,
  },
  themeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  themeIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  themeContent: {
    flex: 1,
  },
  themeTitle: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Poppins_600SemiBold',
  },
  themeSubtitle: {
    fontSize: 13,
    fontFamily: 'Poppins_400Regular',
    marginTop: 2,
  },
  menuContainer: {
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'Poppins_500Medium',
  },
  logoutSection: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  logoutButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  logoutContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 20,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Poppins_600SemiBold',
    marginLeft: 12,
  },
});

export default ProfileScreen;
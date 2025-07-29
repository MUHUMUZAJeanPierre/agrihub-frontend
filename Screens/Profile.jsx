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
import { useAuth  } from '../contexts/AuthContext';
import { wp, hp, fontSize, padding, margin, borderRadius, iconSize, fontSizes, spacing } from '../utils/responsive';

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
  const [user, setUser] = useState({
    name: 'User',
    email: 'user@example.com',
    avatar: 'https://via.placeholder.com/150',
    phone: 'N/A',
    joinDate: '2024-01-01',
    lastActive: 'Today',
  });
  const { theme, toggleTheme } = useTheme();
  const { language, changeLanguage } = useLanguage();
  const Colors = theme === 'dark' ? DarkColors : LightColors;
  const t = translations[language] || translations.en;
  const { logout } = useAuth();

  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem(AUTH_KEYS.USER_DATA);
      if (userData) {
        const parsedUser = JSON.parse(userData);
        setUser({
          name: parsedUser.name || 'User',
          email: parsedUser.email || 'user@example.com',
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

  const handleLogout = () => {
    logout(navigation);
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
      onPress: () => navigation.navigate('Security')
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

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors.background }]}>
      <StatusBar backgroundColor={Colors.background} barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} />
      <ScrollView showsVerticalScrollIndicator={false} bounces={true}>
        {/* Enhanced Header with Background */}
        <View
          style={[styles.headerBackground, { backgroundColor: Colors.background }]}
        >
          <View style={styles.headerContent}>
            <Text style={[styles.headerTitle, { color: Colors.textPrimary }]}>{t.profile}</Text>
            <TouchableOpacity style={styles.settingsButton} onPress={() => Alert.alert(t.settings, 'Coming soon!')}>
              <Ionicons name="settings-outline" size={24} color={Colors.textPrimary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Enhanced Profile Section */}
        <View style={styles.profileSection}>
          <View
            style={[styles.profileCard, { backgroundColor: Colors.cardBackground }]}
          >
            <View style={styles.avatarContainer}>
              <Image 
                source={{ uri: user.avatar }} 
                style={styles.avatar}
              />
              <TouchableOpacity style={styles.editAvatarButton}>
                <Ionicons name="camera" size={16} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <View style={styles.userInfo}>
              <Text style={[styles.userName, { color: Colors.textPrimary }]}>{user.name}</Text>
              <Text style={[styles.userEmail, { color: Colors.textSecondary }]}>{user.email}</Text>
              <Text style={[styles.userPhone, { color: Colors.textTertiary }]}>{user.phone}</Text>
            </View>

            {/* User Stats */}
            <View style={[styles.userStats, { backgroundColor: Colors.surfaceLight }]}> 
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: Colors.textPrimary }]}>12</Text>
                <Text style={[styles.statLabel, { color: Colors.textTertiary }]}>{t.joinedDate}</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: Colors.textPrimary }]}>245</Text>
                <Text style={[styles.statLabel, { color: Colors.textTertiary }]}>Active</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: Colors.textPrimary }]}>98%</Text>
                <Text style={[styles.statLabel, { color: Colors.textTertiary }]}>Score</Text>
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

        <View style={styles.logoutSection}>
          <TouchableOpacity
            style={[
              styles.logoutButton,
              {
                borderColor: Colors.error,
                backgroundColor: theme === 'dark' ? Colors.cardBackground : '#fff',
              },
            ]}
            onPress={handleLogout}
            activeOpacity={0.85}
          >
            <Ionicons name="log-out-outline" size={22} color={Colors.error} style={{ marginRight: 8 }} />
            <Text style={[styles.logoutText, { color: Colors.error }]}>{t.logout}</Text>
          </TouchableOpacity>
        </View>
        
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
    width: wp(80),
    height: wp(80),
    borderRadius: wp(40),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing[5],
  },
  loadingText: {
    fontSize: fontSizes.base,
    fontFamily: 'Poppins_400Regular',
  },
  headerBackground: {
    paddingTop: spacing[2],
    paddingBottom: spacing[5],
    paddingHorizontal: spacing[5],
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing[2],
  },
  headerTitle: {
    fontSize: fontSizes['4xl'],
    fontWeight: 'bold',
    color: '#fff',
    fontFamily: 'Poppins_700Bold',
  },
  settingsButton: {
    width: wp(44),
    height: wp(44),
    borderRadius: wp(22),
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileSection: {
    paddingHorizontal: spacing[5],
    marginTop: -spacing[2],
    marginBottom: spacing[8],
  },
  profileCard: {
    borderRadius: borderRadius.xl,
    padding: spacing[8],
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: spacing[2] },
    shadowOpacity: 0.15,
    shadowRadius: spacing[5],
    elevation: 8,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: spacing[5],
  },
  avatar: {
    width: wp(120),
    height: wp(120),
    borderRadius: wp(60),
    borderWidth: 4,
    borderColor: '#fff',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: wp(36),
    height: wp(36),
    borderRadius: wp(18),
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
    marginBottom: spacing[6],
  },
  userName: {
    fontSize: fontSizes['4xl'],
    fontWeight: 'bold',
    color: '#fff',
    fontFamily: 'Poppins_700Bold',
    marginBottom: spacing[1],
  },
  userEmail: {
    fontSize: fontSizes.base,
    color: 'rgba(255,255,255,0.9)',
    fontFamily: 'Poppins_400Regular',
    marginBottom: spacing[1],
  },
  userPhone: {
    fontSize: fontSizes.sm,
    color: 'rgba(255,255,255,0.7)',
    fontFamily: 'Poppins_400Regular',
  },
  userStats: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: borderRadius.md,
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[5],
    width: '100%',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: fontSizes['2xl'],
    fontWeight: 'bold',
    color: '#fff',
    fontFamily: 'Poppins_700Bold',
  },
  statLabel: {
    fontSize: fontSizes.xs,
    color: 'rgba(255,255,255,0.8)',
    fontFamily: 'Poppins_400Regular',
    marginTop: spacing[0.5],
  },
  statDivider: {
    width: 1,
    height: wp(30),
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginHorizontal: spacing[4],
  },
  section: {
    paddingHorizontal: spacing[5],
    marginBottom: spacing[6],
  },
  sectionTitle: {
    fontSize: fontSizes['2xl'],
    fontWeight: '600',
    fontFamily: 'Poppins_600SemiBold',
    marginBottom: spacing[4],
  },
  languageCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[4],
    borderRadius: borderRadius.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  languageIcon: {
    width: wp(44),
    height: wp(44),
    borderRadius: wp(22),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing[4],
  },
  languageContent: {
    flex: 1,
  },
  languageTitle: {
    fontSize: fontSizes.base,
    fontWeight: '600',
    fontFamily: 'Poppins_600SemiBold',
  },
  languageSubtitle: {
    fontSize: fontSizes.sm,
    fontFamily: 'Poppins_400Regular',
    marginTop: spacing[0.5],
  },
  themeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[4],
    borderRadius: borderRadius.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  themeIcon: {
    width: wp(44),
    height: wp(44),
    borderRadius: wp(22),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing[4],
  },
  themeContent: {
    flex: 1,
  },
  themeTitle: {
    fontSize: fontSizes.base,
    fontWeight: '600',
    fontFamily: 'Poppins_600SemiBold',
  },
  themeSubtitle: {
    fontSize: fontSizes.sm,
    fontFamily: 'Poppins_400Regular',
    marginTop: spacing[0.5],
  },
  menuContainer: {
    borderRadius: borderRadius.md,
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
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: wp(44),
    height: wp(44),
    borderRadius: wp(22),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing[4],
  },
  menuItemText: {
    fontSize: fontSizes.base,
    fontWeight: '500',
    fontFamily: 'Poppins_500Medium',
  },
  logoutSection: {
    paddingHorizontal: spacing[5],
    paddingTop: spacing[2],
  },
  logoutButton: {
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    borderWidth: 1,
    marginTop: spacing[2],
    marginBottom: spacing[2],
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[5],
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  logoutText: {
    fontSize: fontSizes.base,
    fontWeight: '600',
    fontFamily: 'Poppins_600SemiBold',
    marginLeft: spacing[3],
  },
});

export default ProfileScreen;
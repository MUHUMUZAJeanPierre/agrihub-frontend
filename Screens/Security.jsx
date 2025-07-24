import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import Feather from 'react-native-vector-icons/Feather';

const Security = ({ navigation }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { t } = useLanguage();

  const colors = {
    background: isDark ? '#0F1014' : '#FAFBFC',
    surface: isDark ? '#181A20' : '#FFFFFF',
    card: isDark ? '#1E2028' : '#FFFFFF',
    text: isDark ? '#FFFFFF' : '#1A1A1A',
    subText: isDark ? '#A0A0A0' : '#666666',
    border: isDark ? '#2A2D36' : '#E8E8E8',
    accent: '#4BA26A',
    accentLight: isDark ? '#4BA26A20' : '#4BA26A15',
    button: '#4BA26A',
    buttonText: '#FFFFFF',
    icon: isDark ? '#4BA26A' : '#4BA26A',
    shadow: isDark ? '#00000040' : '#00000008',
  };

  const securityItems = [
    {
      icon: 'shield',
      title: t('privacy_policy'),
      description: t('privacy_policy_desc'),
      hasAction: true,
    },
    {
      icon: 'lock',
      title: t('data_protection'),
      description: t('data_protection_desc'),
      hasAction: true,
    },
    {
      icon: 'user-check',
      title: t('account_security'),
      description: t('account_security_desc'),
      hasAction: true,
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}> 
      <StatusBar backgroundColor={colors.background} barStyle={isDark ? 'light-content' : 'dark-content'} />
      
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}> 
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={[styles.backButton, { backgroundColor: colors.accentLight }]}
          accessibilityLabel={t('back_button')}
        >
          <Feather name="arrow-left" size={20} color={colors.icon} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{t('privacy_security')}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView 
        contentContainerStyle={styles.content} 
        showsVerticalScrollIndicator={false}
        style={{ backgroundColor: colors.background }}
      >
        {/* Header Description */}
        <View style={styles.headerSection}>
          <Text style={[styles.headerDescription, { color: colors.subText }]}>
            {t('security_page_description') || 'Manage your privacy settings and security preferences to keep your account safe.'}
          </Text>
        </View>

        {/* Security Items */}
        <View style={styles.itemsContainer}>
          {securityItems.map((item, index) => (
            <TouchableOpacity 
              key={index}
              style={[
                styles.securityItem, 
                { 
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  shadowColor: colors.shadow,
                }
              ]}
              activeOpacity={0.7}
              accessibilityLabel={item.title}
            >
              <View style={[styles.iconContainer, { backgroundColor: colors.accentLight }]}>
                <Feather name={item.icon} size={22} color={colors.accent} />
              </View>
              
              <View style={styles.itemContent}>
                <View style={styles.itemHeader}>
                  <Text style={[styles.itemTitle, { color: colors.text }]}>{item.title}</Text>
                  {item.hasAction && (
                    <Feather name="chevron-right" size={18} color={colors.subText} />
                  )}
                </View>
                <Text style={[styles.itemDescription, { color: colors.subText }]}>
                  {item.description}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={[styles.primaryButton, { backgroundColor: colors.button }]} 
            activeOpacity={0.8} 
            accessibilityLabel={t('view_full_policy')}
          >
            <Feather name="file-text" size={18} color={colors.buttonText} style={styles.buttonIcon} />
            <Text style={[styles.primaryButtonText, { color: colors.buttonText }]}>
              {t('view_full_policy')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.secondaryButton, { borderColor: colors.border }]} 
            activeOpacity={0.7}
            accessibilityLabel={t('export_data') || 'Export My Data'}
          >
            <Feather name="download" size={18} color={colors.accent} style={styles.buttonIcon} />
            <Text style={[styles.secondaryButtonText, { color: colors.accent }]}>
              {t('export_data') || 'Export My Data'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Footer Info */}
        <View style={styles.footerInfo}>
          <Text style={[styles.footerText, { color: colors.subText }]}>
            {t('security_footer') || 'Your privacy and security are our top priorities. We use industry-standard encryption to protect your data.'}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    flex: 1,
    letterSpacing: -0.5,
  },
  content: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  headerSection: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 8,
  },
  headerDescription: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
  itemsContainer: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  securityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  itemContent: {
    flex: 1,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: -0.3,
    flex: 1,
  },
  itemDescription: {
    fontSize: 15,
    lineHeight: 22,
  },
  actionsContainer: {
    paddingHorizontal: 20,
    paddingTop: 32,
    gap: 12,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    paddingVertical: 18,
    shadowColor: '#4BA26A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonIcon: {
    marginRight: 8,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    paddingVertical: 18,
    borderWidth: 1.5,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  footerInfo: {
    paddingHorizontal: 20,
    paddingTop: 32,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
});

export default Security;
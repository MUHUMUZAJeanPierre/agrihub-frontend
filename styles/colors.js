export const Colors = {
  primary: '#4A90E2',
  primaryDark: '#2D5AA0',
  secondary: '#FF6B35',
  accent: '#FFA726',

  background: '#FFFFFF',
  surface: '#F8F9FA', 
  surfaceLight: '#F0F0F0',

  textPrimary: '#000000',
  textSecondary: '#666666',
  textTertiary: '#999999',

  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',

  cardBackground: '#666666',
  inputBackground: '#F5F5F5',
  borderColor: '#E0E0E0',

  gradient: ['#4A90E2', '#357ABD'],
  orangeGradient: ['#FF6B35', '#FF8A50'],
};

export const LightColors = {
  ...Colors,
  cardBackground: '#FFFFFF',
};

export const DarkColors = {
  ...Colors,
  background: '#121212',
  surface: '#1E1E1E',
  surfaceLight: '#2C2C2C',
  textPrimary: '#FFFFFF',
  textSecondary: '#B0B0B0',
  textTertiary: '#808080',
  cardBackground: '#1A1A1A',
  inputBackground: '#2C2C2C',
  borderColor: '#3A3A3A',
};

import { Dimensions, PixelRatio, Platform, StatusBar } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Standard screen dimensions (design reference)
const STANDARD_WIDTH = 375; // iPhone X width
const STANDARD_HEIGHT = 812; // iPhone X height

// Android specific dimensions
const ANDROID_STANDARD_WIDTH = 360; // Common Android device width
const ANDROID_STANDARD_HEIGHT = 640; // Common Android device height

// Get the appropriate standard dimensions based on platform
const getStandardWidth = () => Platform.OS === 'android' ? ANDROID_STANDARD_WIDTH : STANDARD_WIDTH;
const getStandardHeight = () => Platform.OS === 'android' ? ANDROID_STANDARD_HEIGHT : STANDARD_HEIGHT;

// Responsive width calculation
export const wp = (widthPercent) => {
  const standardWidth = getStandardWidth();
  const elemWidth = typeof widthPercent === 'number' ? widthPercent : parseFloat(widthPercent);
  return PixelRatio.roundToNearestPixel((SCREEN_WIDTH * elemWidth) / standardWidth);
};

// Responsive height calculation
export const hp = (heightPercent) => {
  const standardHeight = getStandardHeight();
  const elemHeight = typeof heightPercent === 'number' ? heightPercent : parseFloat(heightPercent);
  return PixelRatio.roundToNearestPixel((SCREEN_HEIGHT * elemHeight) / standardHeight);
};

// Responsive font size
export const fontSize = (size) => {
  const standardWidth = getStandardWidth();
  const scale = SCREEN_WIDTH / standardWidth;
  const newSize = size * scale;
  
  if (Platform.OS === 'android') {
    return Math.round(PixelRatio.roundToNearestPixel(newSize));
  }
  
  return Math.round(newSize);
};

// Responsive padding/margin
export const padding = {
  xs: wp(8),
  sm: wp(12),
  md: wp(16),
  lg: wp(20),
  xl: wp(24),
  xxl: wp(32),
};

export const margin = {
  xs: wp(8),
  sm: wp(12),
  md: wp(16),
  lg: wp(20),
  xl: wp(24),
  xxl: wp(32),
};

// Responsive border radius
export const borderRadius = {
  xs: wp(4),
  sm: wp(8),
  md: wp(12),
  lg: wp(16),
  xl: wp(20),
  xxl: wp(24),
  round: wp(50),
};

// Responsive icon sizes
export const iconSize = {
  xs: wp(12),
  sm: wp(16),
  md: wp(20),
  lg: wp(24),
  xl: wp(28),
  xxl: wp(32),
};

// Screen dimensions
export const screenDimensions = {
  width: SCREEN_WIDTH,
  height: SCREEN_HEIGHT,
  statusBarHeight: StatusBar.currentHeight || 0,
  isSmallDevice: SCREEN_WIDTH < 375,
  isMediumDevice: SCREEN_WIDTH >= 375 && SCREEN_WIDTH < 414,
  isLargeDevice: SCREEN_WIDTH >= 414,
  isTablet: SCREEN_WIDTH >= 768,
};

// Responsive spacing scale
export const spacing = {
  0: 0,
  1: wp(4),
  2: wp(8),
  3: wp(12),
  4: wp(16),
  5: wp(20),
  6: wp(24),
  7: wp(28),
  8: wp(32),
  9: wp(36),
  10: wp(40),
  12: wp(48),
  14: wp(56),
  16: wp(64),
  20: wp(80),
  24: wp(96),
  28: wp(112),
  32: wp(128),
};

// Responsive font sizes
export const fontSizes = {
  xs: fontSize(10),
  sm: fontSize(12),
  base: fontSize(14),
  lg: fontSize(16),
  xl: fontSize(18),
  '2xl': fontSize(20),
  '3xl': fontSize(24),
  '4xl': fontSize(30),
  '5xl': fontSize(36),
  '6xl': fontSize(48),
};

// Responsive line heights
export const lineHeights = {
  xs: fontSize(14),
  sm: fontSize(16),
  base: fontSize(20),
  lg: fontSize(24),
  xl: fontSize(28),
  '2xl': fontSize(32),
  '3xl': fontSize(36),
  '4xl': fontSize(40),
  '5xl': fontSize(44),
  '6xl': fontSize(52),
};

// Device orientation helpers
export const isPortrait = () => SCREEN_HEIGHT > SCREEN_WIDTH;
export const isLandscape = () => SCREEN_WIDTH > SCREEN_HEIGHT;

// Responsive breakpoints
export const breakpoints = {
  phone: 480,
  tablet: 768,
  desktop: 1024,
};

// Check if device matches breakpoint
export const isPhone = () => SCREEN_WIDTH < breakpoints.tablet;
export const isTablet = () => SCREEN_WIDTH >= breakpoints.tablet && SCREEN_WIDTH < breakpoints.desktop;
export const isDesktop = () => SCREEN_WIDTH >= breakpoints.desktop;

// Responsive grid helpers
export const getGridColumns = () => {
  if (isPhone()) return 1;
  if (isTablet()) return 2;
  return 3;
};

// Responsive image dimensions
export const imageDimensions = {
  avatar: {
    small: wp(32),
    medium: wp(48),
    large: wp(64),
    xlarge: wp(80),
  },
  thumbnail: {
    small: wp(60),
    medium: wp(80),
    large: wp(120),
  },
  banner: {
    height: hp(200),
  },
};

// Responsive button dimensions
export const buttonDimensions = {
  small: {
    height: hp(32),
    paddingHorizontal: wp(12),
    borderRadius: wp(16),
  },
  medium: {
    height: hp(40),
    paddingHorizontal: wp(16),
    borderRadius: wp(20),
  },
  large: {
    height: hp(48),
    paddingHorizontal: wp(20),
    borderRadius: wp(24),
  },
};

// Responsive card dimensions
export const cardDimensions = {
  small: {
    padding: wp(12),
    borderRadius: wp(8),
    margin: wp(8),
  },
  medium: {
    padding: wp(16),
    borderRadius: wp(12),
    margin: wp(12),
  },
  large: {
    padding: wp(20),
    borderRadius: wp(16),
    margin: wp(16),
  },
};

// Responsive modal dimensions
export const modalDimensions = {
  small: {
    width: wp(280),
    maxHeight: hp(400),
  },
  medium: {
    width: wp(320),
    maxHeight: hp(500),
  },
  large: {
    width: wp(360),
    maxHeight: hp(600),
  },
};

// Utility function to get responsive value based on screen size
export const getResponsiveValue = (phoneValue, tabletValue, desktopValue) => {
  if (isPhone()) return phoneValue;
  if (isTablet()) return tabletValue;
  return desktopValue;
};

// Utility function to create responsive styles
export const createResponsiveStyle = (styles) => {
  return Object.keys(styles).reduce((acc, key) => {
    const value = styles[key];
    if (typeof value === 'number') {
      acc[key] = wp(value);
    } else if (typeof value === 'object' && value !== null) {
      acc[key] = createResponsiveStyle(value);
    } else {
      acc[key] = value;
    }
    return acc;
  }, {});
};

// Export all utilities
export default {
  wp,
  hp,
  fontSize,
  padding,
  margin,
  borderRadius,
  iconSize,
  screenDimensions,
  spacing,
  fontSizes,
  lineHeights,
  isPortrait,
  isLandscape,
  breakpoints,
  isPhone,
  isTablet,
  isDesktop,
  getGridColumns,
  imageDimensions,
  buttonDimensions,
  cardDimensions,
  modalDimensions,
  getResponsiveValue,
  createResponsiveStyle,
}; 
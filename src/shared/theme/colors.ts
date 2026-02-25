export const Colors = {
  // Primary palette
  primary: '#4F8EF7',
  primaryDark: '#2D6FD4',
  primaryLight: '#E8F0FE',

  // Secondary
  secondary: '#7C5CBF',
  secondaryLight: '#F0EBFF',

  // Semantic colors
  success: '#34C759',
  successLight: '#E8FBF0',
  warning: '#FF9500',
  warningLight: '#FFF8E7',
  danger: '#FF3B30',
  dangerLight: '#FFE8E7',
  info: '#5AC8FA',
  infoLight: '#E8F7FF',

  // Glucose levels
  glucoseLow: '#FF3B30',
  glucoseNormal: '#34C759',
  glucoseHigh: '#FF9500',
  glucoseVeryHigh: '#FF3B30',

  // Gradients
  gradients: {
    primary: ['#4F8EF7', '#6C63FF'] as readonly [string, string],
    secondary: ['#7C5CBF', '#9B6FE3'] as readonly [string, string],
    success: ['#34C759', '#30D158'] as readonly [string, string],
    danger: ['#FF3B30', '#FF6259'] as readonly [string, string],
    warm: ['#FF9500', '#FFB340'] as readonly [string, string],
    header: ['#4F8EF7', '#6366F1'] as readonly [string, string],
    headerDark: ['#1C1C2E', '#2D2D44'] as readonly [string, string],
  },

  // Light theme
  light: {
    background: '#F8F9FA',
    surface: '#FFFFFF',
    surfaceSecondary: '#F2F2F7',
    border: '#E5E5EA',
    divider: '#F2F2F7',
    text: '#1C1C1E',
    textSecondary: '#6D6D72',
    textTertiary: '#AEAEB2',
    placeholder: '#C7C7CC',
    shadow: 'rgba(0, 0, 0, 0.1)',
    overlay: 'rgba(0, 0, 0, 0.5)',
    card: '#FFFFFF',
    tabBar: '#FFFFFF',
    header: '#FFFFFF',
    statusBar: 'dark-content',
  },

  // Dark theme
  dark: {
    background: '#000000',
    surface: '#1C1C1E',
    surfaceSecondary: '#2C2C2E',
    border: '#38383A',
    divider: '#2C2C2E',
    text: '#FFFFFF',
    textSecondary: '#EBEBF5CC',
    textTertiary: '#EBEBF560',
    placeholder: '#48484A',
    shadow: 'rgba(0, 0, 0, 0.3)',
    overlay: 'rgba(0, 0, 0, 0.7)',
    card: '#1C1C1E',
    tabBar: '#1C1C1E',
    header: '#1C1C1E',
    statusBar: 'light-content',
  },
} as const;

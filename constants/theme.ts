// constants/theme.ts
// INGRYN Design System — Single source of truth for all UI tokens

// ─── Colors ───────────────────────────────────────────────────────────────────
export const Colors = {
  // Primary
  primary: '#22C55E',
  primaryDark: '#16A34A',
  primaryLight: '#DCFCE7',
  primarySubtle: '#F0FDF4',

  // Backgrounds
  background: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceSecondary: '#F1F5F9',
  surfaceTertiary: '#E8F5EE',

  // Text
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  textInverse: '#FFFFFF',

  // Semantic
  success: '#10B981',
  successLight: '#D1FAE5',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  danger: '#EF4444',
  dangerLight: '#FEE2E2',
  info: '#3B82F6',
  infoLight: '#DBEAFE',

  // Safety levels
  safe: '#10B981',
  safeLight: '#D1FAE5',
  caution: '#F59E0B',
  cautionLight: '#FEF3C7',
  harmful: '#EF4444',
  harmfulLight: '#FEE2E2',
  unknown: '#9CA3AF',
  unknownLight: '#F3F4F6',

  // Personal flag (dietary)
  personal: '#8B5CF6',
  personalLight: '#EDE9FE',

  // Borders
  border: '#E5E7EB',
  borderStrong: '#D1D5DB',
  borderSubtle: '#F3F4F6',

  // Country status
  permitted: '#10B981',
  permittedLight: '#D1FAE5',
  permittedLimits: '#F59E0B',
  permittedLimitsLight: '#FEF3C7',
  banned: '#EF4444',
  bannedLight: '#FEE2E2',
  underReview: '#8B5CF6',
  underReviewLight: '#EDE9FE',
  noData: '#9CA3AF',
  noDataLight: '#F3F4F6',
}

// ─── Typography ───────────────────────────────────────────────────────────────
export const Fonts = {
  thin: 'PlusJakartaSans_200ExtraLight',
  light: 'PlusJakartaSans_300Light',
  regular: 'PlusJakartaSans_400Regular',
  medium: 'PlusJakartaSans_500Medium',
  semibold: 'PlusJakartaSans_600SemiBold',
  bold: 'PlusJakartaSans_700Bold',
  extrabold: 'PlusJakartaSans_800ExtraBold',
  // Italics
  regularItalic: 'PlusJakartaSans_400Regular_Italic',
  mediumItalic: 'PlusJakartaSans_500Medium_Italic',
  boldItalic: 'PlusJakartaSans_700Bold_Italic',
}

export const FontSizes = {
  xs: 11,
  sm: 12,
  base: 14,
  md: 15,
  lg: 16,
  xl: 18,
  '2xl': 20,
  '3xl': 24,
  '4xl': 28,
  '5xl': 32,
  '6xl': 36,
  '7xl': 42,
}

// ─── Spacing ──────────────────────────────────────────────────────────────────
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
  '6xl': 64,
}

// ─── Border Radius ────────────────────────────────────────────────────────────
export const Radius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 18,
  '2xl': 24,
  '3xl': 32,
  full: 9999,
}

// ─── Shadows ──────────────────────────────────────────────────────────────────
export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  primary: {
    shadowColor: '#22C55E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 4,
  },
  danger: {
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
}

// ─── Safety config helpers ────────────────────────────────────────────────────
export const SafetyConfig = {
  safe: {
    label: 'Safe',
    color: Colors.safe,
    bg: Colors.safeLight,
    icon: '✓',
  },
  caution: {
    label: 'Caution',
    color: Colors.caution,
    bg: Colors.cautionLight,
    icon: '!',
  },
  harmful: {
    label: 'Harmful',
    color: Colors.harmful,
    bg: Colors.harmfulLight,
    icon: '✕',
  },
  unknown: {
    label: 'Unknown',
    color: Colors.unknown,
    bg: Colors.unknownLight,
    icon: '?',
  },
}

export const CountryStatusConfig = {
  permitted: {
    label: 'Permitted',
    color: Colors.permitted,
    bg: Colors.permittedLight,
  },
  permitted_with_limits: {
    label: 'Limited',
    color: Colors.permittedLimits,
    bg: Colors.permittedLimitsLight,
  },
  banned: {
    label: 'Banned',
    color: Colors.banned,
    bg: Colors.bannedLight,
  },
  under_review: {
    label: 'Under Review',
    color: Colors.underReview,
    bg: Colors.underReviewLight,
  },
  no_data: {
    label: 'No Data',
    color: Colors.noData,
    bg: Colors.noDataLight,
  },
}
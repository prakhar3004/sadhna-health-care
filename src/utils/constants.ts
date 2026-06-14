// Sadhna Health Care — Design Tokens & Constants

export const APP_NAME = 'Sadhna Health Care';
export const APP_TAGLINE = 'Connecting Care, Empowering Health';

// ─── Color Palette ────────────────────────────────────────────
export const Colors = {
  light: {
    primary: '#0D9488', // Healing Teal
    primaryLight: '#14B8A6',
    primaryDark: '#0F766E',
    primaryFaded: 'rgba(13, 148, 136, 0.08)',
    secondary: '#FF5A79', // Sunset Rose / Vitality
    secondaryLight: '#FFA6B9',
    secondaryFaded: 'rgba(255, 90, 121, 0.08)',
    accent: '#F97316', // Sunrise Orange / Optimism
    accentLight: '#FB923C',
    accentFaded: 'rgba(249, 115, 22, 0.08)',
    success: '#10B981', // Vibrant Emerald
    successFaded: 'rgba(16, 185, 129, 0.08)',
    warning: '#FB923C',
    error: '#EF4444',
    errorFaded: 'rgba(239, 68, 68, 0.08)',

    // Surfaces (Comforting, non-sterile warm tones)
    background: '#FDFBF7', // Warm Ivory
    surface: '#FFFFFF',
    surfaceElevated: '#FFFFFF',
    surfaceSecondary: '#FAF6F0', // Warm Cream

    // Text (Softer slate blue instead of stark dark)
    text: '#1A2238',
    textSecondary: '#4A5568',
    textTertiary: '#8A95A5',
    textInverse: '#FFFFFF',

    // Borders
    border: '#F1ECE4',
    borderLight: '#FAF6F0',
    divider: '#F1ECE4',

    // Tab bar
    tabIconDefault: '#8A95A5',
    tabIconSelected: '#0D9488',

    // Shadows
    shadow: 'rgba(74, 85, 104, 0.04)',
    shadowMedium: 'rgba(74, 85, 104, 0.08)',
  },
  dark: {
    primary: '#14B8A6', // Mint Teal
    primaryLight: '#2DD4BF',
    primaryDark: '#0D9488',
    primaryFaded: 'rgba(20, 184, 166, 0.15)',
    secondary: '#FFA6B9', // Soft Sunset Rose
    secondaryLight: '#FFC0CB',
    secondaryFaded: 'rgba(255, 166, 185, 0.15)',
    accent: '#FB923C', // Soft Sunrise Orange
    accentLight: '#FDBA74',
    accentFaded: 'rgba(251, 146, 60, 0.15)',
    success: '#34D399',
    successFaded: 'rgba(52, 211, 153, 0.15)',
    warning: '#FB923C',
    error: '#F87171',
    errorFaded: 'rgba(248, 113, 113, 0.15)',

    // Surfaces (Cosmic calming dark tones)
    background: '#0B132B', // Cosmic Midnight
    surface: '#1C2541', // Deep Slate Blue
    surfaceElevated: '#222E50',
    surfaceSecondary: '#131B32',

    // Text
    text: '#F0F4F8',
    textSecondary: '#98A6C3',
    textTertiary: '#6B7D9E',
    textInverse: '#0B132B',

    // Borders
    border: '#2E3A5F',
    borderLight: '#1D2747',
    divider: '#2E3A5F',

    // Tab bar
    tabIconDefault: '#6B7D9E',
    tabIconSelected: '#14B8A6',

    // Shadows
    shadow: 'rgba(0, 0, 0, 0.25)',
    shadowMedium: 'rgba(0, 0, 0, 0.4)',
  },
};

// ─── Role Configuration ───────────────────────────────────────
export type UserRole = 'doctor' | 'caregiver' | 'patient';

export const RoleConfig: Record<UserRole, {
  label: string;
  icon: string;
  color: string;
  lightColor: string;
  fadedColor: string;
  emoji: string;
  description: string;
}> = {
  doctor: {
    label: 'Doctor',
    icon: 'medkit',
    color: '#6366F1',
    lightColor: '#818CF8',
    fadedColor: 'rgba(99, 102, 241, 0.1)',
    emoji: '🩺',
    description: 'Medical Professional',
  },
  caregiver: {
    label: 'Caregiver',
    icon: 'heart',
    color: '#F59E0B',
    lightColor: '#FBBF24',
    fadedColor: 'rgba(245, 158, 11, 0.1)',
    emoji: '💛',
    description: 'Care Provider',
  },
  patient: {
    label: 'Patient',
    icon: 'person',
    color: '#0D9488',
    lightColor: '#14B8A6',
    fadedColor: 'rgba(13, 148, 136, 0.1)',
    emoji: '🟢',
    description: 'Health Seeker',
  },
};

// ─── Post Types ───────────────────────────────────────────────
export type PostType =
  | 'daily_win'
  | 'recovery_story'
  | 'question'
  | 'mood_checkin'
  | 'health_update'
  | 'milestone'
  | 'doctor_tip'
  | 'awareness'
  | 'caregiver_insight'
  | 'event_ama'
  | 'repost';

export const PostTypeConfig: Record<PostType, {
  label: string;
  icon: string;
  color: string;
  emoji: string;
  allowedRoles: ('doctor' | 'caregiver' | 'patient')[];
  description: string;
}> = {
  repost: {
    label: 'Repost',
    icon: 'repeat-outline',
    color: '#10B981',
    emoji: '🔁',
    allowedRoles: ['doctor', 'caregiver', 'patient'],
    description: 'Shared post from another user',
  },
  daily_win: {
    label: 'Daily Win',
    icon: 'checkmark-circle-outline',
    color: '#10B981',
    emoji: '✅',
    allowedRoles: ['patient'],
    description: '"Aaj medicine li", "Walk kiya" — chhoti jeet',
  },
  recovery_story: {
    label: 'Recovery Story',
    icon: 'book-outline',
    color: '#8B5CF6',
    emoji: '📖',
    allowedRoles: ['patient'],
    description: 'Poori journey — long-form inspirational',
  },
  question: {
    label: 'Question',
    icon: 'help-circle-outline',
    color: '#0D9488',
    emoji: '❓',
    allowedRoles: ['doctor', 'caregiver', 'patient'],
    description: 'Community se kuch poochna ho tab',
  },
  mood_checkin: {
    label: 'Mood Check-in',
    icon: 'happy-outline',
    color: '#EC4899',
    emoji: '😊',
    allowedRoles: ['patient'],
    description: 'Aaj kaisa feel ho raha hai',
  },
  health_update: {
    label: 'Health Update',
    icon: 'pulse-outline',
    color: '#3B82F6',
    emoji: '💊',
    allowedRoles: ['patient'],
    description: 'Test results, doctor visit update',
  },
  milestone: {
    label: 'Milestone',
    icon: 'trophy-outline',
    color: '#F59E0B',
    emoji: '🎯',
    allowedRoles: ['patient'],
    description: '"6 mahine cancer-free!" celebrate karo',
  },
  doctor_tip: {
    label: 'Doctor Tip',
    icon: 'medkit-outline',
    color: '#6366F1',
    emoji: '🩺',
    allowedRoles: ['doctor'],
    description: 'Medical awareness, myth-busting',
  },
  awareness: {
    label: 'Awareness Post',
    icon: 'megaphone-outline',
    color: '#EF4444',
    emoji: '📢',
    allowedRoles: ['doctor'],
    description: 'Research news, disease awareness',
  },
  caregiver_insight: {
    label: 'Caregiver Insight',
    icon: 'heart-outline',
    color: '#F97316',
    emoji: '🧡',
    allowedRoles: ['caregiver'],
    description: 'Care tips, family support advice',
  },
  event_ama: {
    label: 'Event / AMA',
    icon: 'calendar-outline',
    color: '#06B6D4',
    emoji: '📅',
    allowedRoles: ['doctor', 'caregiver', 'patient'],
    description: 'Live session, webinar announce karo',
  },
};

// ─── Reactions ────────────────────────────────────────────────
export type ReactionType = 'himmat' | 'support' | 'celebrate' | 'helpful' | 'love';

export const ReactionConfig: Record<ReactionType, {
  label: string;
  emoji: string;
  color: string;
  description: string;
}> = {
  himmat: {
    label: 'Himmat',
    emoji: '💪',
    color: '#3B82F6',
    description: 'Strength, courage posts ke liye',
  },
  support: {
    label: 'Support',
    emoji: '🙏',
    color: '#10B981',
    description: '"Main tumhare saath hoon"',
  },
  celebrate: {
    label: 'Celebrate',
    emoji: '🎉',
    color: '#F59E0B',
    description: 'Milestones, achievements ke liye',
  },
  helpful: {
    label: 'Helpful',
    emoji: '💡',
    color: '#FCD34D',
    description: 'Doctor tips, useful information',
  },
  love: {
    label: 'Love',
    emoji: '❤️',
    color: '#EF4444',
    description: 'Pure emotional support',
  },
};


// ─── Spacing ──────────────────────────────────────────────────
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
};

// ─── Border Radius ────────────────────────────────────────────
export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  full: 9999,
};

// ─── Font Sizes ───────────────────────────────────────────────
export const FontSize = {
  xs: 11,
  sm: 13,
  base: 15,
  md: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 28,
  '4xl': 34,
};

// ─── Font Weights ─────────────────────────────────────────────
export const FontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
};

// ─── Specializations ─────────────────────────────────────────
export const SPECIALIZATIONS = [
  'General Physician',
  'Cardiology',
  'Dermatology',
  'Endocrinology',
  'Gastroenterology',
  'Neurology',
  'Oncology',
  'Ophthalmology',
  'Orthopedics',
  'Pediatrics',
  'Psychiatry',
  'Pulmonology',
  'Radiology',
  'Surgery',
  'Urology',
  'Ayurveda',
  'Homeopathy',
  'Dentistry',
  'ENT',
  'Gynecology',
];

// Sadhna Health Care — Theme Hook
import { useColorScheme as useRNColorScheme } from 'react-native';
import { Colors } from '@/src/utils/constants';

export function useThemeColors() {
  const scheme = useRNColorScheme();
  const colorScheme = scheme === 'dark' ? 'dark' : 'light';
  return Colors[colorScheme];
}

export function useColorScheme() {
  return useRNColorScheme() ?? 'light';
}

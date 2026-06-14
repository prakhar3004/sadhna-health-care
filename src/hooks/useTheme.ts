// Sadhna Health Care — Theme Hook
//
// The app is intentionally LIGHT-ONLY: a warm, hopeful "Aasha" palette designed
// to uplift chronic-care patients. We deliberately ignore the OS dark mode so
// the experience never turns into a heavy/gloomy dark screen. (A future in-app
// theme toggle can re-enable Colors.dark.)
import { Colors } from '@/src/utils/constants';

export function useThemeColors() {
  return Colors.light;
}

export function useColorScheme(): 'light' | 'dark' {
  return 'light';
}

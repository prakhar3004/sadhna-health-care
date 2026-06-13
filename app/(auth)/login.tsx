// Sadhna Health Care — Login Screen
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Input } from '@/src/components/ui/Input';
import { Button } from '@/src/components/ui/Button';
import { useThemeColors } from '@/src/hooks/useTheme';
import { useAuthStore } from '@/src/store/authStore';
import { useLanguageStore } from '@/src/store/languageStore';
import { LanguagePicker } from '@/src/components/ui/LanguagePicker';
import { FontSize, Spacing, Radius } from '@/src/utils/constants';
import { isValidEmail } from '@/src/utils/helpers';

const { width } = Dimensions.get('window');

export default function LoginScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const { login, isLoading } = useAuthStore();
  const t = useLanguageStore((state) => state.t);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!email.trim()) newErrors.email = 'Email is required';
    else if (!isValidEmail(email)) newErrors.email = 'Enter a valid email';
    if (!password.trim()) newErrors.password = 'Password is required';
    else if (password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    await login(email, password);
    router.replace('/(tabs)');
  };

  const handleQuickLogin = async (role: string) => {
    const emails: Record<string, string> = {
      doctor: 'doctor@test.com',
      caregiver: 'caregiver@test.com',
      patient: 'patient@test.com',
    };
    await login(emails[role], 'password');
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Reusable Horizontal Language Selector */}
          <View style={styles.languagePickerWrapper}>
            <LanguagePicker />
          </View>

          {/* Hero Section */}
          <View style={styles.hero}>
            <View style={[styles.logoContainer, { backgroundColor: colors.primaryFaded }]}>
              <Ionicons name="medical" size={40} color={colors.primary} />
            </View>
            <Text style={[styles.appName, { color: colors.text }]}>{t('app_name')}</Text>
            <Text style={[styles.tagline, { color: colors.textSecondary }]}>{t('login_subtitle')}</Text>
          </View>

          {/* Login Form */}
          <View style={[styles.formCard, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
            <Text style={[styles.formTitle, { color: colors.text }]}>{t('login_title')}</Text>
            <Text style={[styles.formSubtitle, { color: colors.textSecondary }]}>
              {t('login_subtitle')}
            </Text>

            <Input
              label={t('email_label')}
              placeholder={t('email_placeholder')}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              icon="mail-outline"
              error={errors.email}
              autoCapitalize="none"
            />

            <Input
              label={t('password_label')}
              placeholder={t('password_placeholder')}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              icon="lock-closed-outline"
              error={errors.password}
            />

            <TouchableOpacity style={styles.forgotPassword}>
              <Text style={[styles.forgotPasswordText, { color: colors.primary }]}>
                {t('forgot_password')}
              </Text>
            </TouchableOpacity>

            <Button
              title={t('sign_in_btn')}
              onPress={handleLogin}
              loading={isLoading}
              fullWidth
              size="lg"
              icon="log-in-outline"
            />

            <View style={styles.registerRow}>
              <Text style={[styles.registerText, { color: colors.textSecondary }]}>
                {t('no_account')}
              </Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
                <Text style={[styles.registerLink, { color: colors.primary }]}>{t('sign_up_link')}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Quick Login for Demo */}
          <View style={[styles.quickLoginSection]}>
            <Text style={[styles.quickLoginTitle, { color: colors.textTertiary }]}>
              ── Quick Demo Login ──
            </Text>
            <View style={styles.quickLoginButtons}>
              <TouchableOpacity
                style={[styles.quickLoginBtn, { backgroundColor: '#6366F1' + '15', borderColor: '#6366F1' + '30' }]}
                onPress={() => handleQuickLogin('doctor')}
              >
                <Ionicons name="medkit" size={20} color="#6366F1" />
                <Text style={[styles.quickLoginBtnText, { color: '#6366F1' }]}>Doctor</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.quickLoginBtn, { backgroundColor: '#F59E0B' + '15', borderColor: '#F59E0B' + '30' }]}
                onPress={() => handleQuickLogin('caregiver')}
              >
                <Ionicons name="heart" size={20} color="#F59E0B" />
                <Text style={[styles.quickLoginBtnText, { color: '#F59E0B' }]}>Caregiver</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.quickLoginBtn, { backgroundColor: '#0D9488' + '15', borderColor: '#0D9488' + '30' }]}
                onPress={() => handleQuickLogin('patient')}
              >
                <Ionicons name="person" size={20} color="#0D9488" />
                <Text style={[styles.quickLoginBtnText, { color: '#0D9488' }]}>Patient</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  languagePickerWrapper: {
    marginTop: Spacing.md,
    alignSelf: 'stretch',
    alignItems: 'center',
    zIndex: 100,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing['3xl'],
  },
  hero: {
    alignItems: 'center',
    marginTop: Spacing['3xl'],
    marginBottom: Spacing['2xl'],
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.base,
  },
  appName: {
    fontSize: FontSize['3xl'],
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: FontSize.base,
    marginTop: 4,
  },
  formCard: {
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    borderWidth: 1,
    shadowColor: 'rgba(0,0,0,0.06)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 4,
  },
  formTitle: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    marginBottom: 4,
  },
  formSubtitle: {
    fontSize: FontSize.sm,
    marginBottom: Spacing.lg,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: Spacing.lg,
    marginTop: -Spacing.sm,
  },
  forgotPasswordText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Spacing.lg,
  },
  registerText: {
    fontSize: FontSize.sm,
  },
  registerLink: {
    fontSize: FontSize.sm,
    fontWeight: '700',
  },
  quickLoginSection: {
    marginTop: Spacing['2xl'],
    alignItems: 'center',
  },
  quickLoginTitle: {
    fontSize: FontSize.xs,
    fontWeight: '500',
    marginBottom: Spacing.md,
    letterSpacing: 1,
  },
  quickLoginButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  quickLoginBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.md,
    borderWidth: 1,
    gap: 6,
  },
  quickLoginBtnText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
});

// Sadhna Health Care — Register Screen
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
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
import { UserRole, RoleConfig, FontSize, Spacing, Radius } from '@/src/utils/constants';
import { isValidEmail, isValidPassword } from '@/src/utils/helpers';

export default function RegisterScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const { register, isLoading } = useAuthStore();
  const t = useLanguageStore((state) => state.t);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!email.trim()) newErrors.email = 'Email is required';
    else if (!isValidEmail(email)) newErrors.email = 'Enter a valid email';
    if (!password.trim()) newErrors.password = 'Password is required';
    else {
      const passCheck = isValidPassword(password);
      if (!passCheck.valid) newErrors.password = passCheck.message;
    }
    if (!selectedRole) newErrors.role = 'Please select your role';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validate() || !selectedRole) return;
    try {
      await register(email, password, fullName, selectedRole);
      // Only proceed to onboarding once a real session exists (register throws otherwise).
      router.replace('/(auth)/profile-setup');
    } catch (err: any) {
      Alert.alert('Sign up failed', err?.message || 'Could not create your account. Please try again.');
    }
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
          {/* Header Row */}
          <View style={styles.headerRow}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
            <View style={styles.pickerContainer}>
              <LanguagePicker />
            </View>
          </View>

          <Text style={[styles.title, { color: colors.text }]}>{t('register_title')}</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {t('register_subtitle')}
          </Text>

          {/* Role Selection */}
          <Text style={[styles.sectionLabel, { color: colors.text }]}>{t('i_am_a')}</Text>
          <View style={styles.roleGrid}>
            {(Object.keys(RoleConfig) as UserRole[]).filter((role) => role !== 'admin').map((role) => {
              const config = RoleConfig[role];
              const isSelected = selectedRole === role;
              return (
                <TouchableOpacity
                  key={role}
                  style={[
                    styles.roleCard,
                    {
                      backgroundColor: isSelected ? config.fadedColor : colors.surfaceSecondary,
                      borderColor: isSelected ? config.color : colors.border,
                      borderWidth: isSelected ? 2 : 1,
                    },
                  ]}
                  onPress={() => setSelectedRole(role)}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.roleIconContainer,
                      { backgroundColor: isSelected ? config.color + '20' : colors.surface },
                    ]}
                  >
                    <Ionicons
                      name={config.icon as any}
                      size={28}
                      color={isSelected ? config.color : colors.textTertiary}
                    />
                  </View>
                  <Text
                    style={[
                      styles.roleLabel,
                      { color: isSelected ? config.color : colors.text },
                    ]}
                  >
                    {t(`${role}_label`)}
                  </Text>
                  <Text style={[styles.roleDesc, { color: colors.textTertiary }]}>
                    {t(`${role}_desc`)}
                  </Text>
                  {isSelected && (
                    <View style={[styles.selectedCheck, { backgroundColor: config.color }]}>
                      <Ionicons name="checkmark" size={14} color="#FFF" />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
          {errors.role && (
            <Text style={[styles.errorText, { color: colors.error }]}>{errors.role}</Text>
          )}

          {/* Form */}
          <View style={styles.form}>
            <Input
              label={t('full_name_label')}
              placeholder={t('full_name_placeholder')}
              value={fullName}
              onChangeText={setFullName}
              icon="person-outline"
              error={errors.fullName}
              autoCapitalize="words"
            />

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

            <Button
              title={t('create_account_btn')}
              onPress={handleRegister}
              loading={isLoading}
              fullWidth
              size="lg"
              icon="person-add-outline"
              style={{ marginTop: Spacing.md }}
            />

            <View style={styles.loginRow}>
              <Text style={[styles.loginText, { color: colors.textSecondary }]}>
                {t('already_have_account')}
              </Text>
              <TouchableOpacity onPress={() => router.back()}>
                <Text style={[styles.loginLink, { color: colors.primary }]}>{t('sign_in_link')}</Text>
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.sm,
    marginBottom: Spacing.sm,
    gap: Spacing.md,
  },
  pickerContainer: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing['3xl'],
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: FontSize['3xl'],
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: FontSize.base,
    marginTop: 4,
    marginBottom: Spacing.xl,
  },
  sectionLabel: {
    fontSize: FontSize.md,
    fontWeight: '600',
    marginBottom: Spacing.md,
  },
  roleGrid: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  roleCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radius.lg,
    position: 'relative',
  },
  roleIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  roleLabel: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    marginBottom: 2,
  },
  roleDesc: {
    fontSize: 10,
    textAlign: 'center',
  },
  selectedCheck: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: FontSize.xs,
    marginTop: 4,
    marginLeft: 4,
  },
  form: {
    marginTop: Spacing.xl,
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Spacing.lg,
  },
  loginText: {
    fontSize: FontSize.sm,
  },
  loginLink: {
    fontSize: FontSize.sm,
    fontWeight: '700',
  },
});

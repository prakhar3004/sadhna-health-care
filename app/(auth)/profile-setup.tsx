// Sadhna Health Care — Profile Setup Screen
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
import { Card } from '@/src/components/ui/Card';
import { Avatar } from '@/src/components/ui/Avatar';
import { RoleBadge } from '@/src/components/ui/RoleBadge';
import { useThemeColors } from '@/src/hooks/useTheme';
import { useAuthStore } from '@/src/store/authStore';
import { useLanguageStore } from '@/src/store/languageStore';
import { LanguagePicker } from '@/src/components/ui/LanguagePicker';
import { Profile } from '@/src/types';
import { SPECIALIZATIONS, FontSize, Spacing, Radius } from '@/src/utils/constants';

export default function ProfileSetupScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const { user, completeProfile, isLoading } = useAuthStore();
  const t = useLanguageStore((state) => state.t);

  // Common State
  const [bio, setBio] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Doctor Specific State
  const [specialization, setSpecialization] = useState(SPECIALIZATIONS[0]);
  const [licenseNumber, setLicenseNumber] = useState('');
  const [experienceYears, setExperienceYears] = useState('');
  const [docUploaded, setDocUploaded] = useState(false);
  const [docName, setDocName] = useState('');
  const [showSpecDropdown, setShowSpecDropdown] = useState(false);

  // Caregiver Specific State
  const [caregiverType, setCaregiverType] = useState<'family' | 'professional'>('family');
  const [relationToPatient, setRelationToPatient] = useState('');
  const [associatedPatientUsername, setAssociatedPatientUsername] = useState('');

  // Patient Specific State
  const [patientIdCard, setPatientIdCard] = useState('');
  const [chronicCondition, setChronicCondition] = useState('');
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');

  if (!user) return null;

  const handleDocUpload = () => {
    // Simulate uploading a verification file
    setDocUploaded(true);
    if (user.role === 'doctor') {
      setDocName('medical_license_certificate.pdf');
    } else {
      setDocName('nursing_license_reg.pdf');
    }
    Alert.alert('Verification Document', 'License certificate uploaded successfully!');
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (phone.length < 10) {
      newErrors.phone = 'Enter a valid phone number';
    }

    if (user.role === 'doctor') {
      if (!licenseNumber.trim()) newErrors.licenseNumber = 'Medical license number is required';
      if (!experienceYears.trim()) newErrors.experienceYears = 'Experience is required';
      if (!location.trim()) newErrors.location = 'Hospital/clinic city is required';
      if (!docUploaded) newErrors.docUpload = 'Verification document is required to verify your profile';
    }

    if (user.role === 'caregiver') {
      if (!location.trim()) newErrors.location = 'Service city/area is required';
      if (caregiverType === 'professional') {
        if (!licenseNumber.trim()) newErrors.licenseNumber = 'Nursing license / register ID is required';
        if (!experienceYears.trim()) newErrors.experienceYears = 'Experience is required';
        if (!docUploaded) newErrors.docUpload = 'Professional license certificate is required';
      } else {
        if (!relationToPatient.trim()) newErrors.relation = 'Relation to patient is required (e.g. Spouse, Son)';
        if (!associatedPatientUsername.trim()) newErrors.patientUser = 'Patient username is required for linking care circles';
      }
    }

    if (user.role === 'patient') {
      if (!patientIdCard.trim()) newErrors.patientId = 'Government ID / Patient Registration ID is required';
      if (!chronicCondition.trim()) newErrors.condition = 'Associated chronic health condition is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      Alert.alert('Incomplete Profile', 'Please fill in all required verification fields.');
      return;
    }

    let profileDetails: Partial<Profile> = {
      bio: bio.trim(),
      phone: phone.trim(),
      location: location.trim(),
    };

    if (user.role === 'doctor') {
      profileDetails = {
        ...profileDetails,
        license_number: licenseNumber.trim(),
        specialization: specialization,
        experience_years: parseInt(experienceYears) || 0,
      };
    } else if (user.role === 'caregiver') {
      profileDetails = {
        ...profileDetails,
        caregiver_type: caregiverType,
        license_number: caregiverType === 'professional' ? licenseNumber.trim() : null,
        experience_years: caregiverType === 'professional' ? (parseInt(experienceYears) || 0) : null,
        relation_to_patient: caregiverType === 'family' ? relationToPatient.trim() : null,
        associated_patient_username: caregiverType === 'family' ? associatedPatientUsername.trim() : null,
      };
    } else if (user.role === 'patient') {
      profileDetails = {
        ...profileDetails,
        patient_id_card_number: patientIdCard.trim(),
        bio: `${chronicCondition.trim()} manager. ${bio.trim()}`,
      };
    }

    try {
      await completeProfile(profileDetails);
      Alert.alert('Profile Setup Complete! 🎉', 'Your profile setup has been completed successfully.', [
        { text: 'Enter App', onPress: () => router.replace('/(tabs)') },
      ]);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Something went wrong.');
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
          {/* Reusable Horizontal Language Selector */}
          <View style={styles.languagePickerWrapper}>
            <LanguagePicker />
          </View>

          {/* Header */}
          <Text style={[styles.title, { color: colors.text }]}>{t('complete_profile_title')}</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {t('complete_profile_sub')}
          </Text>

          {/* User Badge Card */}
          <Card style={[styles.userCard, { backgroundColor: colors.surface }]}>
            <View style={styles.userRow}>
              <Avatar uri={user.avatar_url} name={user.full_name} size={60} />
              <View style={styles.userInfo}>
                <Text style={[styles.fullName, { color: colors.text }]}>{user.full_name}</Text>
                <View style={styles.badgeRow}>
                  <RoleBadge role={user.role} size="md" />
                </View>
              </View>
            </View>
          </Card>

          {/* Adaptation Forms */}
          <View style={styles.form}>
            {/* 🩺 DOCTOR PROFILE FORM */}
            {user.role === 'doctor' && (
              <View style={styles.roleForm}>
                <Text style={[styles.roleHeading, { color: colors.primary }]}>
                  {t('doctor_label')} Verification Details
                </Text>

                {/* Specialization Picker */}
                <Text style={[styles.fieldLabel, { color: colors.text }]}>Specialization</Text>
                <TouchableOpacity
                  style={[styles.dropdownBtn, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}
                  onPress={() => setShowSpecDropdown(!showSpecDropdown)}
                >
                  <Text style={[styles.dropdownText, { color: colors.text }]}>{specialization}</Text>
                  <Ionicons name={showSpecDropdown ? 'chevron-up' : 'chevron-down'} size={18} color={colors.textSecondary} />
                </TouchableOpacity>

                {showSpecDropdown && (
                  <View style={[styles.dropdownList, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <ScrollView style={{ maxHeight: 180 }} nestedScrollEnabled>
                      {SPECIALIZATIONS.map((spec) => (
                        <TouchableOpacity
                           key={spec}
                           style={[styles.dropdownItem, specialization === spec && { backgroundColor: colors.surfaceSecondary }]}
                           onPress={() => {
                             setSpecialization(spec);
                             setShowSpecDropdown(false);
                           }}
                        >
                          <Text style={[styles.dropdownItemText, { color: colors.text }]}>{spec}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}

                <Input
                  label={t('license_label')}
                  placeholder={t('license_placeholder')}
                  value={licenseNumber}
                  onChangeText={setLicenseNumber}
                  icon="ribbon-outline"
                  error={errors.licenseNumber}
                />

                <Input
                  label={t('experience_label')}
                  placeholder={t('experience_placeholder')}
                  value={experienceYears}
                  onChangeText={setExperienceYears}
                  keyboardType="numeric"
                  icon="briefcase-outline"
                  error={errors.experienceYears}
                />

                <Input
                  label={t('location_label')}
                  placeholder={t('location_placeholder')}
                  value={location}
                  onChangeText={setLocation}
                  icon="location-outline"
                  error={errors.location}
                />

                {/* Verification Doc Upload */}
                <Text style={[styles.fieldLabel, { color: colors.text }]}>{t('doc_upload_label')}</Text>
                <Text style={[styles.fieldHint, { color: colors.textTertiary }]}>
                  {t('doc_upload_hint')}
                </Text>
                <TouchableOpacity
                  style={[
                    styles.uploadBtn,
                    {
                      borderColor: docUploaded ? colors.success : colors.border,
                      backgroundColor: docUploaded ? colors.success + '10' : colors.surfaceSecondary,
                    },
                  ]}
                  onPress={handleDocUpload}
                >
                  <Ionicons
                    name={docUploaded ? 'checkmark-circle' : 'cloud-upload-outline'}
                    size={24}
                    color={docUploaded ? colors.success : colors.primary}
                  />
                  <Text style={[styles.uploadBtnText, { color: docUploaded ? colors.success : colors.textSecondary }]}>
                    {docUploaded ? docName : t('doc_upload_btn')}
                  </Text>
                </TouchableOpacity>
                {errors.docUpload && (
                  <Text style={[styles.errorText, { color: colors.error }]}>{errors.docUpload}</Text>
                )}
              </View>
            )}

            {/* 🧡 CAREGIVER PROFILE FORM */}
            {user.role === 'caregiver' && (
              <View style={styles.roleForm}>
                <Text style={[styles.roleHeading, { color: colors.primary }]}>
                  {t('caregiver_label')} Category & Verification
                </Text>

                {/* Caregiver Type Selector */}
                <Text style={[styles.fieldLabel, { color: colors.text, marginBottom: 8 }]}>{t('caregiver_type_label')}</Text>
                <View style={styles.segmentedControl}>
                  <TouchableOpacity
                    style={[
                      styles.segmentTab,
                      caregiverType === 'family' && [styles.segmentActive, { backgroundColor: colors.primary }],
                    ]}
                    onPress={() => setCaregiverType('family')}
                  >
                    <Text style={[styles.segmentText, { color: caregiverType === 'family' ? '#FFF' : colors.textSecondary }]}>
                      {t('caregiver_family')}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.segmentTab,
                      caregiverType === 'professional' && [styles.segmentActive, { backgroundColor: colors.primary }],
                    ]}
                    onPress={() => setCaregiverType('professional')}
                  >
                    <Text style={[styles.segmentText, { color: caregiverType === 'professional' ? '#FFF' : colors.textSecondary }]}>
                      {t('caregiver_professional')}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Conditional Fields based on Caregiver Category */}
                {caregiverType === 'professional' ? (
                  <View style={{ marginTop: Spacing.sm }}>
                    <Input
                      label={t('license_label')}
                      placeholder={t('license_placeholder')}
                      value={licenseNumber}
                      onChangeText={setLicenseNumber}
                      icon="ribbon-outline"
                      error={errors.licenseNumber}
                    />
                    <Input
                      label={t('experience_label')}
                      placeholder={t('experience_placeholder')}
                      value={experienceYears}
                      onChangeText={setExperienceYears}
                      keyboardType="numeric"
                      icon="briefcase-outline"
                      error={errors.experienceYears}
                    />
                    <Input
                      label={t('location_label')}
                      placeholder={t('location_placeholder')}
                      value={location}
                      onChangeText={setLocation}
                      icon="location-outline"
                      error={errors.location}
                    />
                    {/* Verification Doc */}
                    <Text style={[styles.fieldLabel, { color: colors.text }]}>{t('doc_upload_label')}</Text>
                    <TouchableOpacity
                      style={[
                        styles.uploadBtn,
                        {
                          borderColor: docUploaded ? colors.success : colors.border,
                          backgroundColor: docUploaded ? colors.success + '10' : colors.surfaceSecondary,
                        },
                      ]}
                      onPress={handleDocUpload}
                    >
                      <Ionicons
                        name={docUploaded ? 'checkmark-circle' : 'cloud-upload-outline'}
                        size={24}
                        color={docUploaded ? colors.success : colors.primary}
                      />
                      <Text style={[styles.uploadBtnText, { color: docUploaded ? colors.success : colors.textSecondary }]}>
                        {docUploaded ? docName : t('doc_upload_btn')}
                      </Text>
                    </TouchableOpacity>
                    {errors.docUpload && (
                      <Text style={[styles.errorText, { color: colors.error }]}>{errors.docUpload}</Text>
                    )}
                  </View>
                ) : (
                  <View style={{ marginTop: Spacing.sm }}>
                    <Input
                      label={t('relation_label')}
                      placeholder={t('relation_placeholder')}
                      value={relationToPatient}
                      onChangeText={setRelationToPatient}
                      icon="heart-outline"
                      error={errors.relation}
                    />
                    <Input
                      label={t('patient_user_label')}
                      placeholder={t('patient_user_placeholder')}
                      value={associatedPatientUsername}
                      onChangeText={setAssociatedPatientUsername}
                      icon="person-outline"
                      error={errors.patientUser}
                      autoCapitalize="none"
                    />
                    <Input
                      label={t('location_label')}
                      placeholder={t('location_placeholder')}
                      value={location}
                      onChangeText={setLocation}
                      icon="location-outline"
                      error={errors.location}
                    />
                  </View>
                )}
              </View>
            )}

            {/* 🟢 PATIENT PROFILE FORM */}
            {user.role === 'patient' && (
              <View style={styles.roleForm}>
                <Text style={[styles.roleHeading, { color: colors.primary }]}>
                  {t('patient_label')} ID & Condition Details
                </Text>

                <Input
                  label={t('patient_id_label')}
                  placeholder={t('patient_id_placeholder')}
                  value={patientIdCard}
                  onChangeText={setPatientIdCard}
                  icon="card-outline"
                  error={errors.patientId}
                />

                <Input
                  label={t('condition_label')}
                  placeholder={t('condition_placeholder')}
                  value={chronicCondition}
                  onChangeText={setChronicCondition}
                  icon="pulse-outline"
                  error={errors.condition}
                />

                <Input
                  label={t('emergency_name_label')}
                  placeholder={t('emergency_name_placeholder')}
                  value={emergencyName}
                  onChangeText={setEmergencyName}
                  icon="people-outline"
                  error={errors.emergencyName}
                />

                <Input
                  label={t('emergency_phone_label')}
                  placeholder={t('emergency_phone_placeholder')}
                  value={emergencyPhone}
                  onChangeText={setEmergencyPhone}
                  keyboardType="phone-pad"
                  icon="call-outline"
                  error={errors.emergencyPhone}
                />
              </View>
            )}

            {/* Common Details */}
            <Text style={[styles.roleHeading, { color: colors.primary, marginTop: Spacing.lg }]}>Contact & Bio</Text>

            <Input
              label={t('phone_label')}
              placeholder={t('phone_placeholder')}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              icon="call-outline"
              error={errors.phone}
            />

            <Input
              label={t('bio_label')}
              placeholder={t('bio_placeholder')}
              value={bio}
              onChangeText={setBio}
              multiline
              icon="document-text-outline"
              style={{ minHeight: 80 }}
            />

            {/* Submit */}
            <Button
              title={t('save_profile_btn')}
              onPress={handleSubmit}
              loading={isLoading}
              fullWidth
              size="lg"
              icon="checkmark-outline"
              style={{ marginTop: Spacing.xl }}
            />
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
  title: {
    fontSize: FontSize['2xl'],
    fontWeight: '800',
    marginTop: Spacing.lg,
  },
  subtitle: {
    fontSize: FontSize.sm,
    marginTop: 4,
    marginBottom: Spacing.lg,
  },
  userCard: {
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userInfo: {
    marginLeft: Spacing.md,
    gap: 4,
  },
  fullName: {
    fontSize: FontSize.base,
    fontWeight: '700',
  },
  badgeRow: {
    flexDirection: 'row',
  },
  form: {
    marginTop: Spacing.md,
  },
  roleForm: {
    gap: Spacing.xs,
  },
  roleHeading: {
    fontSize: FontSize.base,
    fontWeight: '700',
    marginBottom: Spacing.md,
  },
  fieldLabel: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    marginTop: Spacing.sm,
    marginBottom: 4,
  },
  fieldHint: {
    fontSize: 10,
    marginBottom: Spacing.sm,
  },
  dropdownBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: Spacing.base,
    borderRadius: Radius.md,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  dropdownText: {
    fontSize: FontSize.sm,
    fontWeight: '500',
  },
  dropdownList: {
    borderRadius: Radius.md,
    borderWidth: 1,
    marginBottom: Spacing.md,
    overflow: 'hidden',
  },
  dropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: Spacing.base,
  },
  dropdownItemText: {
    fontSize: FontSize.sm,
  },
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: Radius.md,
    borderWidth: 2,
    borderStyle: 'dashed',
    gap: 10,
    marginBottom: Spacing.sm,
  },
  uploadBtnText: {
    fontSize: FontSize.xs,
    fontWeight: '700',
  },
  errorText: {
    fontSize: FontSize.xs,
    color: 'red',
    marginTop: -4,
    marginBottom: Spacing.sm,
    marginLeft: 4,
  },
  segmentedControl: {
    flexDirection: 'row',
    borderRadius: Radius.md,
    backgroundColor: '#FAF6F0',
    padding: 3,
    marginBottom: Spacing.md,
  },
  segmentTab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentActive: {
    borderRadius: Radius.sm,
  },
  segmentText: {
    fontSize: FontSize.xs,
    fontWeight: '700',
  },
});

// Sadhna Health Care — Caregiver Dashboard Component
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useThemeColors } from '@/src/hooks/useTheme';
import { useAuthStore } from '@/src/store/authStore';
import { useLanguageStore } from '@/src/store/languageStore';
import { Card } from '@/src/components/ui/Card';
import { Avatar } from '@/src/components/ui/Avatar';
import { AppointmentsService } from '@/src/services/appointmentsService';
import { Appointment } from '@/src/types';
import { RoleConfig, Radius, FontSize, Spacing } from '@/src/utils/constants';
import { useDashboardConfigStore } from '@/src/store/dashboardConfigStore';
import { resolveVisibility } from '@/src/services/dashboardConfigService';

export function CaregiverDashboard() {
  const colors = useThemeColors();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const { language, t } = useLanguageStore();
  const dashRules = useDashboardConfigStore((s) => s.rules);
  const vis = (key: string) => resolveVisibility(dashRules, user?.id, user?.role, key);

  const [checklist, setChecklist] = useState([
    { id: 1, done: true },
    { id: 2, done: false },
    { id: 3, done: false },
  ]);

  const [appointments, setAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    if (!user) return;
    AppointmentsService.fetchAppointments(user.id).then(setAppointments).catch(() => {});
  }, [user?.id]);

  // Distinct patients this caregiver is assigned to (from real appointments).
  const recipientCount = new Set(
    appointments.filter((a) => a.caregiver_id === user?.id).map((a) => a.patient_id)
  ).size;

  const toggleCheck = (id: number) => {
    setChecklist((prev) =>
      prev.map((item) => (item.id === id ? { ...item, done: !item.done } : item))
    );
  };

  // Real per-user subtitle from the caregiver's own profile.
  const getCaregiverRoleText = () => {
    if (user?.caregiver_type === 'professional') {
      return ['Professional Caregiver', user?.experience_years ? `${user.experience_years}+ yrs` : null]
        .filter(Boolean)
        .join(' · ');
    }
    if (user?.caregiver_type === 'family') {
      return ['Family Caregiver', user?.relation_to_patient].filter(Boolean).join(' · ');
    }
    return RoleConfig.caregiver.description;
  };

  const getCaregiverTranslations = () => {
    const maps: Record<string, Record<string, string>> = {
      en: {
        care_summary: 'Care Summary',
        recipients: 'Care Recipients',
        tasks_completed: 'Tasks Completed',
        schedule: 'Patient Care Schedule',
        quick_actions: 'Quick Actions',
        share_insight: 'Share Insight',
      },
      hi: {
        care_summary: 'देखभाल सारांश',
        recipients: 'देखभाल प्राप्तकर्ता',
        tasks_completed: 'कार्य पूर्ण',
        schedule: 'मरीज की देखभाल कार्यक्रम',
        quick_actions: 'त्वरित कार्रवाई',
        share_insight: 'अंतर्दृष्टि साझा करें',
      },
      hinglish: {
        care_summary: 'Care Summary',
        recipients: 'Care Recipients',
        tasks_completed: 'Tasks Complete',
        schedule: 'Patient Care Schedule',
        quick_actions: 'Quick Actions',
        share_insight: 'Insight Share Karein',
      },
      bn: {
        care_summary: 'পরিচর্যা সারাংশ',
        recipients: 'পরিচর্যা গ্রহণকারী',
        tasks_completed: 'সম্পন্ন কাজ',
        schedule: 'রোগীর পরিচর্যা সময়সূচী',
        quick_actions: 'দ্রুত পদক্ষেপ',
        share_insight: 'অভিজ্ঞতা শেয়ার করুন',
      },
      te: {
        care_summary: 'సంరక్షణ సారాంశం',
        recipients: 'సంరక్షణ గ్రహీతలు',
        tasks_completed: 'పూర్తయిన పనులు',
        schedule: 'రోగి సంరక్షణ షెడ్యూల్',
        quick_actions: 'త్వరిత చర్యలు',
        share_insight: 'అవగాహన పంచుకోండి',
      },
      mr: {
        care_summary: 'काळजी सारांश',
        recipients: 'काळजी घेणारे रुग्ण',
        tasks_completed: 'पूर्ण झालेली कामे',
        schedule: 'रुग्ण काळजी वेळापत्रक',
        quick_actions: 'जलद कृती',
        share_insight: 'सल्ला सामायिक करा',
      },
      ta: {
        care_summary: 'பராமரிப்பு சுருக்கம்',
        recipients: 'பராமரிப்பு பெறுநர்கள்',
        tasks_completed: 'முடிக்கப்பட்ட பணிகள்',
        schedule: 'நோயாளி பராமரிப்பு அட்டவணை',
        quick_actions: 'விரைவான நடவடிக்கைகள்',
        share_insight: 'நுண்ணறிவை பகிர்க',
      },
      gu: {
        care_summary: 'સંભાળ સારાંશ',
        recipients: 'સંભાળ મેળવનારા',
        tasks_completed: 'પૂર્ણ થયેલા કાર્યો',
        schedule: 'દર્દીની સંભાળનું સમયપત્રક',
        quick_actions: 'ઝડપી કાર્યો',
        share_insight: 'અંતર્દૃષ્ટિ શેર કરો',
      },
      kn: {
        care_summary: 'ಆರೈಕೆ ಸಾರಾಂಶ',
        recipients: 'ಆರೈಕೆ ಪಡೆಯುವವರು',
        tasks_completed: 'ಪೂರ್ಣಗೊಂಡ ಕಾರ್ಯಗಳು',
        schedule: 'ರೋಗಿಯ ಆರೈಕೆ ವೇಳಾಪಟ್ಟಿ',
        quick_actions: 'ತ್ವರಿತ ಕ್ರಿಯೆಗಳು',
        share_insight: 'ವಿಚಾರ ಹಂಚಿಕೊಳ್ಳಿ',
      },
      ml: {
        care_summary: 'പരിചരണ സംഗ്രഹം',
        recipients: 'പരിചരണം സ്വീകരിക്കുന്നവർ',
        tasks_completed: 'പൂർത്തിയാക്കിയ ജോലികൾ',
        schedule: 'രോഗി പരിചരണ ഷെഡ്യൂൾ',
        quick_actions: 'ദ്രുത നടപടികൾ',
        share_insight: 'അനുഭവം പങ്കിടുക',
      },
      pa: {
        care_summary: 'ਦੇਖਭਾਲ ਸਾਰਾਂਸ਼',
        recipients: 'ਦੇਖਭਾਲ ਪ੍ਰਾਪਤਕਰਤਾ',
        tasks_completed: 'ਕੰਮ ਪੂਰੇ ਕੀਤੇ',
        schedule: 'ਮਰੀਜ਼ ਦੀ ਦੇਖਭਾਲ ਦੀ ਸਮਾਂ ਸਾਰਣੀ',
        quick_actions: 'ਤੁਰੰਤ ਕਾਰਵਾਈਆਂ',
        share_insight: 'ਵਿਚਾਰ ਸਾਂਝੇ ਕਰੋ',
      },
      or: {
        care_summary: 'ଯତ୍ନ ସଂକ୍ଷିପ୍ତ ବିବରଣୀ',
        recipients: 'ଯତ୍ନ ଗ୍ରହୀତା',
        tasks_completed: 'ସମ୍ପନ୍ନ କାର୍ଯ୍ୟ',
        schedule: 'ରୋଗୀ ଯତ୍ନ କାର୍ଯ୍ୟସୂଚୀ',
        quick_actions: 'ତ୍ୱରିତ କାର୍ଯ୍ୟ',
        share_insight: 'ଯତ୍ନ ଅନୁଭୂତି ଶେୟାର କରନ୍ତୁ',
      }
    };
    return maps[language] || maps['en'];
  };

  const getChecklistTaskText = (id: number) => {
    const maps: Record<string, Record<number, string>> = {
      en: {
        1: 'Morning insulin log for Rahul',
        2: 'Prepare lunch meal plan',
        3: 'Check blood pressure coordinates',
      },
      hi: {
        1: 'राहुल के लिए सुबह का इंसुलिन लॉग दर्ज करें',
        2: 'दोपहर के भोजन की योजना बनाएं',
        3: 'रक्तचाप (ब्लड प्रेशर) की जांच करें',
      },
      hinglish: {
        1: 'Rahul ke liye morning insulin log karein',
        2: 'Lunch meal plan prepare karein',
        3: 'Blood pressure check karein',
      },
      bn: {
        1: 'রাহুলের জন্য সকালের ইনসুলিন লগ লিখুন',
        2: 'দুপুরের খাবারের পরিকল্পনা তৈরি করুন',
        3: 'রক্তচাপ পরীক্ষা করুন',
      },
      te: {
        1: 'రాహుల్ కోసం ఉదయం ఇన్సులిన్ లాగ్ నమోదు చేయండి',
        2: 'మధ్యాహ్న భోజన ప్రణాళిక సిద్ధం చేయండి',
        3: 'రక్తపోటు తనిఖీ చేయండి',
      },
      mr: {
        1: 'राहुलसाठी सकाळची इन्सुलिन नोंद करा',
        2: 'दुपारच्या जेवणाचे नियोजन करा',
        3: 'रक्तदाब तपासा',
      },
      ta: {
        1: 'ராகுலுக்கு காலை இன்சுலின் பதிவு செய்யவும்',
        2: 'மதிய உணவு திட்டத்தை தயார் செய்யவும்',
        3: 'இரத்த அழுத்தத்தை சரிபார்க்கவும்',
      },
      gu: {
        1: 'રાહુલ માટે સવારનો ઇન્સ્યુલિન લોગ કરો',
        2: 'બપોરના ભોजनનું આયોજન કરો',
        3: 'બ્લડ પ્રેશર તપાસો',
      },
      kn: {
        1: 'ರಾಹುಲ್‌ಗಾಗಿ ಬೆಳಗಿನ ಇನ್ಸುಲಿನ್ ದಾಖಲಿಸಿ',
        2: 'ಮಧ್ಯಾಹ್ನದ ಊಟದ ಯೋಜನೆ ಸಿದ್ಧಪಡಿಸಿ',
        3: 'ರಕ್ತದೊತ್ತಡವನ್ನು ಪರೀಕ್ಷಿಸಿ',
      },
      ml: {
        1: 'രാഹുലിനായി രാവിലെ ഇൻസുലിൻ ലോഗ് ചെയ്യുക',
        2: 'ഉച്ചഭക്ഷണ പദ്ധതി തയ്യാറാക്കുക',
        3: 'രക്താതിമർദ്ദം പരിശോധിക്കുക',
      },
      pa: {
        1: 'ਰਾਹੁਲ ਲਈ ਸਵੇਰ ਦਾ ਇਨਸੁਲਿਨ ਲੌਗ ਕਰੋ',
        2: 'ਦੁਪਹਿਰ ਦੇ ਖਾਣੇ ਦੀ ਯੋਜਨਾ ਤਿਆਰ ਕਰੋ',
        3: 'ਬਲੱਡ ਪ੍ਰੈਸ਼ਰ ਦੀ ਜਾਂਚ ਕਰੋ',
      },
      or: {
        1: 'ରାହୁଲଙ୍କ ପାଇଁ ସକାଳ ଇନସୁលିନ୍ ଲଗ୍ କରନ୍ତୁ',
        2: 'ମଧ୍ୟାହ୍ନ ଭୋଜନ ଯୋଜନା ପ୍ରସ୍ତୁତ କରନ୍ତୁ',
        3: 'ରକ୍ତଚାପ ଯାଞ୍ಚ କରନ୍ତୁ',
      }
    };
    return maps[language]?.[id] || maps['en']?.[id] || '';
  };

  if (!user) return null;

  const labels = getCaregiverTranslations();
  const completedCount = checklist.filter((item) => item.done).length;
  const totalCount = checklist.length;

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
      {/* Welcome Banner */}
      {vis('welcome_banner') && (
      <View style={[styles.welcomeCard, { backgroundColor: colors.primaryFaded }]}>
        <View style={styles.welcomeRow}>
          <View style={styles.welcomeText}>
            <Text style={[styles.greeting, { color: colors.text }]}>{t('hello')}, {user.full_name.split(' ')[0]}! 🧡</Text>
            <Text style={[styles.subGreeting, { color: colors.textSecondary }]}>
              {getCaregiverRoleText()}
            </Text>
          </View>
          <Avatar uri={user.avatar_url} name={user.full_name} size={50} />
        </View>
      </View>
      )}

      {/* Analytics */}
      {vis('analytics') && (
      <>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>{labels.care_summary}</Text>
      <View style={styles.grid}>
        <Card style={styles.gridCard}>
          <Ionicons name="heart" size={20} color="#EF4444" />
          <Text style={[styles.gridValue, { color: colors.text }]}>{recipientCount}</Text>
          <Text style={[styles.gridLabel, { color: colors.textTertiary }]}>{labels.recipients}</Text>
        </Card>
        <Card style={styles.gridCard}>
          <Ionicons name="checkbox" size={20} color={colors.success} />
          <Text style={[styles.gridValue, { color: colors.text }]}>
            {completedCount}/{totalCount}
          </Text>
          <Text style={[styles.gridLabel, { color: colors.textTertiary }]}>{labels.tasks_completed}</Text>
        </Card>
      </View>
      </>
      )}

      {/* Care Checklist */}
      {vis('care_checklist') && (
      <>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>{labels.schedule}</Text>
      <Card style={styles.apptCard}>
        {checklist.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[styles.checklistItem, { borderColor: colors.borderLight }]}
            onPress={() => toggleCheck(item.id)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={item.done ? 'checkbox' : 'square-outline'}
              size={20}
              color={item.done ? colors.primary : colors.textTertiary}
            />
            <Text
              style={[
                styles.checklistText,
                {
                  color: item.done ? colors.textTertiary : colors.text,
                  textDecorationLine: item.done ? 'line-through' : 'none',
                },
              ]}
            >
              {getChecklistTaskText(item.id)}
            </Text>
          </TouchableOpacity>
        ))}
      </Card>
      </>
      )}

      {/* Shortcuts */}
      {vis('shortcuts') && (
      <>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>{labels.quick_actions}</Text>
      <View style={styles.shortcuts}>
        <TouchableOpacity
          style={[styles.shortcutBtn, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}
          onPress={() => router.push({ pathname: '/post/create', params: { prefilledType: 'caregiver_insight' } } as any)}
        >
          <View style={[styles.shortcutIconBg, { backgroundColor: '#F9731615' }]}>
            <Ionicons name="heart" size={22} color="#F97316" />
          </View>
          <Text style={[styles.shortcutLabel, { color: colors.text }]}>{labels.share_insight}</Text>
        </TouchableOpacity>
      </View>
      </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: Spacing.base, paddingBottom: 100 },
  welcomeCard: { padding: Spacing.lg, borderRadius: Radius.lg, marginBottom: Spacing.lg },
  welcomeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  welcomeText: { flex: 1, marginRight: Spacing.md },
  greeting: { fontSize: FontSize.lg, fontWeight: '800', marginBottom: 4 },
  subGreeting: { fontSize: FontSize.xs, lineHeight: 16 },
  sectionTitle: { fontSize: FontSize.md, fontWeight: '800', marginTop: Spacing.md, marginBottom: Spacing.sm },
  grid: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.lg },
  gridCard: { flex: 1, padding: Spacing.md, alignItems: 'center', gap: 6 },
  gridValue: { fontSize: FontSize.xl, fontWeight: '800' },
  gridLabel: { fontSize: FontSize.xs, fontWeight: '500', textAlign: 'center' },
  apptCard: { padding: Spacing.base, marginBottom: Spacing.lg },
  checklistItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, gap: 10 },
  checklistText: { fontSize: FontSize.sm, fontWeight: '500' },
  shortcuts: { flexDirection: 'row', gap: Spacing.md },
  shortcutBtn: { flex: 1, alignItems: 'center', paddingVertical: Spacing.md, borderRadius: Radius.md, borderWidth: 1, gap: 6 },
  shortcutIconBg: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  shortcutLabel: { fontSize: FontSize.xs, fontWeight: '600' },
});

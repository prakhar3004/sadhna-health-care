// Sadhna Health Care — Doctor Dashboard Component
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
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
import { formatTime } from '@/src/utils/helpers';

export function DoctorDashboard() {
  const colors = useThemeColors();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const { language, t } = useLanguageStore();

  const [appointments, setAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    if (!user) return;
    AppointmentsService.fetchAppointments(user.id).then(setAppointments).catch(() => {});
  }, [user?.id]);

  // The logged-in doctor's own appointments + derived, real analytics.
  const myAppts = appointments.filter((a) => a.doctor_id === user?.id);
  const upcoming = myAppts
    .filter((a) => a.status === 'pending' || a.status === 'confirmed')
    .sort((a, b) => +new Date(a.scheduled_at) - +new Date(b.scheduled_at));
  const today = new Date().toDateString();
  const visitsToday = myAppts.filter((a) => new Date(a.scheduled_at).toDateString() === today).length;
  const uniquePatients = new Set(myAppts.map((a) => a.patient_id)).size;
  const pendingCount = myAppts.filter((a) => a.status === 'pending').length;

  const noApptText =
    (({
      en: 'No upcoming appointments', hi: 'कोई आगामी अपॉइंटमेंट नहीं', hinglish: 'Koi upcoming appointment nahi',
      bn: 'কোন আসন্ন অ্যাপয়েন্টমেন্ট নেই', te: 'రాబోయే అపాయింట్‌మెంట్లు లేవు', mr: 'कोणतीही आगामी अपॉइंटमेंट नाही',
      ta: 'வரவிருக்கும் சந்திப்புகள் இல்லை', gu: 'કોઈ આગામી એપોઇન્ટમેન્ટ નથી', kn: 'ಮುಂಬರುವ ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್‌ಗಳಿಲ್ಲ',
      ml: 'വരാനിരിക്കുന്ന അപ്പോയിന്റ്മെന്റുകളില്ല', pa: 'ਕੋਈ ਆਉਣ ਵਾਲੀ ਮੁਲਾਕਾਤ ਨਹੀਂ', or: 'କୌଣସି ଆଗାମୀ ଅପଏଣ୍ଟମେଣ୍ଟ ନାହିଁ',
    } as Record<string, string>)[language]) || 'No upcoming appointments';

  // Real per-user subtitle from the doctor's own profile.
  const getDoctorRoleText = () => {
    const parts = [user?.specialization, user?.license_number].filter(Boolean);
    return parts.length ? parts.join(' · ') : RoleConfig.doctor.description;
  };

  const getDocTranslations = () => {
    const maps: Record<string, Record<string, string>> = {
      en: {
        workspace_analytics: 'Workspace Analytics',
        active_patients: 'Active Patients',
        visits_today: 'Visits Today',
        open_queries: 'Open Queries',
        appt_queue: "Today's Appointments Queue",
        video_consult: 'Video Consultation',
        clinical_shortcuts: 'Clinical Shortcuts',
        doctor_tip: 'Doctor Tip',
        awareness_post: 'Awareness Post',
        video_alert_title: 'Video Consultation',
        video_alert_msg: 'Connecting to secure patient video call...',
      },
      hi: {
        workspace_analytics: 'कार्यक्षेत्र विश्लेषण',
        active_patients: 'सक्रिय मरीज',
        visits_today: 'आज की मुलाक़ातें',
        open_queries: 'खुले प्रश्न',
        appt_queue: 'आज की अपॉइंटमेंट कतार',
        video_consult: 'वीडियो परामर्श',
        clinical_shortcuts: 'क्लीनिकल शॉर्टकट',
        doctor_tip: 'डॉक्टर की सलाह',
        awareness_post: 'जागरूकता पोस्ट',
        video_alert_title: 'वीडियो परामर्श',
        video_alert_msg: 'मरीज के सुरक्षित वीडियो कॉल से जुड़ रहे हैं...',
      },
      hinglish: {
        workspace_analytics: 'Workspace Analytics',
        active_patients: 'Active Patients',
        visits_today: 'Aaj ke Visits',
        open_queries: 'Open Queries',
        appt_queue: "Today's Appointment Queue",
        video_consult: 'Video Consultation',
        clinical_shortcuts: 'Clinical Shortcuts',
        doctor_tip: 'Doctor Tip',
        awareness_post: 'Awareness Post',
        video_alert_title: 'Video Consultation',
        video_alert_msg: 'Secure patient video call se connect ho rahe hain...',
      },
      bn: {
        workspace_analytics: 'কাজের ক্ষেত্র বিশ্লেষণ',
        active_patients: 'সক্রিয় রোগী',
        visits_today: 'আজকের পরিদর্শন',
        open_queries: 'উন্মুক্ত প্রশ্ন',
        appt_queue: 'আজকের অ্যাপয়েন্টমেন্ট সারি',
        video_consult: 'ভিডিও পরামর্শ',
        clinical_shortcuts: 'ক্লিনিকাল শর্টকাট',
        doctor_tip: 'ডাক্তারের পরামর্শ',
        awareness_post: 'সচেতনতা পোস্ট',
        video_alert_title: 'ভিডিও পরামর্শ',
        video_alert_msg: 'রোগীর সুরক্ষিত ভিডিও কলে সংযুক্ত হচ্ছে...',
      },
      te: {
        workspace_analytics: 'పనిస్థలం విశ్లేషణలు',
        active_patients: 'క్రియాశీల రోగులు',
        visits_today: 'ఈ రోజు సందర్శనలు',
        open_queries: 'తెరిచిన ప్రశ్నలు',
        appt_queue: 'ఈ రోజు అపాయింట్‌మెంట్ క్యూ',
        video_consult: 'వీడియో సంప్రదింపులు',
        clinical_shortcuts: 'క్లినికల్ షార్ట్‌కట్లు',
        doctor_tip: 'డాక్టర్ చిట్కా',
        awareness_post: 'అవగాహన పోస్ట్',
        video_alert_title: 'వీడియో సంప్రదింపులు',
        video_alert_msg: 'సురક્ષిత రోగి వీడియో కాల్‌కు కనెక్ట్ అవుతోంది...',
      },
      mr: {
        workspace_analytics: 'कार्यक्षेत्र विश्लेषण',
        active_patients: 'सक्रिय रुग्ण',
        visits_today: 'आजच्या भेटी',
        open_queries: 'खुले प्रश्न',
        appt_queue: 'आजची अपॉइंटमेंट रांग',
        video_consult: 'व्हिडिओ सल्लामसलत',
        clinical_shortcuts: 'क्लिनिकल शॉर्टकट',
        doctor_tip: 'डॉक्टर सल्ला',
        awareness_post: 'जागरूकता पोस्ट',
        video_alert_title: 'व्हिडिओ सल्लामसलत',
        video_alert_msg: 'सुरक्षित रुग्ण व्हिडिओ कॉलशी कनेक्ट करत आहे...',
      },
      ta: {
        workspace_analytics: 'பணியிட பகுப்பாய்வு',
        active_patients: 'செயலில் உள்ள நோயாளிகள்',
        visits_today: 'இன்றைய வருகைகள்',
        open_queries: 'திறந்த கேள்விகள்',
        appt_queue: 'இன்றைய சந்திப்பு வரிசை',
        video_consult: 'வீடியோ ஆலோசனை',
        clinical_shortcuts: 'மருத்துவ குறுக்குவழிகள்',
        doctor_tip: 'டாக்டர் குறிப்பு',
        awareness_post: 'விழிப்புணர்வு பதிவு',
        video_alert_title: 'வீடியோ ஆலோசனை',
        video_alert_msg: 'பாதுகாப்பான நோயாளி வீடியோ அழைப்புடன் இணைகிறது...',
      },
      gu: {
        workspace_analytics: 'વર્કસ્પેસ એનાલિટિક્સ',
        active_patients: 'સક્રિય દર્દીઓ',
        visits_today: 'આજની મુલાકાતો',
        open_queries: 'ખુલ્લા પ્રશ્નો',
        appt_queue: 'આજની એપોઇન્ટમેન્ટ કતાર',
        video_consult: 'વિડિયો પરામર્શ',
        clinical_shortcuts: 'ક્લિનિકલ શૉર્ટકટ્સ',
        doctor_tip: 'ડોક્ટર ટીપ',
        awareness_post: 'જાગૃતિ પોસ્ટ',
        video_alert_title: 'વિડિયો પરામર્શ',
        video_alert_msg: 'સુરક્ષિત દર્દી વિડિયો કૉલ સાથે કનેક્ટ થઈ રહ્યું છે...',
      },
      kn: {
        workspace_analytics: 'ಕಾರ್ಯಕ್ಷೇತ್ರದ ವಿಶ್ಲೇಷಣೆ',
        active_patients: 'ಸಕ್ರಿಯ ರೋಗಿಗಳು',
        visits_today: 'ಇಂದಿನ ಭೇಟಿಗಳು',
        open_queries: 'ಮುಕ್ತ ಪ್ರಶ್ನೆಗಳು',
        appt_queue: 'ಇಂದಿನ ಅಪಾಯಿಂಟ್ಮೆಂಟ್ ಕ್ಯೂ',
        video_consult: 'ವೀಡಿಯೊ ಸಮಾಲೋಚನೆ',
        clinical_shortcuts: 'ಕ್ಲಿನಿಕಲ್ ಶಾರ್ಟ್‌ಕಟ್‌ಗಳು',
        doctor_tip: 'ವೈದ್ಯರ ಸಲಹೆ',
        awareness_post: 'ಜಾಗೃತಿ ಪೋಸ್ಟ್',
        video_alert_title: 'ವೀಡಿಯೊ ಸಮಾಲೋಚನೆ',
        video_alert_msg: 'ಸುರಕ್ಷಿತ ರೋಗಿಯ ವೀಡಿಯೊ ಕರೆಗೆ ಸಂಪರ್ಕಿಸಲಾಗುತ್ತಿದೆ...',
      },
      ml: {
        workspace_analytics: 'വർക്ക്സ്പേസ് അനലിറ്റിക്സ്',
        active_patients: 'സജീവ രോഗികൾ',
        visits_today: 'ഇന്നത്തെ സന്ദർശനങ്ങൾ',
        open_queries: 'തുറന്ന ചോദ്യങ്ങൾ',
        appt_queue: 'ഇന്നത്തെ അപ്പോയിന്റ്മെന്റ് ക്യൂ',
        video_consult: 'വീഡിയോ കൺസൾട്ടേഷൻ',
        clinical_shortcuts: 'ക്ലിനിക്കൽ കുറുക്കുവഴികൾ',
        doctor_tip: 'ഡോക്ടർ ടിപ്പ്',
        awareness_post: 'അവബോധ പോസ്റ്റ്',
        video_alert_title: 'വീഡിയോ കൺസൾട്ടേഷൻ',
        video_alert_msg: 'സുരക്ഷിതമായ രോഗി വീഡിയോ കോളിലേക്ക് കണക്റ്റുചെയ്യുന്നു...',
      },
      pa: {
        workspace_analytics: 'ਕਾਰਜਖੇਤਰ ਵਿਸ਼ਲੇਸ਼ਣ',
        active_patients: 'ਸਰਗਰਮ ਮਰੀਜ਼',
        visits_today: 'ਅੱਜ ਦੇ ਦੌਰੇ',
        open_queries: 'ਖੁੱਲ੍ਹੇ ਸਵਾਲ',
        appt_queue: 'ਅੱਜ ਦੀ ਅਪਾਇੰਟਮੈਂਟ ਕਤਾਰ',
        video_consult: 'ਵੀਡੀਓ ਸਲਾਹ',
        clinical_shortcuts: 'ਕਲੀਨਿਕਲ ਸ਼ਾਰਟਕੱਟ',
        doctor_tip: 'ਡਾਕਟਰ ਦੀ ਸਲਾਹ',
        awareness_post: 'ਜਾਗਰੂਕਤਾ ਪੋਸਟ',
        video_alert_title: 'ਵੀਡੀਓ ਸਲਾਹ',
        video_alert_msg: 'ਮਰੀਜ਼ ਦੇ ਸੁਰੱਖਿਅਤ ਵੀਡੀਓ ਕਾਲ ਨਾਲ ਕਨੈਕਟ ਕੀਤਾ ਜਾ ਰਿਹਾ ਹੈ...',
      },
      or: {
        workspace_analytics: 'କାର୍ଯ୍ୟକ୍ଷେତ୍ର ବିଶ୍ଳେଷଣ',
        active_patients: 'ସକ୍ରିୟ ରୋଗୀ',
        visits_today: 'ଆଜିର ପରିଦର୍ଶନ',
        open_queries: 'ଖୋଲା ପ୍ରଶ୍ନ',
        appt_queue: 'ଆଜିର ଅପଏଣ୍ଟମେଣ୍ଟ ଧାଡି',
        video_consult: 'ଭିଡିଓ ପରାମର୍ଶ',
        clinical_shortcuts: 'କ୍ଲିନିକାଲ୍ ସର୍ଟକଟ୍',
        doctor_tip: 'ଡାକ୍ତର ଟିପ୍',
        awareness_post: 'ସଚେତନତା ପୋଷ୍ଟ',
        video_alert_title: 'ଭିଡିଓ ପରାମର୍ଶ',
        video_alert_msg: 'ରୋଗୀଙ୍କ ସୁରକ୍ଷିତ ଭିଡିଓ କଲ୍ ସହିତ ସଂଯୋਗ କରାଯାଉଛି...',
      }
    };
    return maps[language] || maps['en'];
  };

  if (!user) return null;

  const labels = getDocTranslations();

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
      {/* Welcome Banner */}
      <View style={[styles.welcomeCard, { backgroundColor: colors.primaryFaded }]}>
        <View style={styles.welcomeRow}>
          <View style={styles.welcomeText}>
            <Text style={[styles.greeting, { color: colors.text }]}>{t('hello')}, {user.full_name.split(' ')[0]}! 🩺</Text>
            <Text style={[styles.subGreeting, { color: colors.textSecondary }]}>
              {getDoctorRoleText()}
            </Text>
          </View>
          <Avatar uri={user.avatar_url} name={user.full_name} size={50} />
        </View>
      </View>

      {/* Analytics Cards */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>{labels.workspace_analytics}</Text>
      <View style={styles.grid}>
        <Card style={styles.gridCard}>
          <Ionicons name="people" size={20} color={colors.primary} />
          <Text style={[styles.gridValue, { color: colors.text }]}>{uniquePatients}</Text>
          <Text style={[styles.gridLabel, { color: colors.textTertiary }]}>{labels.active_patients}</Text>
        </Card>
        <Card style={styles.gridCard}>
          <Ionicons name="videocam" size={20} color={colors.secondary} />
          <Text style={[styles.gridValue, { color: colors.text }]}>{visitsToday}</Text>
          <Text style={[styles.gridLabel, { color: colors.textTertiary }]}>{labels.visits_today}</Text>
        </Card>
        <Card style={styles.gridCard}>
          <Ionicons name="help-circle" size={20} color="#F59E0B" />
          <Text style={[styles.gridValue, { color: colors.text }]}>{pendingCount}</Text>
          <Text style={[styles.gridLabel, { color: colors.textTertiary }]}>{labels.open_queries}</Text>
        </Card>
      </View>

      {/* Appointment Queue — the doctor's real upcoming appointments */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>{labels.appt_queue}</Text>
      <Card style={styles.apptCard}>
        {upcoming.length === 0 ? (
          <Text style={[styles.apptTime, { color: colors.textTertiary, paddingVertical: Spacing.sm }]}>
            {noApptText}
          </Text>
        ) : (
          upcoming.slice(0, 5).map((appt) => (
            <View key={appt.id} style={[styles.apptItem, { borderColor: colors.borderLight }]}>
              <View style={styles.apptInfo}>
                <Avatar uri={appt.patient?.avatar_url ?? null} name={appt.patient?.full_name || 'Patient'} size={36} />
                <View style={{ marginLeft: 10 }}>
                  <Text style={[styles.apptName, { color: colors.text }]}>{appt.patient?.full_name || 'Patient'}</Text>
                  <Text style={[styles.apptTime, { color: colors.textSecondary }]}>
                    {formatTime(appt.scheduled_at)}
                    {appt.type === 'video_call' ? ` (${labels.video_consult})` : ''}
                  </Text>
                </View>
              </View>
              {appt.type === 'video_call' && (
                <TouchableOpacity
                  style={[styles.callBtn, { backgroundColor: colors.primary }]}
                  onPress={() => Alert.alert(labels.video_alert_title, labels.video_alert_msg)}
                >
                  <Ionicons name="videocam" size={16} color="#FFF" />
                </TouchableOpacity>
              )}
            </View>
          ))
        )}
      </Card>

      {/* Quick Actions */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>{labels.clinical_shortcuts}</Text>
      <View style={styles.shortcuts}>
        <TouchableOpacity
          style={[styles.shortcutBtn, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}
          onPress={() => router.push({ pathname: '/post/create', params: { prefilledType: 'doctor_tip' } } as any)}
        >
          <View style={[styles.shortcutIconBg, { backgroundColor: colors.primaryFaded }]}>
            <Ionicons name="medkit" size={22} color={colors.primary} />
          </View>
          <Text style={[styles.shortcutLabel, { color: colors.text }]}>{labels.doctor_tip}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.shortcutBtn, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}
          onPress={() => router.push({ pathname: '/post/create', params: { prefilledType: 'awareness' } } as any)}
        >
          <View style={[styles.shortcutIconBg, { backgroundColor: colors.secondaryFaded }]}>
            <Ionicons name="megaphone" size={22} color={colors.secondary} />
          </View>
          <Text style={[styles.shortcutLabel, { color: colors.text }]}>{labels.awareness_post}</Text>
        </TouchableOpacity>
      </View>
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
  apptItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: Spacing.sm },
  apptInfo: { flexDirection: 'row', alignItems: 'center' },
  apptName: { fontSize: FontSize.base, fontWeight: '700' },
  apptTime: { fontSize: FontSize.xs, marginTop: 2 },
  callBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  shortcuts: { flexDirection: 'row', gap: Spacing.md },
  shortcutBtn: { flex: 1, alignItems: 'center', paddingVertical: Spacing.md, borderRadius: Radius.md, borderWidth: 1, gap: 6 },
  shortcutIconBg: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  shortcutLabel: { fontSize: FontSize.xs, fontWeight: '600' },
});

// Sadhna Health Care — Profile Screen
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from '@/src/components/ui/Avatar';
import { RoleBadge } from '@/src/components/ui/RoleBadge';
import { Button } from '@/src/components/ui/Button';
import { Card } from '@/src/components/ui/Card';
import { useThemeColors } from '@/src/hooks/useTheme';
import { useAuthStore } from '@/src/store/authStore';
import { useLanguageStore } from '@/src/store/languageStore';
import { LanguagePicker } from '@/src/components/ui/LanguagePicker';
import { RoleConfig, FontSize, Spacing, Radius } from '@/src/utils/constants';
import { formatCount } from '@/src/utils/helpers';

const LANGUAGE_LABEL_MAP: Record<string, string> = {
  en: 'App Language',
  hi: 'ऐप की भाषा',
  hinglish: 'App ki Bhasha',
  bn: 'অ্যাপের ভাষা',
  te: 'యాప్ భాష',
  mr: 'अॅपची भाषा',
  ta: 'பயன்பாட்டு மொழி',
  gu: 'એપની ભાષા',
  kn: 'ಅಪ್ಲಿಕೇಶನ್ ಭಾಷೆ',
  ml: 'ആപ്പിന്റെ ഭാഷ',
  pa: 'ਐਪ ਦੀ ਭਾਸ਼ਾ',
  or: 'ଆପ୍ ଭାଷಾ',
};

const LANGUAGE_DESC_MAP: Record<string, string> = {
  en: 'Select your preferred Indian language to use the app and read posts.',
  hi: 'ऐप का उपयोग करने और पोस्ट पढ़ने के लिए अपनी पसंदीदा भारतीय भाषा चुनें।',
  hinglish: 'App use karne aur posts padhne ke liye apni preferred Indian language select karein.',
  bn: 'অ্যাপ্লিকেশন ব্যবহার করতে এবং পোস্টগুলি পড়তে আপনার পছন্দের ভারতীয় ভাষা নির্বাচন করুন।',
  te: 'యాప్‌ను ఉపయోగించడానికి మరియు పోస్ట్‌లను చదవడానికి మీకు నచ్చిన భారతీయ భాషను ఎంచుకోండి.',
  mr: 'अॅप वापरण्यासाठी आणि पोस्ट वाचण्यासाठी तुमची पसंतीची भारतीय भाषा निवडा.',
  ta: 'பயன்பாட்டைப் பயன்படுத்தவும் இடுகைகளைப் படிக்கவும் உங்களுக்கு விருப்பமான இந்திய மொழியைத் தேர்ந்தெடுக்கவும்.',
  gu: 'એપનો ઉપયોગ કરવા અને પોસ્ટ્સ વાંચવા માટે તમારી પસંદગીની ભારતીય ભાષા પસંદ કરો.',
  kn: 'ಅಪ್ಲಿಕೇಶನ್ ಬಳಸಲು ಮತ್ತು ಪೋಸ್ಟ್‌ಗಳನ್ನು ಓದಲು ನಿಮ್ಮ ಆದ್ಯತೆಯ ಭಾರತীয় ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ.',
  ml: 'ആപ്പ് ഉപയോഗിക്കുന്നതിനും പോസ്റ്റുകൾ വായിക്കുന്നതിനും നിങ്ങൾക്ക് ഇഷ്ടമുള്ള ഇന്ത്യൻ ഭാഷ തിരഞ്ഞെടുക്കുക.',
  pa: 'ਐਪ ਦੀ ਵਰਤੋਂ ਕਰਨ ਅਤੇ ਪੋਸਟਾਂ ਨੂੰ ਪੜ੍ਹਨ ਲਈ ਆਪਣੀ ਪਸੰਦੀਦਾ ਭਾਰਤੀ ਭਾਸ਼ਾ ਚੁਣੋ।',
  or: 'ଆପ୍ ବ୍ୟବହାର କରିବାକୁ ଏବଂ ପୋଷ୍ଟଗୁଡିକ ପଢିବାକୁ ଆପଣଙ୍କର ପସନ୍ଦର ଭାରତୀୟ ଭାଷା ବାଛନ୍ତୁ।',
};

const LOCAL_TRANS: Record<string, Record<string, string>> = {
  en: {
    profile: 'Profile',
    edit_profile: 'Edit Profile',
    prof_details: 'Professional Details',
    spec: 'Specialization',
    license: 'License',
    exp: 'Experience',
    years: 'years',
    caregiver_details: 'Caregiver Details',
    contact_info: 'Contact Information',
    location: 'Location',
    phone: 'Phone',
    quick_actions: 'Quick Actions',
    saved_posts: 'Saved Posts',
    records: 'Health Records',
    groups: 'My Groups',
    activity: 'Activity',
    privacy: 'Privacy & Security',
    support: 'Help & Support',
    sign_out: 'Sign Out',
  },
  hi: {
    profile: 'प्रोफ़ाइल',
    edit_profile: 'प्रोफ़ाइल बदलें',
    prof_details: 'व्यावसायिक विवरण',
    spec: 'विशेषज्ञता',
    license: 'लाइसेंस',
    exp: 'अनुभव',
    years: 'वर्ष',
    caregiver_details: 'केयरगिवर विवरण',
    contact_info: 'संपर्क जानकारी',
    location: 'स्थान',
    phone: 'फोन',
    quick_actions: 'त्वरित कार्रवाई',
    saved_posts: 'सहेजे गए पोस्ट',
    records: 'स्वास्थ्य रिकॉर्ड',
    groups: 'मेरे समूह',
    activity: 'गतिविधि',
    privacy: 'गोपनीयता और सुरक्षा',
    support: 'सहायता और समर्थन',
    sign_out: 'साइन आउट करें',
  },
  hinglish: {
    profile: 'Profile',
    edit_profile: 'Profile Edit Karein',
    prof_details: 'Professional Details',
    spec: 'Specialization',
    license: 'License',
    exp: 'Experience',
    years: 'saal',
    caregiver_details: 'Caregiver Details',
    contact_info: 'Contact Info',
    location: 'Location',
    phone: 'Phone',
    quick_actions: 'Quick Actions',
    saved_posts: 'Saved Posts',
    records: 'Health Records',
    groups: 'My Groups',
    activity: 'Activity',
    privacy: 'Privacy & Security',
    support: 'Help & Support',
    sign_out: 'Sign Out',
  },
  bn: {
    profile: 'প্রোফাইল',
    edit_profile: 'প্রোফাইল সম্পাদনা',
    prof_details: 'পেশাদার বিবরণ',
    spec: 'বিশেষজ্ঞতা',
    license: 'লাইসেন্স',
    exp: 'অভিজ্ঞতা',
    years: 'বছর',
    caregiver_details: 'কেয়ারগিভার বিবরণ',
    contact_info: 'যোগাযোগের তথ্য',
    location: 'স্থান',
    phone: 'ফোন',
    quick_actions: 'द्रुत অ্যাকশন',
    saved_posts: 'সংরক্ষিত পোস্ট',
    records: 'স্বাস্থ্য রেকর্ড',
    groups: 'আমার গ্রুপ',
    activity: 'কার্যকলাপ',
    privacy: 'গোপনীয়তা ও নিরাপত্তা',
    support: 'সাহায্য ও সমর্থন',
    sign_out: 'সাইন আউট',
  },
  te: {
    profile: 'ప్రొఫైల్',
    edit_profile: 'ప్రొఫైల్ సవరించు',
    prof_details: 'ವృత్తిపరమైన వివరాలు',
    spec: 'ప్రత్యేకత',
    license: 'లైసెన్స్',
    exp: 'అనుభవం',
    years: 'సంవత్సరాలు',
    caregiver_details: 'కేర్‌గివర్ వివరాలు',
    contact_info: 'సంప్రదింపు సమాచారం',
    location: 'స్థానం',
    phone: 'ఫోన్',
    quick_actions: 'త్వరిత చర్యలు',
    saved_posts: 'సేవ్ చేసిన పోస్ట్లు',
    records: 'ఆరోగ్య రికార్డులు',
    groups: 'నా గ్రూపులు',
    activity: 'కార్యకలాపాలు',
    privacy: 'గోప్యత & భద్రత',
    support: 'ಸಹಾಯಂ & మద్దతు',
    sign_out: 'లాగ్ అవుట్',
  },
  mr: {
    profile: 'प्रोफाइल',
    edit_profile: 'प्रोफाइल संपादित करा',
    prof_details: 'व्यावसायिक तपशील',
    spec: 'विशेषज्ञता',
    license: 'परवाना',
    exp: 'अनुभव',
    years: 'वर्षे',
    caregiver_details: 'केयरगिव्हर तपशील',
    contact_info: 'संपर्क माहिती',
    location: 'स्थान',
    phone: 'फोन',
    quick_actions: 'त्वरित कृती',
    saved_posts: 'जतन केलेले पोस्ट',
    records: 'आरोग्य रेकॉर्ड',
    groups: 'माझे गट',
    activity: 'कृती',
    privacy: 'गोपनीयता आणि सुरक्षा',
    support: 'मदत आणि समर्थन',
    sign_out: 'बाहेर पडा',
  },
  ta: {
    profile: 'சுயவிவரம்',
    edit_profile: 'சுயவிவரத்தைத் திருத்து',
    prof_details: 'தொழில்முறை விவரங்கள்',
    spec: 'சிறப்புத் துறை',
    license: 'உரிமம்',
    exp: 'அனுபவம்',
    years: 'ஆண்டுகள்',
    caregiver_details: 'பராமரிப்பாளர் விவரங்கள்',
    contact_info: 'தொடர்பு தகவல்',
    location: 'இருப்பிடம்',
    phone: 'தொலைபேசி',
    quick_actions: 'விரைவான செயல்கள்',
    saved_posts: 'சேமித்த இடுகைகள்',
    records: 'சுகாதார பதிவுகள்',
    groups: 'எனது குழுக்கள்',
    activity: 'செயல்பாடு',
    privacy: 'தனியுரிமை & பாதுகாப்பு',
    support: 'உதவி & ஆதரவு',
    sign_out: 'வெளியேறு',
  },
  gu: {
    profile: 'પ્રોફાઇલ',
    edit_profile: 'પ્રોફાઇલ સંપાદિત કરો',
    prof_details: 'વ્યાવસાયિક વિગતો',
    spec: 'ખાસિયત',
    license: 'લાઇસન્સ',
    exp: 'અનુભવ',
    years: 'વર્ષ',
    caregiver_details: 'કેરગિવર વિગતો',
    contact_info: 'સંપર્ક માહિતી',
    location: 'સ્થાન',
    phone: 'ફોન',
    quick_actions: 'ઝડપી કાર્યો',
    saved_posts: 'સાચવેલ પોસ્ટ્સ',
    records: 'હેલ્થ રેકોર્ડ્સ',
    groups: 'મારા ગ્રુપ',
    activity: 'પ્રવૃત્તિ',
    privacy: 'ગોપનીયતા અને સુરક્ષા',
    support: 'મદદ અને સપોર્ટ',
    sign_out: 'સાઇન આઉટ',
  },
  kn: {
    profile: 'ಪ್ರೊಫೈಲ್',
    edit_profile: 'ಪ್ರೊಫೈಲ್ ಸಂಪಾದಿಸಿ',
    prof_details: 'ವೃತ್ತಿಪರ ವಿವರಗಳು',
    spec: 'ವಿಶೇಷತೆ',
    license: 'ಪರವಾನಗಿ',
    exp: 'ಅನುಭವ',
    years: 'ವರ್ಷಗಳು',
    caregiver_details: 'ಆರೈಕೆದಾರರ ವಿವರಗಳು',
    contact_info: 'ಸಂಪರ್ಕ ಮಾಹಿತಿ',
    location: 'ಸ್ಥಳ',
    phone: 'ಫೋನ್',
    quick_actions: 'ತ್ವರಿತ ಕ್ರಿಯೆಗಳು',
    saved_posts: 'ಉಳಿಸಿದ ಪೋಸ್ಟ್‌ಗಳು',
    records: 'ಆರೋಗ್ಯ ದಾಖಲೆಗಳು',
    groups: 'ನನ್ನ ಗುಂಪುಗಳು',
    activity: 'ಚಟುವಟಿಕೆ',
    privacy: 'ಗೌಪ್ಯತೆ ಮತ್ತು ಭದ್ರತೆ',
    support: 'ಸಹಾಯ ಮತ್ತು ಬೆಂಬಲ',
    sign_out: 'ಸೈನ್ ಔಟ್',
  },
  ml: {
    profile: 'പ്രൊഫൈൽ',
    edit_profile: 'പ്രൊഫൈൽ എഡിറ്റ് ചെയ്യുക',
    prof_details: 'ഔദ്യോഗിക വിവരങ്ങൾ',
    spec: 'സ്പെഷ്യലൈസേഷൻ',
    license: 'ലൈസൻസ്',
    exp: 'പ്രവൃത്തിപരിചയം',
    years: 'വർഷം',
    caregiver_details: 'കെയർഗിവർ വിവരങ്ങൾ',
    contact_info: 'ബന്ധപ്പെടാനുള്ള വിവരങ്ങൾ',
    location: 'സ്ഥലം',
    phone: 'ഫോൺ',
    quick_actions: 'പെട്ടെന്നുള്ള പ്രവർത്തനങ്ങൾ',
    saved_posts: 'സംരക്ഷിച്ച പോസ്റ്റുകൾ',
    records: 'ആരോഗ്യ രേഖകൾ',
    groups: 'എന്റെ ഗ്രൂപ്പുകൾ',
    activity: 'പ്രവർത്തനങ്ങൾ',
    privacy: 'സ്വകാര്യതയും സുരക്ഷയും',
    support: 'സഹായവും പിന്തുണയും',
    sign_out: 'സൈൻ ഔട്ട്',
  },
  pa: {
    profile: 'ਪ੍ਰੋਫਾਈਲ',
    edit_profile: 'ਪ੍ਰੋਫਾਈਲ ਸੋਧੋ',
    prof_details: 'ਪੇਸ਼ੇਵਰ ਵੇਰਵੇ',
    spec: 'ਮਹਾਰਤ',
    license: 'ਲਾਇਸੈਂਸ',
    exp: 'ਤਜਰਬਾ',
    years: 'ਸਾਲ',
    caregiver_details: 'ਕੇਅਰਗਿਵਰ ਵੇਰਵੇ',
    contact_info: 'ਸੰਪਰਕ ਜਾਣਕਾਰੀ',
    location: 'ਸਥਾਨ',
    phone: 'ਫੋਨ',
    quick_actions: 'ਤੁਰੰਤ ਕਾਰਵਾਈਆਂ',
    saved_posts: 'ਸੁਰੱਖਿਅਤ ਕੀਤੀਆਂ ਪੋਸਟਾਂ',
    records: 'ਸਿਹਤ ਰਿਕਾਰਡ',
    groups: 'ਮੇਰੇ ਗਰੁੱਪ',
    activity: 'ਗਤੀਵਿਧੀ',
    privacy: 'ਗੋਪਨੀਯਤਾ ਅਤੇ ਸੁਰੱਖਿਆ',
    support: 'ਮਦਦ ਅਤੇ ਸਹਾਇਤਾ',
    sign_out: 'ਸਾਈਨ ਆਊਟ',
  },
  or: {
    profile: 'ପ୍ରୋଫାଇଲ୍',
    edit_profile: 'ପ୍ରୋଫାଇଲ୍ ସଂପାਦନ',
    prof_details: 'ପେଶାଦାର ବିବରଣୀ',
    spec: 'ବିଶେଷଜ୍ଞତା',
    license: 'ଲାଇସେନ୍ସ',
    exp: 'ଅଭିଜ୍ଞତା',
    years: 'ବର୍ଷ',
    caregiver_details: 'କେୟାରଗିଭର ବିବରଣୀ',
    contact_info: 'ଯୋଗାଯୋଗ ବିବରଣୀ',
    location: 'ସ୍ଥାନ',
    phone: 'ଫୋନ୍',
    quick_actions: 'ଦ୍ରୁତ କାର୍ଯ୍ୟାନୁଷ୍ଠାନ',
    saved_posts: 'ସଂରକ୍ଷିତ ପୋଷ୍ଟ',
    records: 'ସ୍ୱାସ୍ਥ୍ୟ ରେକର୍ଡ',
    groups: 'ମୋ ଗ୍ରୁପ୍',
    activity: 'କାର୍ଯ୍ୟକଳାਪ',
    privacy: 'ଗୋପନୀୟତା ଏବଂ ସୁରକ୍ଷା',
    support: 'ସାହାଯ୍ୟ ଏବံ ସମର୍ଥନ',
    sign_out: 'ସାଇନ୍ ଆଉଟ୍',
  }
};

export default function ProfileScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const lang = useLanguageStore((s) => s.language);

  const localT = (key: string) => {
    return LOCAL_TRANS[lang]?.[key] || LOCAL_TRANS['en']?.[key] || key;
  };

  if (!user) return null;

  const roleConfig = RoleConfig[user.role];

  const handleLogout = () => {
    logout();
    router.replace('/(auth)/login');
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.surface }]}>
          <View style={styles.headerTop}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>{localT('profile')}</Text>
            <View style={styles.headerActions}>
              <TouchableOpacity style={[styles.headerBtn, { backgroundColor: colors.surfaceSecondary }]}>
                <Ionicons name="settings-outline" size={22} color={colors.text} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Profile Hero */}
          <View style={styles.profileHero}>
            <View style={[styles.avatarContainer, { borderColor: roleConfig.color }]}>
              <Avatar uri={user.avatar_url} name={user.full_name} size={90} />
            </View>
            <Text style={[styles.fullName, { color: colors.text }]}>{user.full_name}</Text>
            <Text style={[styles.username, { color: colors.textTertiary }]}>@{user.username}</Text>
            <View style={styles.badgeRow}>
              <RoleBadge role={user.role} size="md" verified={user.is_verified} />
            </View>
          </View>

          {/* Stats Row */}
          <View style={[styles.statsRow, { borderColor: colors.divider }]}>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: colors.text }]}>
                {formatCount(user.posts_count)}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textTertiary }]}>
                {lang === 'hi' ? 'पोस्ट' : lang === 'hinglish' ? 'Posts' : 'Posts'}
              </Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.divider }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: colors.text }]}>
                {formatCount(user.followers_count)}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textTertiary }]}>
                {lang === 'hi' ? 'फॉलोअर्स' : 'Followers'}
              </Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.divider }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: colors.text }]}>
                {formatCount(user.following_count)}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textTertiary }]}>
                {lang === 'hi' ? 'फॉलोइंग' : 'Following'}
              </Text>
            </View>
          </View>

          {/* Bio */}
          {user.bio && (
            <Text style={[styles.bio, { color: colors.textSecondary }]}>{user.bio}</Text>
          )}

          {/* Edit Profile Button */}
          <Button
            title={localT('edit_profile')}
            variant="outline"
            size="md"
            icon="create-outline"
            fullWidth
            onPress={() => {}}
            style={{ marginTop: Spacing.base }}
          />
        </View>

        {/* Info Cards */}
        <View style={styles.infoSection}>
          {/* Professional Info */}
          {user.role === 'doctor' && (
            <Card style={styles.infoCard}>
              <Text style={[styles.infoCardTitle, { color: colors.text }]}>
                {localT('prof_details')}
              </Text>
              <InfoRow
                icon="medical"
                label={localT('spec')}
                value={user.specialization || '—'}
                colors={colors}
              />
              <InfoRow
                icon="ribbon"
                label={localT('license')}
                value={user.license_number || '—'}
                colors={colors}
              />
              <InfoRow
                icon="briefcase"
                label={localT('exp')}
                value={user.experience_years ? `${user.experience_years} ${localT('years')}` : '—'}
                colors={colors}
              />
            </Card>
          )}

          {user.role === 'caregiver' && (
            <Card style={styles.infoCard}>
              <Text style={[styles.infoCardTitle, { color: colors.text }]}>
                {localT('caregiver_details')}
              </Text>
              <InfoRow
                icon="briefcase"
                label={localT('exp')}
                value={user.experience_years ? `${user.experience_years} ${localT('years')}` : '—'}
                colors={colors}
              />
            </Card>
          )}

          {/* Contact Info */}
          <Card style={styles.infoCard}>
            <Text style={[styles.infoCardTitle, { color: colors.text }]}>
              {localT('contact_info')}
            </Text>
            <InfoRow icon="location" label={localT('location')} value={user.location || '—'} colors={colors} />
            <InfoRow icon="call" label={localT('phone')} value={user.phone || '—'} colors={colors} />
          </Card>

          {/* Reusable Horizontal Language Settings Card */}
          <Card style={styles.infoCard}>
            <Text style={[styles.infoCardTitle, { color: colors.text, marginBottom: 4 }]}>
              {LANGUAGE_LABEL_MAP[lang] || LANGUAGE_LABEL_MAP['en']}
            </Text>
            <Text style={{ fontSize: 11, color: colors.textTertiary, marginBottom: Spacing.md }}>
              {LANGUAGE_DESC_MAP[lang] || LANGUAGE_DESC_MAP['en']}
            </Text>
            <LanguagePicker />
          </Card>

          {/* Quick Actions */}
          <Card style={styles.infoCard} noPadding>
            <Text style={[styles.infoCardTitle, { color: colors.text, padding: Spacing.base, paddingBottom: 0 }]}>
              {localT('quick_actions')}
            </Text>
            <ActionRow icon="bookmark-outline" label={localT('saved_posts')} colors={colors} />
            <ActionRow icon="document-text-outline" label={localT('records')} colors={colors} />
            <ActionRow icon="people-outline" label={localT('groups')} colors={colors} />
            <ActionRow icon="analytics-outline" label={localT('activity')} colors={colors} />
            <ActionRow icon="shield-checkmark-outline" label={localT('privacy')} colors={colors} />
            <ActionRow icon="help-circle-outline" label={localT('support')} colors={colors} />
          </Card>

          {/* Logout */}
          <Button
            title={localT('sign_out')}
            variant="ghost"
            size="lg"
            icon="log-out-outline"
            fullWidth
            onPress={handleLogout}
            textStyle={{ color: colors.error }}
            style={{ marginTop: Spacing.sm }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Helper Components ────────────────────────────────────────

function InfoRow({
  icon,
  label,
  value,
  colors,
}: {
  icon: string;
  label: string;
  value: string;
  colors: any;
}) {
  return (
    <View style={infoRowStyles.row}>
      <View style={[infoRowStyles.iconContainer, { backgroundColor: colors.primaryFaded }]}>
        <Ionicons name={icon as any} size={16} color={colors.primary} />
      </View>
      <View style={infoRowStyles.textContainer}>
        <Text style={[infoRowStyles.label, { color: colors.textTertiary }]}>{label}</Text>
        <Text style={[infoRowStyles.value, { color: colors.text }]}>{value}</Text>
      </View>
    </View>
  );
}

function ActionRow({
  icon,
  label,
  colors,
}: {
  icon: string;
  label: string;
  colors: any;
}) {
  return (
    <TouchableOpacity style={actionRowStyles.row} activeOpacity={0.6}>
      <Ionicons name={icon as any} size={20} color={colors.textSecondary} />
      <Text style={[actionRowStyles.label, { color: colors.text }]}>{label}</Text>
      <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
    </TouchableOpacity>
  );
}

// ─── Styles ───────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { paddingBottom: 100 },
  header: {
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.xl,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  headerTitle: {
    fontSize: FontSize['2xl'],
    fontWeight: '800',
  },
  headerActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileHero: {
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  avatarContainer: {
    borderWidth: 3,
    borderRadius: 50,
    padding: 3,
  },
  fullName: {
    fontSize: FontSize['2xl'],
    fontWeight: '800',
    marginTop: Spacing.md,
  },
  username: {
    fontSize: FontSize.sm,
    marginTop: 2,
  },
  badgeRow: {
    marginTop: Spacing.sm,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: Spacing.xl,
    paddingVertical: Spacing.base,
    borderTopWidth: 1,
    borderBottomWidth: 1,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: FontSize.xl,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: FontSize.xs,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
  },
  bio: {
    fontSize: FontSize.sm,
    lineHeight: 20,
    textAlign: 'center',
    marginTop: Spacing.base,
    paddingHorizontal: Spacing.lg,
  },
  infoSection: {
    padding: Spacing.base,
  },
  infoCard: {
    marginBottom: Spacing.md,
  },
  infoCardTitle: {
    fontSize: FontSize.md,
    fontWeight: '700',
    marginBottom: Spacing.md,
  },
});

const infoRowStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    marginLeft: Spacing.md,
  },
  label: {
    fontSize: FontSize.xs,
  },
  value: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    marginTop: 1,
  },
});

const actionRowStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.base,
    gap: Spacing.md,
  },
  label: {
    flex: 1,
    fontSize: FontSize.base,
    fontWeight: '500',
  },
});

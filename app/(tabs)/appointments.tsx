// Sadhna Health Care — Appointments Screen
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from '@/src/components/ui/Avatar';
import { RoleBadge } from '@/src/components/ui/RoleBadge';
import { Card } from '@/src/components/ui/Card';
import { useThemeColors } from '@/src/hooks/useTheme';
import { useAuthStore } from '@/src/store/authStore';
import { useLanguageStore } from '@/src/store/languageStore';
import { mockAppointments } from '@/src/data/mockData';
import { formatAppointmentDate, formatTime } from '@/src/utils/helpers';
import { FontSize, Spacing, Radius } from '@/src/utils/constants';

const TYPE_ICONS = {
  in_person: 'location-outline' as const,
  video_call: 'videocam-outline' as const,
  phone: 'call-outline' as const,
};

const APPOINTMENT_TRANS: Record<string, Record<string, string>> = {
  en: {
    appointments_header: 'Appointments',
    upcoming: 'Upcoming',
    past: 'Past',
    no_upcoming: 'No upcoming appointments',
    no_past: 'No past appointments',
    book_visit: 'Book a visit with a doctor to get started',
    completed_desc: 'Your completed appointments will appear here',
    in_person: 'In Person',
    video_call: 'Video Call',
    phone: 'Phone',
    message_btn: 'Message',
    join_call_btn: 'Join Call',
    pending: 'Pending',
    confirmed: 'Confirmed',
    completed: 'Completed',
    cancelled: 'Cancelled',
  },
  hi: {
    appointments_header: 'अपॉइंटमेंट',
    upcoming: 'आगामी',
    past: 'विगत',
    no_upcoming: 'कोई आगामी अपॉइंटमेंट नहीं',
    no_past: 'कोई पुराना अपॉइंटमेंट नहीं',
    book_visit: 'शुरू करने के लिए डॉक्टर के साथ मुलाक़ात बुक करें',
    completed_desc: 'आपके पूरे किए गए अपॉइंटमेंट यहां दिखाई देंगे',
    in_person: 'व्यक्तिगत रूप से',
    video_call: 'वीडियो कॉल',
    phone: 'फोन',
    message_btn: 'संदेश',
    join_call_btn: 'कॉल में शामिल हों',
    pending: 'लंबित',
    confirmed: 'पुष्टि की गई',
    completed: 'पूरा हो गया',
    cancelled: 'रद्द कर दिया',
  },
  hinglish: {
    appointments_header: 'Appointments',
    upcoming: 'Upcoming',
    past: 'Past',
    no_upcoming: 'No upcoming appointments',
    no_past: 'No past appointments',
    book_visit: 'Start karne ke liye doctor ke sath visit book karein',
    completed_desc: 'Aapke completed appointments yahan dikhenge',
    in_person: 'In Person',
    video_call: 'Video Call',
    phone: 'Phone',
    message_btn: 'Message',
    join_call_btn: 'Call Join Karein',
    pending: 'Pending',
    confirmed: 'Confirmed',
    completed: 'Completed',
    cancelled: 'Cancelled',
  },
  bn: {
    appointments_header: 'অ্যাপয়েন্টমেন্ট',
    upcoming: 'আসন্ন',
    past: 'অতীত',
    no_upcoming: 'কোন আসন্ন অ্যাপয়েন্টমেন্ট নেই',
    no_past: 'কোন অতীত অ্যাপয়েন্টমেন্ট নেই',
    book_visit: 'শুরু করতে ডাক্তারের সাথে দেখা করার বুকিং করুন',
    completed_desc: 'আপনার সম্পন্ন অ্যাপয়েন্টমেন্ট এখানে প্রদর্শিত হবে',
    in_person: 'সরাসরি',
    video_call: 'ভিডিও কল',
    phone: 'ফোন',
    message_btn: 'বার্তা',
    join_call_btn: 'কলে যোগ দিন',
    pending: 'অপেক্ষমান',
    confirmed: 'নিশ্চিত',
    completed: 'সম্পন্ন',
    cancelled: 'বাতিল',
  },
  te: {
    appointments_header: 'అపాయింట్‌మెంట్లు',
    upcoming: 'రాబోయే',
    past: 'గత',
    no_upcoming: 'రాబోయే అపాయింట్‌మెంట్లు లేవు',
    no_past: 'గత అపాయింట్‌మెంట్లు లేవు',
    book_visit: 'ప్రారంభించడానికి ఒక వైద్యుడితో అపాయింట్‌మెంట్ బుక్ చేసుకోండి',
    completed_desc: 'మీ పూర్తయిన అపాయింట్‌మెంట్లు ఇక్కడ కనిపిస్తాయి',
    in_person: 'వ్యక్తిగతంగా',
    video_call: 'వీడియో కాల్',
    phone: 'ఫోన్',
    message_btn: 'సందేశం',
    join_call_btn: 'కాల్‌లో చేరండి',
    pending: 'పెండింగ్',
    confirmed: 'ధృవీకరించబడింది',
    completed: 'పూర్తయింది',
    cancelled: 'రద్దు చేయబడింది',
  },
  mr: {
    appointments_header: 'अपॉइंटमेंट',
    upcoming: 'आगामी',
    past: 'मागील',
    no_upcoming: 'कोणतीही आगामी अपॉइंटमेंट नाही',
    no_past: 'कोणतीही मागील अपॉइंटमेंट नाही',
    book_visit: 'सुरू करण्यासाठी डॉक्टरांशी भेट बुक करा',
    completed_desc: 'तुमच्या पूर्ण झालेल्या अपॉइंटमेंट येथे दिसतील',
    in_person: 'प्रत्यक्ष भेट',
    video_call: 'व्हिडिओ कॉल',
    phone: 'फोन',
    message_btn: 'संदेश',
    join_call_btn: 'कॉलमध्ये सामील व्हा',
    pending: 'प्रलंबित',
    confirmed: 'निश्चित',
    completed: 'पूर्ण',
    cancelled: 'रद्द',
  },
  ta: {
    appointments_header: 'சந்திப்புகள்',
    upcoming: 'வரவிருக்கும்',
    past: 'கடந்த',
    no_upcoming: 'வரவிருக்கும் சந்திப்புகள் எதுவும் இல்லை',
    no_past: 'கடந்த கால சந்திப்புகள் எதுவும் இல்லை',
    book_visit: 'தொடங்குவதற்கு மருத்துவருடன் சந்திப்பை முன்பதிவு செய்யவும்',
    completed_desc: 'உங்கள் முடிக்கப்பட்ட சந்திப்புகள் இங்கே தோன்றும்',
    in_person: 'நேரில்',
    video_call: 'வீடியோ அழைப்பு',
    phone: 'தொலைபேசி',
    message_btn: 'செய்தி',
    join_call_btn: 'அழைப்பில் இணையுங்கள்',
    pending: 'நிலுவையில் உள்ளது',
    confirmed: 'உறுதி செய்யப்பட்டது',
    completed: 'முடிக்கப்பட்டது',
    cancelled: 'ரத்து செய்யப்பட்டது',
  },
  gu: {
    appointments_header: 'એપોઇન્ટમેન્ટ્સ',
    upcoming: 'આગામી',
    past: 'ભૂતકાળ',
    no_upcoming: 'કોઈ આગામી એપોઇન્ટમેન્ટ નથી',
    no_past: 'કોઈ ભૂતકાળની એપોઇન્ટમેન્ટ નથી',
    book_visit: 'શરૂ કરવા માટે ડૉક્ટર સાથે મુલાકાત બુક કરો',
    completed_desc: 'તમારી પૂર્ણ થયેલ એપોઇન્ટમેન્ટ્સ અહીં દેખાશે',
    in_person: 'રૂબરૂ',
    video_call: 'વિડિયો કોલ',
    phone: 'ફોન',
    message_btn: 'સંદેશ',
    join_call_btn: 'કોલમાં જોડાઓ',
    pending: 'બાકી',
    confirmed: 'કન્ફર્મ',
    completed: 'પૂર્ણ',
    cancelled: 'રદ કરેલ',
  },
  kn: {
    appointments_header: 'ಅಪಾಯಿಂಟ್ಮೆಂಟ್ಗಳು',
    upcoming: 'ಮುಂಬರುವ',
    past: 'ಹಿಂದಿನ',
    no_upcoming: 'ಯಾವುದೇ ಮುಂಬರುವ ಅಪಾಯಿಂಟ್ಮೆಂಟ್ ಇಲ್ಲ',
    no_past: 'ಯಾವುದೇ ಹಿಂದಿನ ಅಪಾಯಿಂಟ್ಮೆಂಟ್ ಇಲ್ಲ',
    book_visit: 'ಪ್ರಾರಂಭಿಸಲು ವೈದ್ಯರೊಂದಿಗೆ ಅಪಾಯಿಂಟ್ಮೆಂಟ್ ಬುಕ್ ಮಾಡಿ',
    completed_desc: 'ನಿಮ್ಮ ಪೂರ್ಣಗೊಂಡ ಅಪಾಯಿಂಟ್ಮೆಂಟ್ಗಳು ಇಲ್ಲಿ ಕಾಣಿಸಿಕೊಳ್ಳುತ್ತವೆ',
    in_person: 'ಖುದ್ದಾಗಿ',
    video_call: 'ವೀಡಿಯೊ ಕರೆ',
    phone: 'ಫೋನ್',
    message_btn: 'ಸಂದೇಶ',
    join_call_btn: 'ಕರೆಗೆ ಸೇರಿ',
    pending: 'ಬಾಕಿ ಇದೆ',
    confirmed: 'ದೃಢೀಕರಿಸಲಾಗಿದೆ',
    completed: 'ಪೂರ್ಣಗೊಂಡಿದೆ',
    cancelled: 'ರದ್ದುಗೊಳಿಸಲಾಗಿದೆ',
  },
  ml: {
    appointments_header: 'അപ്പോയിന്റ്മെന്റുകൾ',
    upcoming: 'വരാനിരിക്കുന്ന',
    past: 'കഴിഞ്ഞത്',
    no_upcoming: 'വരാനിരിക്കുന്ന അപ്പോയിന്റ്മെന്റുകൾ ഇല്ല',
    no_past: 'കഴിഞ്ഞ അപ്പോയിന്റ്മെന്റുകൾ ഇല്ല',
    book_visit: 'ആരംഭിക്കുന്നതിന് ഒരു ഡോക്ടറുമായി ഒരു കൂടിക്കാഴ്ച ബുക്ക് ചെയ്യുക',
    completed_desc: 'നിങ്ങളുടെ പൂർത്തിയായ കൂടിക്കാഴ്ചകൾ ഇവിടെ ദൃശ്യമാകും',
    in_person: 'നേരിട്ട്',
    video_call: 'വീഡിയോ കോൾ',
    phone: 'ഫോൺ',
    message_btn: 'സന്ദേശം',
    join_call_btn: 'കോളിൽ ചേരുക',
    pending: 'തീരുമാനമാകാത്തത്',
    confirmed: 'ഉറപ്പിച്ചു',
    completed: 'പൂർത്തിയായി',
    cancelled: 'റദ്ദാക്കി',
  },
  pa: {
    appointments_header: 'ਅਪਾਇੰਟਮੈਂਟਾਂ',
    upcoming: 'ਆਉਣ ਵਾਲੇ',
    past: 'ਬੀਤੇ',
    no_upcoming: 'ਕੋਈ ਆਉਣ ਵਾਲੀ ਅਪਾਇੰਟਮੈਂਟ ਨਹੀਂ',
    no_past: 'ਕੋਈ ਪੁਰਾਣੀ ਅਪਾਇੰਟਮੈਂਟ ਨਹੀਂ',
    book_visit: 'ਸ਼ੁਰੂ ਕਰਨ ਲਈ ਡਾਕਟਰ ਨਾਲ ਮੁਲਾਕਾਤ ਬੁੱਕ ਕਰੋ',
    completed_desc: 'ਤੁਹਾਡੀਆਂ ਪੂਰੀਆਂ ਹੋਈਆਂ ਅਪਾਇੰਟਮੈਂਟਾਂ ਇੱਥੇ ਦਿਖਾਈ ਦੇਣਗੀਆਂ',
    in_person: 'ਆਹਮੋ-ਸਾਹਮਣੇ',
    video_call: 'ਵੀਡੀਓ ਕਾਲ',
    phone: 'ਫ਼ੋਨ',
    message_btn: 'ਸੁਨੇਹਾ',
    join_call_btn: 'ਕਾਲ ਵਿੱਚ ਸ਼ਾਮਲ ਹੋਵੋ',
    pending: 'ਬਾਕੀ',
    confirmed: 'ਪੱਕੀ',
    completed: 'ਪੂਰੀ ਹੋਈ',
    cancelled: 'ਰੱਦ ਕੀਤੀ',
  },
  or: {
    appointments_header: 'ଅପଏଣ୍ଟମେଣ୍ଟ୍',
    upcoming: 'ଆଗାମୀ',
    past: 'ଅତୀତ',
    no_upcoming: 'କୌଣସି ଆଗାମୀ ଅପଏଣ୍ଟମେଣ୍ଟ ନାହିଁ',
    no_past: 'କୌଣସି ଅତୀତ ଅପଏଣ୍ଟମେଣ୍ଟ ନାହିଁ',
    book_visit: 'ଆରମ୍ଭ କରିବା ପାଇଁ ଜଣେ ଡାକ୍ତରଙ୍କ ସହ ଅପଏଣ୍ଟମେଣ୍ଟ ବୁକ୍ କରନ୍ତୁ',
    completed_desc: 'ଆପଣଙ୍କର ସମ୍ପୂର୍ଣ୍ଣ ହୋଇଥିବା ଅପଏଣ୍ଟମେଣ୍ଟଗୁଡିକ ଏଠାରେ ଦେଖାଯିବ',
    in_person: 'ସିଧାସଳଖ',
    video_call: 'ଭିଡିଓ କଲ୍',
    phone: 'ଫୋନ୍',
    message_btn: 'ସନ୍ଦେଶ',
    join_call_btn: 'କଲ୍‌ରେ ଯୋଗ ଦିଅନ୍ତୁ',
    pending: 'ପେଣ୍ଡିଂ',
    confirmed: 'ନିଶ୍ଚିତ',
    completed: 'ସମ୍ପୂର୍ଣ୍ଣ',
    cancelled: 'ବାତିଲ୍',
  }
};

export default function AppointmentsScreen() {
  const colors = useThemeColors();
  const user = useAuthStore((s) => s.user);
  const { language, t } = useLanguageStore();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');

  const trans = APPOINTMENT_TRANS[language] || APPOINTMENT_TRANS['en'];

  const STATUS_CONFIG = {
    pending: { color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', icon: 'time-outline' as const, label: trans.pending },
    confirmed: { color: '#22C55E', bg: 'rgba(34,197,94,0.1)', icon: 'checkmark-circle-outline' as const, label: trans.confirmed },
    completed: { color: '#6366F1', bg: 'rgba(99,102,241,0.1)', icon: 'checkmark-done-outline' as const, label: trans.completed },
    cancelled: { color: '#EF4444', bg: 'rgba(239,68,68,0.1)', icon: 'close-circle-outline' as const, label: trans.cancelled },
  };

  const translateSpecialization = (spec: string) => {
    if (!spec) return '';
    const maps: Record<string, Record<string, string>> = {
      en: { Cardiology: 'Cardiology', Pediatrics: 'Pediatrics', Oncology: 'Oncology', General: 'General Medicine' },
      hi: { Cardiology: 'हृदय रोग विज्ञान', Pediatrics: 'बाल चिकित्सा', Oncology: 'कैंसर विज्ञान', General: 'सामान्य चिकित्सा' },
      hinglish: { Cardiology: 'Cardiology', Pediatrics: 'Pediatrics', Oncology: 'Oncology', General: 'General Medicine' },
      bn: { Cardiology: 'কার্ডিওলজি', Pediatrics: 'পেডিয়াট্রিক্স', Oncology: 'অনকোলজি', General: 'সাধারণ ওষুধ' },
      te: { Cardiology: 'కార్డియాలజీ', Pediatrics: 'పీడియాట్రిక్స్', Oncology: 'ఆంకాలజీ', General: 'జనరల్ మెడిసిన్' },
      mr: { Cardiology: 'हृदयरोगशास्त्र', Pediatrics: 'बालरोगशास्त्र', Oncology: 'कर्करोगशास्त्र', General: 'सामान्य औषध' },
      ta: { Cardiology: 'இருதயவியல்', Pediatrics: 'குழந்தை மருத்துவம்', Oncology: 'புற்றுநோயியல்', General: 'பொது மருத்துவம்' },
      gu: { Cardiology: 'કાર્ડિયોલોજી', Pediatrics: 'બાળરોગ', Oncology: 'ઓન્કોલોજી', General: 'સામાન્ય દવા' },
      kn: { Cardiology: 'ಕಾರ್ಡಿಯಾಲಜಿ', Pediatrics: 'ಶಿಶುವೈದ್ಯಶಾಸ್ತ್ರ', Oncology: 'ಆಂಕೊಲಾಜಿ', General: 'ಸಾಮಾನ್ಯ ಔಷಧ' },
      ml: { Cardiology: 'കാർഡിയോളജി', Pediatrics: 'പീഡിയാട്രിക്സ്', Oncology: 'ഓങ്കോളജി', General: 'ജനറൽ മെഡിസിൻ' },
      pa: { Cardiology: 'ਕਾਰਡੀਓਲੋਜੀ', Pediatrics: 'ਬਾਲ ਰੋਗ', Oncology: 'ਕੈਂਸਰ ਵਿਗਿਆਨ', General: 'ਆਮ ਦਵਾਈ' },
      or: { Cardiology: 'କାର୍ଡିଓଲୋଜି', Pediatrics: 'ଶିଶୁରୋଗ', Oncology: 'ଅଙ୍କୋଲୋଜି', General: 'ସାଧାରଣ ଚିକିତ୍ସา' }
    };
    return maps[language]?.[spec] || maps['en']?.[spec] || spec;
  };

  const appointments = mockAppointments.filter((apt) => {
    if (activeTab === 'upcoming') return apt.status === 'pending' || apt.status === 'confirmed';
    return apt.status === 'completed' || apt.status === 'cancelled';
  });

  const renderAppointment = ({ item }: { item: typeof mockAppointments[0] }) => {
    const statusConfig = STATUS_CONFIG[item.status];
    const isDoctor = user?.role === 'doctor';
    const otherPerson = isDoctor ? item.patient : item.doctor;

    return (
      <Card style={styles.appointmentCard}>
        {/* Status Badge */}
        <View style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}>
          <Ionicons name={statusConfig.icon} size={14} color={statusConfig.color} />
          <Text style={[styles.statusText, { color: statusConfig.color }]}>{statusConfig.label}</Text>
        </View>

        {/* Person Info */}
        <View style={styles.personRow}>
          <Avatar uri={otherPerson.avatar_url} name={otherPerson.full_name} size={48} />
          <View style={styles.personInfo}>
            <Text style={[styles.personName, { color: colors.text }]}>{otherPerson.full_name}</Text>
            <View style={styles.personMeta}>
              <RoleBadge role={otherPerson.role} size="sm" />
              {otherPerson.specialization && (
                <Text style={[styles.specText, { color: colors.textTertiary }]}>
                  · {translateSpecialization(otherPerson.specialization)}
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* Appointment Details */}
        <View style={[styles.detailsGrid, { borderColor: colors.divider }]}>
          <View style={styles.detailItem}>
            <Ionicons name="calendar-outline" size={16} color={colors.primary} />
            <Text style={[styles.detailText, { color: colors.textSecondary }]}>
              {formatAppointmentDate(item.scheduled_at)}
            </Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="time-outline" size={16} color={colors.primary} />
            <Text style={[styles.detailText, { color: colors.textSecondary }]}>
              {formatTime(item.scheduled_at)} · {item.duration_minutes} min
            </Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name={TYPE_ICONS[item.type]} size={16} color={colors.primary} />
            <Text style={[styles.detailText, { color: colors.textSecondary }]}>
              {item.type === 'in_person' ? trans.in_person : item.type === 'video_call' ? trans.video_call : trans.phone}
            </Text>
          </View>
        </View>

        {/* Notes */}
        {item.notes && (
          <Text style={[styles.notes, { color: colors.textTertiary }]} numberOfLines={2}>
            📝 {item.notes}
          </Text>
        )}

        {/* Actions */}
        {(item.status === 'pending' || item.status === 'confirmed') && (
          <View style={styles.actions}>
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.primaryFaded }]}>
              <Ionicons name="chatbubble-outline" size={16} color={colors.primary} />
              <Text style={[styles.actionBtnText, { color: colors.primary }]}>{trans.message_btn}</Text>
            </TouchableOpacity>
            {item.type === 'video_call' && item.status === 'confirmed' && (
              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.primary }]}>
                <Ionicons name="videocam" size={16} color="#FFF" />
                <Text style={[styles.actionBtnText, { color: '#FFF' }]}>{trans.join_call_btn}</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </Card>
    );
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{trans.appointments_header}</Text>
        <TouchableOpacity style={[styles.addButton, { backgroundColor: colors.primary }]}>
          <Ionicons name="add" size={22} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={[styles.tabs, { backgroundColor: colors.surface }]}>
        {(['upcoming', 'past'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tab,
              activeTab === tab && { borderBottomColor: colors.primary, borderBottomWidth: 2 },
            ]}
            onPress={() => setActiveTab(tab)}
          >
            <Text
              style={[
                styles.tabText,
                { color: activeTab === tab ? colors.primary : colors.textTertiary },
              ]}
            >
              {tab === 'upcoming' ? trans.upcoming : trans.past}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Appointments List */}
      <FlatList
        data={appointments}
        renderItem={renderAppointment}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={48} color={colors.textTertiary} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              {activeTab === 'upcoming' ? trans.no_upcoming : trans.no_past}
            </Text>
            <Text style={[styles.emptySubtitle, { color: colors.textTertiary }]}>
              {activeTab === 'upcoming' ? trans.book_visit : trans.completed_desc}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: FontSize['2xl'],
    fontWeight: '800',
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.base,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  tabText: {
    fontSize: FontSize.base,
    fontWeight: '600',
  },
  list: {
    padding: Spacing.base,
    paddingBottom: 100,
  },
  appointmentCard: {
    marginBottom: Spacing.md,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
    gap: 5,
    marginBottom: Spacing.md,
  },
  statusText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
  personRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  personInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  personName: {
    fontSize: FontSize.base,
    fontWeight: '700',
  },
  personMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  specText: {
    fontSize: FontSize.xs,
  },
  detailsGrid: {
    borderTopWidth: 1,
    paddingTop: Spacing.md,
    gap: Spacing.sm,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: FontSize.sm,
  },
  notes: {
    fontSize: FontSize.sm,
    marginTop: Spacing.md,
    fontStyle: 'italic',
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.base,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: Radius.md,
    gap: 6,
  },
  actionBtnText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
    gap: 8,
  },
  emptyTitle: {
    fontSize: FontSize.lg,
    fontWeight: '600',
  },
  emptySubtitle: {
    fontSize: FontSize.sm,
    textAlign: 'center',
    maxWidth: 260,
  },
});

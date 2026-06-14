// Sadhna Health Care — Discover/Search Screen
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from '@/src/components/ui/Avatar';
import { RoleBadge } from '@/src/components/ui/RoleBadge';
import { useThemeColors } from '@/src/hooks/useTheme';
import { useLanguageStore } from '@/src/store/languageStore';
import { useAuthStore } from '@/src/store/authStore';
import { PeopleService } from '@/src/services/peopleService';
import { Profile } from '@/src/types';
import { UserRole, FontSize, Spacing, Radius } from '@/src/utils/constants';
import { formatCount } from '@/src/utils/helpers';

const SEARCH_TRANS: Record<string, Record<string, string>> = {
  en: {
    discover: 'Discover',
    placeholder: 'Search doctors, caregivers, patients...',
    all: 'All',
    doctors: '🩺 Doctors',
    caregivers: '🧡 Caregivers',
    patients: '🟢 Patients',
    followers: 'followers',
    no_results: 'No results found',
    result: 'result',
    results: 'results',
  },
  hi: {
    discover: 'खोजें',
    placeholder: 'डॉक्टरों, देखभालकर्ताओं, मरीजों को खोजें...',
    all: 'सभी',
    doctors: '🩺 डॉक्टर',
    caregivers: '🧡 देखभालकर्ता',
    patients: '🟢 मरीज',
    followers: 'फ़ॉलोअर्स',
    no_results: 'कोई परिणाम नहीं मिला',
    result: 'परिणाम',
    results: 'परिणाम',
  },
  hinglish: {
    discover: 'Discover',
    placeholder: 'Doctors, caregivers, patients search karein...',
    all: 'Sab',
    doctors: '🩺 Doctors',
    caregivers: '🧡 Caregivers',
    patients: '🟢 Patients',
    followers: 'followers',
    no_results: 'Koi results nahi mile',
    result: 'result',
    results: 'results',
  },
  bn: {
    discover: 'অনুসন্ধান',
    placeholder: 'ডাক্তার, কেয়ারগিভার, রোগীদের খুঁজুন...',
    all: 'সব',
    doctors: '🩺 ডাক্তার',
    caregivers: '🧡 কেয়ারগিভার',
    patients: '🟢 রোগী',
    followers: 'অনুগামী',
    no_results: 'কোন ফলাফল পাওয়া যায়নি',
    result: 'ফলাফল',
    results: 'ফলাফল',
  },
  te: {
    discover: 'కనుగొనండి',
    placeholder: 'వైద్యులు, సంరక్షకులు, రోగులను శోధించండి...',
    all: 'అన్నీ',
    doctors: '🩺 వైద్యులు',
    caregivers: '🧡 సంరక్షకులు',
    patients: '🟢 రోగులు',
    followers: 'అనుచరులు',
    no_results: 'ఫలితాలు ఏవీ కనుగొనబడలేదు',
    result: 'ఫలితం',
    results: 'ఫలితాలు',
  },
  mr: {
    discover: 'शोध घ्या',
    placeholder: 'डॉक्टर, काळजीवाहू, रुग्णांचा शोध घ्या...',
    all: 'सर्व',
    doctors: '🩺 डॉक्टर',
    caregivers: '🧡 काळजीवाहू',
    patients: '🟢 रुग्ण',
    followers: 'फॉलोअर्स',
    no_results: 'कोणतेही परिणाम आढळले नाहीत',
    result: 'निकाल',
    results: 'निकाल',
  },
  ta: {
    discover: 'கண்டறியவும்',
    placeholder: 'மருத்துவர்கள், கவனிப்பாளர்கள், நோயாளிகளைத் தேடுங்கள்...',
    all: 'அனைத்தும்',
    doctors: '🩺 மருத்துவர்கள்',
    caregivers: '🧡 கவனிப்பாளர்கள்',
    patients: '🟢 நோயாளிகள்',
    followers: 'பின்தொடர்பவர்கள்',
    no_results: 'முடிவுகள் எதுவும் இல்லை',
    result: 'முடிவு',
    results: 'முடிவுகள்',
  },
  gu: {
    discover: 'શોધો',
    placeholder: 'ડૉક્ટરો, સંભાળ રાખનારાઓ, દર્દીઓ શોધો...',
    all: 'બધા',
    doctors: '🩺 ડૉક્ટરો',
    caregivers: '🧡 સંભાળ રાખનારાઓ',
    patients: '🟢 દર્દીઓ',
    followers: 'ફોલોઅર્સ',
    no_results: 'કોઈ પરિણામ મળ્યા નથી',
    result: 'પરિણામ',
    results: 'પરિણામો',
  },
  kn: {
    discover: 'ಹುಡುಕಿ',
    placeholder: 'ವೈದ್ಯರು, ಆರೈಕೆದಾರರು, ರೋಗಿಗಳನ್ನು ಹುಡುಕಿ...',
    all: 'ಎಲ್ಲವೂ',
    doctors: '🩺 ವೈದ್ಯರು',
    caregivers: '🧡 ಆರೈಕೆದಾರರು',
    patients: '🟢 ರೋಗಿಗಳು',
    followers: 'ಅನುಯಾಯಿಗಳು',
    no_results: 'ಯಾವುದೇ ಫಲಿತಾಂಶಗಳು ಕಂಡುಬಂದಿಲ್ಲ',
    result: 'ಫಲಿತಾಂಶ',
    results: 'ಫಲಿತಾಂಶಗಳು',
  },
  ml: {
    discover: 'കണ്ടെത്തുക',
    placeholder: 'ഡോക്ടർമാർ, പരിചാരകർ, രോഗികൾ എന്നിവരെ തിരയുക...',
    all: 'എല്ലാം',
    doctors: '🩺 ഡോക്ടർമാർ',
    caregivers: '🧡 പരിചാരകർ',
    patients: '🟢 രോഗികൾ',
    followers: 'പിന്തുടരുന്നവർ',
    no_results: 'ഫലങ്ങളൊന്നും കണ്ടെത്തിയില്ല',
    result: 'ഫലം',
    results: 'ഫലങ്ങൾ',
  },
  pa: {
    discover: 'ਖੋਜੋ',
    placeholder: 'ਡਾਕਟਰਾਂ, ਦੇਖਭਾਲਕਰਤਾਵਾਂ, ਮਰੀਜ਼ਾਂ ਦੀ ਖੋਜ ਕਰੋ...',
    all: 'ਸਭ',
    doctors: '🩺 ਡਾਕਟਰ',
    caregivers: '🧡 ਦੇਖਭਾਲਕਰਤਾ',
    patients: '🟢 ਮਰੀਜ਼',
    followers: 'ਫਾਲੋਅਰਜ਼',
    no_results: 'ਕੋਈ ਨਤੀਜਾ ਨਹੀਂ ਮਿਲਿਆ',
    result: 'ਨਤੀਜਾ',
    results: 'ਨਤੀਜੇ',
  },
  or: {
    discover: 'ଆବିଷ୍କାର',
    placeholder: 'ଡାକ୍ତର, ଯତ୍ନକାରୀ, ରୋଗୀମାନଙ୍କୁ ଖୋଜନ୍ତୁ...',
    all: 'ସବୁ',
    doctors: '🩺 ଡାକ୍ତର',
    caregivers: '🧡 ଯତ୍ନକାରୀ',
    patients: '🟢 ରୋଗୀ',
    followers: 'ଅନୁଗାମୀ',
    no_results: 'କୌଣସି ଫଳାଫଳ ମିଳିଲା ନାହିଁ',
    result: 'ଫଳାଫଳ',
    results: 'ଫଳାଫଳଗୁଡିକ',
  }
};

export default function SearchScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const { language } = useLanguageStore();
  const user = useAuthStore((s) => s.user);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<UserRole | 'all'>('all');
  const [results, setResults] = useState<Profile[]>([]);

  const trans = SEARCH_TRANS[language] || SEARCH_TRANS['en'];

  // Debounced search — runs server-side in live mode, on mock data in demo mode.
  useEffect(() => {
    let active = true;
    const handle = setTimeout(async () => {
      try {
        const found = await PeopleService.search(searchQuery, activeFilter, user?.id);
        if (active) setResults(found);
      } catch (e) {
        console.warn('Search failed:', e);
      }
    }, 250);
    return () => {
      active = false;
      clearTimeout(handle);
    };
  }, [searchQuery, activeFilter, user?.id]);

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
      kn: { Cardiology: 'ಕาร์ಡಿಯಾಲಜಿ', Pediatrics: 'ಶಿಶುವೈದ್ಯಶಾಸ್ತ್ರ', Oncology: 'ಆಂಕೊಲಾಜಿ', General: 'ಸಾಮಾನ್ಯ ಔಷಧ' },
      ml: { Cardiology: 'കാർഡിയോളജി', Pediatrics: 'പീഡിയാട്രിക്സ്', Oncology: 'ഓങ്കോളജി', General: 'ജനറൽ മെഡിസിൻ' },
      pa: { Cardiology: 'ਕਾਰਡੀਓਲੋਜੀ', Pediatrics: 'ਬਾਲ ਰੋਗ', Oncology: 'ਕੈਂਸਰ ਵਿਗਿਆਨ', General: 'ਆਮ ਦਵਾਈ' },
      or: { Cardiology: 'କାର୍ଡିଓଲୋଜି', Pediatrics: 'ଶିଶୁରୋଗ', Oncology: 'ଅଙ୍କୋଲୋଜି', General: 'ସାଧାରଣ ଚିକିତ୍ସା' }
    };
    return maps[language]?.[spec] || maps['en']?.[spec] || spec;
  };

  const renderProfileCard = ({ item }: { item: Profile }) => (
    <TouchableOpacity
      style={[styles.profileCard, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}
      onPress={() => router.push(`/user/${item.id}` as any)}
      activeOpacity={0.7}
    >
      <Avatar uri={item.avatar_url} name={item.full_name} size={52} showOnline isOnline={item.is_online} lastSeenAt={item.last_seen_at} />
      <View style={styles.profileInfo}>
        <View style={styles.profileNameRow}>
          <Text style={[styles.profileName, { color: colors.text }]} numberOfLines={1}>
            {item.full_name}
          </Text>
          {item.is_verified && (
            <Ionicons name="checkmark-circle" size={16} color="#3B82F6" />
          )}
        </View>
        <Text style={[styles.profileUsername, { color: colors.textTertiary }]}>
          @{item.username}
        </Text>
        <View style={styles.profileMeta}>
          <RoleBadge role={item.role} size="sm" />
          {item.specialization && (
            <Text style={[styles.specialization, { color: colors.textSecondary }]}>
              · {translateSpecialization(item.specialization)}
            </Text>
          )}
        </View>
      </View>
      <View style={styles.profileStats}>
        <Text style={[styles.statNumber, { color: colors.text }]}>
          {formatCount(item.followers_count)}
        </Text>
        <Text style={[styles.statLabel, { color: colors.textTertiary }]}>{trans.followers}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Search Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{trans.discover}</Text>
        <View style={[styles.searchBar, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
          <Ionicons name="search" size={20} color={colors.textTertiary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder={trans.placeholder}
            placeholderTextColor={colors.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={colors.textTertiary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filter Chips */}
      <View style={styles.filters}>
        {[
          { key: 'all' as const, label: trans.all, icon: 'people' as const },
          { key: 'doctor' as UserRole, label: trans.doctors, icon: 'medkit' as const },
          { key: 'caregiver' as UserRole, label: trans.caregivers, icon: 'heart' as const },
          { key: 'patient' as UserRole, label: trans.patients, icon: 'person' as const },
        ].map((filter) => (
          <TouchableOpacity
            key={filter.key}
            style={[
              styles.filterChip,
              {
                backgroundColor: activeFilter === filter.key ? colors.primary : colors.surfaceSecondary,
                borderColor: activeFilter === filter.key ? colors.primary : colors.border,
              },
            ]}
            onPress={() => setActiveFilter(filter.key)}
          >
            <Text
              style={[
                styles.filterText,
                { color: activeFilter === filter.key ? '#FFF' : colors.textSecondary },
              ]}
            >
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Results */}
      <FlatList
        data={results}
        renderItem={renderProfileCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={48} color={colors.textTertiary} />
            <Text style={[styles.emptyText, { color: colors.textTertiary }]}>
              {trans.no_results}
            </Text>
          </View>
        }
        ListHeaderComponent={
          <Text style={[styles.resultCount, { color: colors.textTertiary }]}>
            {results.length} {results.length === 1 ? trans.result : trans.results}
          </Text>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: FontSize['2xl'],
    fontWeight: '800',
    marginBottom: Spacing.md,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    borderRadius: Radius.md,
    borderWidth: 1,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: FontSize.base,
  },
  filters: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  filterChip: {
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
  list: {
    paddingHorizontal: Spacing.base,
    paddingBottom: 100,
  },
  resultCount: {
    fontSize: FontSize.xs,
    marginBottom: Spacing.md,
    fontWeight: '500',
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.base,
    borderRadius: Radius.lg,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  profileInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  profileNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  profileName: {
    fontSize: FontSize.base,
    fontWeight: '700',
  },
  profileUsername: {
    fontSize: FontSize.xs,
    marginTop: 1,
  },
  profileMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 6,
  },
  specialization: {
    fontSize: FontSize.xs,
  },
  profileStats: {
    alignItems: 'center',
    marginLeft: Spacing.md,
  },
  statNumber: {
    fontSize: FontSize.md,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 10,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: FontSize.base,
  },
});

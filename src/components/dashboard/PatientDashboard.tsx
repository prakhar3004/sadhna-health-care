// Sadhna Health Care — Patient Dashboard Component (Advanced Interactive Level with Handwriting Safety safeguards)
import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Alert, 
  Modal, 
  TextInput, 
  ActivityIndicator,
  Animated,
  Easing
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useThemeColors } from '@/src/hooks/useTheme';
import { useAuthStore } from '@/src/store/authStore';
import { useLanguageStore } from '@/src/store/languageStore';
import { Card } from '@/src/components/ui/Card';
import { Avatar } from '@/src/components/ui/Avatar';
import { Radius, FontSize, Spacing } from '@/src/utils/constants';
import { ApiService } from '@/src/services/api';

const CHECKLIST_ITEMS_MAP: Record<string, Record<number, string>> = {
  en: {
    1: 'Morning Medicine (Metformin)',
    2: '30-minute brisk walk',
    3: 'Afternoon Medicine',
    4: 'Evening blood sugar check',
    5: "Keep it up! You're doing great on your health journey today.",
  },
  hi: {
    1: 'सुबह की दवा (मेटफॉर्मिन)',
    2: '30 मिनट की तेज सैर (वॉक)',
    3: 'दोपहर की दवा',
    4: 'शाम को ब्लड शुगर की जांच',
    5: "इसे जारी रखें! आज आप अपनी स्वास्थ्य यात्रा पर बहुत अच्छा कर रहे हैं।",
  },
  hinglish: {
    1: 'Morning Medicine (Metformin) lein',
    2: '30-minute brisk walk karein',
    3: 'Afternoon Medicine lein',
    4: 'Evening blood sugar check karein',
    5: "Ise continue rakhein! Aaj aap apni health journey par bahut accha kar rahe hain.",
  },
  bn: {
    1: 'সকালের ওষুধ (মেটফর্মিন)',
    2: '৩০ মিনিট দ্রুত হাঁটা',
    3: 'দুপুরের ওষুধ',
    4: 'সন্ধ্যায় রক্তে শর্করার পরীক্ষা',
    5: "এটি চালিয়ে যান! আজ আপনার স্বাস্থ্য যাত্রায় আপনি খুব ভালো করছেন।",
  },
  te: {
    1: 'ఉదయం మందులు (మెట్‌ఫార్మిన్)',
    2: '30 నిమిషాల వేగవంతమైన నడక',
    3: 'మధ్యాహ్నం మందులు',
    4: 'సాయంత్రం బ్లడ్ షుగర్ పరీక్ష',
    5: "ఇలాగే కొనసాగించండి! ఈ రోజు మీ ఆరోగ్య ప్రయాణంలో మీరు చాలా బాగా చేస్తున్నారు.",
  },
  mr: {
    1: 'सकाळचे औषध (मेटफॉर्मिन)',
    2: '३० मिनिटे वेगाने चालणे',
    3: 'दुपारचे औषध',
    4: 'संध्याकाळी रक्तातील साखर तपासणे',
    5: "असेच सुरू ठेवा! आज तुम्ही तुमच्या आरोग्य प्रवासात खूप चांगले करत आहात.",
  },
  ta: {
    1: 'காலை மருந்து (மெட்ஃபார்மின்)',
    2: '30 நிமிட வேகமான நடைப்பயிற்சி',
    3: 'மதிய மருந்து',
    4: 'மாலை இரத்த சர்க்கரை சோதனை',
    5: "இதேபோல் தொடருங்கள்! இன்று உங்கள் ஆரோக்கிய பயணத்தில் நீங்கள் சிறப்பாக செயல்படுகிறீர்கள்.",
  },
  gu: {
    1: 'સવારની દવા (મેટફોર્મિન)',
    2: '૩૦ મિનિટ ઝડપી ચાલવું',
    3: 'બપોરની દવા',
    4: 'સાંજે બ્લડ સુગરની તપાસ',
    5: "આમ જ ચાલુ રાખો! આજે તમે તમારા સ્વાસ્થ્ય પ્રવાસ પર ઘણું સારું काम કરી રહ્યા છો.",
  },
  kn: {
    1: 'ಬೆಳಗಿನ ಔಷಧ (ಮೆಟ್‌ಫಾರ್ಮಿನ್)',
    2: '30 ನಿಮಿಷಗಳ ವೇಗದ ನಡಿಗೆ',
    3: 'ಮಧ್ಯಾಹ್ನದ ಔಷಧ',
    4: 'ಸಂಜೆ ರಕ್ತದ ಸಕ್ಕರೆ ಪರೀಕ್ಷೆ',
    5: "ಹೀಗೆಯೇ ಮುಂದುವರಿಸಿ! ಇಂದು ನಿಮ್ಮ आरोग्य ಪ್ರಯಾಣದಲ್ಲಿ ನೀವು ಉತ್ತಮವಾಗಿ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತಿದ್ದೀರಿ.",
  },
  ml: {
    1: 'രാവിലെത്തെ മരുന്ന് (മെറ്റ്ഫോർമിൻ)',
    2: '30 മിനിറ്റ് വേഗത്തിലുള്ള നടത്തം',
    3: 'ഉച്ചയ്ക്കത്തെ മരുന്ന്',
    4: 'വൈകുന്നേരത്തെ രക്തത്തിലെ പഞ്ചസാര പരിശോധന',
    5: "ഇതുപോലെ തുടരുക! ഇന്ന് നിങ്ങളുടെ ആരോഗ്യ യാത്രയിൽ നിങ്ങൾ മികച്ച രീതിയിലാണ് മുന്നേറുന്നത്.",
  },
  pa: {
    1: 'ਸਵੇਰ ਦੀ ਦਵਾਈ (ਮੈਟਫੋਰਮਿਨ)',
    2: '30 ਮਿੰਟ ਤੇਜ਼ ਸੈਰ',
    3: 'ਦੁਪਹਿਰ ਦੀ ਦਵਾਈ',
    4: 'ਸ਼ਾਮ ਨੂੰ ਬਲੱਡ ਸ਼ੂਗਰ ਦੀ ਜਾਂਚ',
    5: "ਇਸੇ ਤਰ੍ਹਾਂ ਕਰਦੇ ਰਹੋ! ਅੱਜ ਤੁਸੀਂ ਆਪਣੀ ਸਿਹਤ ਯਾਤਰਾ 'ਤੇ ਬਹੁਤ ਵਧੀਆ ਕਰ ਰਹੇ ਹੋ।",
  },
  or: {
    1: 'ସକାଳ ଔଷଧ (ମେଟଫର୍ମିନ୍)',
    2: '୩୦ ମିନିଟ୍ ଦ୍ରୁତ ଚାଲିବା',
    3: 'ମଧ୍ୟାହ୍ନ ଔଷଧ',
    4: 'ସନ୍ଧ୍ଯାରେ ରକ୍ତ ଶର୍କରା ଯାଞ୍ଚ',
    5: "ଏହାକୁ ଜାରି ରଖନ୍ତୁ! ଆଜି ଆପଣ ନିଜ ସ୍ୱାସ୍ଥ୍ୟ ଯାତ୍ରାରେ ବହୁତ ଭଲ କରୁଛନ୍ତି।",
  },
};

const GOALS_PRESETS: Record<string, { id: string; label: string; text: string; hope: string }[]> = {
  en: [
    { id: 'kedarnath', label: '🏔️ Kedarnath Yatra', text: 'Go on Kedarnath Yatra', hope: 'Every medication and step brings you closer to the holy peaks of Kedarnath.' },
    { id: 'wedding', label: '💃 Attend Daughter\'s Wedding', text: 'Attend my daughter\'s wedding active & healthy', hope: 'Staying disciplined today means dancing with joy at your daughter\'s wedding!' },
    { id: 'cycle', label: '🚲 Ride Cycle Again', text: 'Ride a bicycle freely again', hope: 'Strengthening your joints today will get you back pedaling in the fresh air soon.' },
    { id: 'painfree', label: '🚶 Walk Pain-Free', text: 'Walk completely pain-free', hope: 'Completing your walks today builds the stamina for a life of free movement.' },
  ],
  hi: [
    { id: 'kedarnath', label: '🏔️ केदारनाथ यात्रा', text: 'केदारनाथ यात्रा पर जाना है', hope: 'आज की हर दवा और कदम आपको केदारनाथ के पवित्र शिखरों के करीब ले जाते हैं।' },
    { id: 'wedding', label: '💃 बेटी की शादी में शामिल होना', text: 'बेटी की शादी में स्वस्थ और सक्रिय होकर शामिल होना है', hope: 'आज अनुशासित रहने का मतलब है कल अपनी बेटी की शादी में खुशी से झूमना!' },
    { id: 'cycle', label: '🚲 फिर से साइकिल चलाना', text: 'बिना किसी सहारे के फिर से साइकिल चलाना है', hope: 'आज अपने जोड़ों को मजबूत करने से आप जल्द ही ताजी हवा में साइकिल चला सकेंगे।' },
    { id: 'painfree', label: '🚶 बिना दर्द के चलना', text: 'बिना किसी दर्द के स्वतंत्र रूप से चलना है', hope: 'आज की सैर आपके शरीर में दर्द-मुक्त और स्वतंत्र जीवन जीने की ताकत भरेगी।' },
  ],
  hinglish: [
    { id: 'kedarnath', label: '🏔️ Kedarnath Yatra', text: 'Kedarnath Yatra par jaana hai', hope: 'Aaj ki har medicine aur step aapko Kedarnath ke peaks ke aur paas le jayegi.' },
    { id: 'wedding', label: '💃 Daughter\'s Wedding', text: 'Daughter ki shaadi active aur healthy hokar attend karni hai', hope: 'Aaj disciplined rehne ka matlab hai apni beti ki shaadi me khushi se naachna!' },
    { id: 'cycle', label: '🚲 Cycle chalana', text: 'Bicycle fir se chalana hai', hope: 'Aaj joints ko strong karenge to jald hi fresh air me cycle chala payenge.' },
    { id: 'painfree', label: '🚶 Pain-free chalna', text: 'Bina dard ke chalna hai', hope: 'Daily walk complete karne se bina dard ke chalne ki energy aayegi.' },
  ]
};

const DASHBOARD_UI_TRANS: Record<string, Record<string, string>> = {
  en: {
    wajah_title: 'Jeene Ki Wajah (My Goal)',
    edit_goal: 'Edit Goal',
    set_goal: 'Set Your Life Goal',
    goal_placeholder: 'What is your reason to heal? e.g. Attend daughter\'s wedding',
    goal_progress: 'Goal Progress',
    save_goal: 'Save Goal',
    vitals_title: 'Log Vitals',
    sugar: 'Blood Sugar',
    bp: 'Blood Pressure',
    heart_rate: 'Heart Rate',
    save_log: 'Save Log',
    sugar_unit: 'mg/dL',
    bp_unit: 'mmHg',
    hr_unit: 'bpm',
    vitals_status_stable: 'Vitals Stable 🟢',
    vitals_status_warning: 'Vitals Slightly Off 🟡',
    vitals_status_alert: 'Alert: Consult Doctor 🔴',
    streak_label: 'Day Streak 🔥',
    streak_desc: 'Complete checklist daily to keep the streak alive!',
    medals_title: 'Achievements & Medals',
    medals_desc: 'Earn medals by logging vitals and completing tasks',
    doctor_notes_title: 'Doctor Notes & Feedback',
    sos_title: 'Emergency SOS Alert',
    sos_message: 'Trigger SOS countdown and notify your emergency contacts?',
    sos_triggered: 'SOS Sent! Care team and emergency contacts have been notified.',
    cancel: 'Cancel',
    yes: 'Yes, Send SOS',
    
    // Journey
    journey_title: 'My Life Goals 🎯',
    journey_subtitle: 'Track steps and progress towards your recovery milestones',
    active_phase: 'Active Step',
    milestones_title: 'Key Milestones & Targets',

    // Prescription Scanner
    prescription_title: 'Doctor\'s Parcha (Prescription) 📄',
    prescription_subtitle: 'Upload a doctor\'s prescription to auto-schedule medicines & advice list.',
    upload_btn: 'Upload & Scan Parcha',
    parcha_sample1: 'Diabetes Control Plan',
    parcha_sample2: 'Joint Pain Recovery Plan',
    parcha_scan_title: 'Scanning Doctor\'s Prescription...',
    parcha_apply: 'Add to My Schedule',
    parcha_success: 'Parcha Scanned Successfully!',
    parcha_medicines_label: 'Extracted Medicines:',
    parcha_advice_label: 'Doctor\'s Advice:',

    // Custom Tasks
    custom_task_btn: 'Add Custom Task',
    custom_task_modal_title: 'Create Custom Daily Goal',
    custom_task_placeholder: 'e.g. Drink 3L water, Meditate 15 mins',
    custom_task_save: 'Add Goal',
    custom_task_empty: 'Please enter a task name.',

    // SOS Contacts
    manage_sos_btn: 'Manage SOS Contacts ⚙️',
    sos_contacts_title: 'SOS Emergency Directory',
    sos_add_btn: 'Add Contact',
    sos_name_placeholder: 'Contact Name',
    sos_phone_placeholder: 'Phone Number',
    sos_relation_placeholder: 'Relation (e.g. Son, Sister)',
    sos_countdown_title: 'SOS Emergency Countdown',
    sos_countdown_sub: 'Sending emergency alerts in...',
    sos_cancel: 'CANCEL ALERT',
    sos_fired_title: 'Emergency SOS Active! 🚨',
    sos_fired_desc: 'Urgent calls & text notifications have been sent to your contacts.',
    sos_contact_list_empty: 'No custom contacts added yet. Add one below.',

    // Treatment History
    history_title: 'Treatment & Test History 📚',
    history_subtitle: 'Timeline of all prescriptions, vitals log records, and uploaded lab reports.',
    upload_report_btn: 'Upload Test Report',
    upload_report_modal_title: 'Upload Diagnostic Report / Test',
    report_name_placeholder: 'Report Name (e.g. CBC Blood Test, Lipid)',
    report_hospital_placeholder: 'Lab / Hospital Name (e.g. Sadhna Diagnostics)',
    report_details_placeholder: 'Enter key results or medical notes here...',
    report_file_placeholder: 'Select Mock File (e.g. report.pdf)',
    save_report_btn: 'Save to My History',
    history_type_prescription: 'Doctor Prescription 📄',
    history_type_vitals: 'Vitals Log 🩸',
    history_type_report: 'Lab Report 🧪',
    report_file_attached: 'Attached file:',
    report_lab_label: 'Origin/Hospital:',

    // Safety Translations
    parcha_sample3: 'Messy / Scribbled Prescription',
    safety_check_failed: '⚠️ Medical Safety Check Active',
    safety_check_failed_desc: 'To ensure your safety, we did not auto-schedule this medicine. Guessing medicine timings can cause dangerous dosage errors. Please confirm with your doctor or caregiver.',
    safety_ask_doctor: '💬 Ask Dr. Priya',
    safety_ask_caregiver: '👨‍👩‍👦 Ask Ramesh (Son)',
    safety_enter_manual: '✏️ Enter Manually',
    safety_confidence_label: 'Scan Accuracy check:',
    unclear_medicine_name: '[Unclear Handwriting] Tab. L--- 5mg',
    manual_edit_title: 'Verify & Input Correct Medicine',
    manual_edit_input_placeholder: 'e.g. Tab. Lipitor 10mg (Night)',

    // Seva Ecosystem (Pillar 5)
    seva_title: 'Seva Ecosystem 🤝',
    seva_subtitle: 'Community helping community. Support monthly pools or verified medical emergency requests.',
    seva_pool_title: 'Monthly Seva Pool',
    seva_pool_desc: 'Co-funding emergency cases & supporting under-privileged patients.',
    seva_pool_raised: 'Total Raised: ',
    seva_pool_goal: 'Goal: ',
    seva_pool_contributors: 'Contributors: ',
    seva_contribute_btn: 'Contribute / योगदान करें 💖',
    seva_emergency_title: 'Emergency Medical Requests',
    seva_request_support_btn: 'Request Support 🚨',
    seva_partner_ngos: 'Verified NGO Partners:',
    seva_status_verified: 'Verified ✅',
    seva_status_pending: 'Under Verification ⏳',
    seva_status_rejected: 'Declined ❌',
    seva_contribute_modal_title: 'Contribute to Seva Pool',
    seva_contribute_amount_label: 'Select or enter contribution amount (₹):',
    seva_contribute_submit: 'Confirm Contribution 💖',
    seva_request_modal_title: 'Request Emergency Medical Funding',
    seva_request_name_label: 'Patient Name:',
    seva_request_hospital_label: 'Hospital Name:',
    seva_request_amount_label: 'Required Funding (₹):',
    seva_request_reason_label: 'Medical Reason / Diagnosis:',
    seva_request_doc_label: 'Upload Medical Certificate / Estimate:',
    seva_request_doc_attached: 'Attached Document:',
    seva_request_submit: 'Submit Funding Request 🚨',
    seva_donation_success_title: 'Thank you! 💖',
    seva_donation_success_desc: 'Your contribution of ₹{amount} has been added. You are a Seva Hero!',
    seva_request_success_title: 'Request Submitted ⏳',
    seva_request_success_desc: 'Your emergency funding request has been submitted. Partner NGOs (Goonj/Sadhna) will verify the document and launch it in the feed shortly.'
  },
  hi: {
    wajah_title: 'जीने की वजह (मेरा लक्ष्य)',
    edit_goal: 'लक्ष्य बदलें',
    set_goal: 'अपना जीवन लक्ष्य सेट करें',
    goal_placeholder: 'स्वस्थ होने की आपकी वजह क्या है? जैसे: बेटी की शादी',
    goal_progress: 'लक्ष्य प्रगति',
    save_goal: 'लक्ष्य सहेजें',
    vitals_title: 'वाइटल्स दर्ज करें',
    sugar: 'ब्लड शुगर',
    bp: 'ब्लड प्रेशर',
    heart_rate: 'हार्ट रेट',
    save_log: 'लॉग सहेजें',
    sugar_unit: 'mg/dL',
    bp_unit: 'mmHg',
    hr_unit: 'bpm',
    vitals_status_stable: 'वाइटल्स संतुलित हैं 🟢',
    vitals_status_warning: 'वाइटल्स सामान्य से अलग हैं 🟡',
    vitals_status_alert: 'चेतावनी: डॉक्टर से परामर्श लें 🔴',
    streak_label: 'दिनों का ट्रैक 🔥',
    streak_desc: 'ट्रैक बनाए रखने के लिए चेकलिस्ट पूरी करें!',
    medals_title: 'आपकी उपलब्धियां और पदक',
    medals_desc: 'वाइटल्स दर्ज करने और काम पूरा करने पर पदक जीतें',
    doctor_notes_title: 'Doctor नोट्स और सुझाव',
    sos_title: 'आपातकालीन SOS अलर्ट',
    sos_message: 'क्या आप आपातकालीन अलर्ट चालू करके अपने संपर्कों को सूचित करना चाहते हैं?',
    sos_triggered: 'SOS भेजा गया! केयर टीम और परिवार को सूचित कर दिया गया है।',
    cancel: 'रद्द करें',
    yes: 'हाँ, SOS भेजें',

    // Journey
    journey_title: 'मेरे जीवन के लक्ष्य 🎯',
    journey_subtitle: 'अपने जीवन के लक्ष्यों की ओर बढ़े कदमों को ट्रैक करें',
    active_phase: 'सक्रिय चरण',
    milestones_title: 'इस चरण के प्रमुख कार्य',

    // Prescription Scanner
    prescription_title: 'डॉक्टर का पर्चा (Prescription) 📄',
    prescription_subtitle: 'दवाइयों और सलाह का शेड्यूल अपने आप बनाने के लिए डॉक्टर का पर्चा अपलोड करें।',
    upload_btn: 'पर्चा स्कैन करें',
    parcha_sample1: 'डायबिटीज कंट्रोल प्लान (सैंपल)',
    parcha_sample2: 'जोड़ों के दर्द का प्लान (सैंपल)',
    parcha_scan_title: 'डॉक्टर का पर्चा स्कैन हो रहा है...',
    parcha_apply: 'दैनिक शेड्यूल में जोड़ें',
    parcha_success: 'पर्चा सफलतापूर्वक स्कैन हुआ!',
    parcha_medicines_label: 'निकाली गई दवाएं:',
    parcha_advice_label: 'डॉक्टर की सलाह:',

    // Custom Tasks
    custom_task_btn: 'नया कार्य जोड़ें',
    custom_task_modal_title: 'अपना दैनिक लक्ष्य बनाएं',
    custom_task_placeholder: 'जैसे: ३ लीटर पानी पीना, १० मिनट ध्यान',
    custom_task_save: 'लक्ष्य जोड़ें',
    custom_task_empty: 'कृपया कार्य का नाम दर्ज करें।',

    // SOS Contacts
    manage_sos_btn: 'आपातकालीन नंबर बदलें ⚙️',
    sos_contacts_title: 'आपातकालीन संपर्क सूची',
    sos_add_btn: 'संपर्क जोड़ें',
    sos_name_placeholder: 'संपर्क का नाम',
    sos_phone_placeholder: 'फ़ोन नंबर',
    sos_relation_placeholder: 'संबंध (जैसे: बेटा, बहन)',
    sos_countdown_title: 'SOS आपातकालीन काउंटडाउन',
    sos_countdown_sub: 'सभी संपर्कों को आपातकालीन संदेश भेजा जा रहा है...',
    sos_cancel: 'अलर्ट रद्द करें',
    sos_fired_title: 'SOS अलर्ट भेजा गया! 🚨',
    sos_fired_desc: 'सभी संपर्कों को SMS और कॉल अलर्ट भेज दिए गए हैं। सहायता आ रही है।',
    sos_contact_list_empty: 'अभी कोई आपातकालीन संपर्क नहीं है। नीचे से जोड़ें।',

    // Treatment History
    history_title: 'मेरा उपचार एवं जांच इतिहास 📚',
    history_subtitle: 'सभी डॉक्टरों के पर्चों, वाइटल्स लॉग और अपलोड की गई लैब रिपोर्टों का समय-वार इतिहास।',
    upload_report_btn: 'नई जांच रिपोर्ट जोड़ें',
    upload_report_modal_title: 'जांच रिपोर्ट / टेस्ट अपलोड करें',
    report_name_placeholder: 'रिपोर्ट का नाम (जैसे: सीबीसी टेस्ट, थायराइड, लिपिड)',
    report_hospital_placeholder: 'लैब / अस्पताल का नाम (जैसे: साधना लैब्स)',
    report_details_placeholder: 'मुख्य परिणाम या निर्देश यहाँ दर्ज करें...',
    report_file_placeholder: 'रिपोर्ट फ़ाइल (जैसे: report.pdf)',
    save_report_btn: 'इतिहास में सहेजें',
    history_type_prescription: 'डॉक्टर का पर्चा 📄',
    history_type_vitals: 'वाइटल्स रिकॉर्ड 🩸',
    history_type_report: 'लैब जांच रिपोर्ट 🧪',
    report_file_attached: 'संलग्न फ़ाइल:',
    report_lab_label: 'स्रोत/अस्पताल:',

    // Safety Translations
    parcha_sample3: 'अस्पष्ट लिखावट पर्चा (सैंपल)',
    safety_check_failed: '⚠️ चिकित्सा सुरक्षा जाँच सक्रिय है',
    safety_check_failed_desc: 'आपकी सुरक्षा के लिए, हमने इस दवा को ऑटो-शेड्यूल नहीं किया है। दवा के समय का अंदाज़ा लगाना घातक हो सकता है। कृपया अपने डॉक्टर या केयरगिवर से इसकी पुष्टि करें।',
    safety_ask_doctor: '💬 डॉ. प्रिया से पूछें',
    safety_ask_caregiver: '👨‍👩‍👦 रमेश (बेटा) से पूछें',
    safety_enter_manual: '✏️ खुद दर्ज करें',
    safety_confidence_label: 'पर्चा स्कैन सटीकता स्कोर:',
    unclear_medicine_name: '[अस्पष्ट लिखावट] टैब. L--- ५mg',
    manual_edit_title: 'दवा की पुष्टि और सुधार करें',
    manual_edit_input_placeholder: 'जैसे: टैब. लिपिटोर १०mg (रात को)',

    // Seva Ecosystem (Pillar 5)
    seva_title: 'सेवा इकोसिस्टम 🤝',
    seva_subtitle: 'कम्युनिटी द्वारा कम्युनिटी की मदद। मासिक पूल या सत्यापित चिकित्सा मामलों का समर्थन करें।',
    seva_pool_title: 'मासिक सेवा पूल',
    seva_pool_desc: 'गरीब मरीजों के इलाज और आपातकालीन चिकित्सा सहायता के लिए।',
    seva_pool_raised: 'कुल सहेजा गया: ',
    seva_pool_goal: 'लक्ष्य: ',
    seva_pool_contributors: 'योगदानकर्ता: ',
    seva_contribute_btn: 'सेवा योगदान दें 💖',
    seva_emergency_title: 'आपातकालीन चिकित्सा सहायता अनुरोध',
    seva_request_support_btn: 'मदद के लिए अनुरोध करें 🚨',
    seva_partner_ngos: 'सत्यापित NGO भागीदार:',
    seva_status_verified: 'सत्यापित ✅',
    seva_status_pending: 'जांच जारी ⏳',
    seva_status_rejected: 'अस्वीकृत ❌',
    seva_contribute_modal_title: 'सेवा पूल में योगदान करें',
    seva_contribute_amount_label: 'योगदान राशि चुनें या दर्ज करें (₹):',
    seva_contribute_submit: 'योगदान की पुष्टि करें 💖',
    seva_request_modal_title: 'आपातकालीन चिकित्सा सहायता के लिए अनुरोध',
    seva_request_name_label: 'मरीज का नाम:',
    seva_request_hospital_label: 'अस्पताल का नाम:',
    seva_request_amount_label: 'आवश्यक राशि (₹):',
    seva_request_reason_label: 'चिकित्सकीय कारण / बीमारी:',
    seva_request_doc_label: 'चिकित्सा प्रमाण पत्र / एस्टीमेट अपलोड करें:',
    seva_request_doc_attached: 'संलग्न दस्तावेज:',
    seva_request_submit: 'अनुरोध सबमिट करें 🚨',
    seva_donation_success_title: 'बहुत-बहुत धन्यवाद! 💖',
    seva_donation_success_desc: 'आपका ₹{amount} का योगदान पूल में जोड़ दिया गया है। आप एक सेवा नायक हैं!',
    seva_request_success_title: 'अनुरोध सबमिट हुआ ⏳',
    seva_request_success_desc: 'आपका आपातकालीन सहायता अनुरोध सबमिट हो चुका है। हमारे सहयोगी NGO (गूंज/साधना) दस्तावेज की जांच कर इसे जल्द ही लाइव करेंगे।'
  },
  hinglish: {
    wajah_title: 'Jeene Ki Wajah (Mera Goal)',
    edit_goal: 'Goal Edit Karein',
    set_goal: 'Apna Life Goal Set Karein',
    goal_placeholder: 'Swasth hone ki wajah kya hai? e.g. Beti ki shaadi',
    goal_progress: 'Goal Progress',
    save_goal: 'Goal Save Karein',
    vitals_title: 'Vitals Log Karein',
    sugar: 'Blood Sugar',
    bp: 'Blood Pressure',
    heart_rate: 'Heart Rate',
    save_log: 'Log Save Karein',
    sugar_unit: 'mg/dL',
    bp_unit: 'mmHg',
    hr_unit: 'bpm',
    vitals_status_stable: 'Vitals Balanced Hain 🟢',
    vitals_status_warning: 'Vitals Slightly Off Hain 🟡',
    vitals_status_alert: 'Alert: Doctor se consult karein 🔴',
    streak_label: 'Day Streak 🔥',
    streak_desc: 'Streak continue rakhne ke liye checklist poori karein!',
    medals_title: 'Aapke Medals & Achievements',
    medals_desc: 'Reminders pure karke medals jeetein',
    doctor_notes_title: 'Doctor Notes & Feedback',
    sos_title: 'Emergency SOS Alert',
    sos_message: 'Emergency SOS trigger karke contacts ko inform karein?',
    sos_triggered: 'SOS Sent! Care team aur family ko details send kar di gayi hain.',
    cancel: 'Cancel',
    yes: 'Haan, SOS Bhejein',

    // Journey
    journey_title: 'Mere Jeevan Ke Goals 🎯',
    journey_subtitle: 'Apne life goals ki taraf bade steps ko track karein',
    active_phase: 'Active Step',
    milestones_title: 'Step Tasks & Milestones',

    // Prescription Scanner
    prescription_title: 'Doctor ka Parcha (Prescription) 📄',
    prescription_subtitle: 'Medicine schedule aur advice automatic set karne ke liye prescription upload karein.',
    upload_btn: 'Parcha Scan Karein',
    parcha_sample1: 'Diabetes Control Parcha (Sample)',
    parcha_sample2: 'Joint Pain Recovery Parcha (Sample)',
    parcha_scan_title: 'Doctor ka Parcha Scan ho raha hai...',
    parcha_apply: 'Daily Schedule me add karein',
    parcha_success: 'Scan complete! Medicines aur instructions load ho gaye hain.',
    parcha_medicines_label: 'Extracted Medicines:',
    parcha_advice_label: 'Doctor\'s Advice:',

    // Custom Tasks
    custom_task_btn: 'Add Custom Task',
    custom_task_modal_title: 'New Daily Task banayein',
    custom_task_placeholder: 'e.g., 3L water peena, Evening Meditation',
    custom_task_save: 'Task Save Karein',
    custom_task_empty: 'Please task enter karein.',

    // SOS Contacts
    manage_sos_btn: 'SOS Numbers Manage Karein ⚙️',
    sos_contacts_title: 'Emergency SOS Directory',
    sos_add_btn: 'Contact Add Karein',
    sos_name_placeholder: 'Name',
    sos_phone_placeholder: 'Phone Number',
    sos_relation_placeholder: 'Relation (e.g., Son, Doctor)',
    sos_countdown_title: 'SOS Emergency Countdown',
    sos_countdown_sub: 'Subhi contacts ko SOS alert send ho raha hai...',
    sos_cancel: 'CANCEL ALERT',
    sos_fired_title: 'Emergency SOS Sent! 🚨',
    sos_fired_desc: 'Sabhi contacts ko message aur call details send kar di gayi hain.',
    sos_contact_list_empty: 'Abhi koi numbers nahi hain. Niche se add karein.',

    // Treatment History
    history_title: 'Treatment & Test History 📚',
    history_subtitle: 'Doctor prescriptions, vitals log records aur uploaded lab reports ki timeline.',
    upload_report_btn: 'Upload Lab Report',
    upload_report_modal_title: 'Diagnostic Lab Report Upload Karein',
    report_name_placeholder: 'Report Name (e.g. Thyroid, Blood Test)',
    report_hospital_placeholder: 'Lab / Hospital Name (e.g. Sadhna Labs)',
    report_details_placeholder: 'Key results aur notes enter karein...',
    report_file_placeholder: 'Select Mock File (e.g. report.pdf)',
    save_report_btn: 'Save to My History',
    history_type_prescription: 'Doctor Prescription 📄',
    history_type_vitals: 'Vitals Record 🩸',
    history_type_report: 'Lab Report 🧪',
    report_file_attached: 'Attached file:',
    report_lab_label: 'Origin/Hospital:',

    // Safety Translations
    parcha_sample3: 'Illegible Handwriting Prescription',
    safety_check_failed: '⚠️ Medical Safety Check Active',
    safety_check_failed_desc: 'Aapki safety ke liye, humne is medicine ko auto-schedule nahi kiya hai. Medicine timing guess karna dangerous ho sakta hai. Please doctor ya caregiver se confirm karein.',
    safety_ask_doctor: '💬 Ask Doctor',
    safety_ask_caregiver: '👨‍👩‍👦 Ask Caregiver',
    safety_enter_manual: '✏️ Enter Manually',
    safety_confidence_label: 'Scan Accuracy Score:',
    unclear_medicine_name: '[Unclear Handwriting] Tab. L--- 5mg',
    manual_edit_title: 'Verify & Correct Medication',
    manual_edit_input_placeholder: 'e.g., Tab. Lipitor 10mg (Night)',

    // Seva Ecosystem (Pillar 5)
    seva_title: 'Seva Ecosystem 🤝',
    seva_subtitle: 'Community helping community. Monthly pool ya verified medical cases me help karein.',
    seva_pool_title: 'Monthly Seva Pool',
    seva_pool_desc: 'Under-privileged patients ke treatment aur emergency cases ki help ke liye.',
    seva_pool_raised: 'Total Raised: ',
    seva_pool_goal: 'Goal: ',
    seva_pool_contributors: 'Contributors: ',
    seva_contribute_btn: 'Seva Contribution karein 💖',
    seva_emergency_title: 'Emergency Medical Requests',
    seva_request_support_btn: 'Help ke liye Request karein 🚨',
    seva_partner_ngos: 'Verified NGO Partners:',
    seva_status_verified: 'Verified ✅',
    seva_status_pending: 'Verification Pending ⏳',
    seva_status_rejected: 'Declined ❌',
    seva_contribute_modal_title: 'Seva Pool me Contribute karein',
    seva_contribute_amount_label: 'Amount select ya enter karein (₹):',
    seva_contribute_submit: 'Contribution Confirm karein 💖',
    seva_request_modal_title: 'Emergency Medical Funding Request',
    seva_request_name_label: 'Patient Name:',
    seva_request_hospital_label: 'Hospital Name:',
    seva_request_amount_label: 'Required Amount (₹):',
    seva_request_reason_label: 'Medical Reason / Disease:',
    seva_request_doc_label: 'Medical Certificate / Estimate upload karein:',
    seva_request_doc_attached: 'Attached Document:',
    seva_request_submit: 'Request Submit karein 🚨',
    seva_donation_success_title: 'Thank you! 💖',
    seva_donation_success_desc: 'Aapka ₹{amount} ka contribution pool me add ho gaya hai. Aap Seva Hero hain!',
    seva_request_success_title: 'Request Submit ho gayi ⏳',
    seva_request_success_desc: 'Aapka funding request submit ho gaya hai. Partner NGOs (Goonj/Sadhna) documents verify karke jald hi live karenge.'
  }
};

const TREATMENT_JOURNEY_STAGES: Record<string, { id: number; title: string; desc: string; milestones: string[] }[]> = {
  en: [
    { id: 1, title: 'Phase 1: Diagnosis & Plan Setup', desc: 'Complete profile, set goals, and complete diagnostic baseline checks.', milestones: ['✓ Medical diagnostics completed', '✓ Goal "Jeene Ki Wajah" configured', '✓ Patient Profile Setup completed'] },
    { id: 2, title: 'Phase 2: Stabilization & Routine (Active)', desc: 'Actively log vitals, maintain medicine compliance, and build everyday healthy habits.', milestones: ['Log vitals daily (3/5 days logged)', 'Keep streak going (Current: 5 days)', 'Attend Dr. Priya Sharma consultation'] },
    { id: 3, title: 'Phase 3: Conditioning & Exercise', desc: 'Gradually increase physical activity, practice pain-free walking, and joint strength.', milestones: ['Walk 5,000 steps daily', 'Join physical rehab therapy', 'Perform joint exercises'] },
    { id: 4, title: 'Phase 4: Lifelong Wellness & Maintenance', desc: 'Maintain stable health metrics, join community meets, and mentor new patients.', milestones: ['Stabilize sugar levels under 140 mg/dL', 'Participate in group support meets', 'Guide new patients on their journey'] },
  ],
  hi: [
    { id: 1, title: 'चरण 1: निदान और योजना सेटअप', desc: 'प्रोफ़ाइल पूरी करें, लक्ष्य निर्धारित करें और प्रारंभिक निदान पूर्ण करें।', milestones: ['✓ निदान परीक्षण पूर्ण', '✓ "जीने की वजह" लक्ष्य सेट है', '✓ प्रोफ़ाइल सेटअप पूर्ण'] },
    { id: 2, title: 'चरण 2: स्थिरीकरण और नियम (सक्रिय)', desc: 'वाइटल्स दर्ज करें, दवाओं का नियम बनाएं और आदतें विकसित करें।', milestones: ['दैनिक वाइटल्स (3/5 दिन दर्ज)', 'दैनिक ट्रैक बनाये रखें (वर्तमान: 5 दिन)', 'डॉ. प्रिया शर्मा से परामर्श लें'] },
    { id: 3, title: 'चरण 3: शारीरिक अनुकूलन', desc: 'धीरे-धीरे शारीरिक गतिविधि बढ़ाएं, बिना दर्द के चलना सीखें।', milestones: ['प्रतिदिन 5,000 कदम चलें', 'शारीरिक पुनर्वास चिकित्सा में शामिल हों', 'जोड़ों का व्यायाम करें'] },
    { id: 4, title: 'चरण 4: दीर्घकालिक कल्याण और रखरखाव', desc: 'स्थिर स्वास्थ्य आंकड़े बनाए रखें, समुदाय से जुड़ें और दूसरों का मार्गदर्शन करें।', milestones: ['शुगर का स्तर 140 mg/dL के नीचे रखें', 'समूह सहायता बैठकों में भाग लें', 'नए रोगियों को उनकी यात्रा में मार्गदर्शित करें'] },
  ],
  hinglish: [
    { id: 1, title: 'Phase 1: Diagnosis & Setup', desc: 'Profile setup, goals setting aur primary diagnostic tests complete karein.', milestones: ['✓ Diagnostics completed', '✓ "Jeene Ki Wajah" goal set hai', '✓ Profile setup complete'] },
    { id: 2, title: 'Phase 2: Stabilization & Routine (Active)', desc: 'Vitals check karein, daily medicine time par lein aur habits banayein.', milestones: ['Daily Vitals log karein (3/5 days complete)', 'Daily streak maintain karein (Current: 5)', 'Dr. Priya Sharma consultation attend karein'] },
    { id: 3, title: 'Phase 3: Conditioning & Exercise', desc: 'Physical activity slowly badhayein aur pain-free walk karein.', milestones: ['Daily 5,000 steps chalein', 'Physical rehab therapy join karein', 'Joint exercise complete karein'] },
    { id: 4, title: 'Phase 4: Wellness & Maintenance', desc: 'Health stats stable rakhein aur community support groups join karein.', milestones: ['Blood sugar level 140 mg/dL se niche rakhein', 'Support group meetings join karein', 'New patients ko mentor karein'] },
  ],
};

interface ChecklistItem {
  id: number | string;
  done: boolean;
  text?: string;
  isCustom?: boolean;
  isParcha?: boolean;
}

interface SosContact {
  id: string;
  name: string;
  relation: string;
  phone: string;
}

interface HistoryItem {
  id: string;
  type: 'prescription' | 'vitals' | 'report';
  title: string;
  date: string;
  details: string;
  fileName?: string;
  hospital?: string;
}

interface LifeGoalStep {
  id: number;
  title: string;
  desc: string;
  completed: boolean;
  milestones: string[];
}

interface LifeGoal {
  id: string;
  title: string;
  desc: string;
  steps: LifeGoalStep[];
}

interface CareAlert {
  id: string;
  type: 'medicine' | 'test' | 'appointment';
  title: string;
  desc: string;
  date: string;
  details: string;
  ctaText: string;
  completed?: boolean;
}

const parseHistoryDate = (dateStr: string): Date => {
  if (!dateStr) return new Date(0);
  const parts = dateStr.split('-');
  if (parts.length !== 3) return new Date(0);
  const day = parseInt(parts[0], 10);
  const monthStr = parts[1];
  const year = parseInt(parts[2], 10);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthIdx = months.indexOf(monthStr);
  return new Date(year, monthIdx >= 0 ? monthIdx : 0, day);
};

const getInitialCareAlerts = (lang: string): CareAlert[] => {
  return [];
};

interface EmergencyRequest {
  id: string;
  patientName: string;
  hospital: string;
  reason: string;
  requiredAmount: number;
  raisedAmount: number;
  status: 'verified' | 'pending' | 'rejected';
  partnerNGO: string;
  documentName?: string;
  date: string;
}

const getInitialEmergencyRequests = (lang: string): EmergencyRequest[] => {
  return [];
};

const getInitialLifeGoals = (lang: string): LifeGoal[] => {
  const isHi = lang === 'hi';
  const isHinglish = lang === 'hinglish';
  
  return [
    {
      id: 'default_kedarnath',
      title: isHi ? '🏔️ केदारनाथ यात्रा' : isHinglish ? '🏔️ Kedarnath Yatra' : '🏔️ Kedarnath Yatra',
      desc: isHi ? 'भगवान शिव के पवित्र धाम केदारनाथ की चढ़ाई स्वस्थ और सक्रिय होकर पूरी करना।' : isHinglish ? 'Kedarnath ki yatra active aur healthy hokar complete karna.' : 'Complete the pilgrimage to Kedarnath active and healthy.',
      steps: [
        {
          id: 1,
          title: isHi ? 'चिकित्सकीय सलाह व मंजूरी' : 'Doctor Consultation',
          desc: isHi ? 'डॉक्टर से यात्रा के लिए परामर्श लें और फिटनेस जांच पूरी करें।' : 'Consult with your doctor and clear physical fitness baseline checks.',
          completed: true,
          milestones: isHi ? ['✓ डॉक्टर परामर्श पूरा हुआ', '✓ बीपी/ईसीजी रिपोर्ट स्वीकृत'] : ['✓ Doctor consultation completed', '✓ BP & ECG report cleared']
        },
        {
          id: 2,
          title: isHi ? 'दैनिक सैर और श्वसन अभ्यास' : 'Daily Walk & Breathing',
          desc: isHi ? 'प्रतिदिन 5,000 कदम चलें और फेफड़ों की क्षमता बढ़ाने के लिए प्राणायाम करें।' : 'Walk 5,000 steps daily and practice pranayama to increase lung capacity.',
          completed: false,
          milestones: isHi ? ['दैनिक 5,000 कदम सैर करें', 'प्राणायाम (10 मिनट) रोजाना करें'] : ['Walk 5,000 steps daily', 'Breathing exercises (10 mins daily)']
        },
        {
          id: 3,
          title: isHi ? 'सीढ़ियां चढ़ना व जोड़ों की मजबूती' : 'Stamina & Joint Strength',
          desc: isHi ? 'घुटनों को मजबूत करने के व्यायाम करें और धीरे-धीरे सीढ़ियां चढ़ना शुरू करें।' : 'Perform joint strengthening exercises and practice climbing stairs.',
          completed: false,
          milestones: isHi ? ['जोड़ों के व्यायाम (रोज 15 मिनट)', 'बिना दर्द के 20 सीढ़ियां चढ़ना'] : ['Joint exercise (15 mins daily)', 'Climb 20 stairs pain-free']
        },
        {
          id: 4,
          title: isHi ? 'सुरक्षित यात्रा व पूर्णता' : 'Safe Yatra Completion',
          desc: isHi ? 'पोर्टेबल ऑक्सीजन और आवश्यक दवाओं की किट के साथ सुरक्षित यात्रा पूरी करें।' : 'Complete the Kedarnath trek safely with medication kit and portable oxygen.',
          completed: false,
          milestones: isHi ? ['यात्रा की तैयारी व दवा किट पैकिंग', 'सफलतापूर्वक बाबा केदारनाथ के दर्शन'] : ['Pack medication kit', 'Successfully complete the Yatra']
        }
      ]
    },
    {
      id: 'default_wedding',
      title: isHi ? '💃 बेटी की शादी' : isHinglish ? '💃 Beti ki Shaadi' : '💃 Daughter\'s Wedding',
      desc: isHi ? 'बेटी की शादी के समारोहों में बिना किसी दर्द और थकान के सक्रिय रूप से शामिल होना।' : isHinglish ? 'Beti ki shaadi active aur bina thake enjoy karna.' : 'Attend and enjoy daughter\'s wedding active and pain-free.',
      steps: [
        {
          id: 1,
          title: isHi ? 'हार्ट व बीपी नियंत्रण' : 'BP & Cardio Check',
          desc: isHi ? 'ब्लड प्रेशर को स्थिर रखें और कार्डियोलॉजिस्ट से अनुमति लें।' : 'Ensure stable blood pressure levels and consult your physician.',
          completed: true,
          milestones: isHi ? ['✓ बीपी चेकअप सामान्य', '✓ आवश्यक दवाएं तय'] : ['✓ BP readings stable', '✓ Required medications calibrated']
        },
        {
          id: 2,
          title: isHi ? 'शुगर नियंत्रण व संतुलित आहार' : 'Sugar Control & Diet',
          desc: isHi ? 'नियमित रूप से इंसुलिन/दवा लें और कार्बोहाइड्रेट का सेवन कम करें।' : 'Maintain consistent blood sugar levels and reduce carb intake.',
          completed: true,
          milestones: isHi ? ['✓ खाली पेट शुगर < 120', '✓ मीठा पूरी तरह बंद'] : ['✓ Fasting sugar < 120 mg/dL', '✓ Strictly avoid sweets']
        },
        {
          id: 3,
          title: isHi ? 'खड़े रहने की क्षमता विकसित करना' : 'Stamina Building',
          desc: isHi ? 'शादी की रस्मों के लिए बिना किसी सहारे के लगातार 3 घंटे खड़े रहने की क्षमता बनाएं।' : 'Practice standing pain-free for up to 3 hours to attend wedding rituals.',
          completed: false,
          milestones: isHi ? ['दैनिक खड़े रहने का अभ्यास (1 घंटा)', 'पैरों की हल्की स्ट्रेचिंग व मालिश'] : ['Daily standing practice (1 hr)', 'Gentle leg stretches & massage']
        },
        {
          id: 4,
          title: isHi ? 'शादी का सुरक्षित आनंद' : 'Safe Wedding Celebration',
          desc: isHi ? 'शादी के दिन बिना किसी असुविधा के सगे-संबंधियों का स्वागत करें और आनंद लें।' : 'Celebrate the wedding day comfortably without pain or exhaustion.',
          completed: false,
          milestones: isHi ? ['शादी के दिन स्वास्थ्य निगरानी', 'बिना दर्द समारोह में शामिल होना'] : ['Monitor health stats on wedding day', 'Attend and celebrate pain-free']
        }
      ]
    },
    {
      id: 'default_cycle',
      title: isHi ? '🚲 फिर से साइकिल चलाना' : isHinglish ? '🚲 Cycle Chalana' : '🚲 Ride Cycle Again',
      desc: isHi ? 'घुटने के दर्द को दूर कर फिर से पार्क में अपनी पसंदीदा साइकिल चलाना।' : isHinglish ? 'Ghutne ka dard thik karke fir se cycle chalana.' : 'Ride a bicycle again in the local park pain-free.',
      steps: [
        {
          id: 1,
          title: isHi ? 'दर्द प्रबंधन व फिजियोथेरेपी' : 'Pain Relief & Physio',
          desc: isHi ? 'घुटने की मांसपेशियों को सक्रिय करने के लिए फिजियोथेरेपी लें।' : 'Undergo physical therapy to relieve joint inflammation and stiffness.',
          completed: true,
          milestones: isHi ? ['✓ घुटने का दर्द कम होना', '✓ डॉक्टर से साइकिलिंग की अनुमति'] : ['✓ Knee inflammation reduced', '✓ Orthopedic approval received']
        },
        {
          id: 2,
          title: isHi ? 'बैलेंस व हल्की स्ट्रेचिंग' : 'Stretching & Balance',
          desc: isHi ? 'शरीर का संतुलन बनाने के व्यायाम करें और पैरों की मांसपेशियों को स्ट्रेच करें।' : 'Perform balance exercises and hamstring/quadriceps stretches.',
          completed: false,
          milestones: isHi ? ['दैनिक संतुलन व्यायाम (10 मिनट)', 'पैरों की स्ट्रेचिंग (10 मिनट)'] : ['Balance exercises (10 mins)', 'Leg stretches (10 mins)']
        },
        {
          id: 3,
          title: isHi ? 'पहली राइड (खाली पार्क)' : 'First Ride in Empty Park',
          desc: isHi ? 'खाली पार्क या सुरक्षित मैदान में 10 मिनट के लिए धीमी गति से साइकिल चलाएं।' : 'Ride cycle slowly for 10 minutes in an empty park or flat area.',
          completed: false,
          milestones: isHi ? ['साइकिल की जांच व सुरक्षा गियर', '10 मिनट की बिना दर्द वाली सवारी'] : ['Check cycle condition', 'Complete 10 min pain-free ride']
        },
        {
          id: 4,
          title: isHi ? 'नियमित रूप से साइकिल चलाना' : 'Regular Cycling',
          desc: isHi ? 'नियमित रूप से हर सुबह 15 मिनट साइकिल चलाकर तरोताजा महसूस करें।' : 'Incorporate 15 minutes of regular cycling into your morning routine.',
          completed: false,
          milestones: isHi ? ['हफ्ते में 3 बार साइकिल चलाना', 'दैनिक 15 मिनट की सवारी का लक्ष्य'] : ['Cycle 3 times a week', 'Achieve daily 15-minute ride goal']
        }
      ]
    }
  ];
};

const getTodayDateStr = () => {
  const today = new Date();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${today.getDate()}-${months[today.getMonth()]}-${today.getFullYear()}`;
};

const getYesterdayDateStr = () => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${yesterday.getDate()}-${months[yesterday.getMonth()]}-${yesterday.getFullYear()}`;
};

export function PatientDashboard() {
  const colors = useThemeColors();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const { language, t } = useLanguageStore();

  const getChecklistItemText = (item: ChecklistItem) => {
    if (item.text) return item.text;
    return CHECKLIST_ITEMS_MAP[language]?.[item.id as number] || CHECKLIST_ITEMS_MAP['en']?.[item.id as number] || '';
  };

  const getUiText = (key: string) => {
    const activeDict = DASHBOARD_UI_TRANS[language] || DASHBOARD_UI_TRANS['en'];
    return activeDict[key] || DASHBOARD_UI_TRANS['en'][key] || key;
  };

  // State Management
  const [vitalsDate, setVitalsDate] = useState(getTodayDateStr());
  const [goalText, setGoalText] = useState('Attend my daughter\'s wedding active & healthy');
  const [goalProgress, setGoalProgress] = useState(65);
  const [isGoalModalVisible, setIsGoalModalVisible] = useState(false);
  const [tempGoalText, setTempGoalText] = useState('');
  const [tempGoalProgress, setTempGoalProgress] = useState(65);

  // Vitals State
  const [sugar, setSugar] = useState(120);
  const [bp, setBp] = useState(115);
  const [heartRate, setHeartRate] = useState(72);
  const [vitalsSavedMessage, setVitalsSavedMessage] = useState(false);

  // Gamification State
  const [streak, setStreak] = useState(5);
  const [unlockedBadges, setUnlockedBadges] = useState<string[]>(['meds_hero', 'step_warrior']);

  // Checklist State
  const [checklist, setChecklist] = useState<ChecklistItem[]>([
    { id: 1, done: true },
    { id: 2, done: true },
    { id: 3, done: false },
    { id: 4, done: false },
  ]);

  const [steps] = useState(4200);
  const stepGoal = 6000;

  // Advanced States
  const [selectedJourneyStage, setSelectedJourneyStage] = useState(2);
  const [journeyActivePhase, setJourneyActivePhase] = useState(2);

  // Life Goals System States
  const [lifeGoals, setLifeGoals] = useState<LifeGoal[]>([]);
  const [selectedGoalId, setSelectedGoalId] = useState<string>('');
  const [selectedGoalStageId, setSelectedGoalStageId] = useState<number>(1);
  const [isAddGoalModalVisible, setIsAddGoalModalVisible] = useState(false);
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalDesc, setNewGoalDesc] = useState('');

  const [isParchaModalVisible, setIsParchaModalVisible] = useState(false);
  const [parchaStep, setParchaStep] = useState<'select' | 'scanning' | 'result'>('select');
  const [selectedSampleParcha, setSelectedSampleParcha] = useState<number | null>(null);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStepMessage, setScanStepMessage] = useState('');
  const [doctorAdviceList, setDoctorAdviceList] = useState<string[]>([]);

  const [isCustomTaskModalVisible, setIsCustomTaskModalVisible] = useState(false);
  const [customTaskInput, setCustomTaskInput] = useState('');

  // Care Alerts States
  const [careAlerts, setCareAlerts] = useState<CareAlert[]>([]);
  const [selectedCareAlert, setSelectedCareAlert] = useState<CareAlert | null>(null);
  const [isCareAlertModalVisible, setIsCareAlertModalVisible] = useState(false);
  const [activeVideoCall, setActiveVideoCall] = useState(false);
  const [videoCallTimer, setVideoCallTimer] = useState(0);
  const videoCallIntervalRef = useRef<any>(null);

  const [isSosContactsModalVisible, setIsSosContactsModalVisible] = useState(false);
  const [sosContacts, setSosContacts] = useState<SosContact[]>([
    { id: '1', name: 'Ramesh (Son)', relation: 'Son', phone: '9876543210' },
    { id: '2', name: 'Dr. Priya Sharma', relation: 'Doctor', phone: '9123456789' }
  ]);
  const [newContactName, setNewContactName] = useState('');
  const [newContactRelation, setNewContactRelation] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');

  const [isSosCountdownModalVisible, setIsSosCountdownModalVisible] = useState(false);
  const [sosCountdownVal, setSosCountdownVal] = useState(3);
  const [sosFired, setSosFired] = useState(false);

  // Treatment & Diagnostic History Tracking States
  const [treatmentHistory, setTreatmentHistory] = useState<HistoryItem[]>([
    { 
      id: 'hist_1', 
      type: 'report', 
      title: 'CBC Blood Report / सीबीसी रक्त रिपोर्ट', 
      date: '12-Jun-2026', 
      details: 'Hemoglobin: 13.5 g/dL, WBC: 7500 /uL. Platelets normal. Blood parameters look stable.', 
      fileName: 'cbc_blood_report_june.pdf',
      hospital: 'Sadhna Diagnostics Lab'
    },
    { 
      id: 'hist_2', 
      type: 'prescription', 
      title: 'First Oncology Consult / प्रथम कैंसर परामर्श पर्चा', 
      date: '10-Jun-2026', 
      details: 'Consultation with Dr. Priya Sharma. Formulated baseline care, initialized hope goals, and prescribed Metformin.', 
      fileName: 'consultation_parcha_dr_priya.png',
      hospital: 'City Oncology Hospital'
    }
  ]);
  const [expandedHistoryItems, setExpandedHistoryItems] = useState<string[]>([]);

  // Lab Report Upload Modal States
  const [isReportModalVisible, setIsReportModalVisible] = useState(false);
  const [reportName, setReportName] = useState('');
  const [reportHospital, setReportHospital] = useState('');
  const [reportDetails, setReportDetails] = useState('');
  const [reportFileName, setReportFileName] = useState('blood_test_report.pdf');

  // Safety Overrides States for Illegible Handwriting
  const [isManualEditModalVisible, setIsManualEditModalVisible] = useState(false);
  const [manualEditInput, setManualEditInput] = useState('');
  const [unclearMedText, setUnclearMedText] = useState('');
  const [hasResolvedUnclearMedicine, setHasResolvedUnclearMedicine] = useState(false);

  // Seva Ecosystem States
  const [sevaPoolAmount, setSevaPoolAmount] = useState<number>(485200);
  const [sevaPoolContributors, setSevaPoolContributors] = useState<number>(1240);
  const [emergencyRequests, setEmergencyRequests] = useState<EmergencyRequest[]>([]);
  const [isSevaContributeModalVisible, setIsSevaContributeModalVisible] = useState(false);
  const [isSevaRequestModalVisible, setIsSevaRequestModalVisible] = useState(false);
  
  // Contribution inputs
  const [sevaContributeAmount, setSevaContributeAmount] = useState('500');
  const [activeRequestForDonation, setActiveRequestForDonation] = useState<EmergencyRequest | null>(null);

  // Funding Request Form inputs
  const [sevaReqPatientName, setSevaReqPatientName] = useState('');
  const [sevaReqHospital, setSevaReqHospital] = useState('');
  const [sevaReqReason, setSevaReqReason] = useState('');
  const [sevaReqAmount, setSevaReqAmount] = useState('');
  const [sevaReqDocName, setSevaReqDocName] = useState('');

  // Animation values
  const laserAnim = useRef(new Animated.Value(0)).current;
  const sosCountdownTimer = useRef<any>(null);

  // Sync Unclear medicine text when language shifts
  useEffect(() => {
    if (selectedSampleParcha === 3 && !hasResolvedUnclearMedicine) {
      setUnclearMedText(getUiText('unclear_medicine_name'));
    }
  }, [language, selectedSampleParcha, hasResolvedUnclearMedicine]);

  // Laser scanner animation
  useEffect(() => {
    if (parchaStep === 'scanning') {
      laserAnim.setValue(0);
      Animated.loop(
        Animated.sequence([
          Animated.timing(laserAnim, {
            toValue: 1,
            duration: 1200,
            easing: Easing.linear,
            useNativeDriver: false,
          }),
          Animated.timing(laserAnim, {
            toValue: 0,
            duration: 1200,
            easing: Easing.linear,
            useNativeDriver: false,
          }),
        ])
      ).start();
    } else {
      laserAnim.stopAnimation();
    }
  }, [parchaStep]);

  // Handle Scanning Steps
  useEffect(() => {
    if (parchaStep === 'scanning') {
      setScanProgress(0);
      setScanStepMessage(getUiText('scan_step_1'));
      
      const timer1 = setTimeout(() => {
        setScanProgress(35);
        setScanStepMessage(getUiText('scan_step_2'));
      }, 1000);

      const timer2 = setTimeout(() => {
        setScanProgress(70);
        setScanStepMessage(getUiText('scan_step_3'));
      }, 2200);

      const timer3 = setTimeout(() => {
        setScanProgress(100);
        setParchaStep('result');
      }, 3500);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
      };
    }
  }, [parchaStep]);

  // Load from Storage
  useEffect(() => {
    const loadStoredData = async () => {
      try {
        const patientId = user?.id || 'demo_patient';
        
        // 1. Non-DB configurations in AsyncStorage
        const storedGoal = await AsyncStorage.getItem('user_wajah_goal');
        const storedPercent = await AsyncStorage.getItem('user_wajah_progress');
        const storedStreak = await AsyncStorage.getItem('user_win_streak');
        const storedBadges = await AsyncStorage.getItem('user_badges_unlocked');
        const storedChecklist = await AsyncStorage.getItem('user_checklist');
        const storedAdvice = await AsyncStorage.getItem('user_doctor_advice');
        const storedSelectedGoalId = await AsyncStorage.getItem('user_selected_goal_id');
        const storedJourneyPhase = await AsyncStorage.getItem('user_journey_active_phase');

        if (storedGoal) setGoalText(storedGoal);
        if (storedPercent) setGoalProgress(parseInt(storedPercent) || 65);
        if (storedStreak) setStreak(parseInt(storedStreak) || 5);
        if (storedBadges) setUnlockedBadges(JSON.parse(storedBadges));
        if (storedChecklist) setChecklist(JSON.parse(storedChecklist));
        if (storedAdvice) setDoctorAdviceList(JSON.parse(storedAdvice));
        if (storedJourneyPhase) {
          const phase = parseInt(storedJourneyPhase) || 2;
          setJourneyActivePhase(phase);
          setSelectedJourneyStage(phase);
        }

        // 2. Load Vitals via ApiService
        const latestVitals = await ApiService.fetchLatestVitals(patientId);
        if (latestVitals) {
          setSugar(latestVitals.sugar);
          setBp(latestVitals.bp);
          setHeartRate(latestVitals.heartRate);
        }

        // 3. Load Life Goals via ApiService
        const defaultLifeGoals = getInitialLifeGoals(language);
        const fetchedLifeGoals = await ApiService.fetchLifeGoals(patientId, defaultLifeGoals);
        setLifeGoals(fetchedLifeGoals);
        
        if (storedSelectedGoalId && fetchedLifeGoals.some(g => g.id === storedSelectedGoalId)) {
          setSelectedGoalId(storedSelectedGoalId);
          const goalObj = fetchedLifeGoals.find((g: any) => g.id === storedSelectedGoalId);
          if (goalObj) {
            const firstIncomplete = goalObj.steps.find((s: any) => !s.completed);
            setSelectedGoalStageId(firstIncomplete ? firstIncomplete.id : 1);
          }
        } else if (fetchedLifeGoals.length > 0) {
          setSelectedGoalId(fetchedLifeGoals[0].id);
          const firstIncomplete = fetchedLifeGoals[0].steps.find((s: any) => !s.completed);
          setSelectedGoalStageId(firstIncomplete ? firstIncomplete.id : 1);
        }

        // 4. Load SOS Contacts via ApiService
        const defaultSosContacts: any[] = [];
        const fetchedSosContacts = await ApiService.fetchSosContacts(patientId, defaultSosContacts);
        setSosContacts(fetchedSosContacts);

        // 5. Load Treatment History via ApiService
        const defaultHistory: HistoryItem[] = [];
        const fetchedHistory = await ApiService.fetchTreatmentHistory(patientId, defaultHistory);
        setTreatmentHistory(fetchedHistory);

        // 6. Load Seva Pool via ApiService
        const sevaPool = await ApiService.fetchSevaPool();
        setSevaPoolAmount(sevaPool.amount);
        setSevaPoolContributors(sevaPool.contributors);

        // 7. Load Emergency Requests via ApiService
        const defaultEmergencyRequests = getInitialEmergencyRequests(language);
        const fetchedEmergencyRequests = await ApiService.fetchEmergencyRequests(defaultEmergencyRequests);
        setEmergencyRequests(fetchedEmergencyRequests);

        // 8. Load Care Alerts via ApiService
        const defaultCareAlerts = getInitialCareAlerts(language);
        const fetchedCareAlerts = await ApiService.fetchCareAlerts(patientId, defaultCareAlerts);
        setCareAlerts(fetchedCareAlerts);

      } catch (e) {
        console.warn('Failed to load dashboard data:', e);
      }
    };
    loadStoredData();
  }, []);

  // Translate default emergency requests when language changes
  useEffect(() => {
    if (emergencyRequests.length > 0) {
      const hasCustomRequest = emergencyRequests.some(r => !r.id.startsWith('req_'));
      if (!hasCustomRequest) {
        const translatedDefaults = getInitialEmergencyRequests(language);
        // Retain raisedAmount of requests from previous state
        const updated = translatedDefaults.map(tr => {
          const existing = emergencyRequests.find(r => r.id === tr.id);
          return existing ? { ...tr, raisedAmount: existing.raisedAmount } : tr;
        });
        setEmergencyRequests(updated);
      }
    }
  }, [language]);

  // Translate default goals when language changes
  useEffect(() => {
    if (lifeGoals.length > 0) {
      const hasCustomGoal = lifeGoals.some(g => !g.id.startsWith('default_'));
      if (!hasCustomGoal) {
        const translatedDefaults = getInitialLifeGoals(language);
        // Retain completion status of steps from previous state
        const updated = translatedDefaults.map(tg => {
          const existing = lifeGoals.find(g => g.id === tg.id);
          if (existing) {
            const steps = tg.steps.map(ts => {
              const es = existing.steps.find(s => s.id === ts.id);
              return es ? { ...ts, completed: es.completed } : ts;
            });
            return { ...tg, steps };
          }
          return tg;
        });
        setLifeGoals(updated);
      }
    }
  }, [language]);

  // Translate default care alerts when language changes
  useEffect(() => {
    if (careAlerts.length > 0) {
      const hasCustomAlert = careAlerts.some(a => !a.id.startsWith('alert_'));
      if (!hasCustomAlert) {
        const translatedDefaults = getInitialCareAlerts(language);
        // Retain completion status from previous state
        const updated = translatedDefaults.map(ta => {
          const existing = careAlerts.find(a => a.id === ta.id);
          return existing ? { ...ta, completed: existing.completed } : ta;
        });
        setCareAlerts(updated);
      }
    }
  }, [language]);

  // Auto trigger popup for first uncompleted alert on mount
  useEffect(() => {
    if (careAlerts.length > 0) {
      const firstActive = careAlerts.find(a => !a.completed);
      if (firstActive) {
        const timer = setTimeout(() => {
          setSelectedCareAlert(firstActive);
          setIsCareAlertModalVisible(true);
        }, 1200);
        return () => clearTimeout(timer);
      }
    }
  }, [careAlerts.length]);

  // Cleanup video call timer on unmount
  useEffect(() => {
    return () => {
      if (videoCallIntervalRef.current) clearInterval(videoCallIntervalRef.current);
    };
  }, []);

  const saveGoal = async (newGoal: string, newProgress: number) => {
    const sanitizedGoal = newGoal?.replace(/\\n/g, ' ').replace(/\r?\n|\r/g, ' ').replace(/\s+/g, ' ').trim();
    setGoalText(sanitizedGoal);
    setGoalProgress(newProgress);
    setIsGoalModalVisible(false);
    try {
      await AsyncStorage.setItem('user_wajah_goal', sanitizedGoal);
      await AsyncStorage.setItem('user_wajah_progress', newProgress.toString());
    } catch (e) {}
  };

  // Life Goal handlers
  const handleToggleStepCompletion = async (goalId: string, stepId: number) => {
    const updatedGoals = lifeGoals.map((goal) => {
      if (goal.id === goalId) {
        const updatedSteps = goal.steps.map((step) => {
          if (step.id === stepId) {
            return { ...step, completed: !step.completed };
          }
          return step;
        });
        return { ...goal, steps: updatedSteps };
      }
      return goal;
    });
    
    setLifeGoals(updatedGoals);
    
    // Check if goal is completed and was not completed before
    const selectedGoal = updatedGoals.find(g => g.id === goalId);
    if (selectedGoal) {
      const allDone = selectedGoal.steps.every(s => s.completed);
      const previouslyAllDone = lifeGoals.find(g => g.id === goalId)?.steps.every(s => s.completed);
      if (allDone && !previouslyAllDone) {
        Alert.alert(
          language === 'hi' ? 'बधाई हो! 🎉' : 'Congratulations! 🎉',
          language === 'hi' 
            ? `आपने अपने लक्ष्य "${selectedGoal.title}" के सभी 4 चरणों को पूरा कर लिया है! आप जीवन में निरंतर आगे बढ़ रहे हैं।` 
            : `You have successfully completed all 4 steps for your goal "${selectedGoal.title}"! Keep moving forward in life!`
        );
      }
    }

    try {
      await ApiService.saveLifeGoals(user?.id || 'demo_patient', updatedGoals);
    } catch (e) {
      console.warn('Failed to save updated goals:', e);
    }
  };

  const handleSaveNewLifeGoal = async () => {
    if (!newGoalTitle.trim()) {
      Alert.alert('Error', language === 'hi' ? 'कृपया लक्ष्य का नाम लिखें।' : 'Please enter a goal name.');
      return;
    }

    const newGoalId = 'goal_' + Date.now();
    const isHi = language === 'hi';
    const isHinglish = language === 'hinglish';

    const generatedSteps = [
      {
        id: 1,
        title: isHi ? 'परामर्श व प्रारंभिक तैयारी' : isHinglish ? 'Consultation & Preparation' : 'Consultation & Setup',
        desc: isHi ? 'डॉक्टर से परामर्श लें और फिटनेस जांच पूरी करें।' : isHinglish ? 'Doctor se advice lein aur normal checkup karein.' : 'Get doctor\'s approval and complete initial checkups.',
        completed: true,
        milestones: isHi ? ['डॉक्टर से परामर्श लें', 'फिटनेस जांच पूरी करें'] : ['Consult doctor', 'Complete fitness tests']
      },
      {
        id: 2,
        title: isHi ? 'दैनिक आदतें और वाइटल्स नियम' : isHinglish ? 'Daily Habit & Vitals' : 'Daily Routine & Vitals',
        desc: isHi ? 'दवाओं का समय पर सेवन और दैनिक वाइटल्स की निगरानी।' : isHinglish ? 'Medicines regularly lein aur healthy routine banayein.' : 'Maintain vitals and daily medicine compliance.',
        completed: false,
        milestones: isHi ? ['दैनिक वाइटल्स लॉग करें', 'दैनिक दवा नियम बनाए रखें'] : ['Log vitals daily', 'Maintain daily medicine schedule']
      },
      {
        id: 3,
        title: isHi ? 'क्षमता और सहनशक्ति सुधार' : isHinglish ? 'Stamina & Strength' : 'Strength & Stamina Building',
        desc: isHi ? 'लक्ष्य के अनुसार हल्के व्यायाम करें और शारीरिक क्षमता बढ़ाएं।' : isHinglish ? 'Muscle strength badhane ke liye exercises karein.' : 'Perform targeted exercises and build physical strength.',
        completed: false,
        milestones: isHi ? ['मांसपेशियों को मजबूत करने के व्यायाम', 'स्टेमिना में सुधार करना'] : ['Targeted stretching/exercise', 'Increase aerobic capacity']
      },
      {
        id: 4,
        title: isHi ? 'लक्ष्य की सुरक्षित प्राप्ति' : isHinglish ? 'Goal Achievement' : 'Safe Goal Achievement',
        desc: isHi ? 'सुरक्षित रूप से अपने लक्ष्य को पूरा करें और उत्सव मनाएं।' : isHinglish ? 'Safe tareeqe se goal complete karein aur khushi manayein.' : 'Safely accomplish your life goal and celebrate.',
        completed: false,
        milestones: isHi ? ['लक्ष्य दिवस की तैयारी', 'सफलतापूर्वक लक्ष्य पूरा करना'] : ['Prepare for the target day', 'Accomplish your goal successfully']
      }
    ];

    const newGoal: LifeGoal = {
      id: newGoalId,
      title: newGoalTitle.trim(),
      desc: newGoalDesc.trim() || (isHi ? 'मेरे स्वास्थ्य सुधार का एक बड़ा कारण।' : 'A major reason for my recovery.'),
      steps: generatedSteps
    };

    const updatedGoals = [...lifeGoals, newGoal];
    setLifeGoals(updatedGoals);
    setSelectedGoalId(newGoalId);
    setSelectedGoalStageId(2);

    setNewGoalTitle('');
    setNewGoalDesc('');
    setIsAddGoalModalVisible(false);

    try {
      await ApiService.saveLifeGoals(user?.id || 'demo_patient', updatedGoals);
      await AsyncStorage.setItem('user_selected_goal_id', newGoalId);
    } catch (e) {
      console.warn('Failed to save new goal:', e);
    }
  };

  const handleDeleteGoal = (goalId: string) => {
    Alert.alert(
      language === 'hi' ? 'लक्ष्य हटाएं?' : 'Delete Goal?',
      language === 'hi' 
        ? 'क्या आप इस लक्ष्य को अपने जीवन लक्ष्यों की सूची से हटाना चाहते हैं?' 
        : 'Are you sure you want to remove this goal from your life goals list?',
      [
        { text: getUiText('cancel'), style: 'cancel' },
        { 
          text: language === 'hi' ? 'हाँ, हटाएं' : 'Yes, Delete', 
          style: 'destructive',
          onPress: async () => {
            const filteredGoals = lifeGoals.filter(g => g.id !== goalId);
            setLifeGoals(filteredGoals);
            if (filteredGoals.length > 0) {
              setSelectedGoalId(filteredGoals[0].id);
              const firstIncomplete = filteredGoals[0].steps.find(s => !s.completed);
              setSelectedGoalStageId(firstIncomplete ? firstIncomplete.id : 1);
            }
            try {
              await ApiService.deleteLifeGoal(goalId);
              await ApiService.saveLifeGoals(user?.id || 'demo_patient', filteredGoals);
            } catch (e) {}
          }
        }
      ]
    );
  };

  // Seva Ecosystem handlers
  const handleConfirmContribution = async () => {
    const amt = parseInt(sevaContributeAmount);
    if (isNaN(amt) || amt <= 0) {
      Alert.alert('Error', language === 'hi' ? 'कृपया सही राशि दर्ज करें।' : 'Please enter a valid amount.');
      return;
    }

    try {
      // Unlock Seva Hero Badge
      let newBadges = [...unlockedBadges];
      if (!newBadges.includes('seva_hero')) {
        newBadges.push('seva_hero');
        setUnlockedBadges(newBadges);
        await AsyncStorage.setItem('user_badges_unlocked', JSON.stringify(newBadges));
      }

      if (activeRequestForDonation) {
        // Specific emergency request donation (atomic, server-authoritative).
        const { requests, pool } = await ApiService.donateToRequest(
          activeRequestForDonation.id,
          amt,
          emergencyRequests
        );
        setEmergencyRequests(requests);
        setSevaPoolAmount(pool.amount);
        setSevaPoolContributors(pool.contributors);

        const successDesc = getUiText('seva_donation_success_desc').replace('{amount}', amt.toString());
        Alert.alert(
          getUiText('seva_donation_success_title'),
          successDesc
        );
      } else {
        // General Seva pool donation (atomic, server-authoritative).
        const pool = await ApiService.donateToPool(amt);
        setSevaPoolAmount(pool.amount);
        setSevaPoolContributors(pool.contributors);

        const successDesc = getUiText('seva_donation_success_desc').replace('{amount}', amt.toString());
        Alert.alert(
          getUiText('seva_donation_success_title'),
          successDesc
        );
      }
    } catch (e) {
      console.warn('Failed to save donation:', e);
    }

    setIsSevaContributeModalVisible(false);
    setActiveRequestForDonation(null);
  };

  const handleSaveEmergencyRequest = async () => {
    if (!sevaReqPatientName.trim()) {
      Alert.alert('Error', language === 'hi' ? 'कृपया मरीज का नाम लिखें।' : 'Please enter patient name.');
      return;
    }
    if (!sevaReqHospital.trim()) {
      Alert.alert('Error', language === 'hi' ? 'कृपया अस्पताल का नाम लिखें।' : 'Please enter hospital name.');
      return;
    }
    if (!sevaReqReason.trim()) {
      Alert.alert('Error', language === 'hi' ? 'कृपया बीमारी या चिकित्सकीय कारण लिखें।' : 'Please enter medical reason.');
      return;
    }
    const amt = parseInt(sevaReqAmount);
    if (isNaN(amt) || amt <= 0) {
      Alert.alert('Error', language === 'hi' ? 'कृपया सही सहायता राशि दर्ज करें।' : 'Please enter a valid target amount.');
      return;
    }
    if (!sevaReqDocName) {
      Alert.alert(
        language === 'hi' ? 'दस्तावेज आवश्यक' : 'Document Required',
        language === 'hi' 
          ? 'सत्यापन के लिए कृपया चिकित्सा प्रमाण पत्र या एस्टीमेट अपलोड करें।' 
          : 'Please attach a medical certificate or hospital estimate for verification.'
      );
      return;
    }

    const today = new Date();
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const dateStr = `${today.getDate().toString().padStart(2, '0')}-${months[today.getMonth()]}-${today.getFullYear()}`;

    const newRequest: EmergencyRequest = {
      id: 'user_req_' + Date.now(),
      patientName: sevaReqPatientName.trim(),
      hospital: sevaReqHospital.trim(),
      reason: sevaReqReason.trim(),
      requiredAmount: amt,
      raisedAmount: 0,
      status: 'pending',
      partnerNGO: language === 'hi' ? 'साधना फाउंडेशन (सत्यापन जारी)' : 'Sadhna Foundation (Verifying)',
      documentName: sevaReqDocName,
      date: dateStr
    };

    const updated = [newRequest, ...emergencyRequests];
    setEmergencyRequests(updated);

    try {
      await ApiService.addEmergencyRequest(user?.id || 'demo_patient', newRequest, updated);
    } catch (e) {
      console.warn('Failed to save emergency request:', e);
    }

    Alert.alert(
      getUiText('seva_request_success_title'),
      getUiText('seva_request_success_desc')
    );

    // Reset fields
    setSevaReqHospital('');
    setSevaReqReason('');
    setSevaReqAmount('');
    setSevaReqDocName('');
    setIsSevaRequestModalVisible(false);
  };

  // Treatment Journey Timeline Database Logger
  const addHistoryRecord = async (type: 'prescription' | 'vitals' | 'report', title: string, details: string, fileName?: string, hospital?: string, customDate?: string) => {
    const today = new Date();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const formattedDate = customDate || `${today.getDate()}-${months[today.getMonth()]}-${today.getFullYear()}`;
    
    const newRecord: HistoryItem = {
      id: 'hist_' + Date.now(),
      type,
      title,
      date: formattedDate,
      details,
      fileName,
      hospital
    };

    const updatedHistory = [newRecord, ...treatmentHistory];
    setTreatmentHistory(updatedHistory);
    try {
      await ApiService.saveTreatmentHistory(user?.id || 'demo_patient', updatedHistory);
    } catch (e) {}
  };

  const handleSaveVitals = async () => {
    setVitalsSavedMessage(true);
    setTimeout(() => setVitalsSavedMessage(false), 2500);

    // Add vitals log to history track
    const vitalsSummary = `Sugar: ${sugar} mg/dL, BP: ${bp} mmHg, HR: ${heartRate} bpm. (Status: ${vitalsStatus.text})`;
    addHistoryRecord('vitals', language === 'hi' ? 'वाइटल्स लॉग (Vitals Checked)' : 'Vitals Status Checked', vitalsSummary, undefined, undefined, vitalsDate);

    // Unlock vitals master badge if not unlocked
    if (!unlockedBadges.includes('vitals_master')) {
      const updated = [...unlockedBadges, 'vitals_master'];
      setUnlockedBadges(updated);
      try {
        await AsyncStorage.setItem('user_badges_unlocked', JSON.stringify(updated));
      } catch (e) {}
    }

    try {
      await ApiService.saveVitalsLog(user?.id || 'demo_patient', {
        sugar,
        bp,
        heartRate,
        logDate: vitalsDate,
      });
    } catch (e) {}
  };

  const toggleChecklist = async (id: number | string) => {
    const nextChecklist = checklist.map((item) =>
      item.id === id ? { ...item, done: !item.done } : item
    );
    setChecklist(nextChecklist);
    try {
      await AsyncStorage.setItem('user_checklist', JSON.stringify(nextChecklist));
    } catch (e) {}

    const isAllDone = nextChecklist.every((item) => item.done);
    if (isAllDone) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      try {
        await AsyncStorage.setItem('user_win_streak', newStreak.toString());
      } catch (e) {}
      
      // Update Journey Phase if 100% completed
      if (journeyActivePhase === 2) {
        setJourneyActivePhase(3);
        setSelectedJourneyStage(3);
        try {
          await AsyncStorage.setItem('user_journey_active_phase', '3');
        } catch (e) {}
        Alert.alert(
          'Journey Phase Upgraded! 🛣️',
          'Congratulations! You have advanced to Phase 3: Conditioning & Exercise!'
        );
      } else {
        Alert.alert(
          'Congratulations! 🎉',
          `You completed all daily tasks! Your daily streak is now ${newStreak} 🔥`
        );
      }
    }
  };

  const completedCount = checklist.filter((item) => item.done).length;
  const totalCount = checklist.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const getHopeStatement = (currentGoal: string) => {
    const lower = currentGoal.toLowerCase();
    let type = 'painfree';
    if (lower.includes('keda') || lower.includes('yatra') || lower.includes('mountain')) {
      type = 'kedarnath';
    } else if (lower.includes('wedding') || lower.includes('shaadi') || lower.includes('marriage')) {
      type = 'wedding';
    } else if (lower.includes('cycle') || lower.includes('ride') || lower.includes('bike')) {
      type = 'cycle';
    } else if (lower.includes('walk') || lower.includes('pain') || lower.includes('foot') || lower.includes('run')) {
      type = 'painfree';
    } else {
      const fallbacks: Record<string, string> = {
        en: 'Every small step in your daily care keeps you moving forward toward your life dream.',
        hi: 'आपकी दैनिक देखभाल का हर छोटा कदम आपको आपके जीवन के सपने की ओर आगे बढ़ाता है।',
        hinglish: 'Daily care ka har chota step aapko aapke life goal ki taraf le jayega.',
      };
      return fallbacks[language] || fallbacks['en'];
    }

    const presets = GOALS_PRESETS[language] || GOALS_PRESETS['en'] || GOALS_PRESETS['hi'];
    return presets.find((p) => p.id === type)?.hope || presets[0].hope;
  };

  const getVitalsStatus = () => {
    const isSugarDanger = sugar > 180 || sugar < 60;
    const isBpDanger = bp > 150 || bp < 80;
    const isHrDanger = heartRate > 120 || heartRate < 50;

    const isSugarWarning = (sugar >= 141 && sugar <= 180) || (sugar >= 60 && sugar <= 69);
    const isBpWarning = (bp >= 131 && bp <= 150) || (bp >= 80 && bp <= 89);
    const isHrWarning = (heartRate >= 101 && heartRate <= 120) || (heartRate >= 50 && heartRate <= 59);

    if (isSugarDanger || isBpDanger || isHrDanger) {
      return { status: 'alert', text: getUiText('vitals_status_alert'), color: colors.error };
    }
    if (isSugarWarning || isBpWarning || isHrWarning) {
      return { status: 'warning', text: getUiText('vitals_status_warning'), color: colors.warning };
    }
    return { status: 'stable', text: getUiText('vitals_status_stable'), color: colors.success };
  };

  const handleBadgeClick = (badgeId: string) => {
    const badgeDetails: Record<string, Record<string, { title: string; desc: string }>> = {
      en: {
        meds_hero: { title: 'Meds Hero 🏆', desc: 'Earned for taking all your medications on time for 3 consecutive days!' },
        step_warrior: { title: 'Step Warrior 👣', desc: 'Earned for walking at least 4,000 steps today. Keep moving!' },
        vitals_master: { title: 'Vitals Master 🩸', desc: 'Earned for logging your blood sugar and blood pressure today.' },
        scanner_pro: { title: 'Scanner Pro 📄', desc: 'Earned for successfully scanning a doctor\'s prescription and auto-scheduling your medications!' },
        seva_hero: { title: 'Seva Hero 🤝', desc: 'Earned for contributing to the community monthly pool or emergency medical funds!' },
      },
      hi: {
        meds_hero: { title: 'दवा नायक 🏆', desc: 'लगातार 3 दिनों तक अपनी सभी दवाएं समय पर लेने के लिए अर्जित किया गया!' },
        step_warrior: { title: 'कदम योद्धा 👣', desc: 'आज कम से कम 4,000 कदम चलने के लिए अर्जित किया गया। चलते रहें!' },
        vitals_master: { title: 'वाइटल्स मास्टर 🩸', desc: 'आज अपना ब्लड शुगर और ब्लड प्रेशर दर्ज करने के लिए अर्जित किया गया।' },
        scanner_pro: { title: 'पर्चा एक्सपर्ट 📄', desc: 'डॉक्टर का पर्चा स्कैन कर अपनी दवाएं ऑटो-शेड्यूल करने पर मिला!' },
        seva_hero: { title: 'सेवा नायक 🤝', desc: 'मासिक दान पूल या आपातकालीन चिकित्सा सहायता फंड में योगदान करने पर मिला!' },
      },
      hinglish: {
        meds_hero: { title: 'Meds Hero 🏆', desc: '3 days continuously sabhi dawai time par lene ke liye mila!' },
        step_warrior: { title: 'Step Warrior 👣', desc: 'Aaj 4,000 steps walk karne ke liye mila. Keep walking!' },
        vitals_master: { title: 'Vitals Master 🩸', desc: 'Vitals check and log karne ke liye mila.' },
        scanner_pro: { title: 'Scanner Pro 📄', desc: 'Prescription scan karke medicine auto-schedule karne ke liye mila!' },
        seva_hero: { title: 'Seva Hero 🤝', desc: 'Monthly seva pool ya emergency medical funds me contribution karne ke liye mila!' },
      }
    };
    const langKey = badgeDetails[language] ? language : 'en';
    const details = badgeDetails[langKey][badgeId];
    if (details) {
      Alert.alert(details.title, details.desc);
    }
  };

  // SOS Emergency Execution
  const triggerSosCountdown = () => {
    setSosCountdownVal(3);
    setSosFired(false);
    setIsSosCountdownModalVisible(true);
    
    if (sosCountdownTimer.current) clearInterval(sosCountdownTimer.current);

    sosCountdownTimer.current = setInterval(() => {
      setSosCountdownVal((prev) => {
        if (prev <= 1) {
          if (sosCountdownTimer.current) clearInterval(sosCountdownTimer.current);
          setSosFired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const cancelSosAlert = () => {
    if (sosCountdownTimer.current) {
      clearInterval(sosCountdownTimer.current);
    }
    setIsSosCountdownModalVisible(false);
  };

  // Save Custom Contact
  const handleAddSOSContact = async () => {
    if (!newContactName.trim() || !newContactPhone.trim()) {
      Alert.alert('Error', 'Please enter Name and Phone number.');
      return;
    }
    const newContact: SosContact = {
      id: Date.now().toString(),
      name: newContactName.trim(),
      relation: newContactRelation.trim() || 'Family',
      phone: newContactPhone.trim()
    };
    const updated = [...sosContacts, newContact];
    setSosContacts(updated);
    setNewContactName('');
    setNewContactRelation('');
    setNewContactPhone('');
    try {
      await ApiService.saveSosContacts(user?.id || 'demo_patient', updated);
    } catch (e) {}
  };

  const handleDeleteSOSContact = async (id: string) => {
    const updated = sosContacts.filter((c) => c.id !== id);
    setSosContacts(updated);
    try {
      await ApiService.deleteSosContact(id);
      await ApiService.saveSosContacts(user?.id || 'demo_patient', updated);
    } catch (e) {}
  };

  // Prescription Simulation Execution
  const handleSelectSampleParcha = (id: number) => {
    setSelectedSampleParcha(id);
    setParchaStep('scanning');
  };

  // Messy handwriting verification triggers
  const handleAskDoctor = () => {
    Alert.alert(
      language === 'hi' ? 'पुष्टि के लिए डॉक्टर को भेजा गया 💬' : 'Sent to Doctor for Verification 💬',
      language === 'hi'
        ? 'इस दवा की धुंधली लिखावट का स्क्रीनशॉट डॉ. प्रिया शर्मा को भेज दिया गया है। उत्तर मिलते ही आपका शेड्यूल अपडेट कर दिया जायेगा।'
        : 'Scribbled medicine snippet sent directly to Dr. Priya Sharma. You will get a notification as soon as she validates it.'
    );
  };

  const handleAskCaregiver = () => {
    Alert.alert(
      language === 'hi' ? 'पुष्टि के लिए बेटे को भेजा गया 👨‍👩‍👦' : 'Sent to Caregiver Ramesh 👨‍👩‍👦',
      language === 'hi'
        ? 'रमेश (बेटा) को अलर्ट भेजा गया है कि वह पर्चे की जांच कर दवा स्पष्ट करें।'
        : 'Alert message sent to Ramesh (Son) to double check the handwritten paper prescription.'
    );
  };

  const handleSaveManualMedicine = () => {
    if (!manualEditInput.trim()) {
      Alert.alert('Error', getUiText('custom_task_empty'));
      return;
    }
    setUnclearMedText(manualEditInput.trim());
    setHasResolvedUnclearMedicine(true);
    setIsManualEditModalVisible(false);
  };

  const applyParchaSchedule = async () => {
    let newMeds: ChecklistItem[] = [];
    let newAdvice: string[] = [];

    if (selectedSampleParcha === 1) {
      // Diabetes
      newMeds = [
        { id: 'parcha_glycomet_m', text: '💊 Tab. Glycomet GP1 (Morning)', done: false, isParcha: true },
        { id: 'parcha_telma_m', text: '💊 Tab. Telma 40mg (Morning)', done: false, isParcha: true },
        { id: 'parcha_glycomet_n', text: '💊 Tab. Glycomet GP1 (Night)', done: false, isParcha: true },
        { id: 'parcha_diab_walk', text: '🚶 Brisk walk for 30 mins (Evening)', done: false, isParcha: true }
      ];
      newAdvice = [
        'Avoid sweets, high-carb meals like rice & potatoes.',
        'Monitor fasting blood sugar levels twice a week.',
        'Keep a bottle of water nearby and stay hydrated.'
      ];
    } else if (selectedSampleParcha === 2) {
      // Joint Pain & BP
      newMeds = [
        { id: 'parcha_ortho_m', text: '💊 Tab. Orthoflex 100mg (Morning)', done: false, isParcha: true },
        { id: 'parcha_calci_n', text: '💊 Tab. CalciPlus D3 (Night)', done: false, isParcha: true },
        { id: 'parcha_amlo_n', text: '💊 Tab. Amlokind 5mg (Night)', done: false, isParcha: true },
        { id: 'parcha_joint_ex', text: '🚲 10 minutes joint rotation exercises', done: false, isParcha: true }
      ];
      newAdvice = [
        'Perform gentle joint rotation exercises in morning.',
        'Avoid cold beverages and apply warm compress on joints.',
        'Drink warm milk with organic turmeric before sleeping.'
      ];
    } else if (selectedSampleParcha === 3) {
      // Messy Handwriting / Low OCR safety
      newMeds = [
        { id: 'parcha_metform_m3', text: '💊 Tab. Metformin 500mg (Morning)', done: false, isParcha: true }
      ];
      if (hasResolvedUnclearMedicine) {
        newMeds.push({
          id: 'parcha_unclear_resolved',
          text: unclearMedText.startsWith('💊') ? unclearMedText : '💊 ' + unclearMedText,
          done: false,
          isParcha: true
        });
      }
      newAdvice = [
        'DO NOT take medications whose timing or names are scribbled/unclear.',
        'Pharmacist or doctor verification is critical to prevent dosage errors.'
      ];
    }

    // Merge checklist, avoiding duplicates
    const filteredCurrent = checklist.filter((item) => !item.isParcha);
    const updatedChecklist = [...filteredCurrent, ...newMeds];
    setChecklist(updatedChecklist);

    // Merge or set doctor advice
    setDoctorAdviceList(newAdvice);

    // Save prescription scan details in treatment history log
    const prescName = selectedSampleParcha === 1 
      ? (language === 'hi' ? 'डायबिटीज कंट्रोल पर्चा' : 'Diabetes Control Prescription') 
      : selectedSampleParcha === 2
        ? (language === 'hi' ? 'जोड़ों के दर्द का पर्चा' : 'Joint Pain & BP Prescription')
        : (language === 'hi' ? 'अस्पष्ट लिखावट पर्चा सुरक्षा लॉग' : 'Handwriting Safety Prescription Log');
        
    const doctorName = selectedSampleParcha === 1 ? 'Dr. Priya Sharma' : 'Dr. Sanjay Gupta';
    addHistoryRecord(
      'prescription', 
      prescName, 
      `Extracted schedule: ${newMeds.map(m => m.text?.replace('💊 ', '')).join(', ')}. Advice: ${newAdvice.join(', ')}`,
      selectedSampleParcha === 1 ? 'diabetes_care_rx.pdf' : selectedSampleParcha === 2 ? 'joint_rehab_rx.pdf' : 'safety_warning_rx.pdf',
      doctorName
    );

    // Unlock badge
    let updatedBadges = [...unlockedBadges];
    if (!unlockedBadges.includes('scanner_pro')) {
      updatedBadges.push('scanner_pro');
      setUnlockedBadges(updatedBadges);
    }

    try {
      await AsyncStorage.setItem('user_checklist', JSON.stringify(updatedChecklist));
      await AsyncStorage.setItem('user_doctor_advice', JSON.stringify(newAdvice));
      await AsyncStorage.setItem('user_badges_unlocked', JSON.stringify(updatedBadges));
    } catch (e) {}

    setIsParchaModalVisible(false);
    Alert.alert(
      getUiText('parcha_success'),
      language === 'hi' 
        ? 'दवाइयों की सूची और डॉक्टर की सलाह आपके दैनिक डैशबोर्ड में जोड़ दी गई है!' 
        : 'Medicines & instructions have been successfully integrated into your dashboard!'
    );
  };

  // Custom Tasks Actions
  const handleAddCustomTask = async () => {
    if (!customTaskInput.trim()) {
      Alert.alert('Error', getUiText('custom_task_empty'));
      return;
    }
    const newTask: ChecklistItem = {
      id: 'custom_' + Date.now(),
      text: customTaskInput.trim(),
      done: false,
      isCustom: true
    };
    const updated = [...checklist, newTask];
    setChecklist(updated);
    setCustomTaskInput('');
    setIsCustomTaskModalVisible(false);
    try {
      await AsyncStorage.setItem('user_checklist', JSON.stringify(updated));
    } catch (e) {}
  };

  const handleDeleteCustomTask = async (id: number | string) => {
    const updated = checklist.filter((item) => item.id !== id);
    setChecklist(updated);
    try {
      await AsyncStorage.setItem('user_checklist', JSON.stringify(updated));
    } catch (e) {}
  };

  // Care Alerts Handlers
  const formatCallTime = (secs: number): string => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleConfirmMedRefill = async (alertId: string) => {
    const updatedAlerts = careAlerts.map(a => a.id === alertId ? { ...a, completed: true } : a);
    setCareAlerts(updatedAlerts);
    await ApiService.saveCareAlerts(user?.id || 'demo_patient', updatedAlerts);

    addHistoryRecord(
      'vitals', 
      language === 'hi' ? 'दवा स्टॉक रीफिल' : 'Medicine Stock Refill', 
      language === 'hi' ? 'मेटफॉर्मिन 500mg दवा रीफिल पूर्ण। नया स्टॉक: 30 गोलियां।' : 'Metformin 500mg stock refilled. Current Stock: 30 tabs.'
    );

    Alert.alert(
      language === 'hi' ? 'रीफिल सफल! ✅' : 'Refill Confirmed! ✅',
      language === 'hi' ? 'दवा स्टॉक अपडेट हो गया है। आपका दैनिक दवा शेड्यूल सुरक्षित है।' : 'Your medicine stock has been successfully updated to 30 tablets.'
    );

    setIsCareAlertModalVisible(false);
  };

  const handleBookHomeCollection = async (alertId: string) => {
    const updatedAlerts = careAlerts.map(a => a.id === alertId ? { ...a, completed: true } : a);
    setCareAlerts(updatedAlerts);
    await ApiService.saveCareAlerts(user?.id || 'demo_patient', updatedAlerts);

    addHistoryRecord(
      'report', 
      language === 'hi' ? 'HbA1c रक्त जांच बुक की गई' : 'HbA1c Blood Test Scheduled', 
      language === 'hi' ? 'साधना लैब्स द्वारा घर से रक्त नमूना संग्रह बुक किया गया है।' : 'HbA1c blood sample collection booked with Sadhna Diagnostics partner.'
    );

    Alert.alert(
      language === 'hi' ? 'घर बैठे नमूना संग्रह बुक हुआ! 🧪' : 'Home Collection Booked! 🧪',
      language === 'hi' ? 'साधना लैब्स के स्वास्थ्य प्रतिनिधि कल सुबह आपके घर पहुंचेंगे।' : 'A health representative from Sadhna Labs will visit you tomorrow morning.'
    );

    setIsCareAlertModalVisible(false);
  };

  const handleStartVideoConsult = (alertId: string) => {
    setIsCareAlertModalVisible(false);
    setActiveVideoCall(true);
    setVideoCallTimer(0);
    
    if (videoCallIntervalRef.current) clearInterval(videoCallIntervalRef.current);
    videoCallIntervalRef.current = setInterval(() => {
      setVideoCallTimer(prev => prev + 1);
    }, 1000);
  };

  const handleEndVideoConsult = async (alertId: string) => {
    if (videoCallIntervalRef.current) clearInterval(videoCallIntervalRef.current);
    setActiveVideoCall(false);
    
    const updatedAlerts = careAlerts.map(a => a.id === alertId ? { ...a, completed: true } : a);
    setCareAlerts(updatedAlerts);
    await ApiService.saveCareAlerts(user?.id || 'demo_patient', updatedAlerts);

    const durationStr = formatCallTime(videoCallTimer);
    addHistoryRecord(
      'prescription', 
      language === 'hi' ? 'डॉ. प्रिया परामर्श पूर्ण' : 'Dr. Priya Consult Completed', 
      language === 'hi' 
        ? `डॉ. प्रिया शर्मा के साथ वीडियो कॉल संपन्न। कुल अवधि: ${durationStr}। वाइटल्स पर चर्चा की गई।` 
        : `Video consultation completed successfully with Dr. Priya Sharma. Duration: ${durationStr}.`
    );

    Alert.alert(
      language === 'hi' ? 'परामर्श संपन्न! 📞' : 'Consultation Done! 📞',
      language === 'hi' ? 'डॉ. प्रिया के साथ आपका परामर्श सहेज लिया गया है।' : 'Your teleconsultation session summary has been saved to your health history.'
    );
  };

  // Lab Report / Custom Treatment Document Upload
  const handleSaveUploadedReport = () => {
    if (!reportName.trim()) {
      Alert.alert('Error', 'Please enter a report name.');
      return;
    }
    const origin = reportHospital.trim() || 'Sadhna Health Clinic';
    const notes = reportDetails.trim() || 'No description provided.';
    const attachment = reportFileName || 'uploaded_document.pdf';

    addHistoryRecord('report', reportName.trim(), notes, attachment, origin);
    setIsReportModalVisible(false);
    
    // Clear inputs
    setReportName('');
    setReportHospital('');
    setReportDetails('');
    setReportFileName('report_attachment.pdf');

    Alert.alert(
      language === 'hi' ? 'जांच रिपोर्ट सहेजी गई! ✅' : 'Report Saved! ✅',
      language === 'hi' 
        ? 'आपकी रिपोर्ट उपचार इतिहास (Treatment Journey Log) में रिकॉर्ड हो चुकी है।' 
        : 'Your lab report has been successfully logged in your treatment history.'
    );
  };

  const toggleExpandHistoryItem = (id: string) => {
    if (expandedHistoryItems.includes(id)) {
      setExpandedHistoryItems(expandedHistoryItems.filter((x) => x !== id));
    } else {
      setExpandedHistoryItems([...expandedHistoryItems, id]);
    }
  };

  const handleViewMockAttachment = (fileName: string) => {
    Alert.alert(
      language === 'hi' ? 'फ़ाइल पूर्वावलोकन (Preview)' : 'Document Attachment Preview',
      `📄 Viewing: ${fileName}\n\n[Simulated PDF Document opened securely in patient storage]`
    );
  };

  const handleShareDailyWin = () => {
    const winTitle: Record<string, string> = {
      en: "Today's Daily Win! ✅",
      hi: "आज की दैनिक जीत! ✅",
      hinglish: "Aaj ki Daily Win! ✅",
    };
    const winDetails: Record<string, string> = {
      en: `• Took all medicines on time\n• Walked ${steps} steps\n• Logged stable vitals\n\nGoal Quest: "${goalText}" is now ${goalProgress}% complete!`,
      hi: `• सभी दवाएं समय पर लीं\n• ${steps} कदम चले\n• वाइटल्स सामान्य दर्ज किए\n\nलक्ष्य खोज: "${goalText}" अब ${goalProgress}% पूर्ण है!`,
      hinglish: `• Sab medicine time par li\n• ${steps} steps chale\n• stable vitals log kiye\n\nGoal Quest: "${goalText}" ab ${goalProgress}% complete hai!`,
    };
    const title = winTitle[language as string] || winTitle['en'];
    const detail = winDetails[language as string] || winDetails['en'];

    router.push({
      pathname: '/post/create',
      params: {
        prefilledContent: `${title}\n\n${detail}`,
        prefilledType: 'daily_win',
      },
    } as any);
  };

  const welcomeSubText = CHECKLIST_ITEMS_MAP[language]?.[5] || CHECKLIST_ITEMS_MAP['en']?.[5] || '';
  const vitalsStatus = getVitalsStatus();
  
  const activeGoal = lifeGoals.find((g) => g.id === selectedGoalId);
  const activeStages = activeGoal ? activeGoal.steps : [];
  const activeStepId = activeStages.find((s) => !s.completed)?.id || 4;

  // Laser scanner translateY calculation
  const laserTranslateY = laserAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 160]
  });

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
      {/* 1. Welcome Banner (Integrated with Streak) */}
      <View style={[styles.welcomeCard, { backgroundColor: colors.surfaceSecondary }]}>
        <View style={styles.welcomeRow}>
          <View style={styles.welcomeText}>
            <Text style={[styles.greeting, { color: colors.text }]}>{t('hello')}, {user?.full_name?.split(' ')[0]}! 👋</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginVertical: 4 }}>
              <View style={{ backgroundColor: colors.warning + '15', borderColor: colors.warning, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start' }}>
                <Text style={{ fontSize: FontSize.xs, fontWeight: '700', color: colors.text }}>
                  {streak} {getUiText('streak_label')}
                </Text>
              </View>
            </View>
            <Text style={[styles.subGreeting, { color: colors.textSecondary, marginTop: 4 }]}>
              {welcomeSubText}
            </Text>
          </View>
          <Avatar uri={user?.avatar_url} name={user?.full_name || ''} size={50} />
        </View>
      </View>

      {/* 2. Care Reminders Strip */}
      {careAlerts.filter(a => !a.completed).length > 0 && (
        <View style={styles.alertsSectionContainer}>
          <Text style={[styles.alertsSectionTitle, { color: colors.text }]}>
            {language === 'hi' ? 'महत्वपूर्ण सूचनाएं और रिमाइंडर 🚨' : language === 'hinglish' ? 'Important Care Reminders 🚨' : 'Important Care Reminders 🚨'}
          </Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.alertsHorizontalList}
          >
            {careAlerts.filter(a => !a.completed).map((alert) => (
              <TouchableOpacity
                key={alert.id}
                style={[
                  styles.alertSectionCard, 
                  { 
                    backgroundColor: alert.type === 'medicine' 
                      ? colors.error + '10' 
                      : alert.type === 'appointment' 
                        ? colors.primary + '10' 
                        : '#F59E0B10',
                    borderColor: alert.type === 'medicine' 
                      ? colors.error 
                      : alert.type === 'appointment' 
                        ? colors.primary 
                        : '#F59E0B'
                  }
                ]}
                onPress={() => {
                  setSelectedCareAlert(alert);
                  setIsCareAlertModalVisible(true);
                }}
                activeOpacity={0.8}
              >
                <View style={styles.alertCardHeader}>
                  <Ionicons 
                    name={alert.type === 'medicine' ? 'medkit' : alert.type === 'appointment' ? 'videocam' : 'beaker'} 
                    size={20} 
                    color={alert.type === 'medicine' ? colors.error : alert.type === 'appointment' ? colors.primary : '#D97706'} 
                  />
                  <Text style={[styles.alertCardTitleText, { color: colors.text }]} numberOfLines={1}>
                    {alert.title}
                  </Text>
                </View>
                <Text style={[styles.alertCardDescText, { color: colors.textSecondary }]} numberOfLines={2}>
                  {alert.desc}
                </Text>
                <Text style={[styles.alertCardCtaText, { color: alert.type === 'medicine' ? colors.error : alert.type === 'appointment' ? colors.primary : '#D97706' }]}>
                  {alert.ctaText} →
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* 3. Jeene Ki Wajah (Life Goal Quest Card) */}
      <Card style={[styles.goalCard, { backgroundColor: colors.primaryFaded, borderColor: colors.primary }]}>
        <View style={styles.goalHeader}>
          <View style={{ flex: 1, marginRight: Spacing.md }}>
            <Text style={[styles.goalTitleTag, { color: colors.primary }]}>
              {getUiText('wajah_title')}
            </Text>
            <Text style={[styles.goalMainText, { color: colors.text }]}>
              "{goalText?.replace(/\\n/g, ' ').replace(/\r?\n|\r/g, ' ').replace(/\s+/g, ' ').trim()}"
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.editGoalBtn, { backgroundColor: colors.surface }]}
            onPress={() => {
              setTempGoalText(goalText);
              setTempGoalProgress(goalProgress);
              setIsGoalModalVisible(true);
            }}
          >
            <Text style={[styles.editGoalText, { color: colors.primary }]}>
              {getUiText('edit_goal')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Progress Ring / Bar */}
        <View style={styles.progressSection}>
          <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
            <View style={[styles.progressFill, { width: `${goalProgress}%`, backgroundColor: colors.primary }]} />
          </View>
          <Text style={[styles.progressText, { color: colors.textSecondary }]}>
            {getUiText('goal_progress')}: {goalProgress}%
          </Text>
        </View>

        {/* Dynamic Hope Statement */}
        <View style={[styles.hopeBox, { backgroundColor: colors.surface }]}>
          <Ionicons name="sparkles" size={16} color={colors.accent} />
          <Text style={[styles.hopeText, { color: colors.textSecondary }]}>
            {getHopeStatement(goalText)}
          </Text>
        </View>
      </Card>

      {/* 4. Daily Wins Checklist */}
      <Card style={styles.sectionCard}>
        <View style={styles.cardHeader}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>{t('checklist_title')}</Text>
          <Text style={[styles.cardProgressText, { color: colors.primary }]}>{progressPercent}% {t('checklist_progress')}</Text>
        </View>
        <Text style={[styles.cardSub, { color: colors.textTertiary }]}>
          {t('checklist_desc')}
        </Text>

        <View style={styles.checklist}>
          {checklist.map((item) => (
            <View
              key={item.id}
              style={[styles.checklistItemRow, { borderColor: colors.borderLight }]}
            >
              <TouchableOpacity
                style={styles.checklistItemLeft}
                onPress={() => toggleChecklist(item.id)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={item.done ? 'checkbox' : 'square-outline'}
                  size={22}
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
                  {getChecklistItemText(item)}
                </Text>
              </TouchableOpacity>

              {/* Delete button if Custom Task */}
              {item.isCustom && (
                <TouchableOpacity
                  style={styles.deleteTaskBtn}
                  onPress={() => handleDeleteCustomTask(item.id)}
                >
                  <Ionicons name="trash-outline" size={16} color={colors.error} />
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>

        {/* Action Row */}
        <View style={styles.checklistActions}>
          <TouchableOpacity
            style={[styles.customTaskTrigger, { borderColor: colors.primary }]}
            onPress={() => setIsCustomTaskModalVisible(true)}
          >
            <Ionicons name="add-circle-outline" size={16} color={colors.primary} />
            <Text style={[styles.customTaskTriggerText, { color: colors.primary }]}>
              {getUiText('custom_task_btn')}
            </Text>
          </TouchableOpacity>
        </View>

        {progressPercent === 100 ? (
          <TouchableOpacity
            style={[styles.shareBtn, { backgroundColor: colors.primary, marginTop: Spacing.base }]}
            onPress={handleShareDailyWin}
          >
            <Ionicons name="checkmark-circle-outline" size={18} color="#FFF" />
            <Text style={styles.shareBtnText}>{t('share_win_btn')}</Text>
          </TouchableOpacity>
        ) : (
          <View style={[styles.shareBtn, { backgroundColor: colors.surfaceSecondary, marginTop: Spacing.base }]}>
            <Ionicons name="lock-closed" size={16} color={colors.textTertiary} />
            <Text style={[styles.shareBtnText, { color: colors.textTertiary }]}>
              {t('share_win_disabled')}
            </Text>
          </View>
        )}
      </Card>

      {/* 5. Interactive Vitals Log & SOS Section */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>{getUiText('vitals_title')}</Text>
      <Card style={styles.vitalsCard}>
        {/* Vitals Status Bar */}
        <View style={[styles.vitalsStatusBar, { backgroundColor: vitalsStatus.color + '15' }]}>
          <Ionicons name="pulse" size={18} color={vitalsStatus.color} />
          <Text style={[styles.vitalsStatusText, { color: vitalsStatus.color }]}>
            {vitalsStatus.text}
          </Text>
          {vitalsSavedMessage && (
            <Text style={{ fontSize: 11, color: colors.success, marginLeft: 'auto', fontWeight: 'bold' }}>
              ✓ Saved!
            </Text>
          )}
        </View>

        {/* Date Selector for Vitals Log */}
        <View style={styles.vitalsDateContainer}>
          <Text style={[styles.vitalsDateLabel, { color: colors.text }]}>
            📅 {language === 'hi' ? 'लॉग की तिथि:' : 'Log Date:'}
          </Text>
          <View style={styles.vitalsDatePresets}>
            <TouchableOpacity
              style={[
                styles.vitalsDatePresetBtn,
                vitalsDate === getTodayDateStr() && { backgroundColor: colors.primary, borderColor: colors.primary }
              ]}
              onPress={() => setVitalsDate(getTodayDateStr())}
              activeOpacity={0.8}
            >
              <Text style={[styles.vitalsDatePresetText, { color: vitalsDate === getTodayDateStr() ? '#FFF' : colors.textSecondary }]}>
                {language === 'hi' ? 'आज' : 'Today'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.vitalsDatePresetBtn,
                vitalsDate === getYesterdayDateStr() && { backgroundColor: colors.primary, borderColor: colors.primary }
              ]}
              onPress={() => setVitalsDate(getYesterdayDateStr())}
              activeOpacity={0.8}
            >
              <Text style={[styles.vitalsDatePresetText, { color: vitalsDate === getYesterdayDateStr() ? '#FFF' : colors.textSecondary }]}>
                {language === 'hi' ? 'कल' : 'Yesterday'}
              </Text>
            </TouchableOpacity>
          </View>
          <TextInput
            style={[styles.vitalsDateInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surfaceSecondary }]}
            value={vitalsDate}
            onChangeText={setVitalsDate}
            placeholder="DD-MMM-YYYY"
            placeholderTextColor={colors.textTertiary}
          />
        </View>

        {/* Sugar Stepper */}
        <View style={styles.stepperRow}>
          <Text style={[styles.stepperLabel, { color: colors.text }]}>
            🩸 {getUiText('sugar')}
          </Text>
          <View style={styles.stepperControls}>
            <TouchableOpacity
              style={[styles.stepBtn, { backgroundColor: colors.surfaceSecondary }]}
              onPress={() => setSugar(Math.max(50, sugar - 5))}
            >
              <Text style={[styles.stepBtnText, { color: colors.text }]}>-</Text>
            </TouchableOpacity>
            <Text style={[styles.stepValue, { color: colors.text }]}>
              {sugar} <Text style={{ fontSize: 10, color: colors.textTertiary }}>{getUiText('sugar_unit')}</Text>
            </Text>
            <TouchableOpacity
              style={[styles.stepBtn, { backgroundColor: colors.surfaceSecondary }]}
              onPress={() => setSugar(Math.min(300, sugar + 5))}
            >
              <Text style={[styles.stepBtnText, { color: colors.text }]}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* BP Stepper */}
        <View style={styles.stepperRow}>
          <Text style={[styles.stepperLabel, { color: colors.text }]}>
            💓 {getUiText('bp')}
          </Text>
          <View style={styles.stepperControls}>
            <TouchableOpacity
              style={[styles.stepBtn, { backgroundColor: colors.surfaceSecondary }]}
              onPress={() => setBp(Math.max(80, bp - 5))}
            >
              <Text style={[styles.stepBtnText, { color: colors.text }]}>-</Text>
            </TouchableOpacity>
            <Text style={[styles.stepValue, { color: colors.text }]}>
              {bp} <Text style={{ fontSize: 10, color: colors.textTertiary }}>{getUiText('bp_unit')}</Text>
            </Text>
            <TouchableOpacity
              style={[styles.stepBtn, { backgroundColor: colors.surfaceSecondary }]}
              onPress={() => setBp(Math.min(200, bp + 5))}
            >
              <Text style={[styles.stepBtnText, { color: colors.text }]}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Heart Rate Stepper */}
        <View style={styles.stepperRow}>
          <Text style={[styles.stepperLabel, { color: colors.text }]}>
            ❤️ {getUiText('heart_rate')}
          </Text>
          <View style={styles.stepperControls}>
            <TouchableOpacity
              style={[styles.stepBtn, { backgroundColor: colors.surfaceSecondary }]}
              onPress={() => setHeartRate(Math.max(40, heartRate - 2))}
            >
              <Text style={[styles.stepBtnText, { color: colors.text }]}>-</Text>
            </TouchableOpacity>
            <Text style={[styles.stepValue, { color: colors.text }]}>
              {heartRate} <Text style={{ fontSize: 10, color: colors.textTertiary }}>{getUiText('hr_unit')}</Text>
            </Text>
            <TouchableOpacity
              style={[styles.stepBtn, { backgroundColor: colors.surfaceSecondary }]}
              onPress={() => setHeartRate(Math.min(150, heartRate + 2))}
            >
              <Text style={[styles.stepBtnText, { color: colors.text }]}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Vitals Action Buttons */}
        <View style={styles.vitalsActionRow}>
          <TouchableOpacity
            style={[styles.vitalsSaveBtn, { backgroundColor: colors.primary }]}
            onPress={handleSaveVitals}
          >
            <Ionicons name="save-outline" size={16} color="#FFF" />
            <Text style={styles.vitalsSaveBtnText}>{getUiText('save_log')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.vitalsSosBtn, { backgroundColor: colors.error }]}
            onPress={triggerSosCountdown}
          >
            <Ionicons name="alert-circle" size={16} color="#FFF" />
            <Text style={styles.vitalsSosBtnText}>SOS Emergency</Text>
          </TouchableOpacity>
        </View>

        {/* Manage SOS Numbers Link */}
        <TouchableOpacity
          style={styles.manageSosLink}
          onPress={() => setIsSosContactsModalVisible(true)}
        >
          <Text style={[styles.manageSosLinkText, { color: colors.primary }]}>
            {getUiText('manage_sos_btn')}
          </Text>
        </TouchableOpacity>
      </Card>

      {/* 6. Doctor & Caregiver Feedback notes */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>{getUiText('doctor_notes_title')}</Text>
      <Card style={[styles.apptCard, { borderLeftColor: colors.primary, borderLeftWidth: 4 }]}>
        <View style={styles.notesHeader}>
          <Avatar uri={null} name="Dr. Priya Sharma" size={32} />
          <Text style={[styles.notesAuthor, { color: colors.text }]}>Dr. Priya Sharma (Oncologist)</Text>
          <Text style={{ fontSize: 10, color: colors.textTertiary, marginLeft: 'auto' }}>1h ago</Text>
        </View>
        <Text style={[styles.notesBody, { color: colors.textSecondary }]}>
          "Your logged blood pressure coordinates and step tracker statistics look extremely positive this week. Let's maintain this discipline toward our Kedarnath peak quest target! 🏔️"
        </Text>

        {/* Extracted Advice Section */}
        {doctorAdviceList.length > 0 && (
          <View style={[styles.adviceExtractedContainer, { borderTopColor: colors.borderLight }]}>
            <Text style={[styles.adviceTitle, { color: colors.text }]}>
              {language === 'hi' ? 'पर्चे से प्राप्त हिदायतें:' : 'Extracted Doctor Instructions:'}
            </Text>
            {doctorAdviceList.map((adv, idx) => (
              <View key={idx} style={styles.adviceRowItem}>
                <Ionicons name="medical" size={12} color={colors.accent} />
                <Text style={[styles.adviceTextItem, { color: colors.textSecondary }]}>{adv}</Text>
              </View>
            ))}
          </View>
        )}
      </Card>

      {/* 7. My Life Goals Vertical Stepper Card */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: Spacing.md, marginBottom: Spacing.sm }}>
        <Text style={[styles.sectionTitle, { color: colors.text, marginVertical: 0 }]}>{getUiText('journey_title')}</Text>
        <TouchableOpacity
          style={[styles.uploadReportHeaderBtn, { backgroundColor: colors.primary }]}
          onPress={() => setIsAddGoalModalVisible(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={14} color="#FFF" />
          <Text style={styles.uploadReportBtnText}>
            {language === 'hi' ? 'नया लक्ष्य जोड़ें' : language === 'hinglish' ? 'Naya Goal Add' : 'Add Goal'}
          </Text>
        </TouchableOpacity>
      </View>

      <Card style={styles.journeyCard}>
        <Text style={[styles.journeySub, { color: colors.textTertiary }]}>{getUiText('journey_subtitle')}</Text>
        
        {/* Goals horizontal scroll list */}
        {lifeGoals.length > 0 && (
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            style={styles.goalsHorizontalList}
            contentContainerStyle={styles.goalsHorizontalListContent}
          >
            {lifeGoals.map((goal) => {
              const completedStepsCount = goal.steps.filter((s) => s.completed).length;
              const isSelected = goal.id === selectedGoalId;
              return (
                <TouchableOpacity
                  key={goal.id}
                  style={[
                    styles.goalTabItem,
                    {
                      backgroundColor: isSelected ? colors.primary : colors.surfaceSecondary,
                      borderColor: isSelected ? colors.primary : colors.border,
                    }
                  ]}
                  onPress={() => {
                    setSelectedGoalId(goal.id);
                    const firstIncomplete = goal.steps.find((s) => !s.completed);
                    setSelectedGoalStageId(firstIncomplete ? firstIncomplete.id : 1);
                  }}
                  activeOpacity={0.8}
                >
                  <Text 
                    style={[
                      styles.goalTabTitle, 
                      { color: isSelected ? '#FFF' : colors.text }
                    ]}
                  >
                    {goal.title}
                  </Text>
                  <Text 
                    style={[
                      styles.goalTabProgressText, 
                      { color: isSelected ? 'rgba(255, 255, 255, 0.8)' : colors.textSecondary }
                    ]}
                  >
                    {completedStepsCount}/4 {language === 'hi' ? 'चरण' : 'steps'}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}

        {/* Selected Goal Header and Description */}
        {activeGoal && (
          <View style={[styles.selectedGoalHeaderRow, { borderBottomColor: colors.border }]}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.selectedGoalLabelText, { color: colors.textTertiary }]}>
                {language === 'hi' ? 'सक्रिय जीवन लक्ष्य:' : 'Active Life Goal:'}
              </Text>
              <Text style={[styles.selectedGoalTitleText, { color: colors.text }]}>
                {activeGoal.title}
              </Text>
              <Text style={[styles.selectedGoalDescText, { color: colors.textSecondary }]}>
                {activeGoal.desc}
              </Text>
            </View>
            {/* Delete custom goal option */}
            {lifeGoals.length > 1 && (
              <TouchableOpacity 
                style={[styles.deleteGoalBtn, { backgroundColor: colors.errorFaded }]}
                onPress={() => handleDeleteGoal(activeGoal.id)}
                activeOpacity={0.7}
              >
                <Ionicons name="trash" size={16} color={colors.error} />
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Timeline representation */}
        <View style={styles.timelineContainer}>
          <View style={[styles.timelineVerticalLine, { backgroundColor: colors.border }]} />
          {activeStages.map((stage) => {
            const isCompleted = stage.completed;
            const isActive = stage.id === activeStepId;
            const isSelected = stage.id === selectedGoalStageId;

            return (
              <TouchableOpacity 
                key={stage.id} 
                style={styles.timelineItemRow} 
                onPress={() => setSelectedGoalStageId(stage.id)}
                activeOpacity={0.7}
              >
                {/* Node Symbol */}
                <View style={[
                  styles.timelineNode, 
                  { backgroundColor: colors.surface },
                  isCompleted && { borderColor: colors.success, backgroundColor: colors.success + '15' },
                  isActive && { borderColor: colors.primary, backgroundColor: colors.primary + '15' },
                  !isCompleted && !isActive && { borderColor: colors.border }
                ]}>
                  {isCompleted ? (
                    <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                  ) : isActive ? (
                    <View style={[styles.pulseCircle, { backgroundColor: colors.primary }]} />
                  ) : (
                    <Text style={{ fontSize: FontSize.xs, color: colors.textTertiary, fontWeight: 'bold' }}>{stage.id}</Text>
                  )}
                </View>

                {/* Title */}
                <View style={[styles.timelineNodeContent, isSelected && { backgroundColor: colors.surfaceSecondary, borderRadius: Radius.md, padding: Spacing.sm }]}>
                  <Text style={[
                    styles.timelineNodeTitle, 
                    { color: colors.text },
                    isActive && { color: colors.primary, fontWeight: '800' }
                  ]}>
                    {language === 'hi' ? `चरण ${stage.id}: ` : `Step ${stage.id}: `}{stage.title}
                  </Text>
                  <Text style={[styles.timelineNodeDesc, { color: colors.textSecondary }]} numberOfLines={1}>
                    {stage.desc}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Selected Stage Detail Panel */}
        {selectedGoalStageId && activeStages.length > 0 && (
          (() => {
            const currentStageInfo = activeStages.find((s) => s.id === selectedGoalStageId);
            if (!currentStageInfo) return null;
            return (
              <View style={[styles.selectedStageBox, { backgroundColor: colors.primaryFaded, borderColor: colors.primary }]}>
                <View style={styles.stageBoxHeader}>
                  <Ionicons name="flag-outline" size={16} color={colors.primary} />
                  <Text style={[styles.stageBoxTitle, { color: colors.primary }]}>
                    {language === 'hi' ? `चरण ${currentStageInfo.id}: ` : `Step ${currentStageInfo.id}: `}{currentStageInfo.title}
                  </Text>
                  {currentStageInfo.id === activeStepId && (
                    <Text style={[styles.activeTag, { backgroundColor: colors.primary, color: '#FFF' }]}>
                      {getUiText('active_phase')}
                    </Text>
                  )}
                </View>
                <Text style={[styles.stageBoxDesc, { color: colors.text }]}>
                  {currentStageInfo.desc}
                </Text>

                <Text style={[styles.milestoneHeading, { color: colors.textSecondary }]}>
                  {getUiText('milestones_title')}:
                </Text>
                {currentStageInfo.milestones.map((milestone, idx) => (
                  <View key={idx} style={styles.milestoneRow}>
                    <Ionicons 
                      name={milestone.startsWith('✓') ? 'checkmark-circle' : 'ellipse-outline'} 
                      size={14} 
                      color={milestone.startsWith('✓') ? colors.success : colors.textTertiary} 
                    />
                    <Text style={[styles.milestoneText, { color: colors.textSecondary }]}>
                      {milestone.startsWith('✓') ? milestone.substring(2) : milestone}
                    </Text>
                  </View>
                ))}

                {/* Mark as Completed / Incomplete Toggle Button */}
                <TouchableOpacity
                  style={[
                    styles.toggleStepStatusBtn,
                    {
                      backgroundColor: currentStageInfo.completed ? 'transparent' : colors.primary,
                      borderColor: colors.primary,
                      borderWidth: 1,
                    }
                  ]}
                  onPress={() => handleToggleStepCompletion(selectedGoalId, currentStageInfo.id)}
                  activeOpacity={0.8}
                >
                  {currentStageInfo.completed ? (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <Ionicons name="close-circle-outline" size={16} color={colors.primary} />
                      <Text style={[styles.toggleStepStatusText, { color: colors.primary }]}>
                        {language === 'hi' ? 'चरण अपूर्ण चिह्नित करें' : 'Mark as Incomplete'}
                      </Text>
                    </View>
                  ) : (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <Ionicons name="checkmark-circle-outline" size={16} color="#FFF" />
                      <Text style={[styles.toggleStepStatusText, { color: '#FFF' }]}>
                        {language === 'hi' ? 'इसे पूरा चिह्नित करें ✓' : 'Mark as Completed ✓'}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            );
          })()
        )}
      </Card>

      {/* 8. Prescription Parcha Scan Assistant */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>{getUiText('prescription_title')}</Text>
      <Card style={[styles.prescCard, { borderColor: colors.accent, borderWidth: 1 }]}>
        <View style={styles.prescRow}>
          <View style={[styles.prescIconContainer, { backgroundColor: colors.accent + '15' }]}>
            <Ionicons name="document-text-outline" size={32} color={colors.accent} />
          </View>
          <View style={styles.prescInfo}>
            <Text style={[styles.prescTitle, { color: colors.text }]}>
              {language === 'hi' ? 'दवाइयों का ऑटो-शेड्यूल' : 'Auto Medicine Scheduler'}
            </Text>
            <Text style={[styles.prescSub, { color: colors.textSecondary }]}>
              {getUiText('prescription_subtitle')}
            </Text>
            <TouchableOpacity
              style={[styles.prescBtn, { backgroundColor: colors.accent }]}
              onPress={() => {
                setParchaStep('select');
                setSelectedSampleParcha(null);
                setIsParchaModalVisible(true);
              }}
            >
              <Ionicons name="camera-outline" size={16} color="#FFF" />
              <Text style={styles.prescBtnText}>{getUiText('upload_btn')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Card>

      {/* 9. Achievements & Medals */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>{getUiText('medals_title')}</Text>
      <Card style={styles.medalsCard}>
        <Text style={[styles.cardSub, { color: colors.textTertiary, marginBottom: Spacing.md }]}>
          {getUiText('medals_desc')}
        </Text>
        <View style={styles.medalsGrid}>
          <TouchableOpacity
            style={[
              styles.medalBtn,
              { borderColor: colors.border },
              unlockedBadges.includes('meds_hero') && { backgroundColor: '#F59E0B15', borderColor: '#F59E0B' }
            ]}
            onPress={() => handleBadgeClick('meds_hero')}
          >
            <Text style={styles.medalEmoji}>🏆</Text>
            <Text style={[styles.medalLabel, { color: colors.text }]} numberOfLines={1}>
              Meds Hero
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.medalBtn,
              { borderColor: colors.border },
              unlockedBadges.includes('step_warrior') && { backgroundColor: '#10B98115', borderColor: '#10B981' }
            ]}
            onPress={() => handleBadgeClick('step_warrior')}
          >
            <Text style={styles.medalEmoji}>👣</Text>
            <Text style={[styles.medalLabel, { color: colors.text }]} numberOfLines={1}>
              Step Warrior
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.medalBtn,
              { borderColor: colors.border },
              unlockedBadges.includes('vitals_master') && { backgroundColor: '#0D948815', borderColor: '#0D9488' }
            ]}
            onPress={() => handleBadgeClick('vitals_master')}
          >
            <Text style={styles.medalEmoji}>🩸</Text>
            <Text style={[styles.medalLabel, { color: colors.text }]} numberOfLines={1}>
              Vitals Logger
            </Text>
          </TouchableOpacity>

          {/* Scan Badge */}
          <TouchableOpacity
            style={[
              styles.medalBtn,
              { borderColor: colors.border },
              unlockedBadges.includes('scanner_pro') && { backgroundColor: '#8B5CF615', borderColor: '#8B5CF6' }
            ]}
            onPress={() => handleBadgeClick('scanner_pro')}
          >
            <Text style={styles.medalEmoji}>📄</Text>
            <Text style={[styles.medalLabel, { color: colors.text }]} numberOfLines={1}>
              Scanner Pro
            </Text>
          </TouchableOpacity>

          {/* Seva Hero Badge */}
          <TouchableOpacity
            style={[
              styles.medalBtn,
              { borderColor: colors.border },
              unlockedBadges.includes('seva_hero') && { backgroundColor: colors.secondary + '15', borderColor: colors.secondary }
            ]}
            onPress={() => handleBadgeClick('seva_hero')}
          >
            <Text style={styles.medalEmoji}>🤝</Text>
            <Text style={[styles.medalLabel, { color: colors.text }]} numberOfLines={1}>
              Seva Hero
            </Text>
          </TouchableOpacity>
        </View>
      </Card>

      {/* 10. Treatment & Diagnostic History Timeline Log */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>{getUiText('history_title')}</Text>
      <Card style={styles.historyCard}>
        <View style={styles.historyHeader}>
          <Text style={[styles.historySubText, { color: colors.textTertiary }]}>
            {getUiText('history_subtitle')}
          </Text>
          <TouchableOpacity
            style={[styles.uploadReportHeaderBtn, { backgroundColor: colors.primary }]}
            onPress={() => setIsReportModalVisible(true)}
          >
            <Ionicons name="add" size={14} color="#FFF" />
            <Text style={styles.uploadReportBtnText}>{getUiText('upload_report_btn')}</Text>
          </TouchableOpacity>
        </View>

        {/* History timeline list */}
        <View style={styles.historyListTimeline}>
          <View style={[styles.historyVerticalLine, { backgroundColor: colors.border }]} />
          {[...treatmentHistory].sort((a, b) => parseHistoryDate(b.date).getTime() - parseHistoryDate(a.date).getTime()).map((item) => {
            const isExpanded = expandedHistoryItems.includes(item.id);
            const getLogColor = () => {
              if (item.type === 'prescription') return colors.accent;
              if (item.type === 'vitals') return colors.primary;
              return '#F59E0B'; // yellow/amber for lab report
            };

            return (
              <View key={item.id} style={styles.historyItemRow}>
                {/* Node icon based on type */}
                <View style={[styles.historyItemNode, { borderColor: getLogColor(), backgroundColor: colors.surface }]}>
                  <Ionicons 
                    name={item.type === 'prescription' ? 'document-text' : item.type === 'vitals' ? 'heart' : 'beaker'} 
                    size={11} 
                    color={getLogColor()} 
                  />
                </View>

                {/* Content Box */}
                <View style={[
                  styles.historyItemContainer, 
                  { 
                    borderColor: colors.borderLight, 
                    backgroundColor: colors.surfaceSecondary 
                  }
                ]}>
                  <TouchableOpacity 
                    style={styles.historyItemTitleBar} 
                    onPress={() => toggleExpandHistoryItem(item.id)}
                    activeOpacity={0.7}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.historyItemTitle, { color: colors.text }]}>{item.title}</Text>
                      <Text style={{ fontSize: 9, color: colors.textTertiary, marginTop: 1 }}>{item.date}</Text>
                    </View>
                    <Ionicons 
                      name={isExpanded ? 'chevron-up' : 'chevron-down'} 
                      size={16} 
                      color={colors.textTertiary} 
                    />
                  </TouchableOpacity>

                  {isExpanded && (
                    <View style={[styles.historyItemExpandedContent, { borderTopColor: colors.border }]}>
                      <Text style={[styles.historyItemDetailsText, { color: colors.textSecondary }]}>
                        {item.details}
                      </Text>
                      {item.hospital && (
                        <Text style={{ fontSize: 10, color: colors.textTertiary, marginTop: 6 }}>
                          <Text style={{ fontWeight: 'bold' }}>{getUiText('report_lab_label')}</Text> {item.hospital}
                        </Text>
                      )}
                      {item.fileName && (
                        <TouchableOpacity 
                          style={[styles.historyAttachmentPill, { backgroundColor: colors.surfaceSecondary }]}
                          onPress={() => handleViewMockAttachment(item.fileName!)}
                        >
                          <Ionicons name="attach-outline" size={13} color={colors.textSecondary} />
                          <Text style={[styles.attachmentTextText, { color: colors.textSecondary }]} numberOfLines={1}>
                            {item.fileName}
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      </Card>

      {/* 11. Seva Ecosystem */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>{getUiText('seva_title')}</Text>
      <Card style={styles.sevaCard}>
        <Text style={[styles.cardSub, { color: colors.textTertiary, marginBottom: Spacing.md }]}>
          {getUiText('seva_subtitle')}
        </Text>

        {/* 1. Monthly Donation Pool Card */}
        <View style={[styles.sevaPoolContainer, { backgroundColor: colors.primaryFaded, borderColor: colors.primary }]}>
          <View style={styles.sevaPoolHeader}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.sevaPoolTitle, { color: colors.text }]}>
                {getUiText('seva_pool_title')}
              </Text>
              <Text style={[styles.sevaPoolDesc, { color: colors.textSecondary }]}>
                {getUiText('seva_pool_desc')}
              </Text>
            </View>
            <View style={[styles.poolIconBadge, { backgroundColor: colors.primary + '15' }]}>
              <Ionicons name="heart" size={24} color={colors.primary} />
            </View>
          </View>

          {/* Stats row */}
          <View style={styles.sevaStatsRow}>
            <View style={styles.sevaStatItem}>
              <Text style={[styles.sevaStatLabel, { color: colors.textTertiary }]}>
                {getUiText('seva_pool_raised')}
              </Text>
              <Text style={[styles.sevaStatValue, { color: colors.primary }]}>
                ₹{sevaPoolAmount.toLocaleString('en-IN')}
              </Text>
            </View>
            <View style={styles.sevaStatItem}>
              <Text style={[styles.sevaStatLabel, { color: colors.textTertiary }]}>
                {getUiText('seva_pool_contributors')}
              </Text>
              <Text style={[styles.sevaStatValue, { color: colors.text }]}>
                {sevaPoolContributors.toLocaleString('en-IN')}
              </Text>
            </View>
          </View>

          {/* Pool Target Progress bar */}
          <View style={styles.sevaPoolProgressContainer}>
            <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
              {/* Target is ₹5,00,000 */}
              <View style={[styles.progressFill, { width: `${Math.min(100, (sevaPoolAmount / 500000) * 100)}%`, backgroundColor: colors.primary }]} />
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
              <Text style={{ fontSize: 9, color: colors.textTertiary }}>
                {Math.round((sevaPoolAmount / 500000) * 100)}% {language === 'hi' ? 'लक्ष्य पूरा' : 'Target reached'}
              </Text>
              <Text style={{ fontSize: 9, color: colors.textTertiary }}>
                {getUiText('seva_pool_goal')} ₹5,00,000
              </Text>
            </View>
          </View>

          {/* Contribute Button */}
          <TouchableOpacity
            style={[styles.sevaPoolContributeBtn, { backgroundColor: colors.primary }]}
            onPress={() => {
              setActiveRequestForDonation(null);
              setSevaContributeAmount('500');
              setIsSevaContributeModalVisible(true);
            }}
            activeOpacity={0.8}
          >
            <Ionicons name="gift-outline" size={16} color="#FFF" />
            <Text style={styles.sevaPoolContributeBtnText}>
              {getUiText('seva_contribute_btn')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* 2. Emergency Medical Requests Feed */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: Spacing.lg, marginBottom: Spacing.sm }}>
          <Text style={[styles.sevaSectionHeader, { color: colors.text }]}>
            {getUiText('seva_emergency_title')}
          </Text>
          <TouchableOpacity
            style={[styles.sevaRequestSupportBtn, { borderColor: colors.primary, borderWidth: 1 }]}
            onPress={() => {
              setSevaReqPatientName(user?.full_name || 'Karan Verma');
              setSevaReqHospital('');
              setSevaReqReason('');
              setSevaReqAmount('');
              setSevaReqDocName('');
              setIsSevaRequestModalVisible(true);
            }}
            activeOpacity={0.8}
          >
            <Ionicons name="add-circle-outline" size={14} color={colors.primary} />
            <Text style={[styles.sevaRequestSupportBtnText, { color: colors.primary }]}>
              {getUiText('seva_request_support_btn')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* List of requests */}
        {[...emergencyRequests].sort((a, b) => parseHistoryDate(b.date).getTime() - parseHistoryDate(a.date).getTime()).map((req) => {
          const percentRaised = Math.round((req.raisedAmount / req.requiredAmount) * 100);
          const isDone = req.raisedAmount >= req.requiredAmount;
          return (
            <View key={req.id} style={[styles.emergencyReqCard, { borderColor: colors.border, backgroundColor: colors.surfaceSecondary }]}>
              <View style={styles.emergencyReqHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.emergencyPatientName, { color: colors.text }]}>
                    {req.patientName}
                  </Text>
                  <Text style={[styles.emergencyHospital, { color: colors.textTertiary }]} numberOfLines={1}>
                    📍 {req.hospital}
                  </Text>
                </View>
                {/* Status Badge */}
                <View style={[
                  styles.statusBadge,
                  {
                    backgroundColor: req.status === 'verified' 
                      ? colors.success + '15' 
                      : req.status === 'pending' 
                        ? colors.accent + '15' 
                        : colors.error + '15',
                    borderColor: req.status === 'verified' 
                      ? colors.success 
                      : req.status === 'pending' 
                        ? colors.accent 
                        : colors.error
                  }
                ]}>
                  <Text style={[
                    styles.statusBadgeText,
                    {
                      color: req.status === 'verified' 
                        ? colors.success 
                        : req.status === 'pending' 
                          ? colors.accent 
                          : colors.error
                    }
                  ]}>
                    {req.status === 'verified' 
                      ? getUiText('seva_status_verified') 
                      : req.status === 'pending' 
                        ? getUiText('seva_status_pending') 
                        : getUiText('seva_status_rejected')}
                  </Text>
                </View>
              </View>

              {/* Reason / disease */}
              <View style={[styles.emergencyReasonContainer, { backgroundColor: colors.surface }]}>
                <Ionicons name="medical-outline" size={14} color={colors.secondary} />
                <Text style={[styles.emergencyReasonText, { color: colors.textSecondary }]}>
                  {req.reason}
                </Text>
              </View>

              {/* Progress metrics */}
              <View style={styles.emergencyProgressSection}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                  <Text style={{ fontSize: 10, color: colors.textSecondary, fontWeight: '700' }}>
                    ₹{req.raisedAmount.toLocaleString('en-IN')} / ₹{req.requiredAmount.toLocaleString('en-IN')}
                  </Text>
                  <Text style={{ fontSize: 10, color: colors.primary, fontWeight: '800' }}>
                    {percentRaised}% {language === 'hi' ? 'सहेजा गया' : 'Raised'}
                  </Text>
                </View>
                <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
                  <View style={[styles.progressFill, { width: `${Math.min(100, percentRaised)}%`, backgroundColor: isDone ? colors.success : colors.primary }]} />
                </View>
              </View>

              {/* Hospital estimate / verification doc pill */}
              {req.documentName && (
                <TouchableOpacity 
                  style={[styles.emergencyDocPill, { backgroundColor: colors.surface }]}
                  onPress={() => handleViewMockAttachment(req.documentName!)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="document-attach-outline" size={12} color={colors.textSecondary} />
                  <Text style={{ fontSize: 9, color: colors.textSecondary, marginLeft: 4, flex: 1 }} numberOfLines={1}>
                    {req.documentName}
                  </Text>
                  <Text style={{ fontSize: 8, color: colors.primary, fontWeight: 'bold' }}>
                    {language === 'hi' ? '[देखें]' : '[View]'}
                  </Text>
                </TouchableOpacity>
              )}

              {/* Contribute button to specific case */}
              {!isDone ? (
                <TouchableOpacity
                  style={[styles.emergencyContributeBtn, { backgroundColor: colors.secondary }]}
                  onPress={() => {
                    setActiveRequestForDonation(req);
                    setSevaContributeAmount('1000');
                    setIsSevaContributeModalVisible(true);
                  }}
                  activeOpacity={0.8}
                >
                  <Ionicons name="heart-outline" size={14} color="#FFF" />
                  <Text style={styles.emergencyContributeBtnText}>
                    {language === 'hi' ? 'मदद के लिए दान दें' : language === 'hinglish' ? 'Help ke liye Donate karein' : 'Help Patients Heal'}
                  </Text>
                </TouchableOpacity>
              ) : (
                <View style={[styles.emergencyContributeBtn, { backgroundColor: colors.success + '20', borderWidth: 1, borderColor: colors.success }]}>
                  <Ionicons name="checkmark-circle" size={14} color={colors.success} />
                  <Text style={[styles.emergencyContributeBtnText, { color: colors.success }]}>
                    {language === 'hi' ? 'फंड पूर्ण हुआ! 🙏' : 'Fully Funded! 🙏'}
                  </Text>
                </View>
              )}
            </View>
          );
        })}

        {/* 3. Partner NGOs List */}
        <View style={[styles.ngoPartnersContainer, { borderTopColor: colors.borderLight }]}>
          <Text style={[styles.ngoPartnersTitle, { color: colors.textTertiary }]}>
            {getUiText('seva_partner_ngos')}
          </Text>
          <View style={styles.ngoRow}>
            <View style={[styles.ngoPill, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.ngoPillText, { color: colors.text }]}>🤝 साधना फाउंडेशन (Sadhna)</Text>
            </View>
            <View style={[styles.ngoPill, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.ngoPillText, { color: colors.text }]}>🌱 Goonj</Text>
            </View>
            <View style={[styles.ngoPill, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.ngoPillText, { color: colors.text }]}>👴 HelpAge India</Text>
            </View>
          </View>
        </View>
      </Card>

      {/* MODALS */}
      
      {/* 1. Goal Editor Modal */}
      <Modal
        visible={isGoalModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsGoalModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setIsGoalModalVisible(false)}
          />
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={[styles.modalIndicator, { backgroundColor: colors.border }]} />
            <Text style={[styles.modalHeaderTitle, { color: colors.text }]}>
              {getUiText('set_goal')}
            </Text>

            <TextInput
              style={[
                styles.modalInput,
                { color: colors.text, borderColor: colors.border, backgroundColor: colors.surfaceSecondary }
              ]}
              placeholder={getUiText('goal_placeholder')}
              placeholderTextColor={colors.textTertiary}
              value={tempGoalText}
              onChangeText={setTempGoalText}
              multiline
            />

            {/* Progress Slider Stepper */}
            <Text style={[styles.modalSubTitle, { color: colors.text, marginTop: Spacing.md }]}>
              {getUiText('goal_progress')}: {tempGoalProgress}%
            </Text>
            <View style={styles.progressStepper}>
              <TouchableOpacity
                style={[styles.stepBtn, { backgroundColor: colors.surfaceSecondary }]}
                onPress={() => setTempGoalProgress(Math.max(0, tempGoalProgress - 5))}
              >
                <Text style={{ fontSize: 18, color: colors.text }}>-</Text>
              </TouchableOpacity>
              <View style={[styles.modalProgressTrack, { backgroundColor: colors.border, flex: 1, marginHorizontal: 15 }]}>
                <View style={[styles.modalProgressFill, { width: `${tempGoalProgress}%`, backgroundColor: colors.primary }]} />
              </View>
              <TouchableOpacity
                style={[styles.stepBtn, { backgroundColor: colors.surfaceSecondary }]}
                onPress={() => setTempGoalProgress(Math.min(100, tempGoalProgress + 5))}
              >
                <Text style={{ fontSize: 18, color: colors.text }}>+</Text>
              </TouchableOpacity>
            </View>

            {/* Goal Preset Selection Chips */}
            <Text style={[styles.modalSubTitle, { color: colors.text, marginTop: Spacing.lg }]}>
              Goal Presets / बने बनाए लक्ष्य:
            </Text>
            <View style={styles.presetChips}>
              {((GOALS_PRESETS[language] || GOALS_PRESETS['en']) || []).map((preset) => (
                <TouchableOpacity
                  key={preset.id}
                  style={[styles.presetChip, { borderColor: colors.border }]}
                  onPress={() => {
                    setTempGoalText(preset.text);
                    setTempGoalProgress(30); // reset progress for new quest
                  }}
                >
                  <Text style={[styles.presetChipText, { color: colors.textSecondary }]}>
                    {preset.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Save Button */}
            <TouchableOpacity
              style={[styles.modalSaveBtn, { backgroundColor: colors.primary }]}
              onPress={() => saveGoal(tempGoalText, tempGoalProgress)}
            >
              <Text style={styles.modalSaveBtnText}>
                {getUiText('save_goal')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalCancelBtn, { backgroundColor: colors.surfaceSecondary }]}
              onPress={() => setIsGoalModalVisible(false)}
            >
              <Text style={[styles.modalCancelBtnText, { color: colors.text }]}>
                {getUiText('cancel')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 2. Parcha Scanner Modal */}
      <Modal
        visible={isParchaModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsParchaModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setIsParchaModalVisible(false)}
          />
          <View style={[styles.modalContent, { backgroundColor: colors.surface, maxHeight: '90%' }]}>
            <View style={[styles.modalIndicator, { backgroundColor: colors.border }]} />
            <Text style={[styles.modalHeaderTitle, { color: colors.text }]}>
              {getUiText('prescription_title')}
            </Text>

            {parchaStep === 'select' && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.mockUploadBox}>
                  <Ionicons name="cloud-upload-outline" size={44} color={colors.textTertiary} />
                  <Text style={[styles.mockUploadTitle, { color: colors.text }]}>
                    {language === 'hi' ? 'फाइल चुनें या फोटो खींचें' : 'Choose Prescription Image / PDF'}
                  </Text>
                  <Text style={{ fontSize: FontSize.xs, color: colors.textTertiary, textAlign: 'center', marginTop: 4 }}>
                    Camera, Gallery, or local documents upload support.
                  </Text>
                </View>

                <Text style={[styles.modalSubTitle, { color: colors.text, marginTop: Spacing.md }]}>
                  {language === 'hi' ? 'या ट्रायल के लिए सैंपल पर्चा चुनें:' : 'Or, Select a Sample Prescription to Try:'}
                </Text>

                <TouchableOpacity
                  style={[styles.samplePrescItem, { borderColor: colors.primary }]}
                  onPress={() => handleSelectSampleParcha(1)}
                >
                  <View style={[styles.sampleBadge, { backgroundColor: colors.primaryFaded }]}>
                    <Text style={{ fontSize: 10, color: colors.primary, fontWeight: 'bold' }}>SAMPLE A</Text>
                  </View>
                  <Text style={[styles.sampleTitle, { color: colors.text }]}>
                    {getUiText('parcha_sample1')}
                  </Text>
                  <Text style={{ fontSize: FontSize.xs, color: colors.textSecondary, marginTop: 4 }}>
                    👨‍⚕️ Dr. Priya Sharma (Oncologist) {"\n"}
                    💊 Tab. Glycomet GP1 (Morning & Night), Tab. Telma 40mg
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.samplePrescItem, { borderColor: colors.accent }]}
                  onPress={() => handleSelectSampleParcha(2)}
                >
                  <View style={[styles.sampleBadge, { backgroundColor: colors.accent + '15' }]}>
                    <Text style={{ fontSize: 10, color: colors.accent, fontWeight: 'bold' }}>SAMPLE B</Text>
                  </View>
                  <Text style={[styles.sampleTitle, { color: colors.text }]}>
                    {getUiText('parcha_sample2')}
                  </Text>
                  <Text style={{ fontSize: FontSize.xs, color: colors.textSecondary, marginTop: 4 }}>
                    👨‍⚕️ Dr. Sanjay Gupta (Ortho Expert) {"\n"}
                    💊 Tab. Orthoflex 100mg, Tab. CalciPlus D3, Tab. Amlokind
                  </Text>
                </TouchableOpacity>

                {/* New Sample C with Safety Warning Simulator */}
                <TouchableOpacity
                  style={[styles.samplePrescItem, { borderColor: colors.error }]}
                  onPress={() => handleSelectSampleParcha(3)}
                >
                  <View style={[styles.sampleBadge, { backgroundColor: colors.error + '15' }]}>
                    <Text style={{ fontSize: 10, color: colors.error, fontWeight: 'bold' }}>SAMPLE C (SAFETY SIM)</Text>
                  </View>
                  <Text style={[styles.sampleTitle, { color: colors.text }]}>
                    {getUiText('parcha_sample3')}
                  </Text>
                  <Text style={{ fontSize: FontSize.xs, color: colors.textSecondary, marginTop: 4 }}>
                    👨‍⚕️ Dr. Priya Sharma (Messy / Illegible Writing) {"\n"}
                    💊 Tab. Metformin (Clear), Tab. L--- 5mg (Illegible/Scribbled)
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalCancelBtn, { backgroundColor: colors.surfaceSecondary, marginTop: Spacing.base }]}
                  onPress={() => setIsParchaModalVisible(false)}
                >
                  <Text style={[styles.modalCancelBtnText, { color: colors.text }]}>
                    {getUiText('cancel')}
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            )}

            {parchaStep === 'scanning' && (
              <View style={styles.scanningContainer}>
                {/* Mock Parcha Document */}
                <View style={[styles.mockDocContainer, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
                  {/* Glowing Laser scanning line */}
                  <Animated.View style={[
                    styles.laserScannerLine, 
                    { 
                      backgroundColor: '#10B981', 
                      transform: [{ translateY: laserTranslateY }]
                    }
                  ]} />
                  <Text style={{ fontFamily: 'Courier', fontSize: 11, color: colors.textSecondary }}>Rx Rx Rx Rx Rx Rx Rx Rx</Text>
                  <Text style={{ fontFamily: 'Courier', fontSize: 12, fontWeight: 'bold', color: colors.text, marginTop: 10 }}>SADHNA DIAGNOSTICS & CARE</Text>
                  <Text style={{ fontFamily: 'Courier', fontSize: 10, color: colors.textSecondary }}>PATIENT: {user?.full_name}</Text>
                  <View style={{ height: 1, backgroundColor: colors.border, marginVertical: 10 }} />
                  {selectedSampleParcha === 3 ? (
                    <View>
                      <Text style={{ fontFamily: 'Courier', fontSize: 11, color: colors.text, marginVertical: 4 }}>- Tab. Metformin (500mg) ----- 1 OD Morning</Text>
                      <Text style={{ fontFamily: 'Courier', fontSize: 11, color: colors.error, textDecorationLine: 'line-through', marginVertical: 4 }}>- Tab. ~~~~~~? (5mg) ---------- Timing: ????</Text>
                      <Text style={{ fontSize: 9, color: colors.error, fontStyle: 'italic', fontWeight: 'bold', marginTop: 10 }}>[OCR Alert: Low Confidence on Line 2]</Text>
                    </View>
                  ) : (
                    <View>
                      <Text style={{ fontFamily: 'Courier', fontSize: 11, color: colors.text, marginVertical: 4 }}>- Tab. Glycomet GP1 (500mg) ----- 1 OD Morning</Text>
                      <Text style={{ fontFamily: 'Courier', fontSize: 11, color: colors.text, marginVertical: 4 }}>- Tab. Telma 40mg --------------- 1 OD Night</Text>
                    </View>
                  )}
                  <Text style={{ fontFamily: 'Courier', fontSize: 10, fontStyle: 'italic', color: colors.textTertiary, marginTop: 15 }}>
                    *Instructions: Verify dose before consuming.
                  </Text>
                </View>

                {/* Progress updates */}
                <Text style={[styles.scanningTitle, { color: colors.text }]}>
                  {getUiText('parcha_scan_title')}
                </Text>
                <Text style={[styles.scanningSub, { color: colors.primary }]}>
                  {scanStepMessage}
                </Text>
                <View style={[styles.progressTrack, { backgroundColor: colors.border, marginTop: Spacing.md, width: '100%' }]}>
                  <View style={[styles.progressFill, { width: `${scanProgress}%`, backgroundColor: colors.accent }]} />
                </View>
                <ActivityIndicator size="small" color={colors.accent} style={{ marginTop: Spacing.base }} />
              </View>
            )}

            {parchaStep === 'result' && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.resultBox}>
                  <Ionicons name="checkmark-circle-outline" size={40} color={colors.success} />
                  <Text style={[styles.resultTitle, { color: colors.text }]}>
                    {getUiText('parcha_success')}
                  </Text>
                  {selectedSampleParcha === 3 && (
                    <Text style={{ fontSize: FontSize.xs, color: colors.error, fontWeight: 'bold', marginTop: 4 }}>
                      {getUiText('safety_confidence_label')} 68% (Low / कम)
                    </Text>
                  )}
                </View>

                <View style={styles.extractedCard}>
                  <Text style={[styles.extractedSectionHeading, { color: colors.primary }]}>
                    {getUiText('parcha_medicines_label')}
                  </Text>
                  {selectedSampleParcha === 1 ? (
                    <View style={styles.extractedMedsList}>
                      <Text style={[styles.extractedItemText, { color: colors.text }]}>• Tab. Glycomet GP1 (Morning)</Text>
                      <Text style={[styles.extractedItemText, { color: colors.text }]}>• Tab. Telma 40mg (Morning)</Text>
                      <Text style={[styles.extractedItemText, { color: colors.text }]}>• Tab. Glycomet GP1 (Night)</Text>
                      <Text style={[styles.extractedItemText, { color: colors.text }]}>• 30-minute evening walk</Text>
                    </View>
                  ) : selectedSampleParcha === 2 ? (
                    <View style={styles.extractedMedsList}>
                      <Text style={[styles.extractedItemText, { color: colors.text }]}>• Tab. Orthoflex 100mg (Morning)</Text>
                      <Text style={[styles.extractedItemText, { color: colors.text }]}>• Tab. CalciPlus D3 (Night)</Text>
                      <Text style={[styles.extractedItemText, { color: colors.text }]}>• Tab. Amlokind 5mg (Night)</Text>
                      <Text style={[styles.extractedItemText, { color: colors.text }]}>• 10 mins joint exercises</Text>
                    </View>
                  ) : (
                    <View style={styles.extractedMedsList}>
                      <Text style={[styles.extractedItemText, { color: colors.text }]}>• Tab. Metformin 500mg (Morning) 🟢</Text>
                      {hasResolvedUnclearMedicine ? (
                        <Text style={[styles.extractedItemText, { color: colors.success, fontWeight: 'bold' }]}>
                          • {unclearMedText} (Verified/सुधारित) ✅
                        </Text>
                      ) : (
                        <Text style={[styles.extractedItemText, { color: colors.error, fontWeight: 'bold' }]}>
                          • {unclearMedText} ⚠️
                        </Text>
                      )}
                    </View>
                  )}
                </View>

                {/* Safety check display for Sample C */}
                {selectedSampleParcha === 3 && !hasResolvedUnclearMedicine && (
                  <View style={[styles.safetyCheckCard, { borderColor: colors.warning, backgroundColor: colors.warning + '10' }]}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                      <Ionicons name="shield-half" size={16} color={colors.warning} />
                      <Text style={[styles.safetyCheckTitle, { color: colors.warning }]}>
                        {getUiText('safety_check_failed')}
                      </Text>
                    </View>
                    <Text style={{ fontSize: FontSize.xs, color: colors.text, lineHeight: 16 }}>
                      {getUiText('safety_check_failed_desc')}
                    </Text>
                    <View style={styles.safetyActionButtons}>
                      <TouchableOpacity 
                        style={[styles.safetySubBtn, { borderColor: colors.primary }]}
                        onPress={handleAskDoctor}
                      >
                        <Text style={[styles.safetySubBtnText, { color: colors.primary }]}>{getUiText('safety_ask_doctor')}</Text>
                      </TouchableOpacity>

                      <TouchableOpacity 
                        style={[styles.safetySubBtn, { borderColor: colors.accent }]}
                        onPress={handleAskCaregiver}
                      >
                        <Text style={[styles.safetySubBtnText, { color: colors.accent }]}>{getUiText('safety_ask_caregiver')}</Text>
                      </TouchableOpacity>

                      <TouchableOpacity 
                        style={[styles.safetySubBtn, { backgroundColor: colors.primary, borderColor: colors.primary }]}
                        onPress={() => {
                          setManualEditInput(getUiText('unclear_medicine_name').replace('[Unclear Handwriting] ', ''));
                          setIsManualEditModalVisible(true);
                        }}
                      >
                        <Text style={[styles.safetySubBtnText, { color: '#FFF' }]}>{getUiText('safety_enter_manual')}</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                <View style={styles.extractedCard}>
                  <Text style={[styles.extractedSectionHeading, { color: colors.accent }]}>
                    {getUiText('parcha_advice_label')}
                  </Text>
                  {selectedSampleParcha === 1 ? (
                    <View style={styles.extractedMedsList}>
                      <Text style={[styles.extractedItemText, { color: colors.text }]}>• Avoid all sweets, rice, and potatoes.</Text>
                      <Text style={[styles.extractedItemText, { color: colors.text }]}>• Monitor fasting blood sugar twice a week.</Text>
                    </View>
                  ) : selectedSampleParcha === 2 ? (
                    <View style={styles.extractedMedsList}>
                      <Text style={[styles.extractedItemText, { color: colors.text }]}>• Perform gentle joint rotation exercises.</Text>
                      <Text style={[styles.extractedItemText, { color: colors.text }]}>• Avoid cold beverages & apply warm compress.</Text>
                    </View>
                  ) : (
                    <View style={styles.extractedMedsList}>
                      <Text style={[styles.extractedItemText, { color: colors.text }]}>• DO NOT consume illegible medications.</Text>
                      <Text style={[styles.extractedItemText, { color: colors.text }]}>• Consult clinic to verify the scribbled timings.</Text>
                    </View>
                  )}
                </View>

                <TouchableOpacity
                  style={[styles.modalSaveBtn, { backgroundColor: colors.primary, marginTop: Spacing.md }]}
                  onPress={applyParchaSchedule}
                >
                  <Text style={styles.modalSaveBtnText}>
                    {getUiText('parcha_apply')}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalCancelBtn, { backgroundColor: colors.surfaceSecondary }]}
                  onPress={() => setParchaStep('select')}
                >
                  <Text style={[styles.modalCancelBtnText, { color: colors.text }]}>
                    Re-scan / वापस जाएं
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* 3. Custom Task Modal */}
      <Modal
        visible={isCustomTaskModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsCustomTaskModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setIsCustomTaskModalVisible(false)}
          />
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={[styles.modalIndicator, { backgroundColor: colors.border }]} />
            <Text style={[styles.modalHeaderTitle, { color: colors.text }]}>
              {getUiText('custom_task_modal_title')}
            </Text>

            <TextInput
              style={[
                styles.customTaskInputStyle,
                { color: colors.text, borderColor: colors.border, backgroundColor: colors.surfaceSecondary }
              ]}
              placeholder={getUiText('custom_task_placeholder')}
              placeholderTextColor={colors.textTertiary}
              value={customTaskInput}
              onChangeText={setCustomTaskInput}
            />

            <TouchableOpacity
              style={[styles.modalSaveBtn, { backgroundColor: colors.primary, marginTop: Spacing.md }]}
              onPress={handleAddCustomTask}
            >
              <Text style={styles.modalSaveBtnText}>
                {getUiText('custom_task_save')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalCancelBtn, { backgroundColor: colors.surfaceSecondary }]}
              onPress={() => setIsCustomTaskModalVisible(false)}
            >
              <Text style={[styles.modalCancelBtnText, { color: colors.text }]}>
                {getUiText('cancel')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 3.5 Add Life Goal Modal */}
      <Modal
        visible={isAddGoalModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsAddGoalModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setIsAddGoalModalVisible(false)}
          />
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={[styles.modalIndicator, { backgroundColor: colors.border }]} />
            <Text style={[styles.modalHeaderTitle, { color: colors.text }]}>
              {language === 'hi' ? 'नया जीवन लक्ष्य जोड़ें 🎯' : 'Add New Life Goal 🎯'}
            </Text>

            <Text style={{ fontSize: FontSize.xs, color: colors.textSecondary, marginBottom: 4 }}>
              {language === 'hi' ? 'लक्ष्य का नाम (जैसे: चार धाम यात्रा, मैराथन दौड़ना):' : 'Goal Name (e.g. Pilgrimage, Ride Cycle):'}
            </Text>
            <TextInput
              style={[
                styles.customTaskInputStyle,
                { color: colors.text, borderColor: colors.border, backgroundColor: colors.surfaceSecondary, marginBottom: Spacing.base }
              ]}
              placeholder={language === 'hi' ? 'बेटी की शादी में जाना, केदारनाथ यात्रा...' : 'Attend daughter\'s wedding, run 5k...'}
              placeholderTextColor={colors.textTertiary}
              value={newGoalTitle}
              onChangeText={setNewGoalTitle}
            />

            <Text style={{ fontSize: FontSize.xs, color: colors.textSecondary, marginBottom: 4 }}>
              {language === 'hi' ? 'लक्ष्य का विवरण (वैकल्पिक):' : 'Goal Description (Optional):'}
            </Text>
            <TextInput
              style={[
                styles.customTaskInputStyle,
                { color: colors.text, borderColor: colors.border, backgroundColor: colors.surfaceSecondary, height: 60, paddingTop: 10 }
              ]}
              multiline
              numberOfLines={2}
              placeholder={language === 'hi' ? 'संक्षिप्त विवरण लिखें जो आपको प्रेरित करे' : 'Brief description of why this goal matters to you'}
              placeholderTextColor={colors.textTertiary}
              value={newGoalDesc}
              onChangeText={setNewGoalDesc}
            />

            <TouchableOpacity
              style={[styles.modalSaveBtn, { backgroundColor: colors.primary, marginTop: Spacing.md }]}
              onPress={handleSaveNewLifeGoal}
            >
              <Text style={styles.modalSaveBtnText}>
                {language === 'hi' ? 'लक्ष्य सहेजें' : 'Save Goal'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalCancelBtn, { backgroundColor: colors.surfaceSecondary }]}
              onPress={() => setIsAddGoalModalVisible(false)}
            >
              <Text style={[styles.modalCancelBtnText, { color: colors.text }]}>
                {getUiText('cancel')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 4. SOS Contacts Modal */}
      <Modal
        visible={isSosContactsModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsSosContactsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setIsSosContactsModalVisible(false)}
          />
          <View style={[styles.modalContent, { backgroundColor: colors.surface, maxHeight: '85%' }]}>
            <View style={[styles.modalIndicator, { backgroundColor: colors.border }]} />
            <Text style={[styles.modalHeaderTitle, { color: colors.text }]}>
              {getUiText('sos_contacts_title')}
            </Text>

            <ScrollView showsVerticalScrollIndicator={false} style={{ marginBottom: Spacing.base }}>
              {sosContacts.length === 0 ? (
                <Text style={[styles.emptySosText, { color: colors.textTertiary }]}>
                  {getUiText('sos_contact_list_empty')}
                </Text>
              ) : (
                sosContacts.map((contact) => (
                  <View 
                    key={contact.id} 
                    style={[styles.contactListItem, { borderColor: colors.borderLight }]}
                  >
                    <View style={styles.contactDetails}>
                      <Text style={[styles.contactNameText, { color: colors.text }]}>
                        👤 {contact.name} ({contact.relation})
                      </Text>
                      <Text style={{ fontSize: FontSize.xs, color: colors.textSecondary, marginLeft: 20 }}>
                        📞 {contact.phone}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.contactDeleteBtn}
                      onPress={() => handleDeleteSOSContact(contact.id)}
                    >
                      <Ionicons name="trash-outline" size={18} color={colors.error} />
                    </TouchableOpacity>
                  </View>
                ))
              )}

              {/* Form to add */}
              <View style={[styles.addContactForm, { borderColor: colors.border, backgroundColor: colors.surfaceSecondary }]}>
                <Text style={[styles.formHeading, { color: colors.text }]}>
                  {language === 'hi' ? 'नया संपर्क जोड़ें:' : 'Add New Contact:'}
                </Text>
                
                <TextInput
                  style={[styles.formInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]}
                  placeholder={getUiText('sos_name_placeholder')}
                  placeholderTextColor={colors.textTertiary}
                  value={newContactName}
                  onChangeText={setNewContactName}
                />

                <TextInput
                  style={[styles.formInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]}
                  placeholder={getUiText('sos_relation_placeholder')}
                  placeholderTextColor={colors.textTertiary}
                  value={newContactRelation}
                  onChangeText={setNewContactRelation}
                />

                <TextInput
                  style={[styles.formInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]}
                  placeholder={getUiText('sos_phone_placeholder')}
                  placeholderTextColor={colors.textTertiary}
                  value={newContactPhone}
                  onChangeText={setNewContactPhone}
                  keyboardType="phone-pad"
                />

                <TouchableOpacity
                  style={[styles.formSubmitBtn, { backgroundColor: colors.primary }]}
                  onPress={handleAddSOSContact}
                >
                  <Text style={styles.formSubmitBtnText}>{getUiText('sos_add_btn')}</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>

            <TouchableOpacity
              style={[styles.modalCancelBtn, { backgroundColor: colors.surfaceSecondary }]}
              onPress={() => setIsSosContactsModalVisible(false)}
            >
              <Text style={[styles.modalCancelBtnText, { color: colors.text }]}>
                Close / बंद करें
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 5. SOS Countdown Modal */}
      <Modal
        visible={isSosCountdownModalVisible}
        transparent
        animationType="fade"
        onRequestClose={cancelSosAlert}
      >
        <View style={styles.modalOverlayCentered}>
          <View style={[styles.sosAlertBox, { backgroundColor: colors.surface }]}>
            {!sosFired ? (
              <View style={styles.sosCountdownContainer}>
                <View style={[styles.sosAlertHeaderPulse, { backgroundColor: colors.error + '15' }]}>
                  <Ionicons name="alert-circle" size={48} color={colors.error} />
                </View>
                <Text style={[styles.sosCountdownTitle, { color: colors.text }]}>
                  {getUiText('sos_countdown_title')}
                </Text>
                <Text style={{ fontSize: FontSize.xs, color: colors.textSecondary, textAlign: 'center', marginBottom: Spacing.base }}>
                  {getUiText('sos_countdown_sub')}
                </Text>
                <View style={[styles.countdownCircle, { borderColor: colors.error }]}>
                  <Text style={[styles.countdownNumber, { color: colors.error }]}>
                    {sosCountdownVal}
                  </Text>
                </View>
                <TouchableOpacity
                  style={[styles.cancelSosAlertBtn, { backgroundColor: colors.surfaceSecondary }]}
                  onPress={cancelSosAlert}
                >
                  <Text style={[styles.cancelSosAlertBtnText, { color: colors.text }]}>
                    {getUiText('sos_cancel')}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.sosFiredContainer}>
                <Ionicons name="shield-checkmark" size={60} color={colors.success} />
                <Text style={[styles.sosFiredTitle, { color: colors.text }]}>
                  {getUiText('sos_fired_title')}
                </Text>
                <Text style={[styles.sosFiredDesc, { color: colors.textSecondary }]}>
                  {getUiText('sos_fired_desc')}
                </Text>

                <View style={[styles.sosNotifiedList, { backgroundColor: colors.surfaceSecondary }]}>
                  <Text style={{ fontSize: FontSize.xs, fontWeight: 'bold', color: colors.text, marginBottom: 6 }}>
                    {getUiText('sos_sent_msg')}
                  </Text>
                  {sosContacts.map((contact, idx) => (
                    <Text key={idx} style={{ fontSize: 11, color: colors.textSecondary, marginVertical: 2 }}>
                      ✓ {contact.name} ({contact.phone}) - SMS sent!
                    </Text>
                  ))}
                  <Text style={{ fontSize: 11, color: colors.primary, fontWeight: 'bold', marginVertical: 4 }}>
                    ✓ Direct distress signal posted to Sadhna Social Healing Feed!
                  </Text>
                </View>

                <TouchableOpacity
                  style={[styles.modalSaveBtn, { backgroundColor: colors.success, width: '100%', marginTop: Spacing.md }]}
                  onPress={() => setIsSosCountdownModalVisible(false)}
                >
                  <Text style={styles.modalSaveBtnText}>Done / ठीक है</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* 6. Diagnostic Lab Report Upload Modal */}
      <Modal
        visible={isReportModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsReportModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setIsReportModalVisible(false)}
          />
          <View style={[styles.modalContent, { backgroundColor: colors.surface, maxHeight: '90%' }]}>
            <View style={[styles.modalIndicator, { backgroundColor: colors.border }]} />
            <Text style={[styles.modalHeaderTitle, { color: colors.text }]}>
              {getUiText('upload_report_modal_title')}
            </Text>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.reportFormContainer}>
                
                {/* Report Title */}
                <Text style={[styles.modalSubTitle, { color: colors.text }]}>
                  {language === 'hi' ? 'रिपोर्ट का नाम:' : 'Report/Test Name:'}
                </Text>
                <TextInput
                  style={[styles.formInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surfaceSecondary, height: 42 }]}
                  placeholder={getUiText('report_name_placeholder')}
                  placeholderTextColor={colors.textTertiary}
                  value={reportName}
                  onChangeText={setReportName}
                />

                {/* Lab/Hospital Name */}
                <Text style={[styles.modalSubTitle, { color: colors.text, marginTop: Spacing.sm }]}>
                  {language === 'hi' ? 'लैब या अस्पताल का नाम:' : 'Lab / Hospital Name:'}
                </Text>
                <TextInput
                  style={[styles.formInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surfaceSecondary, height: 42 }]}
                  placeholder={getUiText('report_hospital_placeholder')}
                  placeholderTextColor={colors.textTertiary}
                  value={reportHospital}
                  onChangeText={setReportHospital}
                />

                {/* Report Details summary */}
                <Text style={[styles.modalSubTitle, { color: colors.text, marginTop: Spacing.sm }]}>
                  {language === 'hi' ? 'जांच परिणाम / मुख्य आंकड़े:' : 'Key Stats / Test Findings:'}
                </Text>
                <TextInput
                  style={[styles.modalInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surfaceSecondary, height: 70 }]}
                  placeholder={getUiText('report_details_placeholder')}
                  placeholderTextColor={colors.textTertiary}
                  value={reportDetails}
                  onChangeText={setReportDetails}
                  multiline
                />

                {/* Mock File Selector */}
                <Text style={[styles.modalSubTitle, { color: colors.text, marginTop: Spacing.sm }]}>
                  {language === 'hi' ? 'फ़ाइल संलग्न करें:' : 'Attach Lab Document:'}
                </Text>
                <TouchableOpacity 
                  style={[styles.mockFileSelectBox, { borderColor: colors.border, backgroundColor: colors.surfaceSecondary }]}
                  onPress={() => {
                    const sampleFiles = ['thyroid_profile.pdf', 'liver_panel.pdf', 'lipid_report.jpg', 'chest_xray.png'];
                    const randomFile = sampleFiles[Math.floor(Math.random() * sampleFiles.length)];
                    setReportFileName(randomFile);
                  }}
                >
                  <Ionicons name="attach" size={18} color={colors.primary} />
                  <Text style={{ fontSize: FontSize.xs, color: colors.textSecondary, flex: 1, marginLeft: 4 }}>
                    {reportFileName ? `${getUiText('report_file_attached')} ${reportFileName}` : getUiText('report_file_placeholder')}
                  </Text>
                  <Text style={{ fontSize: 9, color: colors.primary, fontWeight: 'bold' }}>[Change]</Text>
                </TouchableOpacity>

                {/* Save button */}
                <TouchableOpacity
                  style={[styles.modalSaveBtn, { backgroundColor: colors.primary, marginTop: Spacing.md }]}
                  onPress={handleSaveUploadedReport}
                >
                  <Text style={styles.modalSaveBtnText}>{getUiText('save_report_btn')}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalCancelBtn, { backgroundColor: colors.surfaceSecondary }]}
                  onPress={() => setIsReportModalVisible(false)}
                >
                  <Text style={[styles.modalCancelBtnText, { color: colors.text }]}>{getUiText('cancel')}</Text>
                </TouchableOpacity>

              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* 7. Unclear Medicine Handwriting Manual Correction Modal */}
      <Modal
        visible={isManualEditModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsManualEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setIsManualEditModalVisible(false)}
          />
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={[styles.modalIndicator, { backgroundColor: colors.border }]} />
            <Text style={[styles.modalHeaderTitle, { color: colors.text }]}>
              {getUiText('manual_edit_title')}
            </Text>
            <Text style={{ fontSize: FontSize.xs, color: colors.textSecondary, marginBottom: Spacing.sm, textAlign: 'center' }}>
              {language === 'hi' 
                ? 'अपने फार्मासिस्ट या डॉक्टर से सही दवा और समय जानकर यहाँ मैन्युअली लिखें:' 
                : 'Enter verified medicine name & instructions directly below:'}
            </Text>

            <TextInput
              style={[
                styles.customTaskInputStyle,
                { color: colors.text, borderColor: colors.border, backgroundColor: colors.surfaceSecondary }
              ]}
              placeholder={getUiText('manual_edit_input_placeholder')}
              placeholderTextColor={colors.textTertiary}
              value={manualEditInput}
              onChangeText={setManualEditInput}
            />

            <TouchableOpacity
              style={[styles.modalSaveBtn, { backgroundColor: colors.primary, marginTop: Spacing.md }]}
              onPress={handleSaveManualMedicine}
            >
              <Text style={styles.modalSaveBtnText}>
                {language === 'hi' ? 'दवा सहेजें' : 'Verify & Save'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalCancelBtn, { backgroundColor: colors.surfaceSecondary }]}
              onPress={() => setIsManualEditModalVisible(false)}
            >
              <Text style={[styles.modalCancelBtnText, { color: colors.text }]}>
                {getUiText('cancel')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Seva Contribution Modal */}
      <Modal
        visible={isSevaContributeModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsSevaContributeModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => {
              setIsSevaContributeModalVisible(false);
              setActiveRequestForDonation(null);
            }}
          />
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={[styles.modalIndicator, { backgroundColor: colors.border }]} />
            <Text style={[styles.modalHeaderTitle, { color: colors.text }]}>
              {getUiText('seva_contribute_modal_title')}
            </Text>

            {activeRequestForDonation && (
              <View style={[styles.donationTargetBox, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
                <Text style={{ fontSize: 9, fontWeight: 'bold', color: colors.textTertiary }}>
                  {language === 'hi' ? 'मरीज की सहायता के लिए दान:' : 'SUPPORTING PATIENT:'}
                </Text>
                <Text style={{ fontSize: 13, fontWeight: '800', color: colors.text, marginTop: 2 }}>
                  {activeRequestForDonation.patientName}
                </Text>
                <Text style={{ fontSize: 11, color: colors.textSecondary }}>
                  {activeRequestForDonation.reason}
                </Text>
              </View>
            )}

            <Text style={[styles.modalSubTitle, { color: colors.text, marginTop: Spacing.sm }]}>
              {getUiText('seva_contribute_amount_label')}
            </Text>

            {/* Presets Row */}
            <View style={styles.presetsRow}>
              {['100', '500', '1000', '2000'].map((preset) => {
                const isSelected = sevaContributeAmount === preset;
                return (
                  <TouchableOpacity
                    key={preset}
                    style={[
                      styles.presetBtn,
                      {
                        backgroundColor: isSelected ? colors.primary : colors.surfaceSecondary,
                        borderColor: isSelected ? colors.primary : colors.border,
                      }
                    ]}
                    onPress={() => setSevaContributeAmount(preset)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.presetBtnText, { color: isSelected ? '#FFF' : colors.text }]}>
                      ₹{preset}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Custom Input */}
            <TextInput
              style={[
                styles.customTaskInputStyle,
                { color: colors.text, borderColor: colors.border, backgroundColor: colors.surfaceSecondary }
              ]}
              keyboardType="number-pad"
              placeholder={language === 'hi' ? 'अन्य राशि दर्ज करें' : 'Enter other amount'}
              placeholderTextColor={colors.textTertiary}
              value={sevaContributeAmount}
              onChangeText={setSevaContributeAmount}
            />

            <TouchableOpacity
              style={[styles.modalSaveBtn, { backgroundColor: colors.primary, marginTop: Spacing.md }]}
              onPress={handleConfirmContribution}
            >
              <Text style={styles.modalSaveBtnText}>
                {getUiText('seva_contribute_submit')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalCancelBtn, { backgroundColor: colors.surfaceSecondary }]}
              onPress={() => {
                setIsSevaContributeModalVisible(false);
                setActiveRequestForDonation(null);
              }}
            >
              <Text style={[styles.modalCancelBtnText, { color: colors.text }]}>
                {getUiText('cancel')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Seva Request Funding Modal */}
      <Modal
        visible={isSevaRequestModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsSevaRequestModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setIsSevaRequestModalVisible(false)}
          />
          <View style={[styles.modalContent, { backgroundColor: colors.surface, maxHeight: '90%' }]}>
            <View style={[styles.modalIndicator, { backgroundColor: colors.border }]} />
            
            <ScrollView showsVerticalScrollIndicator={false} style={{ width: '100%' }}>
              <Text style={[styles.modalHeaderTitle, { color: colors.text }]}>
                {getUiText('seva_request_modal_title')}
              </Text>

              <View style={styles.reportFormContainer}>
                {/* Patient Name */}
                <Text style={[styles.modalSubTitle, { color: colors.text }]}>
                  {getUiText('seva_request_name_label')}
                </Text>
                <TextInput
                  style={[
                    styles.customTaskInputStyle,
                    { color: colors.text, borderColor: colors.border, backgroundColor: colors.surfaceSecondary }
                  ]}
                  placeholder={language === 'hi' ? 'मरीज का पूरा नाम' : "Patient's Full Name"}
                  placeholderTextColor={colors.textTertiary}
                  value={sevaReqPatientName}
                  onChangeText={setSevaReqPatientName}
                />

                {/* Hospital Name */}
                <Text style={[styles.modalSubTitle, { color: colors.text, marginTop: Spacing.sm }]}>
                  {getUiText('seva_request_hospital_label')}
                </Text>
                <TextInput
                  style={[
                    styles.customTaskInputStyle,
                    { color: colors.text, borderColor: colors.border, backgroundColor: colors.surfaceSecondary }
                  ]}
                  placeholder={language === 'hi' ? 'उदा. एम्स दिल्ली, साधना क्लिनिक' : 'e.g. AIIMS Delhi, City Hospital'}
                  placeholderTextColor={colors.textTertiary}
                  value={sevaReqHospital}
                  onChangeText={setSevaReqHospital}
                />

                {/* Required Amount */}
                <Text style={[styles.modalSubTitle, { color: colors.text, marginTop: Spacing.sm }]}>
                  {getUiText('seva_request_amount_label')}
                </Text>
                <TextInput
                  style={[
                    styles.customTaskInputStyle,
                    { color: colors.text, borderColor: colors.border, backgroundColor: colors.surfaceSecondary }
                  ]}
                  keyboardType="number-pad"
                  placeholder={language === 'hi' ? 'उदा. 350000' : 'e.g. 350000'}
                  placeholderTextColor={colors.textTertiary}
                  value={sevaReqAmount}
                  onChangeText={setSevaReqAmount}
                />

                {/* Medical Reason */}
                <Text style={[styles.modalSubTitle, { color: colors.text, marginTop: Spacing.sm }]}>
                  {getUiText('seva_request_reason_label')}
                </Text>
                <TextInput
                  style={[
                    styles.customTaskInputStyle,
                    { color: colors.text, borderColor: colors.border, backgroundColor: colors.surfaceSecondary }
                  ]}
                  placeholder={language === 'hi' ? 'उदा. कीमोथेरेपी उपचार, घुटने की सर्जरी' : 'e.g. Chemotherapy Cycle, Heart Surgery'}
                  placeholderTextColor={colors.textTertiary}
                  value={sevaReqReason}
                  onChangeText={setSevaReqReason}
                />

                {/* Mock Medical Document Upload */}
                <Text style={[styles.modalSubTitle, { color: colors.text, marginTop: Spacing.sm }]}>
                  {getUiText('seva_request_doc_label')}
                </Text>
                <TouchableOpacity 
                  style={[styles.mockFileSelectBox, { borderColor: colors.primary, backgroundColor: colors.surfaceSecondary }]}
                  onPress={() => {
                    const sampleDocs = ['medical_certificate_estimate.pdf', 'hospital_discharge_summary.pdf', 'pathology_diagnostics_receipt.jpg'];
                    const randomDoc = sampleDocs[Math.floor(Math.random() * sampleDocs.length)];
                    setSevaReqDocName(randomDoc);
                  }}
                  activeOpacity={0.7}
                >
                  <Ionicons name="document-attach" size={18} color={colors.primary} />
                  <Text style={{ fontSize: FontSize.xs, color: colors.textSecondary, flex: 1, marginLeft: 4 }}>
                    {sevaReqDocName ? `${getUiText('seva_request_doc_attached')} ${sevaReqDocName}` : (language === 'hi' ? 'अस्पताल अनुमान पत्र / मेडिकल सर्टिफिकेट अपलोड करें' : 'Attach Hospital Estimate Certificate')}
                  </Text>
                  <Text style={{ fontSize: 9, color: colors.primary, fontWeight: 'bold' }}>
                    {sevaReqDocName ? (language === 'hi' ? '[बदलें]' : '[Change]') : (language === 'hi' ? '[अपलोड]' : '[Upload]')}
                  </Text>
                </TouchableOpacity>

                {/* Submit button */}
                <TouchableOpacity
                  style={[styles.modalSaveBtn, { backgroundColor: colors.primary, marginTop: Spacing.md }]}
                  onPress={handleSaveEmergencyRequest}
                >
                  <Text style={styles.modalSaveBtnText}>
                    {getUiText('seva_request_submit')}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalCancelBtn, { backgroundColor: colors.surfaceSecondary }]}
                  onPress={() => setIsSevaRequestModalVisible(false)}
                >
                  <Text style={[styles.modalCancelBtnText, { color: colors.text }]}>
                    {getUiText('cancel')}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* 8. Care Alert Details Modal */}
      {selectedCareAlert && (
        <Modal
          visible={isCareAlertModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setIsCareAlertModalVisible(false)}
        >
          <View style={styles.modalOverlayCentered}>
            <View style={[styles.careAlertBox, { backgroundColor: colors.surface }]}>
              {/* Header with icon */}
              <View style={[
                styles.careAlertHeaderIconBg, 
                { 
                  backgroundColor: selectedCareAlert.type === 'medicine' 
                    ? colors.error + '15' 
                    : selectedCareAlert.type === 'appointment' 
                      ? colors.primary + '15' 
                      : '#F59E0B15' 
                }
              ]}>
                <Ionicons 
                  name={selectedCareAlert.type === 'medicine' ? 'medkit' : selectedCareAlert.type === 'appointment' ? 'videocam' : 'beaker'} 
                  size={32} 
                  color={selectedCareAlert.type === 'medicine' ? colors.error : selectedCareAlert.type === 'appointment' ? colors.primary : '#D97706'} 
                />
              </View>

              <Text style={[styles.careAlertModalTitle, { color: colors.text }]}>
                {selectedCareAlert.title}
              </Text>
              
              <Text style={[styles.careAlertModalDate, { color: colors.textTertiary }]}>
                {language === 'hi' ? 'निर्धारित तिथि:' : 'Scheduled Date:'} {selectedCareAlert.date}
              </Text>

              <Text style={[styles.careAlertModalDetails, { color: colors.textSecondary }]}>
                {selectedCareAlert.details}
              </Text>

              {/* Action Buttons */}
              <View style={styles.careAlertModalActions}>
                {selectedCareAlert.type === 'medicine' && (
                  <TouchableOpacity
                    style={[styles.careAlertModalSubmitBtn, { backgroundColor: colors.error }]}
                    onPress={() => handleConfirmMedRefill(selectedCareAlert.id)}
                  >
                    <Text style={styles.careAlertModalSubmitBtnText}>
                      {selectedCareAlert.ctaText}
                    </Text>
                  </TouchableOpacity>
                )}

                {selectedCareAlert.type === 'test' && (
                  <TouchableOpacity
                    style={[styles.careAlertModalSubmitBtn, { backgroundColor: '#D97706' }]}
                    onPress={() => handleBookHomeCollection(selectedCareAlert.id)}
                  >
                    <Text style={styles.careAlertModalSubmitBtnText}>
                      {selectedCareAlert.ctaText}
                    </Text>
                  </TouchableOpacity>
                )}

                {selectedCareAlert.type === 'appointment' && (
                  <TouchableOpacity
                    style={[styles.careAlertModalSubmitBtn, { backgroundColor: colors.primary }]}
                    onPress={() => handleStartVideoConsult(selectedCareAlert.id)}
                  >
                    <Text style={styles.careAlertModalSubmitBtnText}>
                      {selectedCareAlert.ctaText}
                    </Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={[styles.careAlertModalCancelBtn, { backgroundColor: colors.surfaceSecondary }]}
                  onPress={() => setIsCareAlertModalVisible(false)}
                >
                  <Text style={[styles.careAlertModalCancelBtnText, { color: colors.text }]}>
                    {language === 'hi' ? 'बाद में देखें' : 'Remind Me Later'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* 9. Video Call Simulator Modal */}
      {selectedCareAlert && activeVideoCall && (
        <Modal
          visible={activeVideoCall}
          transparent={false}
          animationType="slide"
          onRequestClose={() => handleEndVideoConsult(selectedCareAlert.id)}
        >
          <View style={[styles.callContainer, { backgroundColor: '#111827' }]}>
            {/* Calling Header Info */}
            <View style={styles.callHeader}>
              <Ionicons name="shield-checkmark" size={16} color="#10B981" />
              <Text style={styles.callSecurityText}>
                {language === 'hi' ? 'सुरक्षित टेलीपरामर्श चैनल' : 'Encrypted Video Consultation'}
              </Text>
            </View>

            {/* Doctor Info & Avatar */}
            <View style={styles.doctorVideoFrame}>
              <View style={styles.docAvatarCircle}>
                <Ionicons name="person" size={72} color="#FFF" />
              </View>
              <Text style={styles.docCallName}>Dr. Priya Sharma</Text>
              <Text style={styles.docCallSpec}>Oncologist / कैंसर विशेषज्ञ</Text>
              
              {/* Call Vitals Pulse simulator */}
              <View style={styles.docVitalsLogBox}>
                <Ionicons name="pulse" size={14} color="#EF4444" />
                <Text style={styles.docVitalsText}>Vitals Shared: Sugar 120, BP 115</Text>
              </View>
            </View>

            {/* Patient video feed (Mock corner preview) */}
            <View style={styles.patientVideoCorner}>
              <Ionicons name="person" size={24} color="#FFF" />
              <Text style={styles.patientPreviewText}>You</Text>
            </View>

            {/* Calling status / Timer */}
            <View style={styles.callStatusContainer}>
              <Text style={styles.callTimerVal}>
                {formatCallTime(videoCallTimer)}
              </Text>
              <Text style={styles.callStatusText}>
                {language === 'hi' ? 'लाइव परामर्श जारी...' : 'Consultation In Progress...'}
              </Text>
            </View>

            {/* Calling Control Buttons */}
            <View style={styles.callControlRow}>
              {/* Mute Button */}
              <TouchableOpacity style={styles.callMuteBtn}>
                <Ionicons name="mic-off" size={24} color="#FFF" />
              </TouchableOpacity>

              {/* End Call Button */}
              <TouchableOpacity 
                style={styles.callEndBtn}
                onPress={() => handleEndVideoConsult(selectedCareAlert.id)}
              >
                <Ionicons name="call" size={28} color="#FFF" style={{ transform: [{ rotate: '135deg' }] }} />
              </TouchableOpacity>

              {/* Video toggle button */}
              <TouchableOpacity style={styles.callMuteBtn}>
                <Ionicons name="videocam-off" size={24} color="#FFF" />
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    padding: Spacing.base,
    paddingBottom: 120,
  },
  goalsHorizontalList: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
  },
  goalsHorizontalListContent: {
    gap: Spacing.sm,
    paddingRight: Spacing.md,
  },
  goalTabItem: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: Radius.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalTabTitle: {
    fontSize: FontSize.xs,
    fontWeight: '700',
  },
  goalTabProgressText: {
    fontSize: 9,
    marginTop: 1,
  },
  selectedGoalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  selectedGoalLabelText: {
    fontSize: 9,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  selectedGoalTitleText: {
    fontSize: FontSize.sm,
    fontWeight: '800',
    marginTop: 2,
  },
  selectedGoalDescText: {
    fontSize: FontSize.xs,
    marginTop: 4,
    lineHeight: 16,
  },
  deleteGoalBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleStepStatusBtn: {
    marginTop: Spacing.base,
    paddingVertical: 10,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'stretch',
  },
  toggleStepStatusText: {
    fontSize: FontSize.xs + 1,
    fontWeight: '700',
  },
  goalCard: {
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    marginBottom: Spacing.lg,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    width: '100%',
  },
  goalTitleTag: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  goalMainText: {
    fontSize: FontSize.lg,
    fontWeight: '800',
    lineHeight: 22,
    flexShrink: 1,
  },
  editGoalBtn: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: Radius.sm,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  editGoalText: {
    fontSize: 10,
    fontWeight: '700',
  },
  progressSection: {
    marginTop: Spacing.md,
    gap: 4,
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    width: '100%',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 10,
    fontWeight: '700',
  },
  hopeBox: {
    marginTop: Spacing.md,
    padding: Spacing.md,
    borderRadius: Radius.md,
    flexDirection: 'row',
    gap: Spacing.sm,
    alignItems: 'center',
  },
  hopeText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    flex: 1,
    lineHeight: 15,
  },
  welcomeCard: {
    padding: Spacing.base,
    borderRadius: Radius.md,
    marginBottom: Spacing.lg,
  },
  welcomeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  welcomeText: {
    flex: 1,
    marginRight: Spacing.md,
  },
  greeting: {
    fontSize: FontSize.base,
    fontWeight: '800',
    marginBottom: 2,
  },
  subGreeting: {
    fontSize: FontSize.xs,
    lineHeight: 15,
  },
  sectionTitle: {
    fontSize: FontSize.md,
    fontWeight: '800',
    marginTop: Spacing.base,
    marginBottom: Spacing.sm,
  },
  
  // Journey Styles
  journeyCard: {
    padding: Spacing.base,
    marginBottom: Spacing.lg,
  },
  journeySub: {
    fontSize: FontSize.xs,
    marginBottom: Spacing.md,
  },
  timelineContainer: {
    position: 'relative',
    marginVertical: Spacing.sm,
    paddingLeft: 10,
  },
  timelineVerticalLine: {
    position: 'absolute',
    left: 20,
    top: 15,
    bottom: 15,
    width: 2,
  },
  timelineItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  timelineNode: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  pulseCircle: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  timelineNodeContent: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  timelineNodeTitle: {
    fontSize: FontSize.xs + 1,
    fontWeight: '700',
  },
  timelineNodeDesc: {
    fontSize: 10,
    marginTop: 2,
  },
  selectedStageBox: {
    marginTop: Spacing.md,
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  stageBoxHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  stageBoxTitle: {
    fontSize: FontSize.xs + 1,
    fontWeight: '800',
  },
  activeTag: {
    fontSize: 8,
    fontWeight: '800',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 'auto',
  },
  stageBoxDesc: {
    fontSize: FontSize.xs,
    lineHeight: 15,
    marginBottom: 8,
  },
  milestoneHeading: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginTop: Spacing.sm,
    marginBottom: 4,
  },
  milestoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginVertical: 2,
  },
  milestoneText: {
    fontSize: FontSize.xs - 1,
  },

  // Treatment & Diagnostics History Styles
  historyCard: {
    padding: Spacing.base,
    marginBottom: Spacing.lg,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.base,
    gap: Spacing.sm,
  },
  historySubText: {
    fontSize: FontSize.xs,
    flex: 1,
    lineHeight: 15,
  },
  uploadReportHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: Radius.md,
  },
  uploadReportBtnText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
  },
  historyListTimeline: {
    position: 'relative',
    paddingLeft: 6,
  },
  historyVerticalLine: {
    position: 'absolute',
    left: 12,
    top: 10,
    bottom: 10,
    width: 1.5,
  },
  historyItemRow: {
    flexDirection: 'row',
    marginVertical: Spacing.xs,
    alignItems: 'flex-start',
  },
  historyItemNode: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    marginTop: 10,
  },
  historyItemContainer: {
    flex: 1,
    marginLeft: Spacing.sm,
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.sm,
    backgroundColor: '#FAF7F2',
  },
  historyItemTitleBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyItemTitle: {
    fontSize: FontSize.xs + 1,
    fontWeight: '700',
  },
  historyItemExpandedContent: {
    marginTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: '#F1ECE4',
    paddingTop: Spacing.sm,
  },
  historyItemDetailsText: {
    fontSize: FontSize.xs,
    lineHeight: 16,
  },
  historyAttachmentPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    marginTop: 8,
    alignSelf: 'flex-start',
    maxWidth: '90%',
  },
  attachmentTextText: {
    fontSize: 9,
    fontWeight: '600',
  },

  // Prescription Card Styles
  prescCard: {
    padding: Spacing.base,
    marginBottom: Spacing.lg,
  },
  prescRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
  },
  prescIconContainer: {
    width: 48,
    height: 48,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  prescInfo: {
    flex: 1,
    gap: 4,
  },
  prescTitle: {
    fontSize: FontSize.sm + 1,
    fontWeight: '800',
  },
  prescSub: {
    fontSize: FontSize.xs,
    lineHeight: 15,
  },
  prescBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: Radius.md,
    marginTop: 6,
    alignSelf: 'flex-start',
  },
  prescBtnText: {
    color: '#FFF',
    fontSize: FontSize.xs,
    fontWeight: '700',
  },

  // Vitals Card Styles
  vitalsCard: {
    padding: Spacing.base,
    marginBottom: Spacing.lg,
  },
  vitalsStatusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: Radius.sm,
    marginBottom: Spacing.base,
    gap: 8,
  },
  vitalsStatusText: {
    fontSize: FontSize.sm,
    fontWeight: '700',
  },
  stepperRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1ECE4',
  },
  stepperLabel: {
    fontSize: FontSize.sm,
    fontWeight: '700',
  },
  stepperControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stepBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBtnText: {
    fontSize: FontSize.md,
    fontWeight: '700',
  },
  stepValue: {
    fontSize: FontSize.base,
    fontWeight: '800',
    minWidth: 50,
    textAlign: 'center',
  },
  vitalsActionRow: {
    flexDirection: 'row',
    marginTop: Spacing.base,
    gap: Spacing.md,
  },
  vitalsSaveBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: Radius.md,
    gap: 6,
  },
  vitalsSaveBtnText: {
    color: '#FFF',
    fontSize: FontSize.sm,
    fontWeight: '700',
  },
  vitalsSosBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: Radius.md,
    gap: 6,
  },
  vitalsSosBtnText: {
    color: '#FFF',
    fontSize: FontSize.sm,
    fontWeight: '700',
  },
  manageSosLink: {
    alignItems: 'center',
    marginTop: Spacing.md,
    paddingVertical: 4,
  },
  manageSosLinkText: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },

  // Daily Win / Checklist Card Styles
  sectionCard: {
    padding: Spacing.base,
    marginBottom: Spacing.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: FontSize.base,
    fontWeight: '700',
  },
  cardProgressText: {
    fontSize: FontSize.xs,
    fontWeight: '700',
  },
  cardSub: {
    fontSize: FontSize.xs,
    marginTop: 4,
    marginBottom: Spacing.md,
  },
  checklist: {
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  checklistItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  checklistItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  checklistText: {
    fontSize: FontSize.sm,
    fontWeight: '500',
    flex: 1,
  },
  deleteTaskBtn: {
    padding: 6,
    marginLeft: 6,
  },
  checklistActions: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginTop: 4,
  },
  customTaskTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderRadius: Radius.sm,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderStyle: 'dashed',
  },
  customTaskTriggerText: {
    fontSize: 10,
    fontWeight: '700',
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: Radius.md,
    gap: 8,
  },
  shareBtnText: {
    color: '#FFF',
    fontSize: FontSize.sm,
    fontWeight: '700',
  },
  gamifyRow: {
    marginBottom: Spacing.lg,
  },
  streakCard: {
    padding: Spacing.md,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FB923C30',
    backgroundColor: '#FB923C08',
  },
  streakIcon: {
    fontSize: 28,
    marginBottom: 4,
  },
  streakNumber: {
    fontSize: FontSize.base,
    fontWeight: '800',
  },
  streakSub: {
    fontSize: FontSize.xs,
    textAlign: 'center',
    marginTop: 2,
  },
  medalsCard: {
    padding: Spacing.base,
    marginBottom: Spacing.lg,
  },
  medalsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  medalBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    gap: 4,
  },
  medalEmoji: {
    fontSize: 24,
  },
  medalLabel: {
    fontSize: 9,
    fontWeight: '700',
  },
  apptCard: {
    padding: Spacing.base,
    marginBottom: Spacing.lg,
  },
  notesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    gap: 8,
  },
  notesAuthor: {
    fontSize: FontSize.xs,
    fontWeight: '700',
  },
  notesBody: {
    fontSize: FontSize.sm,
    fontStyle: 'italic',
    lineHeight: 18,
  },
  adviceExtractedContainer: {
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
  },
  adviceTitle: {
    fontSize: FontSize.xs,
    fontWeight: '800',
    marginBottom: Spacing.sm,
  },
  adviceRowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginVertical: 3,
  },
  adviceTextItem: {
    fontSize: FontSize.xs,
    lineHeight: 15,
  },

  // Modal Common Styles
  modalOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 2000,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xl,
    maxHeight: '80%',
  },
  modalIndicator: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: Spacing.md,
  },
  modalHeaderTitle: {
    fontSize: FontSize.md,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  modalSubTitle: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.md,
    fontSize: FontSize.sm,
    height: 80,
    textAlignVertical: 'top',
  },
  progressStepper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  modalProgressTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  modalProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  presetChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  presetChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  presetChipText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
  modalSaveBtn: {
    paddingVertical: 12,
    borderRadius: Radius.md,
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  modalSaveBtnText: {
    color: '#FFF',
    fontSize: FontSize.sm,
    fontWeight: '700',
  },
  modalCancelBtn: {
    paddingVertical: 12,
    borderRadius: Radius.md,
    alignItems: 'center',
  },
  modalCancelBtnText: {
    fontSize: FontSize.sm,
    fontWeight: '700',
  },

  // Prescription Simulation Modal Styles
  mockUploadBox: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#CCC',
    borderRadius: Radius.md,
    padding: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  mockUploadTitle: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    marginTop: 6,
  },
  samplePrescItem: {
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginVertical: Spacing.xs,
    position: 'relative',
  },
  sampleBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  sampleTitle: {
    fontSize: FontSize.sm,
    fontWeight: '800',
  },
  scanningContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.base,
  },
  mockDocContainer: {
    width: '100%',
    height: 180,
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.md,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: Spacing.base,
  },
  laserScannerLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 3,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 5,
    elevation: 4,
    zIndex: 20,
  },
  scanningTitle: {
    fontSize: FontSize.sm,
    fontWeight: '800',
  },
  scanningSub: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    marginTop: 4,
  },
  resultBox: {
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  resultTitle: {
    fontSize: FontSize.md,
    fontWeight: '800',
    marginTop: Spacing.xs,
  },
  extractedCard: {
    borderWidth: 1,
    borderColor: '#F1ECE4',
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.base,
  },
  extractedSectionHeading: {
    fontSize: FontSize.xs + 1,
    fontWeight: '800',
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
  },
  extractedMedsList: {
    gap: 4,
  },
  extractedItemText: {
    fontSize: FontSize.xs + 1,
    lineHeight: 16,
  },

  // Safety Verification Styles
  safetyCheckCard: {
    borderWidth: 1.5,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.base,
  },
  safetyCheckTitle: {
    fontSize: FontSize.xs + 1,
    fontWeight: '800',
  },
  safetyActionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  safetySubBtn: {
    borderWidth: 1,
    borderRadius: Radius.sm,
    paddingVertical: 6,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  safetySubBtnText: {
    fontSize: 10,
    fontWeight: '700',
  },

  // Custom Task Input Modal Style
  customTaskInputStyle: {
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.md,
    fontSize: FontSize.sm,
    height: 50,
  },

  // SOS Directory Modal Styles
  emptySosText: {
    fontSize: FontSize.xs,
    textAlign: 'center',
    marginVertical: Spacing.lg,
  },
  contactListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  contactDetails: {
    flex: 1,
  },
  contactNameText: {
    fontSize: FontSize.sm,
    fontWeight: '700',
  },
  contactDeleteBtn: {
    padding: 8,
  },
  addContactForm: {
    marginTop: Spacing.lg,
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    gap: Spacing.sm,
  },
  formHeading: {
    fontSize: FontSize.xs + 1,
    fontWeight: '800',
    marginBottom: 2,
  },
  formInput: {
    borderWidth: 1,
    borderRadius: Radius.sm,
    paddingVertical: 6,
    paddingHorizontal: 10,
    fontSize: FontSize.xs + 1,
  },
  formSubmitBtn: {
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: Radius.sm,
    marginTop: 4,
  },
  formSubmitBtnText: {
    color: '#FFF',
    fontSize: FontSize.xs + 1,
    fontWeight: '700',
  },

  // SOS Countdown Modal Styles
  modalOverlayCentered: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 3000,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  sosAlertBox: {
    width: '85%',
    borderRadius: Radius.lg,
    padding: Spacing.base,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  sosCountdownContainer: {
    alignItems: 'center',
    width: '100%',
  },
  sosAlertHeaderPulse: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  sosCountdownTitle: {
    fontSize: FontSize.md,
    fontWeight: '800',
  },
  countdownCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: Spacing.md,
  },
  countdownNumber: {
    fontSize: 36,
    fontWeight: '900',
  },
  cancelSosAlertBtn: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: Radius.md,
    alignItems: 'center',
    width: '100%',
  },
  cancelSosAlertBtnText: {
    fontSize: FontSize.sm,
    fontWeight: '800',
  },
  sosFiredContainer: {
    alignItems: 'center',
    width: '100%',
    paddingVertical: Spacing.sm,
  },
  sosFiredTitle: {
    fontSize: FontSize.md + 1,
    fontWeight: '900',
    color: '#EF4444',
    marginTop: Spacing.sm,
  },
  sosFiredDesc: {
    fontSize: FontSize.xs,
    textAlign: 'center',
    lineHeight: 16,
    marginTop: 4,
    marginBottom: Spacing.md,
  },
  sosNotifiedList: {
    width: '100%',
    padding: Spacing.md,
    borderRadius: Radius.md,
    gap: 2,
  },

  // Lab Report Form / Mock File Select
  reportFormContainer: {
    gap: 4,
  },
  mockFileSelectBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: Radius.sm,
    padding: 10,
    marginTop: 2,
    marginBottom: Spacing.sm,
  },
  mockFileSelectBoxText: {
    fontSize: FontSize.xs,
  },

  // Seva Ecosystem Styles
  sevaCard: {
    padding: Spacing.base,
    marginBottom: Spacing.lg,
  },
  sevaPoolContainer: {
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  sevaPoolHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  sevaPoolTitle: {
    fontSize: FontSize.sm,
    fontWeight: '800',
  },
  sevaPoolDesc: {
    fontSize: 10,
    marginTop: 2,
    lineHeight: 14,
  },
  poolIconBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sevaStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: Spacing.sm,
  },
  sevaStatItem: {
    flex: 1,
  },
  sevaStatLabel: {
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  sevaStatValue: {
    fontSize: FontSize.md,
    fontWeight: '800',
    marginTop: 2,
  },
  sevaPoolProgressContainer: {
    marginVertical: Spacing.xs,
  },
  sevaPoolContributeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: Radius.md,
    marginTop: Spacing.md,
  },
  sevaPoolContributeBtnText: {
    color: '#FFF',
    fontSize: FontSize.xs + 1,
    fontWeight: '700',
  },
  sevaSectionHeader: {
    fontSize: FontSize.xs + 2,
    fontWeight: '800',
  },
  sevaRequestSupportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: Radius.md,
  },
  sevaRequestSupportBtnText: {
    fontSize: 9,
    fontWeight: '700',
  },
  emergencyReqCard: {
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  emergencyReqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.xs,
    gap: Spacing.sm,
  },
  emergencyPatientName: {
    fontSize: FontSize.xs + 1,
    fontWeight: '800',
  },
  emergencyHospital: {
    fontSize: 9,
    marginTop: 1,
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.sm,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBadgeText: {
    fontSize: 8,
    fontWeight: '800',
  },
  emergencyReasonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: 6,
    borderRadius: Radius.sm,
    marginVertical: Spacing.xs,
  },
  emergencyReasonText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    flex: 1,
  },
  emergencyProgressSection: {
    marginVertical: Spacing.sm,
  },
  emergencyDocPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: Radius.sm,
    marginBottom: Spacing.sm,
    alignSelf: 'flex-start',
  },
  emergencyContributeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
    borderRadius: Radius.sm,
  },
  emergencyContributeBtnText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
  },
  ngoPartnersContainer: {
    borderTopWidth: 1,
    marginTop: Spacing.md,
    paddingTop: Spacing.sm,
  },
  ngoPartnersTitle: {
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  ngoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  ngoPill: {
    borderWidth: 1,
    borderRadius: Radius.sm,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  ngoPillText: {
    fontSize: 8.5,
    fontWeight: '700',
  },
  donationTargetBox: {
    width: '100%',
    padding: Spacing.sm,
    borderRadius: Radius.sm,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  presetsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: Spacing.sm,
    gap: Spacing.xs,
  },
  presetBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: Radius.sm,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  presetBtnText: {
    fontSize: FontSize.xs,
    fontWeight: '700',
  },
  alertsSectionContainer: {
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
    paddingHorizontal: 4,
  },
  alertsSectionTitle: {
    fontSize: FontSize.xs + 2,
    fontWeight: '800',
    marginBottom: Spacing.xs,
  },
  alertsHorizontalList: {
    gap: Spacing.sm,
    paddingVertical: 4,
  },
  alertSectionCard: {
    width: 250,
    padding: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: 1.5,
  },
  alertCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: 4,
  },
  alertCardTitleText: {
    fontSize: FontSize.xs,
    fontWeight: '800',
    flex: 1,
  },
  alertCardDescText: {
    fontSize: 9,
    lineHeight: 12,
    marginBottom: Spacing.xs,
  },
  alertCardCtaText: {
    fontSize: 9,
    fontWeight: '800',
  },
  careAlertBox: {
    width: '85%',
    borderRadius: Radius.lg,
    padding: Spacing.base,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  careAlertHeaderIconBg: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  careAlertModalTitle: {
    fontSize: FontSize.base,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 4,
  },
  careAlertModalDate: {
    fontSize: 10,
    fontWeight: '700',
    marginBottom: Spacing.md,
  },
  careAlertModalDetails: {
    fontSize: FontSize.xs,
    textAlign: 'center',
    lineHeight: 16,
    marginBottom: Spacing.lg,
  },
  careAlertModalActions: {
    width: '100%',
    gap: Spacing.xs,
  },
  careAlertModalSubmitBtn: {
    paddingVertical: 12,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  careAlertModalSubmitBtnText: {
    color: '#FFF',
    fontSize: FontSize.xs + 1,
    fontWeight: '700',
  },
  careAlertModalCancelBtn: {
    paddingVertical: 12,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  careAlertModalCancelBtnText: {
    fontSize: FontSize.xs + 1,
    fontWeight: '700',
  },
  callContainer: {
    flex: 1,
    padding: Spacing.lg,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  callHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 40,
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: Radius.full,
  },
  callSecurityText: {
    color: '#10B981',
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  doctorVideoFrame: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  docAvatarCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#374151',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
    borderWidth: 2,
    borderColor: '#4B5563',
  },
  docCallName: {
    color: '#FFF',
    fontSize: FontSize.lg,
    fontWeight: '900',
  },
  docCallSpec: {
    color: '#9CA3AF',
    fontSize: FontSize.xs,
    marginTop: 4,
  },
  docVitalsLogBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: Radius.sm,
    marginTop: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  docVitalsText: {
    color: '#FCA5A5',
    fontSize: 10,
    fontWeight: '700',
  },
  patientVideoCorner: {
    position: 'absolute',
    right: Spacing.lg,
    top: 100,
    width: 80,
    height: 110,
    borderRadius: Radius.md,
    backgroundColor: '#1F2937',
    borderWidth: 1.5,
    borderColor: '#4B5563',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  patientPreviewText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: 'bold',
  },
  callStatusContainer: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  callTimerVal: {
    color: '#FFF',
    fontSize: FontSize.xl,
    fontWeight: '900',
  },
  callStatusText: {
    color: '#9CA3AF',
    fontSize: 11,
    marginTop: 4,
  },
  callControlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
    marginBottom: 40,
  },
  callMuteBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  callEndBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  vitalsDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
    flexWrap: 'wrap',
  },
  vitalsDateLabel: {
    fontSize: FontSize.xs + 1,
    fontWeight: '700',
  },
  vitalsDatePresets: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  vitalsDatePresetBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: '#CCC',
  },
  vitalsDatePresetText: {
    fontSize: 10,
    fontWeight: '700',
  },
  vitalsDateInput: {
    borderWidth: 1,
    borderRadius: Radius.sm,
    paddingVertical: 3,
    paddingHorizontal: 6,
    fontSize: FontSize.xs,
    width: 100,
    textAlign: 'center',
  },
});

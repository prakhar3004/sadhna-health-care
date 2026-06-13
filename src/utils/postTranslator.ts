// Sadhna Health Care — Post Content Translator
import { Language } from './translations';

// Pre-compiled translation database for mock posts to guarantee 100% realistic translation
const MOCK_POST_TRANSLATIONS: Record<string, Record<Language, string>> = {
  p1: {
    en: '🫀 Heart Health Alert: Studies show that just 30 minutes of brisk walking daily can reduce your risk of heart disease by 35%! Start small — even a 10-minute walk after meals makes a difference.\n\n#HeartHealth #PreventiveCare #WalkMore',
    hi: '🫀 हार्ट हेल्थ अलर्ट: अध्ययनों से पता चलता है कि रोजाना केवल 30 मिनट तेज चलने से हृदय रोग का खतरा 35% तक कम हो सकता है! छोटी शुरुआत करें - भोजन के बाद 10 मिनट की वॉक भी बदलाव लाती है।\n\n#HeartHealth #PreventiveCare #WalkMore',
    hinglish: '🫀 Heart Health Alert: Studies se pata chala hai ki daily sirf 30 minutes tez chalne se heart disease ka risk 35% tak kam ho sakta hai! Chhoti shuruat karein - khana khane ke baad 10-minute ki walk bhi faydemand hai.\n\n#HeartHealth #PreventiveCare #WalkMore',
    bn: '🫀 হার্ট হেলথ অ্যালার্ট: গবেষণায় দেখা গেছে যে প্রতিদিন মাত্র ৩০ মিনিট দ্রুত হাঁটা আপনার হৃদরোগের ঝুঁকি ৩৫% কমাতে পারে! ছোট করে শুরু করুন — খাবারের পর মাত্র ১০ মিনিট হাঁটাও পরিবর্তন আনতে পারে।\n\n#HeartHealth #PreventiveCare #WalkMore',
    te: '🫀 హార్ట్ హెల్త్ అలర్ట్: రోజుకు కేవలం 30 నిమిషాలు వేగంగా నడవడం వల్ల గుండె జబ్బుల ప్రమాదాన్ని 35% తగ్గించవచ్చని అధ్యయనాలు చెబుతున్నాయి! చిన్నగా ప్రారంభించండి — భోజనం తర్వాత 10 నిమిషాలు నడవడం కూడా మార్పు తెస్తుంది.\n\n#HeartHealth #PreventiveCare #WalkMore',
    mr: '🫀 हार्ट हेल्थ अलर्ट: संशोधनातून असे दिसून आले आहे की दररोज फक्त ३० मिनिटे वेगाने चालल्याने हृदयविकाराचा धोका ३५% कमी होऊ शकतो! लहान सुरुवात करा - जेवणानंतर १० मिनिटे चालणे देखील फरक पाडते.\n\n#HeartHealth #PreventiveCare #WalkMore',
    ta: '🫀 இதய ஆரோக்கிய எச்சரிக்கை: தினமும் 30 நிமிடங்கள் வேகமாக நடப்பது இதய நோய் அபாயத்தை 35% குறைக்கும் என்று ஆய்வுகள் காட்டுகின்றன! சிறியதாக தொடங்குங்கள் — உணவுக்குப் பின் 10 நிமிட நடைப்பயிற்சியும் மாற்றத்தை ஏற்படுத்தும்.\n\n#HeartHealth #PreventiveCare #WalkMore',
    gu: '🫀 હાર્ટ હેલ્થ એલર્ટ: અભ્યાસો દર્શાવે છે કે રોજ માત્ર ૩૦ મિનિટ ઝડપી ચાલવાથી હૃદય રોગનું જોખમ ૩૫% ઘટાડી શકાય છે! નાની શરૂઆત કરો — જમ્યા પછી માત્ર ૧૦ મિનિટ ચાલવું પણ મોટો તફાવત લાવી શકે છે.\n\n#HeartHealth #PreventiveCare #WalkMore',
    kn: '🫀 ಹಾರ್ಟ್ ಹೆಲ್ತ್ ಅಲರ್ಟ್: ದಿನಕ್ಕೆ ಕೇವಲ 30 ನಿಮಿಷಗಳ ಕಾಲ ವೇಗವಾಗಿ ನಡೆಯುವುದರಿಂದ ಹೃದಯ ಕಾಯಿಲೆಯ ಅಪಾಯವನ್ನು 35% ರಷ್ಟು ಕಡಿಮೆ ಮಾಡಬಹುದು ಎಂದು ಅಧ್ಯಯನಗಳು ತೋರಿಸುತ್ತವೆ! ಸಣ್ಣದಾಗಿ ಪ್ರಾರಂಭಿಸಿ — ಊಟದ ನಂತರ 10 ನಿಮಿಷಗಳ ನಡಿಗೆಯೂ ಬದಲಾವಣೆಯನ್ನು ತರುತ್ತದೆ.\n\n#HeartHealth #PreventiveCare #WalkMore',
    ml: '🫀 ഹാർട്ട് ഹെൽത്ത് അലേർട്ട്: ദിവസവും 30 മിനിറ്റ് വേഗത്തിൽ നടക്കുന്നത് ഹൃദ്രോഗ സാധ്യത 35% കുറയ്ക്കുമെന്ന് പഠനങ്ങൾ വ്യക്തമാക്കുന്നു! ചെറുതായി തുടങ്ങുക - ഭക്ഷണത്തിന് ശേഷം 10 മിനിറ്റ് നടക്കുന്നത് പോലും വലിയ മാറ്റമുണ്ടാക്കും.\n\n#HeartHealth #PreventiveCare #WalkMore',
    pa: '🫀 ਹਾਰਟ ਹੈਲਥ ਅਲਰਟ: ਖੋਜ ਤੋਂ ਪਤਾ ਲੱਗਦਾ ਹੈ ਕਿ ਰੋਜ਼ਾਨਾ ਸਿਰਫ਼ 30 ਮਿੰਟ ਤੇਜ਼ ਚੱਲਣ ਨਾਲ ਦਿਲ ਦੀ ਬਿਮਾਰੀ ਦਾ ਖ਼ਤਰਾ 35% ਤੱਕ ਘੱਟ ਹੋ ਸਕਦਾ ਹੈ! ਛੋਟੀ ਸ਼ੁਰੂਆਤ ਕਰੋ - ਖਾਣੇ ਤੋਂ ਬਾਅਦ 10 ਮਿੰਟ ਦੀ ਸੈਰ ਵੀ ਵੱਡਾ ਬਦਲਾਅ ਲਿਆਉਂਦੀ ਹੈ।\n\n#HeartHealth #PreventiveCare #WalkMore',
    or: '🫀 ହୃଦୟ ସ୍ୱାସ୍ଥ୍ୟ ସତର୍କତା: ଅଧ୍ୟୟନରୁ ଜଣାପଡିଛି ଯେ ପ୍ରତିଦିନ ମାତ୍ର ୩୦ ମିନିଟ୍ ଦ୍ରୁତ ଗତିରେ ଚାଲିବା ଦ୍ୱାରା ହୃଦରୋଗର ଆଶଙ୍କା ୩୫% ହ୍ରାସ ପାଇପାରେ! ଛୋଟରୁ ଆରମ୍ଭ କରନ୍ତୁ — ଖାଇବା ପରେ ମାତ୍ର ୧୦ ମିନିଟ୍ ଚାଲିବା ମଧ୍ୟ ପରିବର୍ତ୍ତନ ଆଣିଥାଏ।\n\n#HeartHealth #PreventiveCare #WalkMore',
  },
  p2: {
    en: '👶 Vaccination Reminder for Parents!\n\nMonsoon season is here. Please ensure your children are up-to-date with:\n• Typhoid vaccine\n• Hepatitis A\n• Flu shot\n\nPrevention is always better than cure. Book a pediatric consultation today!\n\n#ChildHealth #Vaccination #MonsoonCare',
    hi: '👶 माता-पिता के लिए टीकाकरण अनुस्मारक!\n\nमानसून का मौसम आ गया है। कृपया सुनिश्चित करें कि आपके बच्चों को ये टीके लग चुके हों:\n• टाइफाइड वैक्सीन\n• हेपेटाइटिस ए\n• फ्लू शॉट\n\nबचाव हमेशा इलाज से बेहतर होता है। आज ही बाल रोग विशेषज्ञ से सलाह लें!\n\n#ChildHealth #Vaccination #MonsoonCare',
    hinglish: '👶 Parents ke liye Vaccination Reminder!\n\nMonsoon ka season aa gaya hai. Apne bacchon ke ye vaccine time par lagwayein:\n• Typhoid vaccine\n• Hepatitis A\n• Flu shot\n\nPrevention is always better than cure. Aaj hi pediatric consultation book karein!\n\n#ChildHealth #Vaccination #MonsoonCare',
    bn: '👶 অভিভাবকদের জন্য টিকাদানের অনুস্মারক!\n\nবর্ষাকাল এসে গেছে। অনুগ্রহ করে নিশ্চিত করুন যে আপনার বাচ্চাদের এই টিকাগুলি দেওয়া হয়েছে:\n• টাইফয়েড ভ্যাকসিন\n• হেপাটাইটিস এ\n• ফ্লু শট\n\nপ্রতিরোধ সর্বদা নিরাময়ের চেয়ে ভালো। আজই শিশু বিশেষজ্ঞের পরামর্শ বুক করুন!\n\n#ChildHealth #Vaccination #MonsoonCare',
    te: '👶 తల్లిదండ్రులకు టీకాల రిమైండర్!\n\nవర్షాకాలం వచ్చేసింది. మీ పిల్లలకు ఈ కింది టీకాలు వేయించారని నిర్ధారించుకోండి:\n• టైఫాయిడ్ వ్యాక్సిన్\n• హెపటైటిస్ ఎ\n• ఫ్లూ షాట్\n\nనివారణ ఎల్లప్పుడూ నివారణ కంటే మంచిది. ఈరోజే పీడియాట్రిక్ కన్సల్టేషన్ బుక్ చేయండి!\n\n#ChildHealth #Vaccination #MonsoonCare',
    mr: '👶 पालकांसाठी लसीकरण स्मरणपत्र!\n\nपावसाळा सुरू झाला आहे. कृपया आपल्या मुलांचे लसीकरण वेळेवर झाले असल्याची खात्री करा:\n• टायफॉइड लस\n• हिपॅटायटीस ए\n• फ्लू शॉट\n\nप्रतिबंध हा नेहमीच उपचारापेक्षा चांगला असतो. आजच बालरोगतज्ज्ञांचा सल्ला घ्या!\n\n#ChildHealth #Vaccination #MonsoonCare',
    ta: '👶 பெற்றோர்களுக்கான தடுப்பூசி நினைவூட்டல்!\n\nமழைக்காலம் தொடங்கிவிட்டது. உங்கள் குழந்தைகளுக்கு இந்த தடுப்பூசிகள் போடப்பட்டுள்ளதா என்பதை உறுதிப்படுத்தவும்:\n• டைபாய்டு தடுப்பூசி\n• ஹெபடைடிஸ் ஏ\n• காய்ச்சல் ஊசி\n\nவருமுன் காப்பதே சிறந்தது. இன்று குழந்தை நல மருத்துவரை அணுகவும்!\n\n#ChildHealth #Vaccination #MonsoonCare',
    gu: '👶 વાલીઓ માટે રસીકરણ રીમાઇન્ડર!\n\nચોમાસાની ઋતુ આવી ગઈ છે. કૃપા કરીને ખાતરી કરો કે તમારા બાળકોને આ રસીઓ મળી ગઈ છે:\n• ટાઇફોઇડ રસી\n• હેપેટાઇટિસ એ\n• ફ્લૂ શોટ\n\nબચાવ હંમેશા ઇલાજ કરતા બહેતર છે. આજે જ પીડિયાટ્રિક પરામર્શ બુક કરો!\n\n#ChildHealth #Vaccination #MonsoonCare',
    kn: '👶 ಪೋಷಕರಿಗೆ ಲಸಿಕೆ ಜ್ಞಾಪನೆ!\n\nಮಳೆಗಾಲ ಬಂದಿದೆ. ನಿಮ್ಮ ಮಕ್ಕಳಿಗೆ ಈ ಕೆಳಗಿನ ಲಸಿಕೆಗಳನ್ನು ನೀಡಲಾಗಿದೆಯೇ ಎಂದು ಖಚಿತಪಡಿಸಿಕೊಳ್ಳಿ:\n• ಟೈಫಾಯಿಡ್ ಲಸಿಕೆ\n• ಹೆಪಟೈಟಿಸ್ ಎ\n• ಫ್ಲೂ ಶಾಟ್\n\nಚಿಕಿತ್ಸೆಗಿಂತ ತಡೆಗಟ್ಟುವಿಕೆ ಯಾವಾಗಲೂ ಉತ್ತಮ. ಇಂದೇ ಮಕ್ಕಳ ವೈದ್ಯರನ್ನು ಸಂಪರ್ಕಿಸಿ!\n\n#ChildHealth #Vaccination #MonsoonCare',
    ml: '👶 രക്ഷിതാക്കൾക്കായി വാക്സിനേഷൻ ഓർമ്മപ്പെടുത്തൽ!\n\nവർഷകാലം എത്തിക്കഴിഞ്ഞു. നിങ്ങളുടെ കുട്ടികൾക്ക് താഴെ പറയുന്ന വാക്സിനുകൾ നൽകിയിട്ടുണ്ടെന്ന് ഉറപ്പാക്കുക:\n• ടൈഫോയ്ഡ് വാക്സിൻ\n• ഹെപ്പറ്റൈറ്റിസ് എ\n• ഫ്ലൂ ഷോട്ട്\n\nരോഗം വരുന്നതിനേക്കാൾ നല്ലത് വരാതെ നോക്കുന്നതാണ്. ഇന്ന് തന്നെ പീഡിയാട്രിക് കൺസൾട്ടേഷൻ ബുക്ക് ചെയ്യുക!\n\n#ChildHealth #Vaccination #MonsoonCare',
    pa: '👶 ਮਾਪਿਆਂ ਲਈ ਟੀਕਾਕਰਨ ਰੀਮਾਈਂਡਰ!\n\nਮਾਨਸੂਨ ਦਾ ਮੌਸਮ ਆ ਗਿਆ ਹੈ। ਕਿਰਪਾ ਕਰਕੇ ਯਕੀਨੀ ਬਣਾਓ ਕਿ ਤੁਹਾਡੇ ਬੱਚਿਆਂ ਨੂੰ ਇਹ ਟੀਕੇ ਲੱਗ ਚੁੱਕੇ ਹਨ:\n• ਟਾਈਫਾਈਡ ਵੈਕਸੀਨ\n• ਹੈਪੇਟਾਈਟਿਸ ਏ\n• ਫਲੂ ਸ਼ਾਟ\n\nਬਚਾਅ ਹਮੇਸ਼ਾ ਇਲਾਜ ਨਾਲੋਂ ਬਿਹਤਰ ਹੈ। ਅੱਜ ਹੀ ਬਾਲ ਰੋਗ ਮਾਹਿਰ ਦੀ ਸਲਾਹ ਬੁੱਕ ਕਰੋ!\n\n#ChildHealth #Vaccination #MonsoonCare',
    or: '👶 ପିତାମାତାଙ୍କ ପାଇଁ ଟୀକାକରଣ ସ୍ମାରକୀ!\n\nମୌସୁମୀ ଋତୁ ଆସିଯାଇଛି। ଦୟାକରି ନିଶ୍ଚିତ କରନ୍ତୁ ଯେ ଆପଣଙ୍କ ପିଲାମାନଙ୍କୁ ଏହି ଟିକା ଦିଆଯାଇଛି:\n• ଟାଇଫଏଡ୍ ଭ୍ୟାକ୍ସିନ୍\n• ହେପାଟାଇଟିସ୍ ଏ\n• ଫ୍ଲୁ ଶଟ୍\n\nପ୍ରତିରୋଧ ସର୍ବଦା ଚିକିତ୍ସା ଅପେକ୍ଷା ଭଲ। ଆଜି ହିଁ ଶିଶୁ ରୋଗ ବିଶେଷଜ୍ଞଙ୍କ ସହ ପରାମର୍ଶ କରନ୍ତୁ!\n\n#ChildHealth #Vaccination #MonsoonCare',
  },
  p3: {
    en: '3 months into my diabetes management journey and my HbA1c dropped from 9.2 to 6.8! 🎉\n\nWhat helped me:\n1. Regular morning walks (5000 steps)\n2. Intermittent fasting (16:8)\n3. Consistent medication\n4. Less stress (meditation helped!)\n\nIf I can do it, so can you! AMA 💪',
    hi: 'मेरी मधुमेह प्रबंधन यात्रा के 3 महीने और मेरा HbA1c 9.2 से गिरकर 6.8 हो गया! 🎉\n\nजिसने मेरी मदद की:\n1. नियमित सुबह की सैर (5000 कदम)\n2. इंटरमिटेंट फास्टिंग (16:8)\n3. नियमित दवाएं\n4. कम तनाव (ध्यान से मदद मिली!)\n\nअगर मैं कर सकता हूँ, तो आप भी कर सकते हैं! मुझसे कुछ भी पूछें 💪',
    hinglish: 'Diabetes management journey ke 3 months pure hue aur mera HbA1c 9.2 se घटकर 6.8 ho gaya! 🎉\n\nMujhe kis cheez se help mili:\n1. Regular morning walk (5000 steps)\n2. Intermittent fasting (16:8)\n3. Time par medicines lena\n4. Tension kam lena (meditation se help mili!)\n\nAgar main kar sakta hu, toh aap bhi kar sakte hain! Kuch bhi poohein 💪',
    bn: 'ডায়াবেটিস নিয়ন্ত্রণের ৩ মাস এবং আমার HbA1c ৯.২ থেকে কমে ৬.৮ হয়েছে! 🎉\n\nযা আমাকে সাহায্য করেছে:\n১. নিয়মিত সকালে হাঁটা (৫০০০ পা)\n২. ইন্টারমিটেন্ট ফাস্টিং (১৬:৮)\n৩. নিয়মিত ওষুধ খাওয়া\n৪. কম মানসিক চাপ (ধ্যান সাহায্য করেছে!)\n\nআমি যদি পারি, আপনিও পারবেন! প্রশ্ন থাকলে জানান 💪',
    te: 'నా డయాబెటిస్ నిర్వహణ ప్రయాణంలో 3 నెలలు పూర్తయ్యాయి మరియు నా HbA1c 9.2 నుండి 6.8కి తగ్గింది! 🎉\n\nనాకు సహాయపడినవి:\n1. క్రమం తప్పకుండా ఉదయం నడక (5000 అడుగులు)\n2. ఇంటర్మిటెంట్ ఫాస్టింగ్ (16:8)\n3. క్రమబద్ధమైన మందులు\n4. తక్కువ ఒత్తిడి (ధ్యానం సహాయపడింది!)\n\nనేను చేయగలిగితే, మీరు కూడా చేయగలరు! ఏవైనా ప్రశ్నలు ఉంటే అడగండి 💪',
    mr: 'माझ्या मधुमेह व्यवस्थापन प्रवासाचे ३ महिने झाले आणि माझा HbA1c ९.२ वरून ६.८ वर घसरला! 🎉\n\nमला काय मदत झाली:\n१. दररोज सकाळी चालणे (५००० पावले)\n२. इंटरमिटेंट फास्टिंग (१६:८)\n३. नियमित औषधे घेणे\n४. कमी ताण (ध्यानाने मदत केली!)\n\nमी करू शकतो, तर तुम्हीही करू शकता! मला काहीही विचारा 💪',
    ta: 'எனது நீரிழிவு மேலாண்மை பயணத்தின் 3 மாதங்கள் நிறைவடைந்த நிலையில், என் HbA1c 9.2 இலிருந்து 6.8 ஆகக் குறைந்தது! 🎉\n\nஎனக்கு உதவியவை:\n1. வழக்கமான காலை நடைப்பயிற்சி (5000 படிகள்)\n2. இடைப்பட்ட ಉಪವಾಸ (16:8)\n3. முறையான மருந்து உட்கொள்ளல்\n4. குறைந்த மன அழுத்தம் (தியானம் உதவியது!)\n\nஎன்னால் முடியும் என்றால், உங்களாலும் முடியும்! ஏதேனும் கேள்விகள் இருந்தால் கேளுங்கள் 💪',
    gu: 'મારા ડાયાબિટીસ મેનેજમેન્ટની મુસાફરીના ૩ મહિનામાં મારો HbA1c ૯.૨ થી ઘટીને ૬.૮ થઈ ગયો! 🎉\n\nમને જે મદદ મળી:\n૧. નિયમિત સવારની ચાલ (૫૦૦૦ ડગલાં)\n૨. ઇન્ટરમિટેન્ટ ફાસ્ટિંગ (૧૬:૮)\n૩. નિયમિત દવાઓ લેવી\n૪. ઓછો તણાવ (ધ્યાન કરવાથી મદદ મળી!)\n\nજો હું કરી શકું તો તમે પણ કરી શકો! મને ગમે તે પૂછો 💪',
    kn: 'ನನ್ನ ಮಧುಮೇಹ ನಿರ್ವಹಣಾ ಪ್ರಯಾಣದ 3 ತಿಂಗಳುಗಳು ಮತ್ತು ನನ್ನ HbA1c 9.2 ರಿಂದ 6.8 ಕ್ಕೆ ಇಳಿದಿದೆ! 🎉\n\nನನಗೆ ಸಹಾಯ ಮಾಡಿದ್ದು:\n1. ನಿಯಮಿತ ಬೆಳಗಿನ ನಡಿಗೆ (5000 ಹೆಜ್ಜೆಗಳು)\n2. ಇಂಟರ್ಮಿಟೆಂಟ್ ಫಾಸ್ಟಿಂಗ್ (16:8)\n3. ನಿಯಮಿತ ಔಷಧ ಸೇವನೆ\n4. ಕಡಿಮೆ ಒತ್ತಡ (ಧ್ಯಾನ ಸಹಾಯ ಮಾಡಿತು!)\n\nನಾನು ಮಾಡಬಹುದಾದರೆ, ನೀವು ಕೂಡ ಮಾಡಬಹುದು! ಏನನ್ನಾದರೂ ಕೇಳಿ 💪',
    ml: 'എന്റെ പ്രമേഹ നിയന്ത്രണ യാത്രയുടെ 3 മാസം കഴിഞ്ഞപ്പോൾ എന്റെ HbA1c 9.2-ൽ നിന്ന് 6.8 ആയി കുറഞ്ഞു! 🎉\n\nഎന്നെ സഹായിച്ചത്:\n1. ദിവസവും രാവിലെ നടത്തം (5000 ചുവടുകൾ)\n2. ഇടവിട്ടുള്ള ഉപവാസം (16:8)\n3. കൃത്യമായ മരുന്ന് കഴിപ്പ്\n4. കുറഞ്ഞ സമ്മർദ്ദം (ധ്യാനം സഹായിച്ചു!)\n\nഎനിക്ക് സാധിക്കുമെങ്കിൽ, നിങ്ങൾക്കും സാധിക്കും! സംശയങ്ങൾ ചോദിക്കാം 💪',
    pa: 'ਮੇਰੇ ਸ਼ੂਗਰ ਪ੍ਰਬੰਧਨ ਦੀ ਯਾਤਰਾ ਦੇ 3 ਮਹੀਨੇ ਅਤੇ ਮੇਰਾ HbA1c 9.2 ਤੋਂ ਘਟ ਕੇ 6.8 ਹੋ ਗਿਆ! 🎉\n\nਜਿਸ ਚੀਜ਼ ਨੇ ਮੇਰੀ ਮਦਦ ਕੀਤੀ:\n1. ਰੋਜ਼ਾਨਾ ਸਵੇਰ ਦੀ ਸੈਰ (5000 ਕਦਮ)\n2. ਇੰਟਰਮੀਟੈਂਟ ਫਾਸਟਿੰਗ (16:8)\n3. ਲਗਾਤਾਰ ਦਵਾਈਆਂ ਲੈਣਾ\n4. ਘੱਟ ਤਣਾਅ (ਧਿਆਨ ਕਰਨ ਨਾਲ ਮਦਦ ਮਿਲੀ!)\n\nਜੇਕਰ ਮੈਂ ਕਰ ਸਕਦਾ ਹਾਂ, ਤਾਂ ਤੁਸੀਂ ਵੀ ਕਰ ਸਕਦੇ ਹੋ! ਮੈਨੂੰ ਕੁਝ ਵੀ ਪੁੱਛੋ 💪',
    or: 'ମୋର ମଧୁମେହ ନିୟନ୍ତ୍ରଣ ଯାତ୍ରାର ୩ ମାସ ପରେ ମୋର HbA1c ୯.୨ ରୁ ହ୍ରାସ ପାଇ ୬.୮ ହୋଇଗଲା! 🎉\n\nମୋତେ ସାହାଯ୍ୟ କରିଥିବା ଜିନିଷ:\n1. ନିୟମିତ ସକାଳେ ଚାଲିବା (୫୦୦୦ ପାଦ)\n2. ଅନ୍ତରାଳ ଉପବାସ (୧୬:୮)\n3. ନିୟମିତ ଔଷଧ ସେବନ\n4. କମ୍ ମାନସିକ ଚାପ (ଧ୍ୟାନ ସାହାଯ୍ୟ କଲା!)\n\nଯଦି ମୁଁ କରିପାରିବି, ଆପଣ ମଧ୍ୟ କରିପାରିବେ! ମୋତେ କିଛି ବି ପଚାରନ୍ତୁ 💪',
  },
  p4: {
    en: '💙 Tips for New Caregivers:\n\nCaring for a loved one is noble but exhausting. Remember:\n\n• Take breaks — you can\'t pour from an empty cup\n• Join a support group (check the "Caregiver Support" community here!)\n• Keep a medication log\n• Don\'t hesitate to ask for professional help\n\nYou matter too. #CaregiverSupport #SelfCare',
    hi: '💙 नए देखभालकर्ताओं (Caregivers) के लिए सुझाव:\n\nकिसी प्रियजन की देखभाल करना नेक काम है लेकिन थका देने वाला होता है। याद रखें:\n\n• ब्रेक लें - आप खुद खाली रहकर दूसरों की मदद नहीं कर सकते\n• सहायता समूह से जुड़ें (यहाँ "Caregiver Support" कम्युनिटी देखें!)\n• दवाओं का लॉग (रिकॉर्ड) रखें\n• पेशेवर मदद लेने में संकोच न करें\n\nआप भी महत्वपूर्ण हैं। #CaregiverSupport #SelfCare',
    hinglish: '💙 New Caregivers ke liye Tips:\n\nApne loved ones ki care karna noble kaam hai par thaka dene wala ho sakta hai. Yaad rakhein:\n\n• Breaks lein - jab tak khud sahi nahi honge, doosro ki care kaise karenge\n• Support group join karein (app par "Caregiver Support" community check karein!)\n• Medicines ka daily record rakhein\n• Professional help lene se ghabrayein nahi\n\nAap bhi important hain. #CaregiverSupport #SelfCare',
    bn: '💙 নতুন পরিচর্যাকারীদের (Caregivers) জন্য কিছু পরামর্শ:\n\nপ্রিয়জনের যত্ন নেওয়া অত্যন্ত মহৎ কাজ কিন্তু এটি ক্লান্তিকর হতে পারে। মনে রাখবেন:\n\n• বিরতি নিন — নিজে ভালো না থাকলে অন্যের যত্ন নেওয়া সম্ভব নয়\n• একটি সহায়তা গ্রুপে যোগ দিন (এখানে "Caregiver Support" গ্রুপটি দেখুন!)\n• ওষুধের রেকর্ড রাখুন\n• পেশাদার সাহায্য নিতে দ্বিধা করবেন না\n\nআপনার নিজের যত্নও প্রয়োজন। #CaregiverSupport #SelfCare',
    te: '💙 కొత్త కేర్‌గివర్లకు సూచనలు:\n\nప్రియమైన వారిని చూసుకోవడం గొప్ప విషయం, కానీ అది అలసట కలిగిస్తుంది. గుర్తుంచుకోండి:\n\n• విరామం తీసుకోండి — మీరు ఆరోగ్యంగా ఉంటేనే ఇతరులను చూసుకోగలరు\n• సహాయక బృందంలో చేరండి (ఇక్కడే "Caregiver Support" కమ్యూనిటీని చూడండి!)\n• మందుల రికార్డును ఉంచండి\n• నిపుణుల సహాయం అడగడానికి సంకోచించకండి\n\nమీరు కూడా ముఖ్యం. #CaregiverSupport #SelfCare',
    mr: '💙 नवीन केअरगिव्हर्ससाठी काही टिप्स:\n\nआपल्या प्रियजनांची काळजी घेणे हे उदात्त काम आहे पण ते थकवणारे असू शकते. लक्षात ठेवा:\n\n• विश्रांती घ्या - स्वतः निरोगी राहाल तरच दुसऱ्यांची काळजी घेऊ शकाल\n• सपोर्ट ग्रुपमध्ये सामील व्हा (येथील "Caregiver Support" कम्युनिटी तपासा!)\n• औषधांची नोंद ठेवा\n• व्यावसायिक मदत घेण्यास संकोच करू नका\n\nतुमचे स्वतःचे आरोग्यही महत्त्वाचे आहे. #CaregiverSupport #SelfCare',
    ta: '💙 புதிய பராமரிப்பாளர்களுக்கான குறிப்புகள்:\n\nஅன்பானவர்களைப் பராமரிப்பது உன்னதமானது ஆனால் சோர்வை ஏற்படுத்தக்கூடியது. நினைவில் கொள்ளுங்கள்:\n\n• ஓய்வு எடுத்துக் கொள்ளுங்கள் — நீங்கள் நலமாக இருந்தால் மட்டுமே மற்றவர்களைப் பேண முடியும்\n• ஆதரவுக் குழுவில் இணையுங்கள் (இங்குள்ள "Caregiver Support" சமூகத்தைப் பார்க்கவும்!)\n• மருந்து உட்கொள்ளல் பதிவைப் பராமரிக்கவும்\n• தொழில்முறை உதவியைக் கேட்கத் தயங்க வேண்டாம்\n\nநீங்களும் முக்கியம். #CaregiverSupport #SelfCare',
    gu: '💙 નવા કેરગિવર્સ માટે ખાસ ટિપ્સ:\n\nસ્વજનોની સંભાળ રાખવી એ ખૂબ જ ઉમદા કાર્ય છે પરંતુ તેનાથી થાક લાગી શકે છે. યાદ રાખો:\n\n• થોડો સમય વિરામ લો — તમે પોતે સ્વસ્થ હશો તો જ બીજાની કાળજી રાખી શકશો\n• સપોર્ટ ગ્રુપમાં જોડાઓ (અહીં "Caregiver Support" સમુદાય તપાસો!)\n• દવાઓનો લોગ રાખો\n• વ્યાવસાયિક મદદ લેવામાં અચકાશો નહીં\n\nતમે પણ મહત્વના છો. #CaregiverSupport #SelfCare',
    kn: '💙 ಹೊಸ ಆರೈಕೆದಾರರಿಗೆ ಸಲಹೆಗಳು:\n\nಆಪ್ತರನ್ನು ನೋಡಿಕೊಳ್ಳುವುದು ಉದಾತ್ತ ಕೆಲಸ ಆದರೆ ಇದು ದಣಿವು ತರಬಹುದು. ನೆನಪಿಡಿ:\n\n• ವಿಶ್ರಾಂತಿ ತೆಗೆದುಕೊಳ್ಳಿ — ನೀವು ಸ್ವಸ್ಥವಾಗಿದ್ದರೆ ಮಾತ್ರ ಇತರರನ್ನು ನೋಡಿಕೊಳ್ಳಲು ಸಾಧ್ಯ\n• ಬೆಂಬಲ ಗುಂಪಿಗೆ ಸೇರಿ (ಇಲ್ಲಿ "Caregiver Support" ಸಮುದಾಯವನ್ನು ಪರಿಶೀಲಿಸಿ!)\n• ಔಷಧ ದಾಖಲೆಯನ್ನು ಇರಿಸಿ\n• ವೃತ್ತಿಪರ ಸಹಾಯ ಕೇಳಲು ಹಿಂಜರಿಯಬೇಡಿ\n\nನಿಮ್ಮ ಆರೋಗ್ಯವೂ ಮುಖ್ಯ. #CaregiverSupport #SelfCare',
    ml: '💙 പുതിയ കെയർഗിവർമാർക്കുള്ള നിർദ്ദേശങ്ങൾ:\n\nപ്രിയപ്പെട്ടവരെ പരിചരിക്കുന്നത് പുണ്യമാണ്, എന്നാൽ അത് നമ്മെ തളർത്തിയേക്കാം. ഓർക്കുക:\n\n• ഇടവേളകൾ എടുക്കുക - നിങ്ങൾ സ്വയം ആരോഗ്യവാനായിരുന്നാൽ മാത്രമേ മറ്റുള്ളവരെ നോക്കാനാകൂ\n• സപ്പോർട്ട് ഗ്രൂപ്പിൽ ചേരുക (ഇവിടെയുള്ള "Caregiver Support" കമ്മ്യൂണിറ്റി കാണുക!)\n• മരുന്നുകളുടെ റെക്കോർഡ് സൂക്ഷിക്കുക\n• പ്രൊഫഷണൽ സഹായം ചോദിക്കാൻ മടിക്കരുത്\n\nനിങ്ങളും പ്രധാനപ്പെട്ടയാളാണ്. #CaregiverSupport #SelfCare',
    pa: '💙 ਨਵੇਂ ਕੇਅਰਗਿਵਰਾਂ ਲਈ ਸੁਝਾਅ:\n\nਕਿਸੇ ਪਿਆਰੇ ਦੀ ਦੇਖਭਾਲ ਕਰਨਾ ਨੇਕ ਕੰਮ ਹੈ ਪਰ ਇਹ ਥਕਾ ਦੇਣ ਵਾਲਾ ਹੁੰਦਾ ਹੈ। ਯਾਦ ਰੱਖੋ:\n\n• ਬ੍ਰੇਕ ਲਓ - ਜਦੋਂ ਤੱਕ ਤੁਸੀਂ ਖੁਦ ਸਹੀ ਨਹੀਂ ਹੋਵੋਗੇ, ਦੂਜਿਆਂ ਦੀ ਦੇਖਭਾਲ ਕਿਵੇਂ ਕਰੋਗੇ\n• ਸਹਾਇਤਾ ਸਮੂਹ ਵਿੱਚ ਸ਼ਾਮਲ ਹੋਵੋ (ਇੱਥੇ "Caregiver Support" ਕਮਿਊਨਿਟੀ ਦੇਖੋ!)\n• ਦਵਾਈਆਂ ਦਾ ਰਿਕਾਰਡ ਰੱਖੋ\n• ਪੇਸ਼ੇਵਰ ਮਦਦ ਲੈਣ ਤੋਂ ਨਾ ਝਿਜਕੋ\n\nਤੁਸੀਂ ਵੀ ਮਹੱਤਵਪੂਰਨ ਹੋ। #CaregiverSupport #SelfCare',
    or: '💙 ନୂଆ କେୟାରଗିଭରଙ୍କ ପାଇଁ ଟିପ୍ସ:\n\nପ୍ରିୟଜନଙ୍କ ଯତ୍ନ ନେବା ଏକ ମହତ କାର୍ଯ୍ୟ କିନ୍ତୁ ଏହା କ୍ଲାନ୍ତିକର ହୋଇପାରେ। ମନେରଖନ୍ତୁ:\n\n• ବିରତି ନିଅନ୍ତୁ — ଯଦି ଆପଣ ନିଜେ ସୁସ୍ଥ ରହିବେ ତେବେ ଯାଇ ଅନ୍ୟମାନଙ୍କ ଯତ୍ନ ନେଇପାରିବେ\n• ସହାୟତା ଗ୍ରୁପରେ ଯୋଗ ଦିଅନ୍ତୁ (ଏଠାରେ "Caregiver Support" ଗ୍ରୁପ ଯାଞ୍ଚ କରନ୍ତୁ!)\n• ଔଷଧର ହିସାବ ରଖନ୍ତୁ\n• ପେଶାଦାର ସାହାଯ୍ୟ ମାଗିବାକୁ କୁଣ୍ଠାବୋଧ କରନ୍ତୁ ନାହିଁ\n\nଆପଣ ମଧ୍ୟ ଗୁରୁତ୍ୱପୂର୍ଣ୍ଣ। #CaregiverSupport #SelfCare',
  },
  p5: {
    en: '🧠 Interesting case discussion (for medical professionals):\n\nA 45-year-old male presented with sudden-onset severe headache, photophobia, and neck stiffness. CT was negative. LP showed xanthochromia.\n\nWhat would be your next step?\n\n#Neurology #CaseStudy #MedicalDiscussion',
    hi: '🧠 दिलचस्प केस चर्चा (चिकित्सा पेशेवरों के लिए):\n\nएक 45 वर्षीय पुरुष को अचानक तेज सिरदर्द, फोटोफोबिया (रोशनी से परेशानी) और गर्दन में अकड़न की शिकायत हुई। सीटी स्कैन सामान्य था। एलपी (लंबर पंक्चर) में ज़ैंथोक्रोमिया दिखा।\n\nआपका अगला कदम क्या होगा?\n\n#Neurology #CaseStudy #MedicalDiscussion',
    hinglish: '🧠 Interesting case discussion (medical professionals ke liye):\n\nEk 45-year-old male ko sudden severe headache, photophobia, aur neck stiffness hui. CT scan negative tha par LP (Lumbar Puncture) mein xanthochromia mila.\n\nAapka next step kya hoga?\n\n#Neurology #CaseStudy #MedicalDiscussion',
    bn: '🧠 আকর্ষণীয় কেস আলোচনা (চিকিৎসা পেশাদারদের জন্য):\n\nএকজন ৪৫ বছর বয়সী পুরুষের হঠাৎ তীব্র মাথাব্যথা, ফটোফোবিয়া এবং ঘাড় শক্ত হয়ে যাওয়ার উপসর্গ দেখা গেছে। সিটি স্ক্যান নেতিবাচক ছিল। এলপি (ল্যাম্বার পাঙ্কচার) জ্যান্থোক্রোমিয়া দেখিয়েছে।\n\nআপনার পরবর্তী পদক্ষেপ কী হবে?\n\n#Neurology #CaseStudy #MedicalDiscussion',
    te: '🧠 ఆసక్తికరమైన కేస్ చర్చ (వైద్య నిపుణుల కోసం):\n\nఒక 45 సంవత్సరాల పురుషుడు అకస్మాత్తుగా తీవ్రమైన తలనొప్పి, ఫోటోఫోబియా మరియు మెడ బిగుతుతో వచ్చాడు. సిటి స్కాన్ నెగటివ్‌గా వచ్చింది. ఎల్‌పి క్సాంతోక్రోమియాను చూపించింది.\n\nమీ తదుపరి చర్య ఏమిటి?\n\n#Neurology #CaseStudy #MedicalDiscussion',
    mr: '🧠 मनोरंजक केस चर्चा (वैद्यकीय व्यावसायिकांसाठी):\n\nएक ४५ वर्षांचा पुरुष अचानक तीव्र डोकेदुखी, फोटोफोबिया आणि मान ताठ होण्याच्या तक्रारीसह आला. सीटी स्कॅन सामान्य होता. लंबर पंक्चरमध्ये झँथोक्रोमिया दिसला.\n\nतुमची पुढची पायरी काय असेल?\n\n#Neurology #CaseStudy #MedicalDiscussion',
    ta: '🧠 சுவாரஸ்யமான வழக்கு விவாதம் (மருத்துவ நிபுணர்களுக்கு):\n\n45 வயதுடைய ஒருவருக்கு திடீரென கடுமையான தலைவலி, ஒளிக்கூச்சம் மற்றும் கழுத்து விறைப்பு ஏற்பட்டது. சிடி ஸ்கேன் சாதாரணமாக இருந்தது. எல்பி சோதனையில் சாந்தோக்ரோமியா கண்டறியப்பட்டது.\n\nஉங்கள் அடுத்த கட்ட நடவடிக்கை என்ன?\n\n#Neurology #CaseStudy #MedicalDiscussion',
    gu: '🧠 રસપ્રદ કેસ ચર્ચા (તબીબી વ્યાવસાયિકો માટે):\n\nએક ૪૫ વર્ષીય પુરુષને અચાનક ગંભીર માથાનો દુખાવો, ફોટોફોબિયા અને ગરદન અક્કડ થવાની ફરિયાદ થઈ. સીટી સ્કેન નેગેટિવ હતું. એલપીમાં ઝેન્થોક્રોમિયા જોવા મળ્યું.\n\nતમારું આગલું પગલું શું હશે?\n\n#Neurology #CaseStudy #MedicalDiscussion',
    kn: '🧠 ಆಸಕ್ತಿದಾಯಕ ಕೇಸ್ ಚರ್ಚೆ (ವೈದ್ಯಕೀಯ ವೃತ್ತಿಪರರಿಗಾಗಿ):\n\n45 ವರ್ಷದ ಪುರುಷನೊಬ್ಬ ತೀವ್ರ ತಲೆನೋವು, ಫೋಟೋಫೋಬಿಯಾ ಮತ್ತು ಕುತ್ತಿಗೆ ಬಿಗಿತದೊಂದಿಗೆ ಬಂದನು. ಸಿಟಿ ನೆಗೆಟಿವ್ ಇತ್ತು. ಎಲ್ಪಿ ಗ್ಸಾಂಥೋಕ್ರೋಮಿಯಾವನ್ನು ತೋರಿಸಿದೆ.\n\nನಿಮ್ಮ ಮುಂದಿನ ಕ್ರಮ ಏನಿರಬಹುದು?\n\n#Neurology #CaseStudy #MedicalDiscussion',
    ml: '🧠 രസകരമായ കേസ് ചർച്ച (മെഡിക്കൽ പ്രൊഫഷണലുകൾക്ക്):\n\nപെട്ടെന്നുണ്ടായ കടുത്ത തലവേദന, ഫോട്ടോഫോബിയ, കഴുത്ത് കഴപ്പ് എന്നിവയുമായി 45 വയസ്സുള്ള ഒരു പുരുഷൻ എത്തി. സിടി നെഗറ്റീവ് ആയിരുന്നു. എൽപി പരിശോധനയിൽ ക്സാന്തോക്രോമിയ കണ്ടെത്തി.\n\nനിങ്ങളുടെ അടുത്ത ഘട്ടം എന്തായിരിക്കും?\n\n#Neurology #CaseStudy #MedicalDiscussion',
    pa: '🧠 ਦਿਲਚਸਪ ਕੇਸ ਚਰਚਾ (ਮੈਡੀਕਲ ਪੇਸ਼ੇਵਰਾਂ ਲਈ):\n\nਇੱਕ 45 ਸਾਲਾ ਵਿਅਕਤੀ ਅਚਾਨਕ ਤੇਜ਼ ਸਿਰਦਰਦ, ਫੋਟੋਫੋਬੀਆ ਅਤੇ ਗਰਦਨ ਦੀ ਅਕੜਾਅ ਨਾਲ ਆਇਆ। ਸੀਟੀ ਸਕੈਨ ਆਮ ਸੀ। ਐਲਪੀ (ਲੰਬਰ ਪੰਕਚਰ) ਵਿੱਚ ਜ਼ੈਂਥੋਕਰੋਮੀਆ ਦਿਖਾਈ ਦਿੱਤਾ।\n\nਤੁਹਾਡਾ ਅਗਲਾ ਕਦਮ ਕੀ ਹੋਵੇਗਾ?\n\n#Neurology #CaseStudy #MedicalDiscussion',
    or: '🧠 ଆକର୍ଷଣୀୟ କେସ୍ ଆଲୋଚନା (ମେଡିକାଲ ପେଶାଦାରଙ୍କ ପାଇଁ):\n\nଜଣେ ୪୫ ବର୍ଷୀୟ ପୁରୁଷ ହଠାତ୍ ପ୍ରବଳ ମୁଣ୍ଡବିନ୍ଧା, ଆଲୋକ ପ୍ରତି ସମ୍ବେଦନଶୀଳତା ଏବଂ ବେକ ଜଡ଼ିଯିବା ସମସ୍ୟା ନେଇ ଆସିଥିଲେ। ସିଟି ନେଗେଟିଭ୍ ଥିଲା। ଏଲପି ଜାନ୍ଥୋକ୍ରୋମିଆ ଦେଖାଇଲା।\n\nଆପଣଙ୍କର ପରବର୍ତ୍ତୀ ପଦକ୍ଷେପ କଣ ହେବ?\n\n#Neurology #CaseStudy #MedicalDiscussion',
  },
  p6: {
    en: '🎗️ 2 years cancer-free today! This journey taught me:\n\n• Health is wealth — literally\n• Your support system matters more than medicine\n• Mental health IS physical health\n• Every day is a gift\n\nThank you Dr. @dr.priya and the entire team at Sadhna Health Care for giving me a second chance at life. 🙏\n\n#CancerSurvivor #Gratitude #NeverGiveUp',
    hi: '🎗️ आज कैंसर-मुक्त होने के 2 साल पूरे! इस यात्रा ने मुझे सिखाया:\n\n• स्वास्थ्य ही धन है - सचमुच\n• आपकी सहायता प्रणाली (सपोर्ट सिस्टम) दवा से अधिक मायने रखती है\n• मानसिक स्वास्थ्य ही शारीरिक स्वास्थ्य है\n• हर दिन एक उपहार है\n\nमुझे जीवन का दूसरा मौका देने के लिए डॉ. @dr.priya और साधना हेल्थ केयर की पूरी टीम को धन्यवाद। 🙏\n\n#CancerSurvivor #Gratitude #NeverGiveUp',
    hinglish: '🎗️ Aaj cancer-free hone ke 2 years complete ho gaye! Is journey ne mujhe sikhaya:\n\n• Health hi sab kuch hai - literally\n• Aapka support system medicine se zyada important hota hai\n• Mental health aur physical health ek hi hain\n• Har din ek naya gift hai\n\nMujhe doosri zindagi dene ke liye Dr. @dr.priya aur Sadhna Health Care ki team ko shukriya. 🙏\n\n#CancerSurvivor #Gratitude #NeverGiveUp',
    bn: '🎗️ আজ ক্যান্সারের থেকে মুক্ত হওয়ার ২ বছর পূর্ণ হলো! এই যাত্রা আমাকে শিখিয়েছে:\n\n• স্বাস্থ্যই সম্পদ — আক্ষরিক অর্থেই\n• আপনার চারপাশের মানুষজন ওষুধের চেয়ে বেশি গুরুত্বপূর্ণ\n• মানসিক স্বাস্থ্যই হলো শারীরিক স্বাস্থ্য\n• প্রতিটি দিন একটি উপহার\n\nআমাকে জীবনের দ্বিতীয় সুযোগ দেওয়ার জন্য ডঃ @dr.priya এবং সাধনা হেলথ কেয়ারের পুরো টিমকে ধন্যবাদ। 🙏\n\n#CancerSurvivor #Gratitude #NeverGiveUp',
    te: '🎗️ ఈ రోజుతో క్యాన్సర్ నుండి విముక్తి పొంది 2 సంవత్సరాలు పూర్తయ్యాయి! ఈ ప్రయాణం నాకు నేర్పినవి:\n\n• ఆరోగ్యమే మహాభాగ్యం — నిజంగానే\n• మందుల కంటే మీ చుట్టూ ఉండే మద్దతు వ్యవస్థ ముఖ్యం\n• మానసిక ఆరోగ్యమే శారీరక ఆరోగ్యం\n• ప్రతి రోజు ఒక వరం\n\nనాకు జీవితంలో రెండవ అవకాశాన్ని ఇచ్చినందుకు డాక్టర్ @dr.priya మరియు సాధన హెల్త్ కేర్ బృందానికి ధన్యవాదాలు. 🙏\n\n#CancerSurvivor #Gratitude #NeverGiveUp',
    mr: '🎗️ आज कर्करोगमुक्त (Cancer-free) होण्याला २ वर्षे पूर्ण झाली! या प्रवासाने मला शिकवले:\n\n• आरोग्य हीच संपत्ती आहे - खरोखर\n• तुमची सपोर्ट सिस्टम औषधापेक्षा जास्त महत्त्वाची असते\n• मानसिक आरोग्य म्हणजेच शारीरिक आरोग्य आहे\n• प्रत्येक दिवस ही एक भेट आहे\n\nमला जीवनदान दिल्याबद्दल डॉ. @dr.priya आणि साधना हेल्थ केअरच्या संपूर्ण टीमचे आभार. 🙏\n\n#CancerSurvivor #Gratitude #NeverGiveUp',
    ta: '🎗️ இன்று புற்றுநோயிலிருந்து விடுபட்டு 2 ஆண்டுகள் நிறைவு! இந்த பயணம் எனக்குக் கற்றுக் கொடுத்தது:\n\n• நோயற்ற வாழ்வே குறைவற்ற செல்வம்\n• மருந்தை விட உங்களைச் சுற்றியுள்ளவர்களின் ஆதரவு முக்கியம்\n• மன ஆரோக்கியமே உடல் ஆரோக்கியம்\n• ஒவ்வொரு நாளும் ஒரு பரிசு\n\nஎனக்கு இரண்டாவது வாழ்க்கை அளித்த டாக்டர் @dr.priya மற்றும் சாதனா ஹெல்த் கேர் குழுவினருக்கு நன்றி. 🙏\n\n#CancerSurvivor #Gratitude #NeverGiveUp',
    gu: '🎗️ આજે કેન્સર-મુક્ત થયાને ૨ વર્ષ પૂર્ણ! આ મુસાફરીએ મને શીખવ્યું:\n\n• આરોગ્ય એ જ સંપત્તિ છે — ખરેખર\n• તમારી સપોર્ટ સિસ્ટમ દવા કરતાં વધુ મહત્વની છે\n• માનસિક સ્વાસ્થ્ય એ જ શારીરિક સ્વાસ્થ્ય છે\n• દરેક દિવસ એક ભેટ છે\n\nમને જીવનની બીજી તક આપવા બદલ ડો. @dr.priya અને સાધના હેલ્થ કેરની આખી ટીમનો આભાર. 🙏\n\n#CancerSurvivor #Gratitude #NeverGiveUp',
    kn: '🎗️ ಇಂದು ಕ್ಯಾನ್ಸರ್ ಮುಕ್ತವಾಗಿ 2 ವರ್ಷಗಳು! ಈ ಪ್ರಯಾಣ ನನಗೆ ಕಲಿಸಿದ್ದು:\n\n• ಆರೋಗ್ಯವೇ ಭಾಗ್ಯ — ನಿಜವಾಗಿಯೂ\n• ಔಷಧಕ್ಕಿಂತ ನಿಮ್ಮ ಬೆಂಬಲ ವ್ಯವಸ್ಥೆ ಹೆಚ್ಚು ಮುಖ್ಯವಾಗಿದೆ\n• ಮಾನಸಿಕ ಆರೋಗ್ಯವೇ ದೈಹಿಕ ಆರೋಗ್ಯ\n• ಪ್ರತಿ ದಿನವೂ ಒಂದು ಕೊಡುಗೆ\n\nನನಗೆ ಎರಡನೇ ಜೀವನ ನೀಡಿದ ಡಾ. @dr.priya ಮತ್ತು ಸಾಧನಾ ಹೆಲ್ತ್ ಕೇರ್ ತಂಡಕ್ಕೆ ಧನ್ಯವಾದಗಳು. 🙏\n\n#CancerSurvivor #Gratitude #NeverGiveUp',
    ml: '🎗️ ഇന്ന് കാൻസർ വിമുക്തമായിട്ട് 2 വർഷം തികയുന്നു! ഈ യാത്ര എന്നെ പഠിപ്പിച്ചത്:\n\n• ആരോഗ്യം തന്നെയാണ് സമ്പത്ത് - അക്ഷരാർത്ഥത്തിൽ\n• നിങ്ങളുടെ ചുറ്റുമുള്ളവരുടെ പിന്തുണ മരുന്നിനേക്കാൾ പ്രാധാന്യമുള്ളതാണ്\n• മാനസികാരോഗ്യം തന്നെയാണ് ശാരീരിക ആരോഗ്യം\n• ഓരോ ദിവസവും ഒരു സമ്മാനമാണ്\n\nഎനിക്ക് ജീവിതത്തിൽ രണ്ടാം അവസരം നൽകിയ ഡോ. @dr.priya യ്ക്കും സാധന ഹെൽത്ത് കെയറിലെ മുഴുവൻ ടീമിനും നന്ദി. 🙏\n\n#CancerSurvivor #Gratitude #NeverGiveUp',
    pa: '🎗️ ਅੱਜ ਕੈਂਸਰ-ਮੁਕਤ ਹੋਣ ਦੇ 2 ਸਾਲ ਪੂਰੇ! ਇਸ ਯਾਤਰਾ ਨੇ ਮੈਨੂੰ ਸਿਖਾਇਆ:\n\n• ਸਿਹਤ ਹੀ ਸਭ ਤੋਂ ਵੱਡਾ ਧਨ ਹੈ - ਸੱਚਮੁੱਚ\n• ਤੁਹਾਡਾ ਸਪੋਰਟ ਸਿਸਟਮ ਦਵਾਈ ਤੋਂ ਵੱਧ ਮਾਇਨੇ ਰੱਖਦਾ ਹੈ\n• ਮਾਨਸਿਕ ਸਿਹਤ ਹੀ ਸਰੀਰਕ ਸਿਹਤ ਹੈ\n• ਹਰ ਦਿਨ ਇੱਕ ਤੋਹਫ਼ਾ ਹੈ\n\nਮੈਨੂੰ ਜ਼ਿੰਦਗੀ ਦਾ ਦੂਜਾ ਮੌਕਾ ਦੇਣ ਲਈ ਡਾ. @dr.priya ਅਤੇ ਸਾਧਨਾ ਹੈਲਥ ਕੇਅਰ ਦੀ ਪੂਰੀ ਟੀਮ ਦਾ ਧੰਨਵਾਦ। 🙏\n\n#CancerSurvivor #Gratitude #NeverGiveUp',
    or: '🎗️ ଆଜି କର୍କଟମୁକ୍ତ ହେବାର ୨ ବର୍ଷ ପୂରିଲା! ଏହି ଯାତ୍ରା ମୋତେ ଶିଖାଇଛି:\n\n• ସ୍ୱାସ୍ଥ୍ୟ ହିଁ ସମ୍ପଦ — ପ୍ରକୃତରେ\n• ଆପଣଙ୍କ ସପୋର୍ଟ ସିଷ୍ଟମ ଔଷଧ ଅପେକ୍ଷା ଅଧିକ ଗୁରୁତ୍ୱପୂର୍ଣ୍ଣ\n• ମାନସିକ ସ୍ୱାସ୍ଥ୍ୟ ହିଁ ଶାରୀରିକ ସ୍ୱାସ୍ଥ୍ୟ\n• ପ୍ରତ୍ୟେକ ଦିନ ଏକ ଉପହାର\n\nମୋତେ ଜୀବନର ଦ୍ୱିତୀୟ ସୁଯୋଗ ଦେଇଥିବାରୁ ଡ. @dr.priya ଏବଂ ସାଧନା ହେଲଥ କେୟାରର ସମଗ୍ର ଟିମକୁ ଧନ୍ୟବାଦ। 🙏\n\n#CancerSurvivor #Gratitude #NeverGiveUp',
  },
  p7: {
    en: 'Question for the community: What are your go-to healthy snack alternatives for managing cholesterol?\n\nI usually recommend:\n🥜 Almonds (handful)\n🫒 Olive oil-based dressings\n🐟 Fish (salmon, mackerel)\n🥑 Avocado toast\n\nWould love to hear what works for you! 👇',
    hi: 'कम्युनिटी के लिए सवाल: कोलेस्ट्रॉल को प्रबंधित करने के लिए आपके पसंदीदा स्वस्थ स्नैक विकल्प क्या हैं?\n\nमैं आमतौर पर सलाह देती हूँ:\n🥜 बादाम (मुट्ठी भर)\n🫒 जैतून के तेल पर आधारित ड्रेसिंग\n🐟 मछली (सैलमन, मैकेरल)\n🥑 एवोकैडो टोस्ट\n\nआप लोगों के लिए क्या काम करता है, जानना चाहूंगी! 👇',
    hinglish: 'Community ke liye question: Cholesterol control karne ke liye aapke healthy snacks options kya hain?\n\nMain recommend karti hu:\n🥜 Almonds (ek mutthi)\n🫒 Olive oil dressings\n🐟 Fish (salmon, mackerel)\n🥑 Avocado toast\n\nAapke liye kya kaam karta hai, comments mein batayein! 👇',
    bn: 'কমিউনিটির জন্য প্রশ্ন: কোলেস্টেরল নিয়ন্ত্রণের জন্য আপনার প্রিয় স্বাস্থ্যকর স্ন্যাক্স বিকল্পগুলি কী কী?\n\nআমি সাধারণত সুপারিশ করি:\n🥜 কাঠবাদাম (এক মুঠো)\n🫒 অলিভ অয়েল ভিত্তিক ড্রেসিং\n🐟 মাছ (স্যালমন, ম্যাকেরেল)\n🥑 অ্যাভোকাডো টোস্ট\n\nআপনার জন্য কোনটি কাজ করে তা শুনতে ভালো লাগবে! 👇',
    te: 'కమ్యూనిటీకి ప్రశ్న: కొలెస్ట్రాల్ నిర్వహణ కోసం మీ ఆరోగ్యకరమైన స్నాక్ ప్రత్యామ్నాయాలు ఏమిటి?\n\nనేను సాధారణంగా సిఫార్సు చేసేవి:\n🥜 బాదం పప్పులు (గుప్పెడు)\n🫒 ఆలివ్ ఆయిల్ ఆధారిత డ్రెస్సింగ్స్\n🐟 చేపలు (సాల్మన్, మాకేరెల్)\n🥑 అవకాడో టోస్ట్\n\nమీకు ఏది బాగా పనిచేస్తుందో తెలుసుకోవాలనుకుంటున్నాను! 👇',
    mr: 'कम्युनिटीसाठी प्रश्न: कोलेस्ट्रॉल नियंत्रित करण्यासाठी तुमचे आवडते निरोगी स्नॅक्स पर्याय कोणते आहेत?\n\nमी सहसा शिफारस करतो:\n🥜 बदाम (मूठभर)\n🫒 ऑलिव्ह ऑइलवर आधारित ड्रेसिंग\n🐟 मासे (सॅल्मन, मॅकेरल)\n🥑 एवोकॅडो टोस्ट\n\nतुमच्यासाठी काय फायदेशीर ठरते ते नक्की सांगा! 👇',
    ta: 'சமூகத்திற்கான கேள்வி: கொலஸ்ட்ராலை நிர்வகிக்க உங்கள் ஆரோக்கியமான மாற்று தின்பண்டங்கள் யாவை?\n\nநான் வழக்கமாக பரிந்துரைப்பது:\n🥜 பாதாம் (ஒரு கைப்பிடி)\n🫒 ஆலிவ் எண்ணெய் அடிப்படையிலான டிரஸ்ஸிங்ஸ்\n🐟 மீன் (சால்மன், மேக்ரல்)\n🥑 வெண்ணெய் பழ டோஸ்ட்\n\nஉங்களுக்கு எது வேலை செய்கிறது என்பதைக் கேட்க விரும்புகிறேன்! 👇',
    gu: 'સમુદાય માટે પ્રશ્ન: કોલેસ્ટ્રોલ નિયંત્રણ માટે તમારા મનપસંદ હેલ્ધી સ્નેક્સ કયા છે?\n\nહું સામાન્ય રીતે ભલામણ કરું છું:\n🥜 બદામ (મૂઠીભર)\n🫒 ઓલિવ ઓઇલ આધારિત ડ્રેસિંગ્સ\n🐟 માછલી (સૅલ્મોન, મેકરેલ)\n🥑 એવોકાડો ટોસ્ટ\n\nતમારા માટે શું ઉપયોગી છે તે જાણવું ગમશે! 👇',
    kn: 'ಸಮುದಾಯಕ್ಕೆ ಪ್ರಶ್ನೆ: ಕೊಲೆಸ್ಟ್ರಾಲ್ ನಿರ್ವಹಣೆಗಾಗಿ ನಿಮ್ಮ ನೆಚ್ಚಿನ ಆರೋಗ್ಯಕರ ತಿಂಡಿ ಆಯ್ಕೆಗಳು ಯಾವುವು?\n\nನಾನು ಸಾಮಾನ್ಯವಾಗಿ ಶಿಫಾರಸು ಮಾಡುವುದು:\n🥜 ಬಾದಾಮಿ (ಹಿಡಿ ತುಂಬ)\n🫒 ಆಲಿವ್ ಆಯಿಲ್ ಆಧಾರಿತ ಡ್ರೆಸ್ಸಿಂಗ್ಸ್\n🐟 ಮೀನು (ಸಾಲ್ಮನ್, ಮ್ಯಾಕೆರೆಲ್)\n🥑 ಆವಕಾಡೊ ಟೋಸ್ಟ್\n\nನಿಮಗೆ ಯಾವುದು ಸೂಕ್ತವಾಗಿದೆ ಎಂದು ತಿಳಿಯಲು ಬಯಸುತ್ತೇನೆ! 👇',
    ml: 'കമ്മ്യൂണിറ്റിയോട് ഒരു ചോദ്യം: കൊളസ്ട്രോൾ നിയന്ത്രിക്കാൻ നിങ്ങൾ കഴിക്കാറുള്ള ആരോഗ്യകരമായ ലഘുഭക്ഷണങ്ങൾ ഏവയാണ്?\n\nഞാൻ സാധാരണയായി നിർദ്ദേശിക്കാറുള്ളത്:\n🥜 ബദാം (ഒരു പിടി)\n🫒 ഒലിവ് ഓയിൽ ചേർത്ത സാലഡുകൾ\n🐟 മത്സ്യം (സാൽമൺ, മാക്കറൽ)\n🥑 അവോക്കാഡോ ടോസ്റ്റ്\n\nനിങ്ങൾക്ക് ഏതാണ് പ്രയോജനപ്പെടാറുള്ളതെന്ന് അറിയാൻ ആഗ്രഹമുണ്ട്! 👇',
    pa: 'ਕਮਿਊਨਿਟੀ ਲਈ ਸਵਾਲ: ਕੋਲੇਸਟ੍ਰੋਲ ਨੂੰ ਕੰਟਰੋਲ ਕਰਨ ਲਈ ਤੁਹਾਡੇ ਪਸੰਦੀਦਾ ਸਿਹਤਮੰਦ ਸਨੈਕਸ ਵਿਕਲਪ ਕੀ ਹਨ?\n\nਮੈਂ ਆਮ ਤੌਰ ਤੇ ਸਿਫਾਰਸ਼ ਕਰਦੀ ਹਾਂ:\n🥜 ਬਾਦਾਮ (ਮੁੱਠੀ ਭਰ)\n🫒 ਜੈਤੂਨ ਦੇ ਤੇਲ ਤੇ ਅਧਾਰਤ ਡਰੈਸਿੰਗ\n🐟 ਮੱਛੀ (ਸੈਲਮਨ, ਮੈਕਰੇਲ)\n🥑 ਐਵੋਕਾਡੋ ਟੋਸਟ\n\nਤੁਹਾਡੇ ਲਈ ਕੀ ਕੰਮ ਕਰਦਾ ਹੈ, ਕਮੈਂਟ ਵਿੱਚ ਦੱਸੋ! 👇',
    or: 'କମ୍ୟୁନିଟି ପାଇଁ ପ୍ରଶ୍ନ: କୋଲେଷ୍ଟ୍ରଲ୍ ନିୟନ୍ତ୍ରଣ ପାଇଁ ଆପଣଙ୍କର ପସନ୍ଦର ସ୍ୱାସ୍ଥ୍ୟକର ସ୍ନାକ୍ସ ବିକଳ୍ପ କଣ?\n\nମୁଁ ସାଧାରଣତଃ ପରାମର୍શ ଦିଏ:\n🥜 ବାଦାମ (ମୁଠାଏ)\n🫒 ଅଲିଭ୍ ତେଲ ଆଧାରିତ ଡ୍ରେସିଙ୍ଗ\n🐟 ମାଛ (ସାଲମନ, ମାକେରେଲ)\n🥑 ଆଭୋକାଡୋ ଟୋଷ୍ଟ\n\nଆପଣଙ୍କ ପାଇଁ କଣ କାମ କରେ ଜାଣିବାକୁ ଚାହେଁ! 👇',
  },
};

// Word mapping for fallback translator to translate user-generated posts dynamically
const WORD_MAP: Record<string, Record<Language, string>> = {
  medicine: {
    en: 'medicine',
    hi: 'दवा',
    hinglish: 'medicine',
    bn: 'ওষুধ',
    te: 'మందులు',
    mr: 'औषध',
    ta: 'மருந்து',
    gu: 'દવા',
    kn: 'ಔಷಧ',
    ml: 'മരുന്ന്',
    pa: 'ਦਵਾਈ',
    or: 'ଔଷଧ',
  },
  walk: {
    en: 'walk',
    hi: 'सैर (वॉक)',
    hinglish: 'walk',
    bn: 'হাঁটা',
    te: 'నడక',
    mr: 'चालणे',
    ta: 'நடைப்பயிற்சி',
    gu: 'ચાલવું',
    kn: 'ನಡಿಗೆ',
    ml: 'നടത്തം',
    pa: 'ਸੈਰ',
    or: 'ଚାଲିବା',
  },
  exercise: {
    en: 'exercise',
    hi: 'व्यायाम',
    hinglish: 'exercise',
    bn: 'ব্যায়াম',
    te: 'వ్యాయామం',
    mr: 'व्यायाम',
    ta: 'உடற்பயிற்சி',
    gu: 'વ્યાયામ',
    kn: 'ವ್ಯಾಯಾಮ',
    ml: 'വ്യായാമം',
    pa: 'ਕਸਰਤ',
    or: 'ବ୍ୟାୟାମ',
  },
  doctor: {
    en: 'doctor',
    hi: 'डॉक्टर',
    hinglish: 'doctor',
    bn: 'ডাক্তার',
    te: 'వైద్యుడు',
    mr: 'डॉक्टर',
    ta: 'மருத்துவர்',
    gu: 'ડોક્ટર',
    kn: 'ವೈದ್ಯರು',
    ml: 'ഡോക്ടർ',
    pa: 'ਡਾਕਟਰ',
    or: 'ଡାକ୍ତର',
  },
  today: {
    en: 'today',
    hi: 'आज',
    hinglish: 'aaj',
    bn: 'আজ',
    te: 'ఈరోజు',
    mr: 'आज',
    ta: 'இன்று',
    gu: 'આજે',
    kn: 'ಇಂದು',
    ml: 'ഇന്ന്',
    pa: 'ਅੱਜ',
    or: 'ଆଜି',
  },
  healthy: {
    en: 'healthy',
    hi: 'स्वस्थ',
    hinglish: 'healthy',
    bn: 'স্বাস্থ্যকর',
    te: 'ఆరోగ్యకరమైన',
    mr: 'निरोगी',
    ta: 'ஆரோக்கியமான',
    gu: 'સ્વસ્થ',
    kn: 'ಆರೋಗ್ಯಕರ',
    ml: 'ആരോഗ്യമുള്ള',
    pa: 'ਸਿਹਤਮੰਦ',
    or: 'ସ୍ୱାସ୍ଥ୍ୟକର',
  },
  pain: {
    en: 'pain',
    hi: 'दर्द',
    hinglish: 'dard',
    bn: 'ব্যথা',
    te: 'నొప్పి',
    mr: 'दुखणे',
    ta: 'வலி',
    gu: 'દુખાવો',
    kn: 'ನೋವು',
    ml: 'വേദന',
    pa: 'ਦਰਦ',
    or: 'ଯନ୍ତ୍ରଣା',
  },
  happy: {
    en: 'happy',
    hi: 'खुश',
    hinglish: 'khush',
    bn: 'খুশি',
    te: 'సంతోషం',
    mr: 'आनंदी',
    ta: 'மகிழ்ச்சி',
    gu: 'ખુશ',
    kn: 'ಸಂತೋಷ',
    ml: 'സന്തോഷം',
    pa: 'ਖੁਸ਼',
    or: 'ଖୁସି',
  },
  recovered: {
    en: 'recovered',
    hi: 'ठीक हो गया',
    hinglish: 'recover ho gaya',
    bn: 'সুস্থ হয়ে উঠেছে',
    te: 'కోలుకున్నారు',
    mr: 'बरे झाले',
    ta: 'குணமடைந்தார்',
    gu: 'સાજા થયા',
    kn: 'ಗುಣಮುಖರಾಗಿದ್ದಾರೆ',
    ml: 'സുഖം പ്രാപിച്ചു',
    pa: 'ਠੀਕ ਹੋ ਗਿਆ',
    or: 'ସୁସ୍ଥ ହୋଇଗଲେ',
  },
  sugar: {
    en: 'sugar',
    hi: 'शुगर',
    hinglish: 'sugar',
    bn: 'চিনি (সুগার)',
    te: 'షుగర్',
    mr: 'साखर',
    ta: 'சர்க்கரை',
    gu: 'સુગર',
    kn: 'ಸಕ್ಕರೆ',
    ml: 'ഷുഗർ',
    pa: 'ਸ਼ੂਗਰ',
    or: 'ସୁଗାର',
  },
  care: {
    en: 'care',
    hi: 'देखभाल',
    hinglish: 'care',
    bn: 'যত্ন',
    te: 'సంరక్షణ',
    mr: 'काळजी',
    ta: 'பராமரிப்பு',
    gu: 'સંભાળ',
    kn: 'ಆರೈಕೆ',
    ml: 'പരിചരണം',
    pa: 'ਦੇਖਭਾਲ',
    or: 'ଯତ୍ନ',
  },
  patient: {
    en: 'patient',
    hi: 'मरीज',
    hinglish: 'patient',
    bn: 'রোগী',
    te: 'రోగి',
    mr: 'रुग्ण',
    ta: 'நோயாளி',
    gu: 'દર્દી',
    kn: 'ರೋಗಿ',
    ml: 'രോഗി',
    pa: 'ਮਰੀਜ਼',
    or: 'ରୋଗୀ',
  },
};

const LANGUAGE_NAMES: Record<Language, string> = {
  en: 'English',
  hi: 'Hindi (हिंदी)',
  hinglish: 'Hinglish',
  bn: 'Bengali (বাংলা)',
  te: 'Telugu (తెలుగు)',
  mr: 'Marathi (मराठी)',
  ta: 'Tamil (தமிழ்)',
  gu: 'Gujarati (ગુજરાતી)',
  kn: 'Kannada (ಕನ್ನಡ)',
  ml: 'Malayalam (മലയാളം)',
  pa: 'Punjabi (ਪੰਜਾਬੀ)',
  or: 'Odia (ଓଡ଼ିଆ)',
};

/**
 * Translates post content to the target language.
 * Uses high-fidelity pre-compiled translations for mock posts,
 * and a rule-based word replacer for custom user posts.
 */
export function translatePost(postId: string, content: string, targetLanguage: Language): {
  translatedText: string;
  sourceLanguage: string;
} {
  // 1. Check if we have a pre-compiled translation for this mock post
  if (MOCK_POST_TRANSLATIONS[postId] && MOCK_POST_TRANSLATIONS[postId][targetLanguage]) {
    // Detect source: if postId starts with 'p' and is in mock, the original is English
    return {
      translatedText: MOCK_POST_TRANSLATIONS[postId][targetLanguage],
      sourceLanguage: 'English',
    };
  }

  // 2. Fallback rule-based translation for custom user posts
  // Split words, replace matching terms, and re-compile
  const words = content.split(/(\s+)/);
  const translatedWords = words.map((word) => {
    const cleanWord = word.toLowerCase().replace(/[^a-z0-9]/g, '');
    const suffix = word.substring(cleanWord.length);
    const prefix = word.substring(0, word.length - cleanWord.length - suffix.length);

    if (WORD_MAP[cleanWord] && WORD_MAP[cleanWord][targetLanguage]) {
      // Retain capitalization style roughly
      const replacement = WORD_MAP[cleanWord][targetLanguage];
      if (word[0] === word[0].toUpperCase()) {
        return prefix + replacement.charAt(0).toUpperCase() + replacement.slice(1) + suffix;
      }
      return prefix + replacement + suffix;
    }
    return word;
  });

  // Simple simulated localization suffix to make it clearly translated
  const finalText = translatedWords.join('');

  return {
    translatedText: finalText,
    sourceLanguage: 'Detected Language',
  };
}

export function getLanguageName(lang: Language): string {
  return LANGUAGE_NAMES[lang] || lang;
}

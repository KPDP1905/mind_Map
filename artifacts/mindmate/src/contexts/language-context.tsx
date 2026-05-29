import { createContext, useContext, useState } from "react";

export type Lang = "en" | "hi" | "es" | "fr" | "ta" | "te" | "bn" | "mr" | "gu" | "pa" | "ml" | "kn";

export const LANGUAGES: { code: Lang; label: string; nativeLabel: string; flag: string }[] = [
  { code: "en", label: "English", nativeLabel: "English", flag: "🇬🇧" },
  { code: "hi", label: "Hindi", nativeLabel: "हिंदी", flag: "🇮🇳" },
  { code: "ta", label: "Tamil", nativeLabel: "தமிழ்", flag: "🇮🇳" },
  { code: "te", label: "Telugu", nativeLabel: "తెలుగు", flag: "🇮🇳" },
  { code: "bn", label: "Bengali", nativeLabel: "বাংলা", flag: "🇮🇳" },
  { code: "mr", label: "Marathi", nativeLabel: "मराठी", flag: "🇮🇳" },
  { code: "gu", label: "Gujarati", nativeLabel: "ગુજરાતી", flag: "🇮🇳" },
  { code: "pa", label: "Punjabi", nativeLabel: "ਪੰਜਾਬੀ", flag: "🇮🇳" },
  { code: "ml", label: "Malayalam", nativeLabel: "മലയാളം", flag: "🇮🇳" },
  { code: "kn", label: "Kannada", nativeLabel: "ಕನ್ನಡ", flag: "🇮🇳" },
  { code: "es", label: "Spanish", nativeLabel: "Español", flag: "🇪🇸" },
  { code: "fr", label: "French", nativeLabel: "Français", flag: "🇫🇷" },
];

const translations: Record<Lang, Record<string, string>> = {
  en: {
    dashboard: "Dashboard", moodTracker: "Mood Tracker", aiChat: "Your Mind's Doctor",
    journal: "Journal", wellnessTools: "Wellness Tools", mindGames: "Mind Games",
    meditation: "Meditation", periodTracker: "Period Tracker", profile: "Profile",
    admin: "Admin", signOut: "Sign out", welcomeBack: "Welcome back",
    water: "Water Tracker", sleep: "Sleep Schedule", psychology: "Learn Psychology",
    dashboardSubtitle: "Here is a gentle overview of your recent wellbeing.",
    avgMood: "Avg Mood", streak: "Streak", wellnessScore: "Wellness Score",
    aiChats: "AI Chats", moodTrend: "Mood Trend", recentActivity: "Recent Activity",
    thisWeek: "This week", keepItUp: "Keep it up!", outOf100: "Out of 100",
    totalSessions: "Total sessions",
  },
  hi: {
    dashboard: "डैशबोर्ड", moodTracker: "मूड ट्रैकर", aiChat: "आपका मन का डॉक्टर",
    journal: "डायरी", wellnessTools: "वेलनेस टूल्स", mindGames: "माइंड गेम्स",
    meditation: "ध्यान", periodTracker: "पीरियड ट्रैकर", profile: "प्रोफाइल",
    admin: "एडमिन", signOut: "साइन आउट", welcomeBack: "वापस स्वागत है",
    water: "पानी ट्रैकर", sleep: "नींद शेड्यूल", psychology: "मनोविज्ञान सीखें",
    dashboardSubtitle: "आपकी हाल की भलाई का एक सौम्य अवलोकन।",
    avgMood: "औसत मूड", streak: "स्ट्रीक", wellnessScore: "वेलनेस स्कोर",
    aiChats: "AI चैट्स", moodTrend: "मूड ट्रेंड", recentActivity: "हाल की गतिविधि",
    thisWeek: "इस सप्ताह", keepItUp: "जारी रखें!", outOf100: "100 में से",
    totalSessions: "कुल सत्र",
  },
  ta: {
    dashboard: "டாஷ்போர்டு", moodTracker: "மனநிலை கண்காணிப்பு", aiChat: "உங்கள் மனித மருத்துவர்",
    journal: "பத்திரிகை", wellnessTools: "நலன் கருவிகள்", mindGames: "மன விளையாட்டுகள்",
    meditation: "தியானம்", periodTracker: "மாதவிடாய் கண்காணிப்பு", profile: "சுயவிவரம்",
    admin: "நிர்வாகி", signOut: "வெளியேறு", welcomeBack: "மீண்டும் வரவேற்கிறோம்",
    water: "தண்ணீர் கண்காணிப்பு", sleep: "தூக்க அட்டவணை", psychology: "உளவியல் கற்றுக்கொள்",
    dashboardSubtitle: "உங்கள் சமீபத்திய நலனின் மென்மையான கண்ணோட்டம்.",
    avgMood: "சராசரி மனநிலை", streak: "தொடர்ச்சி", wellnessScore: "நலன் மதிப்பெண்",
    aiChats: "AI அரட்டைகள்", moodTrend: "மனநிலை போக்கு", recentActivity: "சமீபத்திய செயல்பாடு",
    thisWeek: "இந்த வாரம்", keepItUp: "தொடர்ந்து செய்யுங்கள்!", outOf100: "100க்கு",
    totalSessions: "மொத்த அமர்வுகள்",
  },
  te: {
    dashboard: "డాష్‌బోర్డ్", moodTracker: "మూడ్ ట్రాకర్", aiChat: "మీ మైండ్ డాక్టర్",
    journal: "జర్నల్", wellnessTools: "వెల్‌నెస్ టూల్స్", mindGames: "మైండ్ గేమ్స్",
    meditation: "ధ్యానం", periodTracker: "పీరియడ్ ట్రాకర్", profile: "ప్రొఫైల్",
    admin: "అడ్మిన్", signOut: "సైన్ అవుట్", welcomeBack: "తిరిగి స్వాగతం",
    water: "నీరు ట్రాకర్", sleep: "నిద్ర షెడ్యూల్", psychology: "సైకాలజీ నేర్చుకోండి",
    dashboardSubtitle: "మీ ఇటీవలి ఆరోగ్యం యొక్క సున్నితమైన అవలోకనం.",
    avgMood: "సగటు మూడ్", streak: "స్ట్రీక్", wellnessScore: "వెల్‌నెస్ స్కోర్",
    aiChats: "AI చాట్స్", moodTrend: "మూడ్ ట్రెండ్", recentActivity: "ఇటీవలి కార్యకలాపం",
    thisWeek: "ఈ వారం", keepItUp: "కొనసాగించండి!", outOf100: "100 లో",
    totalSessions: "మొత్తం సెషన్లు",
  },
  bn: {
    dashboard: "ড্যাশবোর্ড", moodTracker: "মুড ট্র্যাকার", aiChat: "আপনার মনের ডাক্তার",
    journal: "জার্নাল", wellnessTools: "ওয়েলনেস টুলস", mindGames: "মাইন্ড গেমস",
    meditation: "ধ্যান", periodTracker: "পিরিয়ড ট্র্যাকার", profile: "প্রোফাইল",
    admin: "অ্যাডমিন", signOut: "সাইন আউট", welcomeBack: "আবার স্বাগতম",
    water: "পানি ট্র্যাকার", sleep: "ঘুমের সময়সূচী", psychology: "মনোবিজ্ঞান শিখুন",
    dashboardSubtitle: "আপনার সাম্প্রতিক সুস্থতার একটি মৃদু সংক্ষেপ।",
    avgMood: "গড় মুড", streak: "স্ট্রিক", wellnessScore: "ওয়েলনেস স্কোর",
    aiChats: "AI চ্যাটস", moodTrend: "মুড ট্রেন্ড", recentActivity: "সাম্প্রতিক কার্যক্রম",
    thisWeek: "এই সপ্তাহ", keepItUp: "চালিয়ে যান!", outOf100: "১০০ এর মধ্যে",
    totalSessions: "মোট সেশন",
  },
  mr: {
    dashboard: "डॅशबोर्ड", moodTracker: "मूड ट्रॅकर", aiChat: "तुमचा मनाचा डॉक्टर",
    journal: "जर्नल", wellnessTools: "वेलनेस टूल्स", mindGames: "माइंड गेम्स",
    meditation: "ध्यान", periodTracker: "पीरियड ट्रॅकर", profile: "प्रोफाइल",
    admin: "अ‍ॅडमिन", signOut: "साइन आउट", welcomeBack: "परत स्वागत",
    water: "पाणी ट्रॅकर", sleep: "झोप वेळापत्रक", psychology: "मानसशास्त्र शिका",
    dashboardSubtitle: "तुमच्या अलीकडील आरोग्याचे एक सौम्य विहंगावलोकन.",
    avgMood: "सरासरी मूड", streak: "स्ट्रीक", wellnessScore: "वेलनेस स्कोर",
    aiChats: "AI चॅट्स", moodTrend: "मूड ट्रेंड", recentActivity: "अलीकडील क्रियाकलाप",
    thisWeek: "या आठवड्यात", keepItUp: "चालू ठेवा!", outOf100: "100 पैकी",
    totalSessions: "एकूण सत्रे",
  },
  gu: {
    dashboard: "ડૅશબોર્ડ", moodTracker: "મૂડ ટ્રૅકર", aiChat: "તમારા મનના ડૉક્ટર",
    journal: "જર્નલ", wellnessTools: "વેલનેસ ટૂલ્સ", mindGames: "માઇન્ડ ગેમ્સ",
    meditation: "ધ્યાન", periodTracker: "પીરિયડ ટ્રૅકર", profile: "પ્રોફાઇલ",
    admin: "એડ્મિન", signOut: "સાઇન આઉટ", welcomeBack: "પાછા સ્વાગત",
    water: "પાણી ટ્રૅકર", sleep: "ઊંઘ શેડ્યૂલ", psychology: "મનોવિજ્ઞાન શીખો",
    dashboardSubtitle: "તમારી તાજેતરની ભલાઈની એક નરમ ઝાંખી.",
    avgMood: "સરેરાશ મૂડ", streak: "સ્ટ્રીક", wellnessScore: "વેલનેસ સ્કોર",
    aiChats: "AI ચૅટ્સ", moodTrend: "મૂડ ટ્રેન્ડ", recentActivity: "તાજેતરની પ્રવૃત્તિ",
    thisWeek: "આ અઠવાડિયે", keepItUp: "ચાલુ રાખો!", outOf100: "100 માંથી",
    totalSessions: "કુલ સત્રો",
  },
  pa: {
    dashboard: "ਡੈਸ਼ਬੋਰਡ", moodTracker: "ਮੂਡ ਟ੍ਰੈਕਰ", aiChat: "ਤੁਹਾਡਾ ਮਨ ਦਾ ਡਾਕਟਰ",
    journal: "ਜਰਨਲ", wellnessTools: "ਵੈਲਨੈੱਸ ਟੂਲਸ", mindGames: "ਮਾਇੰਡ ਗੇਮਸ",
    meditation: "ਧਿਆਨ", periodTracker: "ਪੀਰੀਅਡ ਟ੍ਰੈਕਰ", profile: "ਪ੍ਰੋਫਾਈਲ",
    admin: "ਐਡਮਿਨ", signOut: "ਸਾਈਨ ਆਊਟ", welcomeBack: "ਵਾਪਸ ਜੀ ਆਇਆਂ",
    water: "ਪਾਣੀ ਟ੍ਰੈਕਰ", sleep: "ਨੀਂਦ ਸ਼ੈਡਿਊਲ", psychology: "ਮਨੋਵਿਗਿਆਨ ਸਿੱਖੋ",
    dashboardSubtitle: "ਤੁਹਾਡੀ ਤਾਜ਼ੀ ਭਲਾਈ ਦਾ ਇੱਕ ਕੋਮਲ ਸੰਖੇਪ।",
    avgMood: "ਔਸਤ ਮੂਡ", streak: "ਸਟ੍ਰੀਕ", wellnessScore: "ਵੈਲਨੈੱਸ ਸਕੋਰ",
    aiChats: "AI ਚੈਟਸ", moodTrend: "ਮੂਡ ਟ੍ਰੈਂਡ", recentActivity: "ਤਾਜ਼ੀ ਗਤੀਵਿਧੀ",
    thisWeek: "ਇਸ ਹਫ਼ਤੇ", keepItUp: "ਜਾਰੀ ਰੱਖੋ!", outOf100: "100 ਵਿੱਚੋਂ",
    totalSessions: "ਕੁੱਲ ਸੈਸ਼ਨ",
  },
  ml: {
    dashboard: "ഡാഷ്‌ബോർഡ്", moodTracker: "മൂഡ് ട്രാക്കർ", aiChat: "നിങ്ങളുടെ മനസ്സിന്റെ ഡോക്ടർ",
    journal: "ജേർണൽ", wellnessTools: "വെൽനസ് ടൂൾസ്", mindGames: "മൈൻഡ് ഗെയിംസ്",
    meditation: "ധ്യാനം", periodTracker: "പീരിയഡ് ട്രാക്കർ", profile: "പ്രൊഫൈൽ",
    admin: "അഡ്മിൻ", signOut: "സൈൻ ഔട്ട്", welcomeBack: "തിരിച്ചു സ്വാഗതം",
    water: "വെള്ളം ട്രാക്കർ", sleep: "ഉറക്ക ഷെഡ്യൂൾ", psychology: "സൈക്കോളജി പഠിക്കൂ",
    dashboardSubtitle: "നിങ്ങളുടെ സമീപകാല ക്ഷേമത്തിന്റെ ഒരു മൃദു അവലോകനം.",
    avgMood: "ശരാശരി മൂഡ്", streak: "സ്ട്രീക്", wellnessScore: "വെൽനസ് സ്കോർ",
    aiChats: "AI ചാറ്റ്സ്", moodTrend: "മൂഡ് ട്രെൻഡ്", recentActivity: "സമീപകാല പ്രവർത്തനം",
    thisWeek: "ഈ ആഴ്ച", keepItUp: "തുടരൂ!", outOf100: "100 ൽ",
    totalSessions: "ആകെ സെഷനുകൾ",
  },
  kn: {
    dashboard: "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್", moodTracker: "ಮೂಡ್ ಟ್ರ್ಯಾಕರ್", aiChat: "ನಿಮ್ಮ ಮನಸ್ಸಿನ ವೈದ್ಯ",
    journal: "ಜರ್ನಲ್", wellnessTools: "ವೆಲ್ನೆಸ್ ಟೂಲ್ಸ್", mindGames: "ಮೈಂಡ್ ಗೇಮ್ಸ್",
    meditation: "ಧ್ಯಾನ", periodTracker: "ಪೀರಿಯಡ್ ಟ್ರ್ಯಾಕರ್", profile: "ಪ್ರೊಫೈಲ್",
    admin: "ಅಡ್ಮಿನ್", signOut: "ಸೈನ್ ಔಟ್", welcomeBack: "ಮರಳಿ ಸ್ವಾಗತ",
    water: "ನೀರು ಟ್ರ್ಯಾಕರ್", sleep: "ನಿದ್ರೆ ವೇಳಾಪಟ್ಟಿ", psychology: "ಮನೋವಿಜ್ಞಾನ ಕಲಿಯಿರಿ",
    dashboardSubtitle: "ನಿಮ್ಮ ಇತ್ತೀಚಿನ ಆರೋಗ್ಯದ ಮೃದು ಅವಲೋಕನ.",
    avgMood: "ಸರಾಸರಿ ಮೂಡ್", streak: "ಸ್ಟ್ರೀಕ್", wellnessScore: "ವೆಲ್ನೆಸ್ ಸ್ಕೋರ್",
    aiChats: "AI ಚಾಟ್ಸ್", moodTrend: "ಮೂಡ್ ಟ್ರೆಂಡ್", recentActivity: "ಇತ್ತೀಚಿನ ಚಟುವಟಿಕೆ",
    thisWeek: "ಈ ವಾರ", keepItUp: "ಮುಂದುವರಿಸಿ!", outOf100: "100 ರಲ್ಲಿ",
    totalSessions: "ಒಟ್ಟು ಸೆಷನ್‌ಗಳು",
  },
  es: {
    dashboard: "Panel", moodTracker: "Rastreador de Humor", aiChat: "Tu Doctor Mental",
    journal: "Diario", wellnessTools: "Herramientas de Bienestar", mindGames: "Juegos Mentales",
    meditation: "Meditación", periodTracker: "Rastreador Menstrual", profile: "Perfil",
    admin: "Admin", signOut: "Cerrar sesión", welcomeBack: "Bienvenido de nuevo",
    water: "Rastreador de Agua", sleep: "Horario de Sueño", psychology: "Aprender Psicología",
    dashboardSubtitle: "Un suave resumen de tu bienestar reciente.",
    avgMood: "Humor Promedio", streak: "Racha", wellnessScore: "Puntuación de Bienestar",
    aiChats: "Chats de IA", moodTrend: "Tendencia de Humor", recentActivity: "Actividad Reciente",
    thisWeek: "Esta semana", keepItUp: "¡Sigue así!", outOf100: "De 100",
    totalSessions: "Sesiones totales",
  },
  fr: {
    dashboard: "Tableau de bord", moodTracker: "Suivi d'humeur", aiChat: "Votre médecin mental",
    journal: "Journal", wellnessTools: "Outils de bien-être", mindGames: "Jeux mentaux",
    meditation: "Méditation", periodTracker: "Suivi menstruel", profile: "Profil",
    admin: "Admin", signOut: "Se déconnecter", welcomeBack: "Bienvenue à nouveau",
    water: "Suivi de l'eau", sleep: "Programme de sommeil", psychology: "Apprendre la psychologie",
    dashboardSubtitle: "Un aperçu doux de votre bien-être récent.",
    avgMood: "Humeur moyenne", streak: "Série", wellnessScore: "Score de bien-être",
    aiChats: "Chats IA", moodTrend: "Tendance d'humeur", recentActivity: "Activité récente",
    thisWeek: "Cette semaine", keepItUp: "Continuez!", outOf100: "Sur 100",
    totalSessions: "Total des séances",
  },
};

interface LangContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
}

const LangContext = createContext<LangContextValue>({
  lang: "en",
  setLang: () => {},
  t: (k) => k,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    try {
      return (localStorage.getItem("mm_lang") as Lang) || "en";
    } catch {
      return "en";
    }
  });

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem("mm_lang", l);
  };

  const t = (key: string): string => translations[lang]?.[key] ?? translations["en"][key] ?? key;

  return (
    <LangContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}

import { createContext, useContext, useState } from "react";

type Lang = "en" | "hi";

const translations: Record<Lang, Record<string, string>> = {
  en: {
    dashboard: "Dashboard",
    moodTracker: "Mood Tracker",
    aiChat: "Your Mind's Doctor",
    journal: "Journal",
    wellnessTools: "Wellness Tools",
    mindGames: "Mind Games",
    meditation: "Meditation",
    periodTracker: "Period Tracker",
    profile: "Profile",
    admin: "Admin",
    signOut: "Sign out",
    welcomeBack: "Welcome back",
    dashboardSubtitle: "Here is a gentle overview of your recent wellbeing.",
    avgMood: "Avg Mood",
    streak: "Streak",
    wellnessScore: "Wellness Score",
    aiChats: "AI Chats",
    moodTrend: "Mood Trend",
    recentActivity: "Recent Activity",
    thisWeek: "This week",
    keepItUp: "Keep it up!",
    outOf100: "Out of 100",
    totalSessions: "Total sessions",
  },
  hi: {
    dashboard: "डैशबोर्ड",
    moodTracker: "मूड ट्रैकर",
    aiChat: "आपका मन का डॉक्टर",
    journal: "डायरी",
    wellnessTools: "वेलनेस टूल्स",
    mindGames: "माइंड गेम्स",
    meditation: "ध्यान",
    periodTracker: "पीरियड ट्रैकर",
    profile: "प्रोफाइल",
    admin: "एडमिन",
    signOut: "साइन आउट",
    welcomeBack: "वापस स्वागत है",
    dashboardSubtitle: "आपकी हाल की भलाई का एक सौम्य अवलोकन।",
    avgMood: "औसत मूड",
    streak: "स्ट्रीक",
    wellnessScore: "वेलनेस स्कोर",
    aiChats: "AI चैट्स",
    moodTrend: "मूड ट्रेंड",
    recentActivity: "हाल की गतिविधि",
    thisWeek: "इस सप्ताह",
    keepItUp: "जारी रखें!",
    outOf100: "100 में से",
    totalSessions: "कुल सत्र",
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

  const t = (key: string): string => translations[lang][key] ?? translations["en"][key] ?? key;

  return (
    <LangContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}

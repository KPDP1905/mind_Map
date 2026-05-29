import { useState, useRef } from "react";
import { useAuth } from "@/contexts/auth-context";
import { usePageTheme } from "@/hooks/use-page-theme";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, LogOut, Settings, Bell, Shield, ChevronDown, ChevronUp, Download, Volume2, Play } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

type Section = "preferences" | "notifications" | "privacy" | null;

function useLocalStorage<T>(key: string, defaultValue: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : defaultValue;
    } catch {
      return defaultValue;
    }
  });
  const set = (v: T) => {
    setValue(v);
    localStorage.setItem(key, JSON.stringify(v));
  };
  return [value, set] as const;
}

const NOTIFICATION_SOUNDS = [
  { id: "gentle_chime",    label: "Gentle Chime",    emoji: "🔔", freqs: [523, 659, 784],      dur: 0.3, vol: 0.25, type: "sine" as OscillatorType },
  { id: "soft_bell",       label: "Soft Bell",        emoji: "🛎️", freqs: [880, 1108],          dur: 0.5, vol: 0.2,  type: "sine" as OscillatorType },
  { id: "meditation_bowl", label: "Meditation Bowl",  emoji: "🎵", freqs: [220, 330],           dur: 1.2, vol: 0.15, type: "sine" as OscillatorType },
  { id: "crystal_bell",    label: "Crystal Bell",     emoji: "✨", freqs: [1047, 1319, 1568],   dur: 0.25, vol: 0.2, type: "triangle" as OscillatorType },
  { id: "wind_chime",      label: "Wind Chime",       emoji: "🌬️", freqs: [622, 740, 880, 988], dur: 0.2,  vol: 0.2, type: "triangle" as OscillatorType },
  { id: "rain_drop",       label: "Rain Drop",        emoji: "💧", freqs: [1200, 900],          dur: 0.15, vol: 0.3, type: "sine" as OscillatorType },
  { id: "wooden_tap",      label: "Wooden Tap",       emoji: "🥁", freqs: [200, 160],           dur: 0.1,  vol: 0.35, type: "triangle" as OscillatorType },
  { id: "soft_ping",       label: "Soft Ping",        emoji: "📳", freqs: [1568],              dur: 0.4,  vol: 0.2,  type: "sine" as OscillatorType },
  { id: "deep_bell",       label: "Deep Bell",        emoji: "🔮", freqs: [110, 165],           dur: 1.0,  vol: 0.2,  type: "sine" as OscillatorType },
  { id: "ocean_ding",      label: "Ocean Ding",       emoji: "🌊", freqs: [392, 494, 587],      dur: 0.4,  vol: 0.15, type: "sine" as OscillatorType },
  { id: "forest_whistle",  label: "Forest Whistle",   emoji: "🌿", freqs: [740, 880, 1047],     dur: 0.2,  vol: 0.18, type: "triangle" as OscillatorType },
  { id: "morning_tone",    label: "Morning Tone",     emoji: "🌅", freqs: [440, 554, 659, 880], dur: 0.3,  vol: 0.2,  type: "sine" as OscillatorType },
];

function playNotificationSound(sound: typeof NOTIFICATION_SOUNDS[0]) {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const { freqs, dur, vol, type } = sound;
    freqs.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * dur * 0.6);
      gain.gain.setValueAtTime(vol, ctx.currentTime + i * dur * 0.6);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * dur * 0.6 + dur + 0.2);
      osc.start(ctx.currentTime + i * dur * 0.6);
      osc.stop(ctx.currentTime + i * dur * 0.6 + dur + 0.3);
    });
    setTimeout(() => ctx.close(), (freqs.length * dur * 0.6 + dur + 0.5) * 1000);
  } catch {}
}

export default function ProfilePage() {
  usePageTheme("linear-gradient(135deg, #faf8f5 0%, #f5f0e8 50%, #faf8f5 100%)");
  const { user, isLoaded, logout } = useAuth();
  const { toast } = useToast();
  const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

  const [openSection, setOpenSection] = useState<Section>(null);
  const [language, setLanguage] = useLocalStorage("mm_language", "en");
  const [timezone] = useLocalStorage("mm_timezone", Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [notifDailyReminder, setNotifDailyReminder] = useLocalStorage("mm_notif_daily", true);
  const [notifWeeklyReport, setNotifWeeklyReport] = useLocalStorage("mm_notif_weekly", true);
  const [notifAffirmations, setNotifAffirmations] = useLocalStorage("mm_notif_affirmations", true);
  const [notifTips, setNotifTips] = useLocalStorage("mm_notif_tips", false);
  const [notifSound, setNotifSound] = useLocalStorage("mm_notif_sound", "gentle_chime");
  const [playingId, setPlayingId] = useState<string | null>(null);

  const toggle = (section: Section) => setOpenSection(prev => prev === section ? null : section);

  const handleSignOut = async () => {
    await logout();
    window.location.href = BASE || "/";
  };

  const handlePreviewSound = (sound: typeof NOTIFICATION_SOUNDS[0]) => {
    setPlayingId(sound.id);
    playNotificationSound(sound);
    const totalDur = sound.freqs.length * sound.dur * 0.6 + sound.dur + 0.5;
    setTimeout(() => setPlayingId(null), totalDur * 1000);
  };

  const handleExportData = () => {
    const data = {
      exportedAt: new Date().toISOString(),
      user: { username: user?.username, displayName: user?.displayName },
      note: "Mood, journal, and wellness data can be exported from the API.",
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "calmora-data.json";
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Data exported", description: "Your profile data has been downloaded." });
  };

  if (!isLoaded || !user) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Profile</h1>
        <p className="text-muted-foreground mt-1 text-lg">Manage your account and preferences.</p>
      </div>

      {/* Profile card */}
      <Card className="rounded-3xl border-border/50 shadow-sm overflow-hidden">
        <CardContent className="p-8 flex flex-col md:flex-row items-center gap-8">
          <Avatar className="w-24 h-24 border-4 border-background shadow-md">
            <AvatarFallback className="bg-primary/10 text-primary text-2xl">
              {user.displayName?.charAt(0) || user.username?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
          
          <div className="text-center md:text-left flex-1">
            <h2 className="text-2xl font-bold text-foreground">{user.displayName}</h2>
            <p className="text-muted-foreground mt-1">@{user.username}</p>
            {user.role === "admin" && (
              <span className="inline-flex items-center gap-1 mt-2 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-3 py-0.5 text-xs font-semibold">
                <Shield className="w-3 h-3" /> Admin
              </span>
            )}
          </div>

          <Button variant="outline" className="rounded-full px-6" onClick={handleSignOut}>
            <LogOut className="w-4 h-4 mr-2" />
            Sign out
          </Button>
        </CardContent>
      </Card>

      {/* Account Settings */}
      <Card className="rounded-3xl border-border/50 shadow-sm overflow-hidden">
        <CardHeader>
          <CardTitle className="text-lg">Account Settings</CardTitle>
          <CardDescription>Manage your app preferences</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border/50">

            {/* General Preferences */}
            <div>
              <button
                onClick={() => toggle("preferences")}
                className="w-full p-6 flex items-center justify-between hover:bg-muted/30 transition-colors text-left"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Settings className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">General Preferences</h3>
                    <p className="text-sm text-muted-foreground">Language and timezone</p>
                  </div>
                </div>
                {openSection === "preferences" ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
              </button>

              <AnimatePresence>
                {openSection === "preferences" && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.22 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-6 space-y-5 bg-muted/10 border-t border-border/30">
                      <div className="pt-5 grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Language</Label>
                          <Select value={language} onValueChange={(v) => { setLanguage(v); toast({ title: "Language saved" }); }}>
                            <SelectTrigger className="rounded-xl">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="en">🇬🇧 English</SelectItem>
                              <SelectItem value="hi">🇮🇳 Hindi</SelectItem>
                              <SelectItem value="mr">🇮🇳 Marathi</SelectItem>
                              <SelectItem value="ta">🇮🇳 Tamil</SelectItem>
                              <SelectItem value="te">🇮🇳 Telugu</SelectItem>
                              <SelectItem value="bn">🇧🇩 Bengali</SelectItem>
                              <SelectItem value="gu">🇮🇳 Gujarati</SelectItem>
                              <SelectItem value="pa">🇮🇳 Punjabi</SelectItem>
                              <SelectItem value="ml">🇮🇳 Malayalam</SelectItem>
                              <SelectItem value="kn">🇮🇳 Kannada</SelectItem>
                              <SelectItem value="es">🇪🇸 Spanish</SelectItem>
                              <SelectItem value="fr">🇫🇷 French</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2 sm:col-span-2">
                          <Label className="text-sm font-medium">Timezone</Label>
                          <div className="flex items-center gap-2 px-3 py-2 bg-background rounded-xl border border-border/50 text-sm text-foreground">
                            {timezone}
                          </div>
                          <p className="text-xs text-muted-foreground">Detected from your browser automatically</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Notifications */}
            <div>
              <button
                onClick={() => toggle("notifications")}
                className="w-full p-6 flex items-center justify-between hover:bg-muted/30 transition-colors text-left"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                    <Bell className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">Notifications & Sounds</h3>
                    <p className="text-sm text-muted-foreground">Daily reminders, alerts, and notification tones</p>
                  </div>
                </div>
                {openSection === "notifications" ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
              </button>

              <AnimatePresence>
                {openSection === "notifications" && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.22 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-6 bg-muted/10 border-t border-border/30">
                      <div className="pt-5 space-y-4">
                        {[
                          { id: "daily", label: "Daily mood check-in reminder", desc: "Gentle nudge every morning to log your mood", value: notifDailyReminder, set: setNotifDailyReminder },
                          { id: "weekly", label: "Weekly wellness report", desc: "A summary of your week every Sunday", value: notifWeeklyReport, set: setNotifWeeklyReport },
                          { id: "affirmations", label: "Daily affirmation", desc: "Start each day with an inspiring affirmation", value: notifAffirmations, set: setNotifAffirmations },
                          { id: "tips", label: "Wellness tips", desc: "Occasional mental health tips and articles", value: notifTips, set: setNotifTips },
                        ].map(({ id, label, desc, value, set }) => (
                          <div key={id} className="flex items-center justify-between gap-4 p-4 bg-background rounded-2xl border border-border/50">
                            <div>
                              <p className="text-sm font-medium text-foreground">{label}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
                            </div>
                            <Switch
                              id={id}
                              checked={value}
                              onCheckedChange={(v) => { set(v); toast({ title: v ? "Notification enabled" : "Notification disabled" }); }}
                            />
                          </div>
                        ))}

                        {/* Notification Sound Picker */}
                        <div className="pt-2">
                          <div className="flex items-center gap-2 mb-3">
                            <Volume2 className="w-4 h-4 text-blue-500" />
                            <p className="text-sm font-semibold text-foreground">Notification Sound</p>
                            <span className="text-xs text-muted-foreground ml-auto">
                              {NOTIFICATION_SOUNDS.find(s => s.id === notifSound)?.emoji}{" "}
                              {NOTIFICATION_SOUNDS.find(s => s.id === notifSound)?.label}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {NOTIFICATION_SOUNDS.map(sound => {
                              const isSelected = notifSound === sound.id;
                              const isPlaying = playingId === sound.id;
                              return (
                                <button key={sound.id}
                                  onClick={() => {
                                    setNotifSound(sound.id);
                                    handlePreviewSound(sound);
                                    toast({ title: `Sound: ${sound.label}`, description: "Notification sound updated" });
                                  }}
                                  className={`flex items-center gap-2 p-3 rounded-2xl border text-left transition-all ${
                                    isSelected
                                      ? "bg-blue-50 dark:bg-blue-950/20 border-blue-300 dark:border-blue-700"
                                      : "bg-background border-border/50 hover:bg-muted/30"
                                  }`}
                                >
                                  <span className="text-base leading-none">{sound.emoji}</span>
                                  <span className={`text-xs font-medium flex-1 truncate ${isSelected ? "text-blue-700 dark:text-blue-300" : "text-foreground"}`}>
                                    {sound.label}
                                  </span>
                                  {isPlaying
                                    ? <span className="w-3.5 h-3.5 rounded-full bg-blue-400 animate-pulse flex-shrink-0" />
                                    : <Play className={`w-3 h-3 flex-shrink-0 ${isSelected ? "text-blue-500" : "text-muted-foreground/40"}`} />
                                  }
                                </button>
                              );
                            })}
                          </div>
                          <p className="text-xs text-muted-foreground mt-2 px-1">Click any sound to preview and select it.</p>
                        </div>

                        <p className="text-xs text-muted-foreground px-1">Preferences saved to your device.</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Privacy & Security */}
            <div>
              <button
                onClick={() => toggle("privacy")}
                className="w-full p-6 flex items-center justify-between hover:bg-muted/30 transition-colors text-left"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">Privacy & Security</h3>
                    <p className="text-sm text-muted-foreground">Data and security settings</p>
                  </div>
                </div>
                {openSection === "privacy" ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
              </button>

              <AnimatePresence>
                {openSection === "privacy" && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.22 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-6 bg-muted/10 border-t border-border/30">
                      <div className="pt-5 space-y-3">
                        <div className="p-4 bg-background rounded-2xl border border-border/50 space-y-1">
                          <p className="text-sm font-medium text-foreground">🔒 Your data is private</p>
                          <p className="text-xs text-muted-foreground">All your moods, journals, and chats are stored securely and are only visible to you.</p>
                        </div>
                        <button
                          onClick={handleExportData}
                          className="w-full flex items-center gap-3 p-4 bg-background rounded-2xl border border-border/50 hover:bg-muted/30 transition-colors text-left"
                        >
                          <Download className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium text-foreground">Export my data</p>
                            <p className="text-xs text-muted-foreground">Download a copy of your profile data as JSON</p>
                          </div>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>
        </CardContent>
      </Card>
    </div>
  );
}

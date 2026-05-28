import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, LogOut, Settings, Bell, Shield, ChevronDown, ChevronUp, Download } from "lucide-react";
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

export default function ProfilePage() {
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

  const toggle = (section: Section) => setOpenSection(prev => prev === section ? null : section);

  const handleSignOut = async () => {
    await logout();
    window.location.href = BASE || "/";
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
    a.download = "mindmitra-data.json";
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
                    <h3 className="font-medium text-foreground">Notifications</h3>
                    <p className="text-sm text-muted-foreground">Daily reminders and alerts</p>
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

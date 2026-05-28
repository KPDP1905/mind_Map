import { Link, useLocation } from "wouter";
import { useUser, useClerk } from "@clerk/react";
import { useEffect, useState } from "react";
import { 
  LayoutDashboard, 
  Smile, 
  MessageCircle, 
  BookOpen, 
  Sparkles, 
  User, 
  LogOut,
  Menu,
  Shield,
  Gamepad2,
  Moon,
  Sun,
  Wind,
  FlowerIcon,
  Languages
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useTheme } from "@/contexts/theme-context";
import { useLang } from "@/contexts/language-context";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { user } = useUser();
  const { signOut } = useClerk();
  const [isAdmin, setIsAdmin] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { lang, setLang, t } = useLang();

  useEffect(() => {
    fetch("/api/admin/me")
      .then((r) => r.json())
      .then((d) => { if (d.isAdmin) setIsAdmin(true); })
      .catch(() => {});
  }, []);

  const navItems = [
    { href: "/dashboard",       label: t("dashboard"),      icon: LayoutDashboard },
    { href: "/mood",             label: t("moodTracker"),    icon: Smile },
    { href: "/chat",             label: t("aiChat"),         icon: MessageCircle },
    { href: "/journal",          label: t("journal"),        icon: BookOpen },
    { href: "/wellness",         label: t("wellnessTools"),  icon: Sparkles },
    { href: "/meditation",       label: t("meditation"),     icon: Wind },
    { href: "/period-tracker",   label: t("periodTracker"),  icon: FlowerIcon },
    { href: "/games",            label: t("mindGames"),      icon: Gamepad2 },
    { href: "/profile",          label: t("profile"),        icon: User },
    ...(isAdmin ? [{ href: "/admin", label: t("admin"), icon: Shield }] : []),
  ];

  const handleSignOut = () => {
    signOut({ redirectUrl: import.meta.env.BASE_URL.replace(/\/$/, "") || "/" });
  };

  const SidebarContent = ({ onNavClick }: { onNavClick?: () => void }) => (
    <div className="flex flex-col h-full bg-sidebar border-r border-sidebar-border text-sidebar-foreground">
      <div className="p-6 flex items-center gap-2.5">
        <img src="/logo-transparent.png" alt="Mind Mitra" className="w-9 h-9 object-contain" />
        <span className="text-xl font-bold tracking-tight">Mind Mitra</span>
      </div>
      <nav className="flex-1 px-4 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location === item.href || location.startsWith(`${item.href}/`);
          return (
            <Link key={item.href} href={item.href} onClick={onNavClick}>
              <div className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-colors cursor-pointer ${
                item.href === "/admin"
                  ? isActive ? "bg-amber-100 text-amber-800 font-medium" : "hover:bg-amber-50 text-amber-700"
                  : item.href === "/period-tracker"
                  ? isActive ? "bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 font-medium" : "hover:bg-rose-50 dark:hover:bg-rose-950/20 text-muted-foreground"
                  : item.href === "/meditation"
                  ? isActive ? "bg-indigo-100 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-medium" : "hover:bg-indigo-50 dark:hover:bg-indigo-950/20 text-muted-foreground"
                  : isActive ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" : "hover:bg-sidebar-accent/50 text-muted-foreground"
              }`}>
                <item.icon className="w-5 h-5 flex-shrink-0" />
                <span className="truncate text-sm">{item.label}</span>
              </div>
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-sidebar-border mt-auto space-y-1">
        <div className="flex items-center gap-2 px-2 py-2">
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 justify-start gap-2 rounded-xl text-muted-foreground hover:text-foreground text-xs"
            onClick={toggleTheme}
          >
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            {theme === "dark" ? "Light Mode" : "Dark Mode"}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 justify-start gap-2 rounded-xl text-muted-foreground hover:text-foreground text-xs"
            onClick={() => setLang(lang === "en" ? "hi" : "en")}
          >
            <Languages className="w-4 h-4" />
            {lang === "en" ? "हिंदी" : "English"}
          </Button>
        </div>

        <div className="flex items-center gap-3 px-4 py-2">
          <div className="w-8 h-8 rounded-full bg-primary/10 overflow-hidden flex-shrink-0 flex items-center justify-center">
            {user?.imageUrl ? (
              <img src={user.imageUrl} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <User className="w-5 h-5 m-auto text-primary" />
            )}
          </div>
          <div className="truncate">
            <p className="text-sm font-medium truncate">{user?.firstName || 'User'}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.primaryEmailAddress?.emailAddress}</p>
          </div>
        </div>
        <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground" onClick={handleSignOut}>
          <LogOut className="w-5 h-5 mr-3" />
          {t("signOut")}
        </Button>
      </div>
    </div>
  );

  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <div className="flex min-h-screen app-bg text-foreground">
      <aside className="hidden md:flex w-64 flex-col fixed inset-y-0">
        <SidebarContent />
      </aside>

      <div className="flex-1 flex flex-col md:ml-64 min-w-0">
        <header className="md:hidden flex items-center justify-between p-4 border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <img src="/logo-transparent.png" alt="Mind Mitra" className="w-7 h-7 object-contain" />
            <span className="text-lg font-bold tracking-tight">Mind Mitra</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full">
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="w-6 h-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-64 border-r-0">
                <SidebarContent onNavClick={() => setSheetOpen(false)} />
              </SheetContent>
            </Sheet>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8 max-w-5xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}

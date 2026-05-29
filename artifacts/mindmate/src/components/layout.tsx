import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/auth-context";
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
  const { user, logout } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { lang, setLang, t } = useLang();

  const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

  useEffect(() => {
    fetch(`${BASE}/api/admin/me`, { credentials: "include" })
      .then((r) => r.json())
      .then((d) => { if (d.isAdmin) setIsAdmin(true); })
      .catch(() => {});
  }, [BASE]);

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

  const handleSignOut = async () => {
    await logout();
    window.location.href = BASE || "/";
  };

  const SidebarContent = ({ onNavClick }: { onNavClick?: () => void }) => (
    <div className="flex flex-col h-full text-sidebar-foreground"
      style={{ background: "linear-gradient(180deg, #fdf5f5 0%, #faf0f5 50%, #f5f0fa 100%)" }}>

      {/* Brand */}
      <div className="p-5 border-b border-rose-100/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 shadow-md"
            style={{ background: "linear-gradient(135deg, #c4788a 0%, #a05870 100%)" }}>
            <img src="/logo.png" alt="Calmora" className="w-full h-full object-contain p-1.5" />
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight font-serif-heading"
              style={{ fontFamily: "Georgia, serif", color: "#8b3a52" }}>
              Calmora
            </span>
            <p className="text-[10px] leading-tight" style={{ color: "#b07080" }}>
              Your Safe Space
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location === item.href || location.startsWith(`${item.href}/`);
          return (
            <Link key={item.href} href={item.href} onClick={onNavClick}>
              <div className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
                item.href === "/admin"
                  ? isActive
                    ? "bg-amber-100 text-amber-800 font-medium shadow-sm"
                    : "hover:bg-amber-50 text-amber-700"
                  : item.href === "/period-tracker"
                  ? isActive
                    ? "text-rose-700 font-medium shadow-sm"
                    : "hover:bg-rose-50/70 text-muted-foreground"
                  : item.href === "/meditation"
                  ? isActive
                    ? "text-purple-700 font-medium shadow-sm"
                    : "hover:bg-purple-50/70 text-muted-foreground"
                  : isActive
                    ? "font-medium shadow-sm"
                    : "hover:bg-rose-50/50 text-muted-foreground"
              }`}
                style={isActive && item.href !== "/admin" ? {
                  background: "linear-gradient(135deg, rgba(196,120,138,0.15), rgba(176,96,160,0.12))",
                  color: "#8b3a52",
                  border: "1px solid rgba(196,120,138,0.2)",
                } : {}}>
                <item.icon className="w-4.5 h-4.5 flex-shrink-0" style={{ width: "1.1rem", height: "1.1rem" }} />
                <span className="truncate text-sm">{item.label}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-rose-100/60 mt-auto space-y-1">
        <div className="flex items-center gap-2 px-1 py-1">
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 justify-start gap-2 rounded-xl text-muted-foreground hover:text-foreground text-xs hover:bg-rose-50/60"
            onClick={toggleTheme}
          >
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            {theme === "dark" ? "Light Mode" : "Dark Mode"}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 justify-start gap-2 rounded-xl text-muted-foreground hover:text-foreground text-xs hover:bg-rose-50/60"
            onClick={() => setLang(lang === "en" ? "hi" : "en")}
          >
            <Languages className="w-4 h-4" />
            {lang === "en" ? "हिंदी" : "English"}
          </Button>
        </div>

        <div className="flex items-center gap-3 px-3 py-2 rounded-xl"
          style={{ background: "rgba(196,120,138,0.08)" }}>
          <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center shadow-sm"
            style={{ background: "linear-gradient(135deg, #c4788a, #a05870)" }}>
            <User className="w-4 h-4 text-white" />
          </div>
          <div className="truncate">
            <p className="text-sm font-medium truncate" style={{ color: "#6b2a3a" }}>{user?.displayName || user?.username || "User"}</p>
            <p className="text-xs truncate" style={{ color: "#b07080" }}>@{user?.username}</p>
          </div>
        </div>

        <Button
          variant="ghost"
          className="w-full justify-start text-muted-foreground hover:text-rose-700 hover:bg-rose-50/60 rounded-xl text-sm"
          onClick={handleSignOut}
        >
          <LogOut className="w-4 h-4 mr-3" />
          {t("signOut")}
        </Button>
      </div>
    </div>
  );

  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <div className="flex min-h-screen app-bg text-foreground">
      <aside className="hidden md:flex w-64 flex-col fixed inset-y-0 shadow-lg"
        style={{ borderRight: "1px solid rgba(196,120,138,0.18)" }}>
        <SidebarContent />
      </aside>

      <div className="flex-1 flex flex-col md:ml-64 min-w-0">
        <header className="md:hidden flex items-center justify-between p-4 sticky top-0 z-10"
          style={{
            background: "rgba(253,245,245,0.88)",
            backdropFilter: "blur(16px)",
            borderBottom: "1px solid rgba(196,120,138,0.15)"
          }}>
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg overflow-hidden shadow-sm"
              style={{ background: "linear-gradient(135deg, #c4788a 0%, #a05870 100%)" }}>
              <img src="/logo.png" alt="Calmora" className="w-full h-full object-contain p-1" />
            </div>
            <div>
              <span className="text-base font-bold" style={{ fontFamily: "Georgia, serif", color: "#8b3a52" }}>
                Calmora
              </span>
            </div>
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

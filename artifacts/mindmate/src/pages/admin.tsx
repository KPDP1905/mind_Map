import { useAuth } from "@/contexts/auth-context";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { usePageTheme } from "@/hooks/use-page-theme";
import { Users, TrendingUp, Shield, Plus, Trash2, Eye, EyeOff, Megaphone, ExternalLink, Image } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

type AdminStats = { totalUsers: number; newThisWeek: number; newThisMonth: number; activeThisWeek: number };

interface Ad {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  linkUrl: string;
  company: string;
  active: boolean;
  createdAt: string;
  clicks: number;
}

function useAds() {
  const [ads, setAds] = useState<Ad[]>(() => {
    try { return JSON.parse(localStorage.getItem("calmora_ads") || "[]"); } catch { return []; }
  });
  const save = (next: Ad[]) => { setAds(next); localStorage.setItem("calmora_ads", JSON.stringify(next)); };
  const add = (ad: Omit<Ad, "id" | "createdAt" | "clicks">) => {
    save([...ads, { ...ad, id: Date.now().toString(), createdAt: new Date().toISOString(), clicks: 0 }]);
  };
  const remove = (id: string) => save(ads.filter(a => a.id !== id));
  const toggle = (id: string) => save(ads.map(a => a.id === id ? { ...a, active: !a.active } : a));
  return { ads, add, remove, toggle };
}

export default function AdminPage() {
  usePageTheme("linear-gradient(135deg, #fdfaf7 0%, #faf5f0 40%, #f8f5fd 70%, #fdf8f5 100%)");
  const { user } = useAuth();
  const { toast } = useToast();
  const { ads, add, remove, toggle } = useAds();

  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [tab, setTab] = useState<"overview" | "ads">("overview");

  const [newAd, setNewAd] = useState({
    title: "", description: "", imageUrl: "", linkUrl: "", company: "", active: true,
  });
  const [showAdForm, setShowAdForm] = useState(false);

  useEffect(() => {
    fetch(`${BASE}/api/admin/me`, { credentials: "include" })
      .then(r => r.json())
      .then(d => {
        setIsAdmin(!!d.isAdmin);
        if (d.isAdmin) {
          fetch(`${BASE}/api/admin/stats`, { credentials: "include" })
            .then(r => r.json())
            .then(setStats)
            .catch(() => {});
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleAddAd = () => {
    if (!newAd.title.trim() || !newAd.company.trim() || !newAd.linkUrl.trim()) {
      toast({ title: "Please fill in title, company, and link URL", variant: "destructive" });
      return;
    }
    add(newAd);
    setNewAd({ title: "", description: "", imageUrl: "", linkUrl: "", company: "", active: true });
    setShowAdForm(false);
    toast({ title: "✅ Advertisement added!", description: "It will appear in the app for users." });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64 rounded-xl" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="max-w-lg mx-auto animate-in fade-in duration-500">
        <Card className="rounded-3xl border-amber-200 bg-amber-50 shadow-sm text-center p-8 space-y-4">
          <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto">
            <Shield className="w-8 h-8 text-amber-600" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Admin Access Required</h1>
          <p className="text-muted-foreground">You don't have admin access. Only the configured admin can view this page.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3" style={{ fontFamily: "Georgia, serif" }}>
            <Shield className="w-7 h-7 text-primary" />
            Admin Panel
          </h1>
          <p className="text-muted-foreground mt-1">Manage Calmora users and advertisements.</p>
        </div>
        <div className="text-sm text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-full">
          👋 {user?.displayName || user?.username}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-muted/30 rounded-2xl w-fit">
        {(["overview", "ads"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-xl text-sm font-medium transition-all capitalize ${
              tab === t ? "bg-white shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}>
            {t === "overview" ? "📊 Overview" : "📢 Advertisements"}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
          {tab === "overview" && (
            <div className="space-y-6">
              {stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: "Total Users", value: stats.totalUsers, icon: Users, color: "#3b82f6" },
                    { label: "New This Week", value: stats.newThisWeek, icon: TrendingUp, color: "#10b981" },
                    { label: "New This Month", value: stats.newThisMonth, icon: Users, color: "#8b5cf6" },
                    { label: "Active This Week", value: stats.activeThisWeek, icon: TrendingUp, color: "#f59e0b" },
                  ].map(({ label, value, icon: Icon, color }) => (
                    <Card key={label} className="rounded-2xl border-border/50 shadow-sm">
                      <CardContent className="p-5">
                        <Icon className="w-5 h-5 mb-3" style={{ color }} />
                        <p className="text-3xl font-bold text-foreground">{(value || 0).toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground mt-1">{label}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              <Card className="rounded-3xl border-border/50 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Megaphone className="w-5 h-5 text-primary" />
                    Active Ads Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="p-4 rounded-2xl bg-muted/30">
                      <p className="text-2xl font-bold text-foreground">{ads.length}</p>
                      <p className="text-xs text-muted-foreground">Total Ads</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-green-50">
                      <p className="text-2xl font-bold text-green-600">{ads.filter(a => a.active).length}</p>
                      <p className="text-xs text-muted-foreground">Active</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-muted/30">
                      <p className="text-2xl font-bold text-foreground">{ads.reduce((s, a) => s + a.clicks, 0)}</p>
                      <p className="text-xs text-muted-foreground">Total Clicks</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {tab === "ads" && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-foreground">Advertisements</h2>
                  <p className="text-sm text-muted-foreground mt-0.5">Manage company ads shown inside Calmora.</p>
                </div>
                <Button onClick={() => setShowAdForm(true)} className="rounded-full gap-2">
                  <Plus className="w-4 h-4" /> Add New Ad
                </Button>
              </div>

              {/* Add Ad Form */}
              <AnimatePresence>
                {showAdForm && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                    <Card className="rounded-3xl border-primary/20 shadow-md">
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          <Megaphone className="w-4 h-4 text-primary" /> New Advertisement
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs font-medium text-muted-foreground mb-1 block">Company Name *</label>
                            <Input placeholder="e.g. Yoga Studio, Healthy Foods Co." value={newAd.company}
                              onChange={e => setNewAd(a => ({ ...a, company: e.target.value }))} className="rounded-xl" />
                          </div>
                          <div>
                            <label className="text-xs font-medium text-muted-foreground mb-1 block">Ad Title *</label>
                            <Input placeholder="e.g. Try our 14-day free trial!" value={newAd.title}
                              onChange={e => setNewAd(a => ({ ...a, title: e.target.value }))} className="rounded-xl" />
                          </div>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-muted-foreground mb-1 block">Description</label>
                          <Textarea placeholder="Short description of the offer..." value={newAd.description}
                            onChange={e => setNewAd(a => ({ ...a, description: e.target.value }))}
                            className="rounded-xl resize-none" rows={2} />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs font-medium text-muted-foreground mb-1 block">Image URL (optional)</label>
                            <Input placeholder="https://..." value={newAd.imageUrl}
                              onChange={e => setNewAd(a => ({ ...a, imageUrl: e.target.value }))} className="rounded-xl" />
                          </div>
                          <div>
                            <label className="text-xs font-medium text-muted-foreground mb-1 block">Link URL *</label>
                            <Input placeholder="https://yourcompany.com" value={newAd.linkUrl}
                              onChange={e => setNewAd(a => ({ ...a, linkUrl: e.target.value }))} className="rounded-xl" />
                          </div>
                        </div>
                        <div className="flex gap-2 pt-2">
                          <Button onClick={handleAddAd} className="rounded-full flex-1">Save Ad</Button>
                          <Button variant="ghost" onClick={() => setShowAdForm(false)} className="rounded-full flex-1">Cancel</Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Ads List */}
              {ads.length === 0 ? (
                <div className="text-center py-16 border border-dashed rounded-3xl bg-muted/5">
                  <Megaphone className="w-10 h-10 mx-auto text-muted-foreground/30 mb-3" />
                  <p className="text-muted-foreground font-medium">No advertisements yet</p>
                  <p className="text-sm text-muted-foreground/70 mt-1">Add your first ad to start earning from Calmora.</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {ads.map((ad) => (
                    <Card key={ad.id} className={`rounded-2xl border-border/50 shadow-sm transition-all ${!ad.active ? "opacity-60" : ""}`}>
                      <CardContent className="p-5 flex items-start gap-4">
                        {ad.imageUrl ? (
                          <img src={ad.imageUrl} alt={ad.title}
                            className="w-16 h-16 rounded-xl object-cover flex-shrink-0 border border-border/50" />
                        ) : (
                          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center flex-shrink-0">
                            <Image className="w-6 h-6 text-muted-foreground" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold text-foreground truncate">{ad.title}</p>
                            <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 font-medium ${
                              ad.active ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"
                            }`}>
                              {ad.active ? "Active" : "Paused"}
                            </span>
                          </div>
                          <p className="text-xs text-primary font-medium">{ad.company}</p>
                          {ad.description && <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{ad.description}</p>}
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <span>{ad.clicks} clicks</span>
                            <a href={ad.linkUrl} target="_blank" rel="noopener noreferrer"
                              className="flex items-center gap-1 text-blue-500 hover:underline">
                              <ExternalLink className="w-3 h-3" /> View link
                            </a>
                          </div>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <Button variant="ghost" size="icon" className="rounded-xl w-9 h-9" onClick={() => toggle(ad.id)}>
                            {ad.active ? <EyeOff className="w-4 h-4 text-muted-foreground" /> : <Eye className="w-4 h-4 text-muted-foreground" />}
                          </Button>
                          <Button variant="ghost" size="icon" className="rounded-xl w-9 h-9 hover:bg-red-50 hover:text-red-600"
                            onClick={() => { remove(ad.id); toast({ title: "Ad removed." }); }}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

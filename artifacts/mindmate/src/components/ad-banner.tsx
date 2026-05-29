import { useState, useEffect } from "react";
import { X, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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

function loadAds(): Ad[] {
  try { return JSON.parse(localStorage.getItem("calmora_ads") || "[]"); } catch { return []; }
}

function trackClick(id: string) {
  try {
    const ads: Ad[] = JSON.parse(localStorage.getItem("calmora_ads") || "[]");
    const updated = ads.map(a => a.id === id ? { ...a, clicks: a.clicks + 1 } : a);
    localStorage.setItem("calmora_ads", JSON.stringify(updated));
  } catch {}
}

interface AdBannerProps {
  placement?: "top" | "bottom" | "inline";
  className?: string;
}

export function AdBanner({ placement = "inline", className = "" }: AdBannerProps) {
  const [ads] = useState<Ad[]>(() => loadAds().filter(a => a.active));
  const [index, setIndex] = useState(0);
  const [dismissed, setDismissed] = useState<Set<string>>(() => {
    try { return new Set(JSON.parse(sessionStorage.getItem("calmora_dismissed_ads") || "[]")); } catch { return new Set(); }
  });

  const visibleAds = ads.filter(a => !dismissed.has(a.id));

  useEffect(() => {
    if (visibleAds.length <= 1) return;
    const t = setInterval(() => setIndex(i => (i + 1) % visibleAds.length), 8000);
    return () => clearInterval(t);
  }, [visibleAds.length]);

  const dismiss = (id: string) => {
    const next = new Set(dismissed);
    next.add(id);
    setDismissed(next);
    sessionStorage.setItem("calmora_dismissed_ads", JSON.stringify([...next]));
    if (index >= visibleAds.length - 1) setIndex(0);
  };

  if (visibleAds.length === 0) return null;

  const ad = visibleAds[Math.min(index, visibleAds.length - 1)];
  if (!ad) return null;

  return (
    <AnimatePresence mode="wait">
      <motion.div key={ad.id}
        initial={{ opacity: 0, y: placement === "top" ? -8 : 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className={`relative rounded-2xl border border-border/40 bg-gradient-to-r from-secondary/10 to-primary/5 overflow-hidden ${className}`}>
        <div className="flex items-center gap-4 p-3 pr-10">
          {ad.imageUrl && (
            <img src={ad.imageUrl} alt={ad.company}
              className="w-12 h-12 rounded-xl object-cover flex-shrink-0 border border-border/30"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground/60 bg-muted/40 px-2 py-0.5 rounded-full">
                Sponsored
              </span>
              <span className="text-xs font-semibold text-muted-foreground">{ad.company}</span>
            </div>
            <p className="text-sm font-semibold text-foreground truncate">{ad.title}</p>
            {ad.description && (
              <p className="text-xs text-muted-foreground truncate mt-0.5">{ad.description}</p>
            )}
          </div>
          {ad.linkUrl && (
            <a href={ad.linkUrl} target="_blank" rel="noopener noreferrer"
              onClick={() => trackClick(ad.id)}
              className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-full text-xs font-medium hover:bg-primary/90 transition-colors">
              Visit <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
        <button onClick={() => dismiss(ad.id)}
          className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
          <X className="w-3.5 h-3.5" />
        </button>
        {visibleAds.length > 1 && (
          <div className="flex justify-center gap-1 pb-2">
            {visibleAds.map((_, i) => (
              <button key={i} onClick={() => setIndex(i)}
                className={`w-1.5 h-1.5 rounded-full transition-all ${i === index ? "bg-primary" : "bg-muted-foreground/30"}`} />
            ))}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

---
name: Calmora branding
description: App name, logo, theme, and per-page background system
---

App was rebranded from "Mind Mitra" to "Calmora – Your Safe Space for Mental Wellness".

**Logo**: `artifacts/mindmate/public/logo.png` (brain+sunflower, pink background).

**Per-page backgrounds**: `artifacts/mindmate/src/hooks/use-page-theme.ts` — call `usePageTheme("gradient...")` inside any page component; it sets `--page-bg` CSS var which `.app-bg` in `index.css` reads.

**Why**: Each module has its own calming background (beige dashboard, sunset mood, lavender meditation, etc.) without touching layout.tsx.

**How to apply**: Import `usePageTheme` and call it at the top of any page component with the desired CSS gradient string.

**Splash screen**: `artifacts/mindmate/src/components/splash.tsx` — shown once per session (sessionStorage flag `calmora_splash_seen`).

**Color palette**: Warm rose primary (#c4788a / #a05870), serif headings (Georgia), soft shadows.

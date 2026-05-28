import { Switch, Route, useLocation, Redirect, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect, useRef } from "react";
import { ClerkProvider, SignIn, SignUp, Show, useClerk } from "@clerk/react";
import { publishableKeyFromHost } from "@clerk/react/internal";
import { shadcn } from "@clerk/themes";
import { ErrorBoundary } from "@/components/error-boundary";

import LandingPage from "./pages/landing";
import DashboardPage from "./pages/dashboard";
import AppLayout from "./components/layout";
import MoodPage from "./pages/mood";
import ChatPage from "./pages/chat";
import JournalPage from "./pages/journal";
import WellnessPage from "./pages/wellness";
import ProfilePage from "./pages/profile";
import AdminPage from "./pages/admin";
import GamesPage from "./pages/games";
import MeditationPage from "./pages/meditation";
import PeriodTrackerPage from "./pages/period-tracker";

const queryClient = new QueryClient();

const clerkPubKey = publishableKeyFromHost(
  window.location.hostname,
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY
);
const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;
const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || "/"
    : path;
}

if (!clerkPubKey) {
  throw new Error("Missing VITE_CLERK_PUBLISHABLE_KEY in .env file");
}

const clerkAppearance = {
  theme: shadcn,
  cssLayerName: "clerk",
  options: {
    logoPlacement: "inside" as const,
    logoLinkUrl: basePath || "/",
    logoImageUrl: `${window.location.origin}${basePath}/logo.svg`,
  },
  variables: {
    colorPrimary: "hsl(221, 68%, 70%)",
    colorForeground: "hsl(230, 25%, 18%)",
    colorMutedForeground: "hsl(230, 15%, 45%)",
    colorDanger: "hsl(350, 80%, 65%)",
    colorBackground: "hsl(0, 0%, 100%)",
    colorInput: "hsl(0, 0%, 100%)",
    colorInputForeground: "hsl(230, 25%, 18%)",
    colorNeutral: "hsl(240, 20%, 90%)",
    fontFamily: "'Outfit', 'Inter', sans-serif",
    borderRadius: "1rem",
  },
  elements: {
    rootBox: "w-full flex justify-center",
    cardBox: "bg-white rounded-2xl w-[440px] max-w-full overflow-hidden shadow-lg border border-border",
    card: "!shadow-none !border-0 !bg-transparent !rounded-none",
    footer: "!shadow-none !border-0 !bg-transparent !rounded-none",
    headerTitle: "text-2xl font-bold text-foreground",
    headerSubtitle: "text-muted-foreground",
    socialButtonsBlockButtonText: "font-medium",
    formFieldLabel: "text-foreground font-medium",
    footerActionLink: "text-primary hover:text-primary/80 font-medium",
    footerActionText: "text-muted-foreground",
    dividerText: "text-muted-foreground",
    identityPreviewEditButton: "text-primary hover:text-primary/80",
    formFieldSuccessText: "text-primary",
    alertText: "text-destructive font-medium",
    logoBox: "h-12 w-12 mx-auto mb-4",
    logoImage: "w-full h-full object-contain",
    socialButtonsBlockButton: "border border-border hover:bg-muted/50 transition-colors",
    formButtonPrimary: "bg-primary hover:bg-primary/90 text-primary-foreground transition-colors",
    formFieldInput: "border-border focus:ring-primary focus:border-primary",
    footerAction: "bg-muted/30 py-4",
    dividerLine: "bg-border",
    alert: "bg-destructive/10 border border-destructive/20 text-destructive",
    otpCodeFieldInput: "border-border focus:ring-primary focus:border-primary text-foreground",
    formFieldRow: "mb-4",
    main: "p-8",
  },
};

function SignInPage() {
  const apiBase = basePath ? `${basePath}/api` : "/api";

  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-background px-4 gap-4">
      <SignIn routing="path" path={`${basePath}/sign-in`} signUpUrl={`${basePath}/sign-up`} />
      <div className="w-[440px] max-w-full rounded-2xl border border-dashed border-amber-300 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-700 px-5 py-4 flex flex-col gap-2">
        <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wide">🛠 Dev Only — Quick Login</p>
        <p className="text-sm text-amber-800 dark:text-amber-300">OTP verification bypass karne ke liye neeche click karo:</p>
        <a
          href={`${apiBase}/dev/quick-login`}
          className="inline-block rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold px-4 py-2 text-center transition-colors"
        >
          ⚡ Quick Login (No OTP)
        </a>
        <p className="text-xs text-amber-600 dark:text-amber-500">Email: testuser@mindmitra.com</p>
      </div>
    </div>
  );
}

function SignUpPage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background px-4">
      <SignUp routing="path" path={`${basePath}/sign-up`} signInUrl={`${basePath}/sign-in`} />
    </div>
  );
}

function ClerkQueryClientCacheInvalidator() {
  const { addListener } = useClerk();
  const queryClient = useQueryClient();
  const prevUserIdRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = addListener(({ user }) => {
      const userId = user?.id ?? null;
      if (
        prevUserIdRef.current !== undefined &&
        prevUserIdRef.current !== userId
      ) {
        queryClient.clear();
      }
      prevUserIdRef.current = userId;
    });
    return unsubscribe;
  }, [addListener, queryClient]);

  return null;
}

function HomeRedirect() {
  return (
    <>
      <Show when="signed-in">
        <Redirect to="/dashboard" />
      </Show>
      <Show when="signed-out">
        <LandingPage />
      </Show>
    </>
  );
}

function AuthenticatedRoute({ component: Component }: { component: React.ComponentType }) {
  return (
    <>
      <Show when="signed-in">
        <AppLayout>
          <Component />
        </AppLayout>
      </Show>
      <Show when="signed-out">
        <Redirect to="/" />
      </Show>
    </>
  );
}


function Router() {
  const [, setLocation] = useLocation();

  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl}
      appearance={clerkAppearance}
      signInUrl={`${basePath}/sign-in`}
      signUpUrl={`${basePath}/sign-up`}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <QueryClientProvider client={queryClient}>
        <ClerkQueryClientCacheInvalidator />
        <TooltipProvider>
          <Switch>
            <Route path="/" component={HomeRedirect} />
            <Route path="/sign-in/*?" component={SignInPage} />
            <Route path="/sign-up/*?" component={SignUpPage} />
            
            <Route path="/dashboard"><AuthenticatedRoute component={DashboardPage} /></Route>
            <Route path="/mood"><AuthenticatedRoute component={MoodPage} /></Route>
            <Route path="/chat"><AuthenticatedRoute component={ChatPage} /></Route>
            <Route path="/chat/:id"><AuthenticatedRoute component={ChatPage} /></Route>
            <Route path="/journal"><AuthenticatedRoute component={JournalPage} /></Route>
            <Route path="/wellness"><AuthenticatedRoute component={WellnessPage} /></Route>
            <Route path="/meditation"><AuthenticatedRoute component={MeditationPage} /></Route>
            <Route path="/period-tracker"><AuthenticatedRoute component={PeriodTrackerPage} /></Route>
            <Route path="/profile"><AuthenticatedRoute component={ProfilePage} /></Route>
            <Route path="/games"><AuthenticatedRoute component={GamesPage} /></Route>
            <Route path="/admin"><AuthenticatedRoute component={AdminPage} /></Route>

            <Route>
              <div className="flex h-screen items-center justify-center bg-background">
                <div className="text-center">
                  <h1 className="text-4xl font-bold text-foreground">404</h1>
                  <p className="mt-2 text-muted-foreground">Page not found</p>
                </div>
              </div>
            </Route>
          </Switch>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <WouterRouter base={basePath}>
        <Router />
      </WouterRouter>
    </ErrorBoundary>
  );
}

export default App;

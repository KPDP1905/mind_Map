import { Switch, Route, Redirect, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ErrorBoundary } from "@/components/error-boundary";
import { AuthProvider, useAuth } from "@/contexts/auth-context";
import { useState, useCallback } from "react";
import SplashScreen from "@/components/splash";

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
import LoginPage from "./pages/login";
import WaterPage from "./pages/water";
import SleepPage from "./pages/sleep";
import PsychologyPage from "./pages/psychology";

const queryClient = new QueryClient();
const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

function AuthenticatedRoute({ component: Component }: { component: React.ComponentType }) {
  const { isLoaded, isSignedIn } = useAuth();
  if (!isLoaded) return null;
  if (!isSignedIn) return <Redirect to="/login" />;
  return (
    <AppLayout>
      <Component />
    </AppLayout>
  );
}

function HomeRedirect() {
  const { isLoaded, isSignedIn } = useAuth();
  if (!isLoaded) return null;
  return isSignedIn ? <Redirect to="/dashboard" /> : <LandingPage />;
}

function AppRoutes() {
  return (
    <Switch>
      <Route path="/" component={HomeRedirect} />
      <Route path="/login" component={LoginPage} />

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
      <Route path="/water"><AuthenticatedRoute component={WaterPage} /></Route>
      <Route path="/sleep"><AuthenticatedRoute component={SleepPage} /></Route>
      <Route path="/psychology"><AuthenticatedRoute component={PsychologyPage} /></Route>

      <Route>
        <div className="flex h-screen items-center justify-center bg-background">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-foreground">404</h1>
            <p className="mt-2 text-muted-foreground">Page not found</p>
          </div>
        </div>
      </Route>
    </Switch>
  );
}

function App() {
  const [splashDone, setSplashDone] = useState(() => {
    return sessionStorage.getItem("calmora_splash_seen") === "1";
  });

  const handleSplashDone = useCallback(() => {
    sessionStorage.setItem("calmora_splash_seen", "1");
    setSplashDone(true);
  }, []);

  return (
    <ErrorBoundary>
      {!splashDone && <SplashScreen onDone={handleSplashDone} />}
      <WouterRouter base={basePath}>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <TooltipProvider>
              <AppRoutes />
              <Toaster />
            </TooltipProvider>
          </AuthProvider>
        </QueryClientProvider>
      </WouterRouter>
    </ErrorBoundary>
  );
}

export default App;

import { useEffect, useRef } from "react";
import { useSignIn } from "@clerk/react";
import { useLocation } from "wouter";

export default function AutoLoginPage() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const [, setLocation] = useLocation();
  const attempted = useRef(false);

  useEffect(() => {
    if (!isLoaded || attempted.current) return;

    const params = new URLSearchParams(window.location.search);
    const ticket = params.get("__clerk_ticket");

    if (!ticket) {
      setLocation("/sign-in");
      return;
    }

    attempted.current = true;

    signIn
      .create({ strategy: "ticket", ticket })
      .then(async (result) => {
        if (result.status === "complete") {
          await setActive({ session: result.createdSessionId });
          setLocation("/dashboard");
        } else {
          console.error("Unexpected sign-in status:", result.status);
          setLocation("/sign-in");
        }
      })
      .catch((err) => {
        console.error("Auto-login failed:", err);
        setLocation("/sign-in");
      });
  }, [isLoaded, signIn, setActive, setLocation]);

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-muted-foreground text-sm">Logging you in...</p>
      </div>
    </div>
  );
}

import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  isClerkError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, isClerkError: false };
  }

  static getDerivedStateFromError(error: unknown): State {
    const msg = error instanceof Error ? error.message : String(error);
    const isClerkError =
      msg.includes("failed_to_load_clerk_js") ||
      msg.includes("Failed to load Clerk JS") ||
      msg.includes("ClerkRuntimeError");
    return { hasError: true, isClerkError };
  }

  componentDidCatch(error: unknown) {
    console.error("App error caught by boundary:", error);
  }

  render() {
    if (this.state.hasError) {
      if (this.state.isClerkError) {
        return (
          <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[hsl(240,30%,97%)] px-4 text-center">
            <div className="text-5xl">🧠</div>
            <h1 className="text-2xl font-bold text-[hsl(230,25%,18%)]">
              MindMate AI
            </h1>
            <p className="max-w-sm text-[hsl(230,15%,45%)]">
              Having trouble connecting to the auth service. Please{" "}
              <button
                className="font-medium text-[hsl(221,68%,70%)] underline underline-offset-2"
                onClick={() => window.location.reload()}
              >
                reload the page
              </button>{" "}
              to try again.
            </p>
          </div>
        );
      }

      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[hsl(240,30%,97%)] px-4 text-center">
          <p className="text-[hsl(230,15%,45%)]">
            Something went wrong.{" "}
            <button
              className="font-medium text-[hsl(221,68%,70%)] underline underline-offset-2"
              onClick={() => window.location.reload()}
            >
              Reload
            </button>
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}

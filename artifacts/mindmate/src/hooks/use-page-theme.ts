import { useEffect } from "react";

export function usePageTheme(bg: string) {
  useEffect(() => {
    document.documentElement.style.setProperty("--page-bg", bg);
    return () => {
      document.documentElement.style.removeProperty("--page-bg");
    };
  }, [bg]);
}

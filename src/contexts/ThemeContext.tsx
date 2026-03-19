import { ThemeProvider as NextThemesProvider } from "next-themes";
import { ReactNode } from "react";

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  return (
    <NextThemesProvider 
      attribute="class" 
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
      storageKey="veil-theme"
    >
      {children}
    </NextThemesProvider>
  );
};

// Re-export useTheme from next-themes for consistency
export { useTheme } from "next-themes";
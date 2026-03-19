import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";

export function FloatingThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      onClick={toggleTheme}
      className="fixed bottom-6 left-6 z-50 h-10 w-10 rounded-full bg-card border border-border shadow-lg flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
      aria-label="Toggle theme"
    >
      {resolvedTheme === "dark" ? (
        <Moon className="h-4 w-4" />
      ) : (
        <Sun className="h-4 w-4" />
      )}
    </motion.button>
  );
}

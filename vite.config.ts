import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// Plugin to make CSS non-render-blocking for faster FCP
function asyncCssPlugin(): Plugin {
  return {
    name: 'async-css',
    enforce: 'post',
    transformIndexHtml(html) {
      // Convert <link rel="stylesheet" href="...assets/index-*.css"> to async loading
      // This allows the inline static hero to paint immediately (faster FCP)
      return html.replace(
        /<link rel="stylesheet" crossorigin href="(\/assets\/index-[^"]+\.css)">/g,
        `<link rel="stylesheet" href="$1" media="print" onload="this.media='all'">
    <noscript><link rel="stylesheet" href="$1"></noscript>`
      );
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), asyncCssPlugin(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-query': ['@tanstack/react-query'],
          'vendor-supabase': ['@supabase/supabase-js'],
          'vendor-ui': ['@radix-ui/react-toast', '@radix-ui/react-tooltip'],
        },
      },
    },
  },
}));

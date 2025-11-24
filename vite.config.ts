import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { visualizer } from "rollup-plugin-visualizer";

// https://vitejs.dev/config/
export default defineConfig({
  // ✅ ADD THIS LINE:
  appType: "spa", // This tells the dev server to handle SPA routing (deep links)

  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom"],
          vendor: ["react-router-dom"], // (We fixed this earlier)
        },
      },
    },
  },

  server: {
    host: "::",
    port: 8081,
  },
  plugins: [
    react(),
    visualizer({ open: true }), // (We added this earlier)
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
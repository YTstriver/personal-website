import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  define: {
    "import.meta.env.VITE_VERCEL_OBSERVABILITY_CLIENT_CONFIG": JSON.stringify(
      process.env.VERCEL_OBSERVABILITY_CLIENT_CONFIG ?? "",
    ),
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});

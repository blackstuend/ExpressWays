import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/ExpressWays/',
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
});

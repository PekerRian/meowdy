import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ["antd"], // Optimize Ant Design dependency
  },
  server: {
    port: 3000, // You can change the port if needed
    open: true, // Open the browser automatically
  },
  build: {
    outDir: "dist", // Output directory for the build
  },
  resolve: {
    alias: {
      "@": "/src", // Shortcut alias for the src directory
    },
  },
});
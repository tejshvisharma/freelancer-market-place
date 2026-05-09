import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { visualizer } from "rollup-plugin-visualizer";

export default defineConfig({
    plugins: [
        react(),
        visualizer({
            open: false,
            gzipSize: true,
            filename: "dist/bundle-analysis.html",
        }),
    ],

    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
    server: {
    proxy: {
      '/api/v1': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
    build: {
        chunkSizeWarningLimit: 600,
    },
});
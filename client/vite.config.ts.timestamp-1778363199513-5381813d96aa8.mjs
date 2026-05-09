// vite.config.ts
import { defineConfig } from "file:///C:/Users/ojshv/OneDrive/Desktop/Nayoda%20Full%20Stack%20Internship/freelancer-marketplace/client/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Users/ojshv/OneDrive/Desktop/Nayoda%20Full%20Stack%20Internship/freelancer-marketplace/client/node_modules/@vitejs/plugin-react/dist/index.js";
import path from "path";
import { visualizer } from "file:///C:/Users/ojshv/OneDrive/Desktop/Nayoda%20Full%20Stack%20Internship/freelancer-marketplace/client/node_modules/rollup-plugin-visualizer/dist/plugin/index.js";
var __vite_injected_original_dirname = "C:\\Users\\ojshv\\OneDrive\\Desktop\\Nayoda Full Stack Internship\\freelancer-marketplace\\client";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    visualizer({
      open: false,
      gzipSize: true,
      filename: "dist/bundle-analysis.html"
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "./src")
    }
  },
  server: {
    proxy: {
      "/api/v1": {
        target: "http://localhost:8000",
        changeOrigin: true
      }
    }
  },
  build: {
    chunkSizeWarningLimit: 600
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxvanNodlxcXFxPbmVEcml2ZVxcXFxEZXNrdG9wXFxcXE5heW9kYSBGdWxsIFN0YWNrIEludGVybnNoaXBcXFxcZnJlZWxhbmNlci1tYXJrZXRwbGFjZVxcXFxjbGllbnRcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXG9qc2h2XFxcXE9uZURyaXZlXFxcXERlc2t0b3BcXFxcTmF5b2RhIEZ1bGwgU3RhY2sgSW50ZXJuc2hpcFxcXFxmcmVlbGFuY2VyLW1hcmtldHBsYWNlXFxcXGNsaWVudFxcXFx2aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvb2pzaHYvT25lRHJpdmUvRGVza3RvcC9OYXlvZGElMjBGdWxsJTIwU3RhY2slMjBJbnRlcm5zaGlwL2ZyZWVsYW5jZXItbWFya2V0cGxhY2UvY2xpZW50L3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSBcInZpdGVcIjtcclxuaW1wb3J0IHJlYWN0IGZyb20gXCJAdml0ZWpzL3BsdWdpbi1yZWFjdFwiO1xyXG5pbXBvcnQgcGF0aCBmcm9tIFwicGF0aFwiO1xyXG5pbXBvcnQgeyB2aXN1YWxpemVyIH0gZnJvbSBcInJvbGx1cC1wbHVnaW4tdmlzdWFsaXplclwiO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcclxuICAgIHBsdWdpbnM6IFtcclxuICAgICAgICByZWFjdCgpLFxyXG4gICAgICAgIHZpc3VhbGl6ZXIoe1xyXG4gICAgICAgICAgICBvcGVuOiBmYWxzZSxcclxuICAgICAgICAgICAgZ3ppcFNpemU6IHRydWUsXHJcbiAgICAgICAgICAgIGZpbGVuYW1lOiBcImRpc3QvYnVuZGxlLWFuYWx5c2lzLmh0bWxcIixcclxuICAgICAgICB9KSxcclxuICAgIF0sXHJcblxyXG4gICAgcmVzb2x2ZToge1xyXG4gICAgICAgIGFsaWFzOiB7XHJcbiAgICAgICAgICAgIFwiQFwiOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCBcIi4vc3JjXCIpLFxyXG4gICAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAgc2VydmVyOiB7XHJcbiAgICBwcm94eToge1xyXG4gICAgICAnL2FwaS92MSc6IHtcclxuICAgICAgICB0YXJnZXQ6ICdodHRwOi8vbG9jYWxob3N0OjgwMDAnLFxyXG4gICAgICAgIGNoYW5nZU9yaWdpbjogdHJ1ZSxcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgfSxcclxuICAgIGJ1aWxkOiB7XHJcbiAgICAgICAgY2h1bmtTaXplV2FybmluZ0xpbWl0OiA2MDAsXHJcbiAgICB9LFxyXG59KTsiXSwKICAibWFwcGluZ3MiOiAiO0FBQXNkLFNBQVMsb0JBQW9CO0FBQ25mLE9BQU8sV0FBVztBQUNsQixPQUFPLFVBQVU7QUFDakIsU0FBUyxrQkFBa0I7QUFIM0IsSUFBTSxtQ0FBbUM7QUFLekMsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDeEIsU0FBUztBQUFBLElBQ0wsTUFBTTtBQUFBLElBQ04sV0FBVztBQUFBLE1BQ1AsTUFBTTtBQUFBLE1BQ04sVUFBVTtBQUFBLE1BQ1YsVUFBVTtBQUFBLElBQ2QsQ0FBQztBQUFBLEVBQ0w7QUFBQSxFQUVBLFNBQVM7QUFBQSxJQUNMLE9BQU87QUFBQSxNQUNILEtBQUssS0FBSyxRQUFRLGtDQUFXLE9BQU87QUFBQSxJQUN4QztBQUFBLEVBQ0o7QUFBQSxFQUNBLFFBQVE7QUFBQSxJQUNSLE9BQU87QUFBQSxNQUNMLFdBQVc7QUFBQSxRQUNULFFBQVE7QUFBQSxRQUNSLGNBQWM7QUFBQSxNQUNoQjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQUEsRUFDRSxPQUFPO0FBQUEsSUFDSCx1QkFBdUI7QUFBQSxFQUMzQjtBQUNKLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==

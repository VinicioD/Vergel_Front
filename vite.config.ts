import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      // Todo lo que empiece por /api será redirigido transparente a Render
      "/api": {
        target: "https://vergel-api-evy7.onrender.com",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});

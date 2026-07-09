import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      "/ws": { target: "ws://localhost:3006", ws: true },
      "/api": "http://localhost:3006",
      "/generated-images": "http://localhost:3006",
    },
  },
});

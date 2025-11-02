import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    // Allow requests coming from the Docker/container hostnames used in this compose setup
    // Add any additional hostnames your environment requires (e.g. api-gateway, frontend-web)
    allowedHosts: ["frontend-web", "localhost"]
  },
});

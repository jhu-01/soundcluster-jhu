import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  publicDir: "client/public",
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    include: ["client/src/**/*.test.{ts,tsx}"],
    setupFiles: ["client/src/test/setup.ts"],
  },
});

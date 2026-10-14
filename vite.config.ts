import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

// App (PWA) publicado no GitHub Pages. A pasta public/ é a mesma usada pelo render do Remotion.
export default defineConfig({
  root: path.resolve(__dirname, "app"),
  publicDir: path.resolve(__dirname, "public"),
  base: "./",
  plugins: [react()],
  build: { outDir: path.resolve(__dirname, "dist"), emptyOutDir: true, assetsInlineLimit: 0, chunkSizeWarningLimit: 2000 },
  server: { host: true },
});

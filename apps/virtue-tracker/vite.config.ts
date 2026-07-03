import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { lifestyleBase } from "lifestyle-sync/vite/base";
import { lifestyleHtmlBoot } from "lifestyle-sync/vite/htmlBoot";
import { lifestylePreview } from "lifestyle-sync/vite/preview";
import { lifestylePwaPlugins } from "lifestyle-sync/vite/pwa";

const root = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    lifestyleHtmlBoot({ title: "美德训练", themeColor: "#ffffff" }),
    ...lifestylePwaPlugins({
      name: "美德训练",
      shortName: "美德训练",
      description: "富兰克林式美德训练 — 每周专注一项习惯，日拱一卒",
      themeColor: "#ffffff",
      backgroundColor: "#ffffff",
    }),
  ],
  base: lifestyleBase(mode),
  resolve: {
    alias: {
      "lifestyle-sync": path.resolve(root, "../../packages/lifestyle-sync/src/index.ts"),
    },
  },
  build: {
    outDir: "dist",
    assetsDir: "assets",
  },
  preview: lifestylePreview(5174, true),
  server: {
    port: 5174,
    host: true,
    strictPort: false,
  },
}));

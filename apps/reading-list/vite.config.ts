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
    lifestyleHtmlBoot({ title: "阅读书单" }),
    ...lifestylePwaPlugins({
      name: "阅读书单",
      shortName: "阅读书单",
      description: "阅读目标、笔记与测验",
      themeColor: "#ffffff",
    }),
  ],
  base: lifestyleBase(mode),
  resolve: {
    alias: {
      "lifestyle-sync": path.resolve(root, "../../packages/lifestyle-sync/src/index.ts"),
    },
  },
  preview: lifestylePreview(5181),
  server: { port: 5181, host: true },
}));

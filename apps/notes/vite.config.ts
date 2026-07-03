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
    lifestyleHtmlBoot({ title: "灵感笔记" }),
    ...lifestylePwaPlugins({
      name: "灵感笔记",
      shortName: "灵感笔记",
      description: "随手记灵感，每日成文",
      themeColor: "#ffffff",
    }),
  ],
  base: lifestyleBase(mode),
  resolve: {
    alias: {
      "lifestyle-sync": path.resolve(root, "../../packages/lifestyle-sync/src/index.ts"),
    },
  },
  preview: lifestylePreview(5178),
  server: { port: 5178, host: true },
}));

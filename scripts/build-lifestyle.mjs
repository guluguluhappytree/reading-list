import { execSync } from "node:child_process";

import { existsSync } from "node:fs";

import path from "node:path";

import { fileURLToPath } from "node:url";



const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");



const apps = [

  "virtue-tracker",

  "diary",

  "ledger",

  "notes",

  "copywriter",

  "reading-list",

  "ip-builder",

  "bucket-list",

  "memos",

  "channel",

];



const requiredIcons = ["icon-192.png", "icon-512.png", "apple-touch-icon.png"];



console.log("构建 Lifestyle App（生产版，支持离线 PWA）…\n");



for (const app of apps) {

  console.log(`→ ${app}`);

  try {
    execSync(`npm run icons -w ${app}`, { cwd: root, stdio: "inherit" });
  } catch {
    console.warn(`  ⚠ ${app} 无 icons 脚本，跳过 PNG 生成`);
  }

  const appDir = path.join(root, "apps", app);
  execSync("npx tsc -b", { cwd: appDir, stdio: "inherit" });
  execSync("node --import tsx ../../node_modules/vite/bin/vite.js build", {
    cwd: appDir,
    stdio: "inherit",
  });

  const iconDir = path.join(root, "apps", app, "dist", "icons");
  const missing = requiredIcons.filter((name) => !existsSync(path.join(iconDir, name)));
  if (missing.length > 0) {
    throw new Error(`${app} 构建后缺少图标: ${missing.join(", ")}`);
  }

}



console.log("\n全部构建完成，图标 PNG 已就绪。");



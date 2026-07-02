import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawn, execSync } from "node:child_process";
import { ensureLocalCerts } from "./ensure-local-certs.mjs";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const LAN_IP = "192.168.1.4";

// 5173–5180 已在 Windows 防火墙放行，手机 Wi‑Fi 可直接访问
const apps = [
  { workspace: "channel", port: 5173, label: "频道" },
  { workspace: "virtue-tracker", port: 5174, label: "美德训练" },
  { workspace: "diary", port: 5175, label: "日记" },
  { workspace: "bucket-list", port: 5176, label: "人生清单" },
  { workspace: "ledger", port: 5177, label: "记账" },
  { workspace: "notes", port: 5178, label: "灵感笔记" },
  { workspace: "copywriter", port: 5179, label: "文案库" },
  { workspace: "memos", port: 5180, label: "备忘录" },
  { workspace: "reading-list", port: 5181, label: "阅读书单" },
  { workspace: "ip-builder", port: 5182, label: "IP实战" },
];

function spawnDetached(command, args, cwd = root) {
  const child = spawn(command, args, { cwd, shell: true, detached: true, stdio: "ignore" });
  child.unref();
}

function tryOpenFirewall() {
  const script = path.join(root, "scripts", "open-lifestyle-firewall.ps1");
  if (!existsSync(script)) return;
  try {
    spawn(
      "powershell",
      ["-ExecutionPolicy", "Bypass", "-Command", `Start-Process powershell -Verb RunAs -Wait -ArgumentList '-ExecutionPolicy Bypass -File \\"${script}\\"'`],
      { cwd: root, shell: true, detached: true, stdio: "ignore" },
    ).unref();
  } catch {
    // 需要用户手动确认 UAC
  }
}

await ensureLocalCerts();
tryOpenFirewall();

try {
  spawn("docker", ["start", "listing-assistant-postgres"], { cwd: root, shell: true, detached: true, stdio: "ignore" }).unref();
} catch {
  // ignore
}

console.log("正在构建全部 App（离线 PWA 版）…\n");
execSync("node scripts/build-lifestyle.mjs", { cwd: root, stdio: "inherit" });

console.log("\n启动 Lifestyle 全家桶（HTTPS · 离线 + 云备份）…\n");

spawnDetached("npm", ["run", "dev:api"]);

for (const { workspace, port, label } of apps) {
  const appDir = path.join(root, "apps", workspace);
  spawnDetached(
    "node",
    ["--import", "tsx", "../../node_modules/vite/bin/vite.js", "preview", "--host", "0.0.0.0", "--port", String(port), "--strictPort"],
    appDir,
  );
  console.log(`  ✓ ${label}  https://${LAN_IP}:${port}/`);
}

console.log(`
════════════════════════════════════════════════════
  安装到手机（装好后无 Wi‑Fi 也能用）
════════════════════════════════════════════════════

⚠️  必须连家里 Wi‑Fi（不能用 5G）
⚠️  必须用 https:// 开头（不是 http）

常用地址：
  美德训练  https://${LAN_IP}:5174/
  人生清单  https://${LAN_IP}:5176/   ← 原 5182 已改
  备忘录    https://${LAN_IP}:5180/   ← 原 5183 已改

步骤：
1. Safari 地址栏输入上面 https 地址 → 点「前往」
2. 提示不安全 → 显示详细信息 → 访问此网站
3. 页面加载完 → 分享 → 添加到主屏幕
4. 删掉旧的主屏幕图标

云同步 API: https://${LAN_IP}:4000
`);

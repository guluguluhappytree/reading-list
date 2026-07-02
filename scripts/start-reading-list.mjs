import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawn, execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { ensureLocalCerts } from "./ensure-local-certs.mjs";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const appDir = path.join(root, "apps", "reading-list");
const LAN_IP = "192.168.1.4";
const PORT = 5181;

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
      [
        "-ExecutionPolicy",
        "Bypass",
        "-Command",
        `Start-Process powershell -Verb RunAs -Wait -ArgumentList '-ExecutionPolicy Bypass -File \\"${script}\\"'`,
      ],
      { cwd: root, shell: true, detached: true, stdio: "ignore" },
    ).unref();
  } catch {
    // 需要用户在 UAC 弹窗点「是」
  }
}

await ensureLocalCerts();
tryOpenFirewall();

try {
  spawn("docker", ["start", "listing-assistant-postgres"], { cwd: root, shell: true, detached: true, stdio: "ignore" }).unref();
} catch {
  // ignore
}

console.log("构建阅读书单…\n");
execSync("npm run icons -w reading-list", { cwd: root, stdio: "inherit" });
execSync("npm run build -w reading-list", { cwd: root, stdio: "inherit" });

spawnDetached("npm", ["run", "dev:api"]);
spawnDetached(
  "node",
  ["--import", "tsx", "../../node_modules/vite/bin/vite.js", "preview", "--host", "0.0.0.0", "--port", String(PORT), "--strictPort"],
  appDir,
);

console.log(`
阅读书单已启动

  手机 Wi‑Fi：https://${LAN_IP}:${PORT}/
  电脑：      https://localhost:${PORT}/

⚠️  地址必须以 https:// 开头（不是 http）
⚠️  手机必须连家里 Wi‑Fi，不能用 4G/5G

步骤：
1. 若弹出 UAC，请点「是」放行防火墙端口
2. Safari 地址栏输入完整地址 → 前往
3. 提示不安全 → 显示详细信息 → 访问此网站
4. 分享 → 添加到主屏幕
5. 右上角 ☁ 登录

电脑重启后：npm run start:reading-list
`);

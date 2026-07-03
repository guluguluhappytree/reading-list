/**
 * 从 SVG 生成 PWA 与 Capacitor 所需的 PNG 图标。
 * 运行: node scripts/generate-icons.mjs
 */
import { readFileSync, writeFileSync, mkdirSync, copyFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const svgPath = join(root, "public/icons/icon.svg");
const svg = readFileSync(svgPath);

async function main() {
  let sharp;
  try {
    sharp = (await import("sharp")).default;
  } catch {
    console.error("请先安装 sharp: npm install -D sharp");
    process.exit(1);
  }

  const sizes = [
    { name: "icon-192.png", size: 192, dir: "public/icons" },
    { name: "icon-512.png", size: 512, dir: "public/icons" },
    { name: "apple-touch-icon.png", size: 180, dir: "public/icons" },
    { name: "icon.png", size: 1024, dir: "resources" },
    { name: "splash.png", size: 2732, dir: "resources" },
  ];

  for (const { name, size, dir } of sizes) {
    const outDir = join(root, dir);
    mkdirSync(outDir, { recursive: true });
    const outPath = join(outDir, name);

    if (name === "splash.png") {
      await sharp({
        create: {
          width: size,
          height: size,
          channels: 4,
          background: { r: 26, g: 22, b: 18, alpha: 1 },
        },
      })
        .composite([
          {
            input: await sharp(svg).resize(Math.round(size * 0.35)).png().toBuffer(),
            gravity: "center",
          },
        ])
        .png()
        .toFile(outPath);
    } else {
      await sharp(svg).resize(size, size).png().toFile(outPath);
    }
    console.log(`✓ ${outPath}`);
  }

  copyFileSync(svgPath, join(root, "resources/icon.svg"));
  console.log("图标生成完成");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

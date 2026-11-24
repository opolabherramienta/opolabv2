// Draws the images of the welcome email into public/email/ with headless Chrome.
// Run from the project root: node emails/arte/render.mjs
// Set CHROME_PATH if Chrome is not in its usual Windows folder.
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

const chrome = process.env.CHROME_PATH || "C:/Program Files/Google/Chrome/Application/chrome.exe";
const here = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"));
const out = path.resolve("public/email");
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "opolab-arte-"));

fs.mkdirSync(out, { recursive: true });

function shoot(url, file, width, height, transparent = false) {
  const result = spawnSync(chrome, [
    "--headless=new",
    "--disable-gpu",
    "--hide-scrollbars",
    "--force-device-scale-factor=2",
    `--user-data-dir=${tmp}`,
    `--window-size=${width},${height}`,
    "--virtual-time-budget=8000",
    ...(transparent ? ["--default-background-color=00000000"] : []),
    `--screenshot=${path.join(out, file)}`,
    url,
  ]);

  if (result.status !== 0) {
    throw new Error(`Chrome no pudo dibujar ${file}: ${result.stderr}`);
  }

  console.log(`${file} (${width} x ${height})`);
}

shoot(pathToFileURL(path.join(here, "cabecera.html")).href, "cabecera.png", 600, 330);
shoot(pathToFileURL(path.join(here, "bombo.html")).href, "bombo.png", 536, 224);

// The three tiles of "what it does", with the same drawings as components/ui/Icon.tsx.
const icons = {
  plan: {
    fill: "#8b5cf6",
    edge: "#6a3fe0",
    ink: "#ffffff",
    d: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 16.5a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9ZM12 12.5a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1Z",
  },
  repasos: {
    fill: "#3b82f6",
    edge: "#2563eb",
    ink: "#ffffff",
    d: "M4.5 11a7 7 0 0 1 12-4.5L19 9M19 4.5V9h-4.5M19.5 13a7 7 0 0 1-12 4.5L5 15M5 19.5V15h4.5",
  },
  racha: {
    fill: "#fbbf24",
    edge: "#d4950a",
    ink: "#1e1a38",
    d: "M12 21c3.6 0 6.5-2.7 6.5-6.4 0-3-1.9-4.8-3.2-6.6-.9-1.3-1.3-2.7-1.3-4.5-2.9 1.5-5 4.3-5 7.3-1-.6-1.6-1.5-1.9-2.7C6 9.6 5.500 11.5 5.500 14.6 5.500 18.300 8.400 21 12 21Z",
  },
};

for (const [name, icon] of Object.entries(icons)) {
  const html = `<!doctype html><html><body style="margin:0;background:transparent">
<div style="width:56px;height:56px;border-radius:16px;background:${icon.fill};box-shadow:0 4px 0 ${icon.edge};display:flex;align-items:center;justify-content:center">
<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="${icon.ink}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="${icon.d}"/></svg>
</div></body></html>`;
  const file = path.join(tmp, `${name}.html`);

  fs.writeFileSync(file, html);
  shoot(pathToFileURL(file).href, `icono-${name}.png`, 56, 60, true);
}

fs.rmSync(tmp, { recursive: true, force: true, maxRetries: 5 });

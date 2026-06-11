/**
 * One-shot screenshot generator for the README tour.
 * Run with: npx tsx scripts/screenshot.ts  (requires dev server running on :3000)
 * Or: node --experimental-strip-types scripts/screenshot.ts
 */

import { chromium } from "playwright";
import path from "node:path";
import fs from "node:fs";

const OUT = path.join(__dirname, "..", "public", "screens");
fs.mkdirSync(OUT, { recursive: true });

const ROUTES = [
  { path: "/",                 file: "home.png" },
  { path: "/study/tags",       file: "tags.png" },
  { path: "/study/journey",    file: "journey-flow.png",     wait: () => Promise.resolve() }, // Flow is default tab
  { path: "/study/journey",    file: "journey-visits.png",   click: "Visits" },
  { path: "/study/journey",    file: "journey-sequence.png", click: "Sequence" },
  { path: "/study/versions",   file: "versions.png" },
  { path: "/study/subjects",   file: "subjects.png" },
  { path: "/study/export",     file: "export.png" },
];

async function main() {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1480, height: 900 }, deviceScaleFactor: 1.5 });
  const page = await ctx.newPage();

  for (const r of ROUTES) {
    console.log(`→ ${r.path}${r.click ? ` (tab: ${r.click})` : ""}`);
    await page.goto(`http://localhost:3001${r.path}`, { waitUntil: "networkidle" });
    if (r.click) {
      // Tabs have an Icon + label + best-for description inside the button.
      // Use a text locator on the label inside the button, then click the parent.
      await page.locator(`button:has-text("${r.click}")`).first().click();
      await page.waitForTimeout(500);
    }
    await page.screenshot({ path: path.join(OUT, r.file), fullPage: true });
  }

  await browser.close();
  console.log(`\nDone. Wrote ${ROUTES.length} screenshots to ${OUT}/`);
}

main().catch((e) => { console.error(e); process.exit(1); });

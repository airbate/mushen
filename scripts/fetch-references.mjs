#!/usr/bin/env node
// 从 airbate/Numerologist_skills 仓库拉 references MD，重新生成
// lib/references/{qimen,ziwei}.ts。运行：`node scripts/fetch-references.mjs`
import { writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const REPO = "airbate/Numerologist_skills";

async function fetchFile(path) {
  const r = await fetch(`https://api.github.com/repos/${REPO}/contents/${path}`, {
    headers: { Accept: "application/vnd.github+json" },
  });
  if (!r.ok) throw new Error(`failed to fetch ${path}: ${r.status}`);
  const data = await r.json();
  return Buffer.from(data.content, "base64").toString("utf-8");
}

async function genModule(outFile, header, files) {
  let content = `// ${header}\n// DO NOT EDIT BY HAND.\n`;
  for (const f of files) {
    const name = f.toUpperCase().replace(/\.md$/, "").replace(/-/g, "_");
    const md = await fetchFile(`${outFile === "qimen.ts" ? "qimen-dunjia" : "ziwei-doushu"}/references/${f}`);
    const body = md.split("\n").slice(1).join("\n").replace(/`/g, "\\`");
    content += `\nexport const ${name} = \`\n${body}\n\`;\n`;
  }
  mkdirSync(resolve(ROOT, "lib/references"), { recursive: true });
  writeFileSync(resolve(ROOT, `lib/references/${outFile}`), content);
  console.log(`wrote lib/references/${outFile} (${content.length} bytes)`);
}

await genModule("qimen.ts", "Auto-generated from airbate/Numerologist_skills/qimen-dunjia/references/*.md", [
  "ruleset-mainline.md",
  "geju.md",
  "yongshen.md",
  "interview.md",
  "examples.md",
]);

await genModule("ziwei.ts", "Auto-generated from airbate/Numerologist_skills/ziwei-doushu/references/*.md", [
  "calculation.md",
  "stars.md",
  "sihua.md",
  "patterns.md",
]);

console.log("done");
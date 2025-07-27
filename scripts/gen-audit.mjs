// scripts/gen-audit.mjs
import { promises as fs } from "fs";
import path from "path";

const ROOT = process.cwd();
const OUT = path.join(ROOT, "AUDIT_SNAPSHOT.md");
const INCLUDE = ["src", "public", "supabase", "package.json", "vite.config.ts", "tsconfig.json", "tailwind.config.ts", "eslint.config.js", "postcss.config.js"];
const EXCLUDE_DIRS = new Set(["node_modules", ".git", "dist", ".vercel", ".output", ".next", ".turbo", ".cache", "build", ".expo", ".temp"]);

async function walk(dir, depth = 0, maxDepth = 5, lines = []) {
  if (depth > maxDepth) return lines;
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    if (EXCLUDE_DIRS.has(e.name)) continue;
    const p = path.join(dir, e.name);
    const rel = path.relative(ROOT, p);
    lines.push(`${"  ".repeat(depth)}- ${rel}${e.isDirectory() ? "/" : ""}`);
    if (e.isDirectory()) await walk(p, depth + 1, maxDepth, lines);
  }
  return lines;
}

async function readIfExists(p) {
  try { return await fs.readFile(p, "utf8"); } catch { return null; }
}

function section(title, body) {
  return `\n## ${title}\n\n${body}\n`;
}

(async () => {
  const parts = [];
  parts.push(`# Audit Snapshot\n\n_Gerado em ${new Date().toISOString()}_\n`);

  // Árvore de pastas (até 5 níveis)
  const tree = (await walk(ROOT, 0, 5, [])).join("\n");
  parts.push(section("Árvore de Pastas", "```\n" + tree + "\n```"));

  // Conteúdos essenciais
  for (const file of INCLUDE) {
    const p = path.join(ROOT, file);
    const data = await readIfExists(p);
    if (data) parts.push(section(`Conteúdo: ${file}`, "```" + (file.endsWith(".json") ? "json" : "") + "\n" + data + "\n```"));
  }

  // Supabase — functions e migrations
  for (const dir of ["supabase/functions", "supabase/migrations"]) {
    const p = path.join(ROOT, dir);
    try {
      const entries = await fs.readdir(p);
      parts.push(section(`Lista: ${dir}`, entries.map(e => `- ${e}`).join("\n") || "_(vazio)_"));
    } catch {}
  }

  // Indexação de componentes relacionados a imagens/capítulos
  const candidates = [];
  async function indexByPattern(dir, patterns = [/image/i, /chapter/i, /editor/i, /position/i]) {
    try {
      const entries = await fs.readdir(path.join(ROOT, dir), { withFileTypes: true });
      for (const e of entries) {
        const rel = path.join(dir, e.name);
        if (e.isDirectory()) await indexByPattern(rel, patterns);
        else if (/\.(tsx?|jsx?)$/.test(e.name) && patterns.some(rx => rx.test(e.name))) candidates.push(rel);
      }
    } catch {}
  }
  for (const base of ["src"]) await indexByPattern(base);
  parts.push(section("Arquivos candidatos (capítulos/imagens)", candidates.map(c => `- ${c}`).join("\n") || "_nenhum encontrado_"));

  await fs.writeFile(OUT, parts.join("\n"));
  console.log("Gerado:", OUT);
})();

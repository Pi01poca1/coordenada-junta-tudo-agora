// scripts/checkpoint.mjs
import { promises as fs } from "fs";
import path from "path";
import { execSync } from "child_process";

const ROOT = process.cwd();
function run(cmd) {
  try { return execSync(cmd, { cwd: ROOT, stdio: "pipe" }).toString().trim(); }
  catch { return ""; }
}

const now = new Date();
const pad = (n) => String(n).padStart(2, "0");
const stamp = `${now.getFullYear()}${pad(now.getMonth()+1)}${pad(now.getDate())}${pad(now.getHours())}${pad(now.getMinutes())}`;
const human = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;

async function main() {
  // 1) Tenta atualizar snapshots existentes (não quebra se não houver)
  run("node scripts/gen-audit.mjs");
  run("node scripts/gen-audit-deep.mjs");

  // 2) Coleta metadados do repositório/ambiente
  const branch   = run("git rev-parse --abbrev-ref HEAD");
  const last     = run('git --no-pager log -1 --pretty="%h %s (%ci)"');
  const status   = run("git status --porcelain=v1");
  const diffstat = run("git --no-pager diff --stat");
  const nodeV    = process.version;
  const npmV     = run("npm -v");

  // 3) Gera relatório de checkpoint
  const dir = path.join(ROOT, "CHECKPOINTS");
  await fs.mkdir(dir, { recursive: true });
  const file = path.join(dir, `CP-${stamp}.md`);
  const md = `# Checkpoint ${human}

- Branch: **${branch}**
- Último commit: ${last || "(sem commits?)"}
- Node: ${nodeV}
- npm: ${npmV}

## Status
\`\`\`
${status || "(sem alterações não commitadas)"}
\`\`\`

## Diff (stat)
\`\`\`
${diffstat || "(sem diff)"}
\`\`\`

> Snapshots atualizados automaticamente (se scripts existirem): AUDIT_SNAPSHOT.md, AUDIT_DEEP.md
`;
  await fs.writeFile(file, md, "utf8");

  // 4) Sobe os artefatos do checkpoint
  run('git add "AUDIT_SNAPSHOT.md"');
  run('git add "AUDIT_DEEP.md"');
  run(`git add "${path.relative(ROOT, file)}"`);

  // 5) Commit + tag
  const msg = `chore(checkpoint): ${human}`;
  const commitOut = run(`git commit -m "${msg}"`);
  const tag = `cp-${stamp}`;
  run(`git tag -a ${tag} -m "${msg}"`);

  console.log("✅ Checkpoint criado:");
  console.log("  -", path.relative(ROOT, file));
  console.log("  - tag:", tag);
  console.log(commitOut || "  - (nada novo para commitar)");
}

main().catch((e) => { console.error(e); process.exit(1); });

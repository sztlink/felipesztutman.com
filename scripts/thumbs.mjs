// Gera miniaturas webp leves das imagens de public/img/obras/** para a faixa
// e a folha de contato das paginas de obra (ObraDocumentacao.astro).
//
// Saida: public/img/obras/<slug>/thumb/<arquivo>.webp (360 px de largura, sem ampliar).
// As miniaturas sao versionadas no git: o deploy (GitHub Actions) roda
// `npx astro build`, que nao dispara o "prebuild" do npm. Este script roda
// sozinho em `npm run thumbs` e antes de `npm run build`; so regenera o que
// estiver ausente ou mais velho que o original. Se a miniatura faltar, o
// layout cai no JPG original.
//
// Uso: node scripts/thumbs.mjs [--force]

import { readdir, stat, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const srcDir = path.join(root, 'public', 'img', 'obras');
const WIDTH = 360;
const QUALITY = 62;
const force = process.argv.includes('--force');

let sharp;
try {
  sharp = (await import('sharp')).default;
} catch {
  console.warn('[thumbs] sharp indisponivel; miniaturas nao geradas (o layout usa o JPG).');
  process.exit(0);
}

async function walk(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (entry.name === 'thumb') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...await walk(full));
    else if (/\.(jpe?g|png)$/i.test(entry.name)) out.push(full);
  }
  return out;
}

async function mtime(file) {
  try {
    return (await stat(file)).mtimeMs;
  } catch {
    return 0;
  }
}

const files = await walk(srcDir);
let made = 0;
let kept = 0;
let failed = 0;
for (const file of files) {
  const dest = path.join(path.dirname(file), 'thumb', path.basename(file).replace(/\.[^.]+$/, '.webp'));
  if (!force && (await mtime(dest)) >= (await mtime(file))) {
    kept++;
    continue;
  }
  try {
    await mkdir(path.dirname(dest), { recursive: true });
    await sharp(file)
      .rotate()
      .resize({ width: WIDTH, withoutEnlargement: true })
      .webp({ quality: QUALITY, effort: 5 })
      .toFile(dest);
    made++;
  } catch (error) {
    failed++;
    console.warn(`[thumbs] falhou ${path.relative(root, file)}: ${error.message}`);
  }
}
console.log(`[thumbs] ${made} geradas, ${kept} em dia, ${failed} falhas (${files.length} imagens)`);

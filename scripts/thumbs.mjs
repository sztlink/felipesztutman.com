// Gera miniaturas webp leves das imagens de public/img/obras/** para a faixa
// e a folha de contato das paginas de obra (ObraDocumentacao.astro).
//
// Saida: public/img/obras/<slug>/thumb/<arquivo>.webp (360 px de largura, sem ampliar)
// e public/img/obras/<slug>/web/<arquivo>.webp (1600 px, para o palco e o srcset).
// Grava tambem src/data/image-dims.json com largura e altura de cada original,
// para o layout declarar width/height e evitar salto de layout.
// As miniaturas sao versionadas no git: o deploy (GitHub Actions) roda
// `npx astro build`, que nao dispara o "prebuild" do npm. Este script roda
// sozinho em `npm run thumbs` e antes de `npm run build`; so regenera o que
// estiver ausente ou mais velho que o original. Se a miniatura faltar, o
// layout cai no JPG original.
//
// Uso: node scripts/thumbs.mjs [--force]

import { readdir, stat, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const srcDir = path.join(root, 'public', 'img', 'obras');
const VARIANTS = [
  { dir: 'thumb', width: 360, quality: 62 },
  { dir: 'web', width: 1600, quality: 74 },
];
const dimsFile = path.join(root, 'src', 'data', 'image-dims.json');
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
    if (VARIANTS.some((v) => v.dir === entry.name)) continue;
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
let dims = {};
try {
  dims = JSON.parse(await readFile(dimsFile, 'utf8'));
} catch {}
const nextDims = {};
for (const file of files) {
  const key = '/' + path.relative(path.join(root, 'public'), file).split(path.sep).join('/');
  try {
    const meta = await sharp(file).rotate().metadata();
    const swap = (meta.orientation || 1) >= 5;
    nextDims[key] = swap ? [meta.height, meta.width] : [meta.width, meta.height];
  } catch {
    if (dims[key]) nextDims[key] = dims[key];
  }
  for (const v of VARIANTS) {
    const dest = path.join(path.dirname(file), v.dir, path.basename(file).replace(/\.[^.]+$/, '.webp'));
    if (!force && (await mtime(dest)) >= (await mtime(file))) {
      kept++;
      continue;
    }
    try {
      await mkdir(path.dirname(dest), { recursive: true });
      await sharp(file)
        .rotate()
        .resize({ width: v.width, withoutEnlargement: true })
        .webp({ quality: v.quality, effort: 5 })
        .toFile(dest);
      made++;
    } catch (error) {
      failed++;
      console.warn(`[thumbs] falhou ${path.relative(root, file)} (${v.dir}): ${error.message}`);
    }
  }
}
const sorted = Object.fromEntries(Object.keys(nextDims).sort().map((k) => [k, nextDims[k]]));
const json = JSON.stringify(sorted, null, 0).replace(/\],"/g, '],\n"').replace(/^\{/, '{\n').replace(/\}$/, '\n}\n');
let current = '';
try {
  current = await readFile(dimsFile, 'utf8');
} catch {}
if (current !== json) await writeFile(dimsFile, json);
console.log(`[thumbs] ${made} geradas, ${kept} em dia, ${failed} falhas (${files.length} imagens, ${VARIANTS.length} variantes)`);

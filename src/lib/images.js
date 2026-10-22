// Variantes geradas por scripts/thumbs.mjs para as imagens de /img/obras:
// thumb/ (360 px) e web/ (1600 px), em webp. Se a variante faltar, usa o original.
import { existsSync } from 'node:fs';
import path from 'node:path';
import dims from '../data/image-dims.json';

const publicDir = path.join(process.cwd(), 'public');
const variant = (src, dir) => src.replace(/\/([^/]+)\.(jpe?g|png)$/i, `/${dir}/$1.webp`);
const exists = (p) => existsSync(path.join(publicDir, p));

export function thumbOf(src) {
  const t = variant(src, 'thumb');
  return t !== src && exists(t) ? t : src;
}

// Atributos de <img> responsiva: src leve, srcset 360/1600/original e dimensões.
export function responsive(src, sizes = '100vw') {
  const size = dims[src];
  const thumb = variant(src, 'thumb');
  const web = variant(src, 'web');
  const hasThumb = thumb !== src && exists(thumb);
  const hasWeb = web !== src && exists(web);
  const set = [];
  if (hasThumb) set.push(`${thumb} ${Math.min(360, size?.[0] || 360)}w`);
  if (hasWeb) set.push(`${web} ${Math.min(1600, size?.[0] || 1600)}w`);
  if (set.length && size && size[0] > 1600) set.push(`${src} ${size[0]}w`);
  return {
    src: hasWeb ? web : src,
    ...(set.length ? { srcset: set.join(', '), sizes } : {}),
    ...(size ? { width: size[0], height: size[1] } : {}),
  };
}

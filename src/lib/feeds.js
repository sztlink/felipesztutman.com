// Feeds gerados no build, sem dependência extra: RSS (PT e EN) e llms.txt.
// Fonte: frontmatter das páginas de obra e de escrito, e works.json para a ordem.
import worksData from '../data/works.json';

const SITE = 'https://felipesztutman.com';

const esc = (s = '') => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const byFile = (mods) => Object.fromEntries(Object.entries(mods).map(([path, mod]) => [
  path.split('/').pop().replace(/\.md$/, ''), mod.frontmatter || {},
]));

const obrasPt = byFile(import.meta.glob('../pages/obras/*.md', { eager: true }));
const obrasEn = byFile(import.meta.glob('../pages/en/obras/*.md', { eager: true }));
const escritosPt = byFile(import.meta.glob('../pages/escritos/*.md', { eager: true }));
const escritosEn = byFile(import.meta.glob('../pages/en/escritos/*.md', { eager: true }));

// Obras do mais recente para o mais antigo (número = ordem de abertura).
const works = (worksData.works || []).slice().sort((a, b) => b.numero.localeCompare(a.numero));

export function entries(lang) {
  const isEN = lang === 'en';
  const prefix = isEN ? '/en' : '';
  const obras = isEN ? obrasEn : obrasPt;
  const escritos = isEN ? escritosEn : escritosPt;
  const workItems = works
    .filter((w) => obras[w.slug])
    .map((w) => ({
      kind: 'obra',
      slug: w.slug,
      numero: w.numero,
      title: obras[w.slug].title,
      year: obras[w.slug].year,
      location: obras[w.slug].location,
      description: obras[w.slug].description || obras[w.slug].lead || '',
      url: `${SITE}${prefix}/obras/${w.slug}/`,
    }));
  const writingItems = Object.entries(escritos).map(([slug, fm]) => ({
    kind: 'escrito',
    slug,
    title: fm.title,
    date: fm.date,
    description: fm.description || fm.subtitle || '',
    url: `${SITE}${prefix}/escritos/${slug}/`,
  }));
  return { workItems, writingItems };
}

export function rss(lang) {
  const isEN = lang === 'en';
  const { workItems, writingItems } = entries(lang);
  const home = `${SITE}${isEN ? '/en' : ''}/`;
  const self = `${SITE}${isEN ? '/en' : ''}/rss.xml`;
  const item = (it) => {
    const iso = typeof it.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(it.date) ? new Date(`${it.date}T12:00:00Z`).toUTCString() : null;
    const cat = it.kind === 'obra' ? (isEN ? 'work' : 'obra') : (isEN ? 'writing' : 'escrito');
    const title = it.kind === 'obra' ? `${it.numero} · ${it.title} (${it.year})` : it.title;
    return `    <item>
      <title>${esc(title)}</title>
      <link>${esc(it.url)}</link>
      <guid isPermaLink="true">${esc(it.url)}</guid>
      <category>${cat}</category>
      <description>${esc(it.description)}</description>${iso ? `\n      <pubDate>${iso}</pubDate>` : ''}
    </item>`;
  };
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Felipe Sztutman</title>
    <link>${home}</link>
    <atom:link href="${self}" rel="self" type="application/rss+xml"/>
    <description>${isEN ? 'Works and writings by Felipe Sztutman, artist and builder of immersive systems. São Paulo, Brazil.' : 'Obras e escritos de Felipe Sztutman, artista e construtor de sistemas imersivos. São Paulo, Brasil.'}</description>
    <language>${isEN ? 'en' : 'pt-BR'}</language>
${[...workItems, ...writingItems].map(item).join('\n')}
  </channel>
</rss>
`;
}

export function llms() {
  const pt = entries('pt');
  const en = entries('en');
  const enBySlug = Object.fromEntries(en.workItems.map((w) => [w.slug, w]));
  const enWritings = Object.fromEntries(en.writingItems.map((w) => [w.slug, w]));
  const lines = [
    '# Felipe Sztutman',
    '',
    '> Brazilian artist (São Paulo, 1986) and builder of immersive systems. He conceives environments where light, technology and perception become language: urban light interventions of the LUZCIDADE series (2009-2013), immersive exhibitions of The Elements series (OCEANVS, São Paulo 3024, Andrômeda, Floresta Utópica) and installation-systems such as Metadata and 2047. Founder of AYA Studio. Trained in mechatronics (COTUCA/Unicamp) and design (FAU-USP).',
    '',
    'The site is bilingual: Portuguese at the root, English under /en/. Each work page carries the narrative text in the first person, a technical record, credits, press and image documentation. Work numbers follow the order of opening.',
    '',
    '## Pages',
    '',
    `- [Home / work archive](${SITE}/) ([English](${SITE}/en/))`,
    `- [About](${SITE}/sobre/) ([English](${SITE}/en/sobre/))`,
    `- [Timeline](${SITE}/trajetoria/) ([English](${SITE}/en/trajetoria/))`,
    `- [Publications](${SITE}/publicacoes/) ([English](${SITE}/en/publicacoes/))`,
    `- [Writings](${SITE}/escritos/) ([English](${SITE}/en/escritos/))`,
    `- [Relational map](${SITE}/mapa/): diagram of relations between works, writings and references (Portuguese only)`,
    '',
    '## Works',
    '',
    ...pt.workItems.map((w) => {
      const e = enBySlug[w.slug];
      return `- [${w.numero} · ${w.title} (${w.year})](${w.url}): ${(e?.description || w.description).replace(/\s+/g, ' ').trim()}${e ? ` ([English](${e.url}))` : ''}`;
    }),
    '',
    '## Writings',
    '',
    ...pt.writingItems.map((w) => {
      const e = enWritings[w.slug];
      return `- [${w.title}](${w.url}): ${(e?.description || w.description).replace(/\s+/g, ' ').trim()}${e ? ` ([English](${e.url}))` : ''}`;
    }),
    '',
    '## Optional',
    '',
    `- [RSS, Portuguese](${SITE}/rss.xml)`,
    `- [RSS, English](${SITE}/en/rss.xml)`,
    `- [Sitemap](${SITE}/sitemap-index.xml)`,
    '- [Enciclopédia Itaú Cultural](https://enciclopedia.itaucultural.org.br/pessoas/60193-felipe-sztutman)',
    '- [AYA Studio](https://aya.cx)',
    '',
  ];
  return lines.join('\n');
}

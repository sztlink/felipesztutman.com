#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

const DREAM_ROOT = path.resolve('/home/aya/lastro/Documents/aya/workspace/sistema/relatorios');
const SITE_ROOT = path.resolve('/home/aya/lastro/Documents/artista/felipesztutman-astro');
const OUT_DIR = path.join(SITE_ROOT, 'src/pages/diario');
const ENDPOINT = process.env.QWEN_ENDPOINT || 'http://192.168.15.133:11435/v1/chat/completions';
const MODEL = process.env.QWEN_MODEL || 'Qwen_Qwen3.6-35B-A3B-Q4_K_M.gguf';
const PI_FALLBACK_PROVIDER = process.env.PI_FALLBACK_PROVIDER || 'openai-codex';
const PI_FALLBACK_MODEL = process.env.PI_FALLBACK_MODEL || 'gpt-5.5';
const PI_FALLBACK_THINKING = process.env.PI_FALLBACK_THINKING || 'high';
const PI_FALLBACK_TIMEOUT_MS = Number(process.env.PI_FALLBACK_TIMEOUT_MS || 600000);

const args = new Set(process.argv.slice(2));
const onlyDate = [...args].find(a => /^\d{4}-\d{2}-\d{2}$/.test(a));
const force = args.has('--force');
const limitArg = [...args].find(a => a.startsWith('--limit='));
const limit = limitArg ? Number(limitArg.split('=')[1]) : Infinity;

function stripMd(s = '') {
  return String(s)
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/_([^_]+)_/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .trim();
}
function yaml(s = '') { return JSON.stringify(String(s).replace(/\n/g, ' ').trim()); }
function sanitizePublic(s = '') {
  return String(s)
    .replace(/\/home\/aya\/[^\s)]+/g, '[arquivo de ateliê]')
    .replace(/C:\\[^\s)]+/g, '[arquivo de ateliê]')
    .replace(/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/g, '[email]')
    .replace(/\b(felipesztutman@gmail\.com|felipe@aya\.cx)\b/gi, '[email]')
    .replace(/\b(sa[uú]de|press[aã]o|tabaco|Mounjaro|Sorine|m[ée]dico|Mariana|Tom|Otto)\b/gi, '')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
function findPersona(date) {
  const dir = path.join(DREAM_ROOT, `sonho-maquina-${date}`);
  const personaFile = path.join(dir, 'persona-felipe-artista.md');
  if (fs.existsSync(personaFile)) return fs.readFileSync(personaFile, 'utf8');
  const report = path.join(dir, `SONHO-DA-MAQUINA-${date}.md`);
  if (!fs.existsSync(report)) return '';
  const md = fs.readFileSync(report, 'utf8');
  const marker = md.search(/^###\s+Felipe artista/im);
  if (marker < 0) return '';
  const rest = md.slice(marker);
  const next = rest.search(/\n###\s+/);
  return next > 0 ? rest.slice(0, next) : rest;
}
function fallbackTitle(source = '') {
  const text = stripMd(source).replace(/[^\wÀ-ÿ\- ]+/g, ' ').split(/\s+/).filter(Boolean);
  return text.slice(0, 7).join(' ') || 'Diário de ateliê';
}
function parseJson(content = '') {
  let c = content.trim();
  if (c.startsWith('```')) c = c.split('```', 2)[1].replace(/^json/i, '').trim();
  const first = c.indexOf('{');
  const last = c.lastIndexOf('}');
  if (first >= 0 && last > first) c = c.slice(first, last + 1);
  return JSON.parse(c);
}
function diaryPrompt(date, source) {
  const system = `Você é editor do Diário de Ateliê de Felipe Sztutman no site felipesztutman.com.
Transforme a persona "Felipe artista" de um relatório íntimo em uma entrada pública de diário de ateliê.
Objetivo: SEO e presença online do artista, sem expor bastidores íntimos.
Responda APENAS JSON válido com: title, subtitle, description, tags, body_md.
Regras obrigatórias:
- Não mencionar "Sonho da Máquina", relatório, persona, AYA interna, paths, emails, saúde, família, alertas, instruções íntimas ou operação sensível.
- Pode mencionar szt.link, arquivo, obras, software, jogo, interface, instalação, memória, ateliê, processo e pesquisa artística.
- Escrever em primeira pessoa quando couber, como texto público assumível pelo artista.
- Título curto, forte, SEO-friendly, sem clickbait.
- body_md com 600 a 1100 palavras, headings H2, tom ensaístico claro.
- Incluir uma frase final discreta conectando o texto ao processo artístico em andamento.`;
  const user = JSON.stringify({ date, source: sanitizePublic(source).slice(0, 12000) });
  return { system, user };
}
async function generateWithQwen(date, source) {
  const { system, user } = diaryPrompt(date, source);
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: 'system', content: system }, { role: 'user', content: user }],
      temperature: 0.38,
      max_tokens: 3600,
      chat_template_kwargs: { enable_thinking: false },
    }),
    signal: AbortSignal.timeout(300000),
  });
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
  const payload = await res.json();
  return parseJson(payload.choices?.[0]?.message?.content || '');
}
async function generateWithPiFallback(date, source) {
  const { system, user } = diaryPrompt(date, source);
  const prompt = `${system}\n\nDADOS DE ENTRADA JSON:\n${user}\n\nRetorne somente o objeto JSON, sem markdown.`;
  const { stdout } = await execFileAsync('pi', [
    '--provider', PI_FALLBACK_PROVIDER,
    '--model', PI_FALLBACK_MODEL,
    '--thinking', PI_FALLBACK_THINKING,
    '--no-tools',
    '--no-skills',
    '--no-context-files',
    '--no-extensions',
    '--no-prompt-templates',
    '--no-themes',
    '--no-session',
    '-p',
    prompt,
  ], { timeout: PI_FALLBACK_TIMEOUT_MS, maxBuffer: 1024 * 1024 * 8 });
  return parseJson(stdout);
}
async function generateEntry(date, source) {
  let obj;
  try {
    obj = await generateWithQwen(date, source);
  } catch (err) {
    console.error(`  WARN Qwen indisponível/ocupado: ${err.message}`);
    console.error(`  usando fallback Pi: ${PI_FALLBACK_PROVIDER}/${PI_FALLBACK_MODEL} • ${PI_FALLBACK_THINKING}`);
    obj = await generateWithPiFallback(date, source);
  }
  return {
    title: sanitizePublic(obj.title || fallbackTitle(source)),
    subtitle: sanitizePublic(obj.subtitle || 'Diário de Ateliê'),
    description: sanitizePublic(obj.description || obj.subtitle || ''),
    tags: Array.isArray(obj.tags) ? obj.tags.map(x => sanitizePublic(String(x))).filter(Boolean).slice(0, 8) : ['diário de ateliê'],
    body_md: sanitizePublic(obj.body_md || ''),
  };
}

function writeEntry(date, entry) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const out = path.join(OUT_DIR, `${date}.md`);
  const tags = `[${entry.tags.map(yaml).join(', ')}]`;
  const body = `---\nlayout: ../../layouts/Escrito.astro\ntitle: ${yaml(entry.title)}\nsubtitle: ${yaml(entry.subtitle)}\ndate: ${yaml(date)}\ndescription: ${yaml(entry.description)}\ntype: "diário de ateliê"\ntags: ${tags}\nsource: "derivado público da persona Felipe artista do sonho da máquina"\n---\n\n${entry.body_md.trim()}\n`;
  fs.writeFileSync(out, body, 'utf8');
  return out;
}

const dates = fs.readdirSync(DREAM_ROOT)
  .filter(d => /^sonho-maquina-\d{4}-\d{2}-\d{2}$/.test(d))
  .map(d => d.replace('sonho-maquina-', ''))
  .filter(d => !onlyDate || d === onlyDate)
  .sort()
  .reverse();

let done = 0;
for (const date of dates) {
  if (done >= limit) break;
  const out = path.join(OUT_DIR, `${date}.md`);
  if (!force && fs.existsSync(out)) { console.log(`skip ${date} (exists)`); continue; }
  const source = findPersona(date);
  if (!stripMd(source)) { console.log(`skip ${date} (sem persona artista)`); continue; }
  console.log(`gerando diário ${date}...`);
  let entry;
  try {
    entry = await generateEntry(date, source);
  } catch (err) {
    console.error(`  FAIL LLM falhou; não publicando fallback bruto: ${err.message}`);
    continue;
  }
  const written = writeEntry(date, entry);
  console.log(`  wrote ${written}`);
  console.log(`  title: ${entry.title}`);
  done++;
}
console.log(`done: ${done}`);

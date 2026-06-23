#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';

// Roda o pi CLI com STDIN FECHADO (stdio[0]='ignore'). Sem isso o pi fica
// pendurado esperando input de stdin quando recebe prompt longo via -p, e
// só morre no timeout (10min). Com stdin em EOF imediato, responde em ~18s.
// execFile NÃO resolve: ele força pipe no stdin. Só spawn respeita 'ignore'.
function runPi(args, timeoutMs) {
  return new Promise((resolve, reject) => {
    const child = spawn('pi', args, { stdio: ['ignore', 'pipe', 'pipe'] });
    let out = '', err = '', done = false;
    const finish = (fn, v) => { if (!done) { done = true; clearTimeout(timer); fn(v); } };
    const timer = setTimeout(() => { child.kill('SIGKILL'); finish(reject, new Error('pi timeout')); }, timeoutMs);
    child.stdout.on('data', d => { out += d; });
    child.stderr.on('data', d => { err += d; });
    child.on('error', e => finish(reject, e));
    child.on('close', code => code === 0 ? finish(resolve, out) : finish(reject, new Error(`pi exit ${code}: ${err.slice(0, 200)}`)));
  });
}

const DREAM_ROOT = path.resolve('/home/aya/lastro/Documents/aya/workspace/sistema/relatorios');
const SITE_ROOT = path.resolve('/home/aya/lastro/Documents/artista/felipesztutman-astro');
const OUT_DIR = path.join(SITE_ROOT, 'src/pages/diario');
const ENDPOINT = process.env.QWEN_ENDPOINT || 'http://192.168.15.133:11435/v1/chat/completions';
const MODEL = process.env.QWEN_MODEL || 'local-vllm';
const PI_FALLBACK_PROVIDER = process.env.PI_FALLBACK_PROVIDER || 'openai-codex';
const PI_FALLBACK_MODEL = process.env.PI_FALLBACK_MODEL || 'gpt-5.4';
const PI_FALLBACK_THINKING = process.env.PI_FALLBACK_THINKING || 'medium';
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
    // Scrub de nomes-próprios da maquinaria interna -> equivalentes neutros de ateliê.
    // Roda no input (persona que o LLM lê) e no output (texto final), nas duas pontas.
    .replace(/sonho da m[áa]quina/gi, 'processo de ateliê')
    .replace(/machine dream/gi, 'processo de ateliê')
    .replace(/jornal[\s]+[íi]ntimo/gi, 'caderno de ateliê')
    .replace(/relat[óo]rio[\s]+[íi]ntimo/gi, 'caderno de ateliê')
    .replace(/turboquant\w*/gi, 'pesquisa técnica')
    .replace(/x journal/gi, 'registro')
    .replace(/aya interna/gi, 'ateliê')
    .replace(/scout\w*/gi, 'curadoria')
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
function diaryPrompt(date, source, avoid = []) {
  let system = `Você é editor do Diário de Ateliê de Felipe Sztutman no site felipesztutman.com.
Transforme a persona "Felipe artista" de um relatório íntimo em uma entrada pública de diário de ateliê.
Objetivo: SEO e presença online do artista, sem expor bastidores íntimos.
Responda APENAS JSON válido com: title, subtitle, description, tags, body_md.
Regras obrigatórias:
- Não mencionar "Sonho da Máquina", jornal íntimo, relatório íntimo, Scout, TurboQuant, X Journal, AYA interna, paths, emails, saúde, família ou operação sensível. Pode usar palavras comuns como sonho, processo, memória, arquivo, obra.
- Pode mencionar szt.link, arquivo, obras, software, jogo, interface, instalação, memória, ateliê, processo e pesquisa artística.
- Escrever em primeira pessoa, como texto público assumível pelo artista. Nunca escrever como análise externa sobre "o artista".
- Se mencionar Player 1, tratar como exposição confirmada e em produção, nunca como A_CONFIRMAR ou em confirmação.
- Título curto, forte, SEO-friendly, sem clickbait.
- body_md com 600 a 1100 palavras, headings H2, tom ensaístico claro.
- Incluir uma frase final discreta conectando o texto ao processo artístico em andamento.`;
  if (avoid.length) {
    system += `\n- CRÍTICO: NÃO use, em hipótese alguma, estas palavras ou expressões (uma versão anterior foi rejeitada por contê-las): ${avoid.join(', ')}. Reescreva o texto inteiro sem elas, inclusive no título, subtítulo e tags.`;
  }
  const user = JSON.stringify({ date, source: sanitizePublic(source).slice(0, 12000) });
  return { system, user };
}
async function resolveQwenModel() {
  const modelsUrl = ENDPOINT.replace(/\/chat\/completions\/?$/, '/models');
  try {
    const res = await fetch(modelsUrl, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) return MODEL;
    const payload = await res.json();
    const ids = Array.isArray(payload.data) ? payload.data.map(m => m.id).filter(Boolean) : [];
    if (!ids.length || ids.includes(MODEL)) return MODEL;
    console.error(`  WARN Qwen model ${MODEL} não encontrado; usando ${ids[0]}`);
    return ids[0];
  } catch {
    return MODEL;
  }
}

async function generateWithQwen(date, source, avoid = []) {
  const { system, user } = diaryPrompt(date, source, avoid);
  const model = await resolveQwenModel();
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
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
async function generateWithPiFallback(date, source, avoid = []) {
  const { system, user } = diaryPrompt(date, source, avoid);
  const prompt = `${system}\n\nDADOS DE ENTRADA JSON:\n${user}\n\nRetorne somente o objeto JSON, sem markdown.`;
  const stdout = await runPi([
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
  ], PI_FALLBACK_TIMEOUT_MS);
  return parseJson(stdout);
}
async function generateEntry(date, source, avoid = []) {
  let obj;
  try {
    // Pi primeiro: voz em primeira pessoa muito melhor que o Qwen 7B local.
    obj = await generateWithPiFallback(date, source, avoid);
  } catch (err) {
    console.error(`  WARN Pi indisponível: ${err.message}`);
    console.error(`  usando Qwen local como fallback`);
    obj = await generateWithQwen(date, source, avoid);
  }
  return {
    title: sanitizePublic(obj.title || fallbackTitle(source)),
    subtitle: sanitizePublic(obj.subtitle || 'Diário de Ateliê'),
    description: sanitizePublic(obj.description || obj.subtitle || ''),
    tags: Array.isArray(obj.tags) ? obj.tags.map(x => sanitizePublic(String(x))).filter(Boolean).slice(0, 8) : ['diário de ateliê'],
    body_md: sanitizePublic(obj.body_md || ''),
  };
}

function validatePublicEntry(entry) {
  const text = [entry.title, entry.subtitle, entry.description, entry.body_md, ...(entry.tags || [])].join('\n').toLowerCase();
  // Bloquear nomes-próprios da maquinaria interna (não palavras comuns como
  // "sonho", "relatório", "persona", "alerta", que um diário de ateliê usa de forma legítima).
  // A trava de dados sensíveis (paths/emails/saúde/família) fica no sanitizePublic + no check abaixo.
  const forbidden = [
    'sonho da máquina', 'machine dream', 'jornal íntimo', 'relatório íntimo',
    'scout', 'turboquant', 'x journal', 'aya interna', 'a_confirmar', 'em confirmação'
  ];
  const hit = forbidden.find(term => text.includes(term));
  if (hit) { const e = new Error(`entrada pública contém termo proibido: ${hit}`); e.forbiddenTerm = hit; throw e; }
  if (/\/home\/aya|C:\\\\|[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/i.test(text)) {
    throw new Error('entrada pública contém path ou email');
  }
}

function writeEntry(date, entry) {
  validatePublicEntry(entry);
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const out = path.join(OUT_DIR, `${date}.md`);
  const tags = `[${entry.tags.map(yaml).join(', ')}]`;
  const body = `---\nlayout: ../../layouts/Escrito.astro\ntitle: ${yaml(entry.title)}\nsubtitle: ${yaml(entry.subtitle)}\ndate: ${yaml(date)}\ndescription: ${yaml(entry.description)}\ntype: "diário de ateliê"\ntags: ${tags}\nsource: "derivado público de caderno de ateliê"\n---\n\n${entry.body_md.trim()}\n`;
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
  let ok = false;
  const avoid = [];
  for (let attempt = 1; attempt <= 3 && !ok; attempt++) {
    try {
      const entry = await generateEntry(date, source, avoid);
      const written = writeEntry(date, entry);
      console.log(`  wrote ${written}`);
      console.log(`  title: ${entry.title}`);
      done++; ok = true;
    } catch (err) {
      if (err.forbiddenTerm && !avoid.includes(err.forbiddenTerm)) avoid.push(err.forbiddenTerm);
      console.error(`  tentativa ${attempt}/3 em ${date} falhou: ${err.message}`);
    }
  }
  if (!ok) { console.error(`  FAIL ${date}: desistindo após 3 tentativas`); continue; }
}
console.log(`done: ${done}`);

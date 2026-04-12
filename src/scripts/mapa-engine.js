// mapa-engine.js — módulo ES, importado pelo Astro
// DOM já está pronto quando módulos executam (deferred por padrão)
// ─────────────────────────────────────────────────────────────

const raw = JSON.parse(document.getElementById('mapa-data').textContent);

// Normaliza cores: #rgb → #rrggbb (evita crash no addColorStop)
function hex6(c) {
  if (!c) return '#888888';
  if (c.length === 4) return '#' + c[1]+c[1] + c[2]+c[2] + c[3]+c[3];
  return c;
}

// Fase golden-angle por índice → wiggle orgânico, nunca sincronizado
const GOLDEN = 2.399963;

const nodes = raw.map((n, i) => ({
  ...n,
  color: hex6(n.color),
  rx: n.lens.conceito[0], ry: n.lens.conceito[1],
  tx: n.lens.conceito[0], ty: n.lens.conceito[1],
  phase:  (i * GOLDEN) % (Math.PI * 2),
  freqX:  0.55 + (i % 7) * 0.07,   // 0.55–1.02 Hz
  freqY:  0.45 + (i % 5) * 0.09,   // 0.45–0.81 Hz
}));

// ── ESTADO ────────────────────────────────────────────────
let currentLens = 'conceito';
const activeFilters = new Set();
let searchQuery = '';

// ── CANVAS ────────────────────────────────────────────────
const cvs = document.getElementById('canvas');
const ctx = cvs.getContext('2d');
let W, H, CX, CY, zoom = 1, panX = 0, panY = 0;
let dragging = false, dragX0, dragY0, dragPX, dragPY, hovered = null;

function resize() {
  W = cvs.width  = window.innerWidth;
  H = cvs.height = window.innerHeight;
  CX = W / 2; CY = H / 2;
}
window.addEventListener('resize', resize);
resize();

function toScreen(x, y) { return [(x + panX) * zoom + CX, (y + panY) * zoom + CY]; }
function toWorld(sx, sy) { return [(sx - CX) / zoom - panX, (sy - CY) / zoom - panY]; }

// ── LENTE ─────────────────────────────────────────────────
const CONN_ALPHA = { conceito: 0.055, temporal: 0, linhagem: 0.16 };

function setLens(name) {
  currentLens = name;
  nodes.forEach(n => {
    const pos = n.lens[name] || n.lens.conceito;
    n.tx = pos[0]; n.ty = pos[1];
  });
  document.querySelectorAll('.lens').forEach(b =>
    b.classList.toggle('active', b.dataset.l === name)
  );
  updateCounter();
}

// ── BUSCA ─────────────────────────────────────────────────
function scoreNode(n, q) {
  const words = q.toLowerCase().split(/\s+/).filter(w => w.length > 1);
  if (!words.length) return 1;
  const corpus = [n.label, n.sub, n.desc, ...(n.tags || [])].join(' ').toLowerCase();
  return words.reduce((s, w) => s + (corpus.includes(w) ? 1 : 0), 0);
}

// ── VISIBILIDADE ──────────────────────────────────────────
function nodeVis(n) {
  const q = searchQuery.trim();
  const anyActive = activeFilters.size > 0 || q;
  if (!anyActive) return 1;
  if (q && scoreNode(n, q) > 0) return 1;
  for (const f of activeFilters) {
    const [t, v] = f.split(':');
    if (t === 'p' && (n.people || []).includes(v)) return 1;
    if (t === 'm' && (n.material || []).includes(v)) return 1;
  }
  return 0.05;
}

// ── COUNTER de nós visíveis ───────────────────────────────
function updateCounter() {
  const el = document.getElementById('vis-count');
  if (!el) return;
  const anyActive = activeFilters.size > 0 || searchQuery.trim();
  if (!anyActive) { el.textContent = ''; return; }
  const n = nodes.filter(n => nodeVis(n) > 0.5).length;
  el.textContent = `${n} / ${nodes.length}`;
}

// ── DOT GRID ──────────────────────────────────────────────
function drawGrid() {
  const spacing = 80;
  const [wx0, wy0] = toWorld(-1, -1);
  const [wx1, wy1] = toWorld(W + 1, H + 1);
  const startX = Math.floor(wx0 / spacing) * spacing;
  const startY = Math.floor(wy0 / spacing) * spacing;

  // Tamanho do dot: maior quando zoom >1, menor quando zoom <1
  const dotR = Math.max(0.6, Math.min(1.5, zoom));

  ctx.fillStyle = 'rgba(255,255,255,0.045)';
  ctx.beginPath();
  for (let x = startX; x <= wx1; x += spacing) {
    for (let y = startY; y <= wy1; y += spacing) {
      const [sx, sy] = toScreen(x, y);
      ctx.moveTo(sx + dotR, sy);
      ctx.arc(sx, sy, dotR, 0, Math.PI * 2);
    }
  }
  ctx.fill();

  // Ponto de origem (0,0) levemente destacado
  const [ox, oy] = toScreen(0, 0);
  ctx.fillStyle = 'rgba(255,255,255,0.10)';
  ctx.beginPath();
  ctx.arc(ox, oy, 2, 0, Math.PI * 2);
  ctx.fill();
}

// ── MARCADORES DE ANO (lente temporal) ───────────────────
const YEAR_MARKS = [
  { y: 2009, x: -340 }, { y: 2013, x: -166 },
  { y: 2019, x: 95 },   { y: 2022, x: 225 },
  { y: 2024, x: 312 },  { y: 2025, x: 355 },
  { y: 2026, x: 400 },
];

function drawYearMarkers() {
  const lineY = 220;
  const [lx]  = toScreen(-560, lineY);
  const [rx]  = toScreen(450,  lineY);
  const [, ly] = toScreen(0,   lineY);

  ctx.beginPath();
  ctx.moveTo(lx, ly); ctx.lineTo(rx, ly);
  ctx.strokeStyle = 'rgba(255,255,255,.05)'; ctx.lineWidth = 1; ctx.stroke();

  ctx.font = `${Math.max(8, 9 * zoom)}px 'SF Mono',monospace`;
  ctx.textAlign = 'center';
  for (const m of YEAR_MARKS) {
    const [sx, sy] = toScreen(m.x, lineY + 4);
    ctx.beginPath();
    ctx.moveTo(sx, sy - 5); ctx.lineTo(sx, sy + 3);
    ctx.strokeStyle = 'rgba(255,255,255,.12)'; ctx.lineWidth = 1; ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,.18)';
    ctx.fillText(m.y, sx, sy + 15);
  }
  // hiato
  const [hx, hy] = toScreen(-36, lineY + 28);
  ctx.font = `${Math.max(7, 8 * zoom)}px 'SF Mono',monospace`;
  ctx.fillStyle = 'rgba(255,255,255,.06)';
  ctx.fillText('— hiato 2014–2018 —', hx, hy);
  // refs label
  const [rx2, ry2] = toScreen(-400, -270);
  ctx.fillStyle = 'rgba(255,255,255,.07)';
  ctx.fillText('referências', rx2, ry2);
}

// ── DRAW LOOP ─────────────────────────────────────────────
const LERP = 0.06;

function draw() {
  const t = performance.now() / 1000;

  ctx.clearRect(0, 0, W, H);

  // posição tween
  nodes.forEach(n => {
    n.rx += (n.tx - n.rx) * LERP;
    n.ry += (n.ty - n.ry) * LERP;
  });

  // grid
  drawGrid();

  if (currentLens === 'temporal') drawYearMarkers();

  // ── CONEXÕES ──────────────────────────────────────────
  const connBase = CONN_ALPHA[currentLens] || 0;
  if (connBase > 0) {
    for (const n of nodes) {
      // wiggle position para conexão (consistente com nó)
      const wax = n.type !== 'ref' ? Math.sin(t * n.freqX + n.phase) * 0.8 : 0;
      const way = n.type !== 'ref' ? Math.cos(t * n.freqY + n.phase * 1.618) * 0.8 : 0;

      for (const lid of (n.links || [])) {
        const m = nodes.find(k => k.id === lid);
        if (!m) continue;
        const isHov = hovered && (
          hovered.id === n.id || hovered.id === m.id ||
          (hovered.links || []).includes(n.id) || (hovered.links || []).includes(m.id)
        );
        const va = Math.min(nodeVis(n), nodeVis(m));
        const a = isHov ? connBase * 4 : connBase * va;
        if (a < 0.005) continue;

        const wbx = m.type !== 'ref' ? Math.sin(t * m.freqX + m.phase) * 0.8 : 0;
        const wby = m.type !== 'ref' ? Math.cos(t * m.freqY + m.phase * 1.618) * 0.8 : 0;

        const [x1, y1] = toScreen(n.rx + wax, n.ry + way);
        const [x2, y2] = toScreen(m.rx + wbx, m.ry + wby);
        ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
        ctx.strokeStyle = `rgba(255,255,255,${a})`;
        ctx.lineWidth = isHov ? 1.5 : 0.8;
        ctx.stroke();
      }
    }
  }

  // ── NÓS ───────────────────────────────────────────────
  for (const n of nodes) {
    // wiggle: suave, diferente por nó
    const wigAmp  = n.type === 'ref' ? 0 : 0.8;
    const wigX    = Math.sin(t * n.freqX + n.phase) * wigAmp;
    const wigY    = Math.cos(t * n.freqY + n.phase * 1.618) * wigAmp;
    const [sx, sy] = toScreen(n.rx + wigX, n.ry + wigY);

    const sr     = n.r * zoom;
    const vis    = nodeVis(n);
    const isHov  = hovered && hovered.id === n.id;
    const isConn = hovered && ((hovered.links||[]).includes(n.id) || (n.links||[]).includes(hovered.id));

    // glow
    if (n.type !== 'ref' && vis > 0.15) {
      const glowR   = sr * (isHov ? 4.5 : 3.2);
      const opacity = isHov ? 0.28 : (isConn ? 0.15 : 0.10);
      const g = ctx.createRadialGradient(sx, sy, 0, sx, sy, glowR);
      g.addColorStop(0, n.color + Math.round(opacity * vis * 255).toString(16).padStart(2,'0'));
      g.addColorStop(0.4, n.color + Math.round(opacity * vis * 0.4 * 255).toString(16).padStart(2,'0'));
      g.addColorStop(1, n.color + '00');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(sx, sy, glowR, 0, Math.PI * 2); ctx.fill();
    }

    // anel externo (obras + escritos, não refs)
    if (n.type !== 'ref' && vis > 0.15 && zoom > 0.5) {
      const ringR   = Math.max(sr * 0.55, 3.5);
      const ringOpa = isHov ? 0.6 : (isConn ? 0.35 : 0.18);
      ctx.beginPath(); ctx.arc(sx, sy, ringR, 0, Math.PI * 2);
      ctx.strokeStyle = n.color + Math.round(ringOpa * vis * 255).toString(16).padStart(2,'0');
      ctx.lineWidth   = isHov ? 1.5 : 0.8;
      ctx.stroke();
    }

    // ponto central
    const dotR      = Math.max(sr * 0.38, 2.5);
    const dotAlpha  = isHov ? 1 : (isConn ? 0.85 : 0.65);
    ctx.beginPath(); ctx.arc(sx, sy, dotR, 0, Math.PI * 2);
    ctx.fillStyle = n.type === 'ref'
      ? `rgba(80,80,110,${vis * dotAlpha * 0.7})`
      : n.color + Math.round(dotAlpha * vis * 255).toString(16).padStart(2,'0');
    ctx.fill();

    // anel de hover (pulsa)
    if (isHov) {
      const pulse = 1 + Math.sin(t * 3) * 0.15;
      ctx.beginPath(); ctx.arc(sx, sy, dotR * pulse + 4 * zoom, 0, Math.PI * 2);
      ctx.strokeStyle = n.color + '44'; ctx.lineWidth = 1.2; ctx.stroke();
    }

    // label
    const labelAlpha = isHov ? 1 : (isConn ? 0.75 : (n.type === 'ref' ? 0.18 : 0.42));
    const finalAlpha = labelAlpha * vis;
    if (finalAlpha < 0.04) continue;

    const labelSize = Math.max(10, Math.min(13, 11 * zoom));
    ctx.textAlign  = 'center';
    ctx.font       = `${isHov ? 500 : 400} ${labelSize}px system-ui,sans-serif`;
    ctx.fillStyle  = `rgba(210,220,240,${finalAlpha})`;
    ctx.fillText(n.label, sx, sy + dotR + 14 * Math.max(zoom, 0.7));

    if (zoom > 0.65 && n.type !== 'ref') {
      ctx.font      = `${Math.max(8, 9 * zoom)}px 'SF Mono',monospace`;
      ctx.fillStyle = `rgba(200,210,230,${finalAlpha * 0.38})`;
      ctx.fillText(n.sub, sx, sy + dotR + 25 * Math.max(zoom, 0.7));
    }
  }

  requestAnimationFrame(draw);
}
draw();

// ── INTERAÇÃO: mouse ──────────────────────────────────────
cvs.addEventListener('wheel', e => {
  e.preventDefault();
  const f = e.deltaY > 0 ? 0.9 : 1.1;
  const [wx, wy] = toWorld(e.clientX, e.clientY);
  zoom = Math.max(0.25, Math.min(5, zoom * f));
  panX = wx - (e.clientX - CX) / zoom;
  panY = wy - (e.clientY - CY) / zoom;
}, { passive: false });

cvs.addEventListener('mousedown', e => {
  dragging = true;
  dragX0 = dragPX = e.clientX;
  dragY0 = dragPY = e.clientY;
});

window.addEventListener('mouseup', e => {
  if (dragging) {
    const moved = Math.hypot(e.clientX - dragX0, e.clientY - dragY0);
    if (moved < 5 && hovered) openDetail(hovered);
  }
  dragging = false;
});

window.addEventListener('mousemove', e => {
  if (dragging) {
    panX += (e.clientX - dragPX) / zoom;
    panY += (e.clientY - dragPY) / zoom;
    dragPX = e.clientX; dragPY = e.clientY;
  }
  const [wx, wy] = toWorld(e.clientX, e.clientY);
  hovered = null;
  for (const n of nodes) {
    if (Math.hypot(wx - n.rx, wy - n.ry) < Math.max(n.r * 1.5, 14)) {
      hovered = n; break;
    }
  }
  cvs.style.cursor = hovered ? 'pointer' : (dragging ? 'grabbing' : 'grab');
});

// ── INTERAÇÃO: touch ──────────────────────────────────────
let touchDist = 0;
cvs.addEventListener('touchstart', e => {
  if (e.touches.length === 1) {
    dragging = true;
    dragX0 = dragPX = e.touches[0].clientX;
    dragY0 = dragPY = e.touches[0].clientY;
  }
  if (e.touches.length === 2) {
    touchDist = Math.hypot(
      e.touches[0].clientX - e.touches[1].clientX,
      e.touches[0].clientY - e.touches[1].clientY
    );
  }
}, { passive: true });

cvs.addEventListener('touchmove', e => {
  e.preventDefault();
  if (e.touches.length === 1 && dragging) {
    panX += (e.touches[0].clientX - dragPX) / zoom;
    panY += (e.touches[0].clientY - dragPY) / zoom;
    dragPX = e.touches[0].clientX; dragPY = e.touches[0].clientY;
  }
  if (e.touches.length === 2) {
    const d  = Math.hypot(e.touches[0].clientX-e.touches[1].clientX, e.touches[0].clientY-e.touches[1].clientY);
    const mx = (e.touches[0].clientX + e.touches[1].clientX) / 2;
    const my = (e.touches[0].clientY + e.touches[1].clientY) / 2;
    const [wx, wy] = toWorld(mx, my);
    zoom = Math.max(0.25, Math.min(5, zoom * (d / touchDist)));
    panX = wx - (mx - CX) / zoom;
    panY = wy - (my - CY) / zoom;
    touchDist = d;
  }
}, { passive: false });

cvs.addEventListener('touchend', e => {
  if (e.changedTouches.length === 1 && dragging) {
    const moved = Math.hypot(e.changedTouches[0].clientX - dragX0, e.changedTouches[0].clientY - dragY0);
    if (moved < 10) {
      const [wx, wy] = toWorld(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
      const tapped = nodes.find(n => Math.hypot(wx - n.rx, wy - n.ry) < Math.max(n.r * 1.8, 18));
      if (tapped) openDetail(tapped);
    }
  }
  dragging = false;
});

// ── PAINEL DETALHE ────────────────────────────────────────
const detail = document.getElementById('detail');
document.getElementById('dc').onclick = () => detail.classList.remove('open');

// Escape fecha painel
window.addEventListener('keydown', e => {
  if (e.key === 'Escape') detail.classList.remove('open');
});

function openDetail(n) {
  document.getElementById('dtype').textContent  = n.type;
  document.getElementById('dtitle').textContent = n.label;
  document.getElementById('dmeta').textContent  = n.sub;
  document.getElementById('dbody').innerHTML    = `<p>${n.desc}</p>`;

  // conexões no detalhe
  const connNodes = (n.links || [])
    .map(id => nodes.find(m => m.id === id))
    .filter(Boolean);
  const connEl = document.getElementById('dconn');
  if (connEl && connNodes.length) {
    connEl.innerHTML = connNodes.map(m =>
      `<span class="dconn-item" data-id="${m.id}">${m.label}</span>`
    ).join('');
    connEl.querySelectorAll('.dconn-item').forEach(el => {
      el.addEventListener('click', () => {
        const target = nodes.find(m => m.id === el.dataset.id);
        if (target) openDetail(target);
      });
    });
  }

  // tags (material + people)
  const tagsEl = document.getElementById('dtags');
  const showTags = [...(n.material||[]), ...(n.people||[])];
  tagsEl.innerHTML = showTags.map(t => `<span>${t}</span>`).join('');

  const link = document.getElementById('dlink');
  if (n.slug) { link.href = n.slug; link.style.display = 'inline-block'; }
  else        { link.style.display = 'none'; }

  detail.classList.add('open');
}

// ── UI: lentes ────────────────────────────────────────────
document.querySelectorAll('.lens').forEach(b => {
  b.addEventListener('click', () => setLens(b.dataset.l));
});

// ── UI: busca ─────────────────────────────────────────────
document.getElementById('search').addEventListener('input', e => {
  searchQuery = e.target.value;
  updateCounter();
});

// ── UI: filtros ───────────────────────────────────────────
document.querySelectorAll('.fp').forEach(b => {
  b.addEventListener('click', () => {
    const key = `${b.dataset.t}:${b.dataset.v}`;
    if (activeFilters.has(key)) { activeFilters.delete(key); b.classList.remove('on'); }
    else                        { activeFilters.add(key);    b.classList.add('on');    }
    updateCounter();
  });
});

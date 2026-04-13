// mapa-engine.js — módulo ES
// ─────────────────────────────────────────────────────────────

const raw = JSON.parse(document.getElementById('mapa-data').textContent);
function hex6(c) {
  if (!c || c.length !== 4) return c || '#888888';
  return '#' + c[1]+c[1] + c[2]+c[2] + c[3]+c[3];
}

const nodes = raw.map(n => ({
  ...n,
  color: hex6(n.color),
  rx: n.lens.conceito[0], ry: n.lens.conceito[1],
  tx: n.lens.conceito[0], ty: n.lens.conceito[1],
}));

// ── ESTADO ────────────────────────────────────────────────
let currentLens  = 'conceito';
const activeFilters = new Set();
let searchQuery  = '';

// modo edição
let editMode      = false;
let editDragNode  = null;
let editMoved     = false; // distingue click de drag

// ── CANVAS ────────────────────────────────────────────────
const cvs = document.getElementById('canvas');
const ctx = cvs.getContext('2d');
let W, H, CX, CY, zoom = 0.72, panX = 0, panY = 0;
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
const CONN_COLOR = {
  conceito: 'rgba(255,255,255,0.12)',
  temporal: null,
  linhagem: 'rgba(255,255,255,0.22)',
};

function setLens(name) {
  currentLens = name;
  nodes.forEach(n => {
    const pos = n.lens[name] || n.lens.conceito;
    n.tx = pos[0]; n.ty = pos[1];
  });
  document.querySelectorAll('.lens').forEach(b =>
    b.classList.toggle('active', b.dataset.l === name)
  );
  if (editMode) updateEditPanel();
  updateCounter();
}

// ── BUSCA ─────────────────────────────────────────────────
function scoreNode(n, q) {
  const words = q.toLowerCase().split(/\s+/).filter(w => w.length > 1);
  if (!words.length) return 1;
  const corpus = [n.label, n.sub, n.desc, ...(n.tags||[])].join(' ').toLowerCase();
  return words.reduce((s, w) => s + (corpus.includes(w) ? 1 : 0), 0);
}

function isActive(n) {
  const q = searchQuery.trim();
  const anyActive = activeFilters.size > 0 || q;
  if (!anyActive) return true;
  if (q && scoreNode(n, q) > 0) return true;
  for (const f of activeFilters) {
    const [t, v] = f.split(':');
    if (t === 'p' && (n.people||[]).includes(v)) return true;
    if (t === 'm' && (n.material||[]).includes(v)) return true;
  }
  return false;
}

// ── COUNTER ───────────────────────────────────────────────
function updateCounter() {
  const el = document.getElementById('vis-count');
  if (!el) return;
  const anyActive = activeFilters.size > 0 || searchQuery.trim();
  el.textContent = anyActive
    ? `${nodes.filter(isActive).length} / ${nodes.length}`
    : '';
}

// ── MODO EDIÇÃO ────────────────────────────────────────────
function toggleEditMode() {
  editMode = !editMode;
  document.getElementById('btn-edit')?.classList.toggle('active', editMode);
  document.getElementById('edit-panel')?.classList.toggle('active', editMode);
  if (editMode) updateEditPanel();
  cvs.style.cursor = editMode ? 'crosshair' : 'grab';
}

// Exporta posições da lente atual (todas)
function positionsForLens(lens) {
  const out = {};
  [...nodes]
    .sort((a, b) => a.id.localeCompare(b.id))
    .forEach(n => {
      const p = n.lens[lens] || [Math.round(n.rx), Math.round(n.ry)];
      out[n.id] = [Math.round(p[0]), Math.round(p[1])];
    });
  return out;
}

// Exporta todas as lentes de todos os nós (para colar no mapa.json)
function allPositions() {
  const out = {};
  [...nodes]
    .sort((a, b) => a.id.localeCompare(b.id))
    .forEach(n => {
      out[n.id] = {
        conceito: n.lens.conceito.map(Math.round),
        temporal: n.lens.temporal ? n.lens.temporal.map(Math.round) : n.lens.conceito.map(Math.round),
        linhagem: n.lens.linhagem ? n.lens.linhagem.map(Math.round) : n.lens.conceito.map(Math.round),
      };
    });
  return out;
}

function updateEditPanel() {
  const ta  = document.getElementById('edit-json');
  const lbl = document.getElementById('edit-lens-name');
  if (!ta) return;
  if (lbl) lbl.textContent = `lente: ${currentLens}`;
  ta.value = JSON.stringify(positionsForLens(currentLens), null, 2);
}

function copyToClipboard(text) {
  navigator.clipboard?.writeText(text).catch(() => {
    const t = document.createElement('textarea');
    t.value = text; document.body.appendChild(t);
    t.select(); document.execCommand('copy');
    document.body.removeChild(t);
  });
}

// ── DOT GRID ──────────────────────────────────────────────
function drawGrid() {
  const spacing = 100;
  const [wx0, wy0] = toWorld(-1, -1);
  const [wx1, wy1] = toWorld(W + 1, H + 1);
  const startX = Math.floor(wx0 / spacing) * spacing;
  const startY = Math.floor(wy0 / spacing) * spacing;
  const dotR = Math.max(1, Math.min(2, zoom * 1.4));

  ctx.fillStyle = editMode
    ? 'rgba(255,200,50,0.12)'  // amarelo sutil em modo edição
    : 'rgba(255,255,255,0.14)';
  ctx.beginPath();
  for (let x = startX; x <= wx1; x += spacing) {
    for (let y = startY; y <= wy1; y += spacing) {
      const [sx, sy] = toScreen(x, y);
      ctx.moveTo(sx + dotR, sy);
      ctx.arc(sx, sy, dotR, 0, Math.PI * 2);
    }
  }
  ctx.fill();

  const [ox, oy] = toScreen(0, 0);
  ctx.fillStyle = editMode ? 'rgba(255,200,50,0.5)' : 'rgba(255,255,255,0.35)';
  ctx.beginPath(); ctx.arc(ox, oy, 2.5, 0, Math.PI * 2); ctx.fill();
}

// ── YEAR MARKERS ──────────────────────────────────────────
const YEAR_MARKS = [
  { y: 2009, x: -340 }, { y: 2013, x: -166 },
  { y: 2019, x: 95 },   { y: 2022, x: 225 },
  { y: 2024, x: 312 },  { y: 2025, x: 355 },
  { y: 2026, x: 400 },
];

function drawYearMarkers() {
  const lineY = 220;
  const [lx]   = toScreen(-560, lineY);
  const [rx]   = toScreen(450,  lineY);
  const [, ly] = toScreen(0,    lineY);

  ctx.beginPath(); ctx.moveTo(lx, ly); ctx.lineTo(rx, ly);
  ctx.strokeStyle = 'rgba(255,255,255,0.18)'; ctx.lineWidth = 0.5; ctx.stroke();

  ctx.font = `${Math.max(9, 10 * zoom)}px 'SF Mono',monospace`;
  ctx.textAlign = 'center';
  for (const m of YEAR_MARKS) {
    const [sx, sy] = toScreen(m.x, lineY + 4);
    ctx.beginPath(); ctx.moveTo(sx, sy - 6); ctx.lineTo(sx, sy + 4);
    ctx.strokeStyle = 'rgba(255,255,255,0.30)'; ctx.lineWidth = 1; ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.40)';
    ctx.fillText(m.y, sx, sy + 17);
  }
  const [hx, hy] = toScreen(-36, lineY + 30);
  ctx.font = `${Math.max(8, 9 * zoom)}px 'SF Mono',monospace`;
  ctx.fillStyle = 'rgba(255,255,255,0.15)';
  ctx.fillText('— hiato 2014–2018 —', hx, hy);
  const [rx2, ry2] = toScreen(-400, -270);
  ctx.fillStyle = 'rgba(255,255,255,0.15)';
  ctx.fillText('referências', rx2, ry2);
}

// ── DRAW ──────────────────────────────────────────────────
const LERP_NAV  = 0.06;
const LERP_EDIT = 0.35; // mais rápido em modo edição

function draw() {
  ctx.clearRect(0, 0, W, H);
  const lerp = editMode ? LERP_EDIT : LERP_NAV;

  nodes.forEach(n => {
    if (editDragNode && n.id === editDragNode.id) return; // dragged: posição imediata
    n.rx += (n.tx - n.rx) * lerp;
    n.ry += (n.ty - n.ry) * lerp;
  });

  drawGrid();
  if (currentLens === 'temporal') drawYearMarkers();

  // ── CONEXÕES ────────────────────────────────────────────
  const connColor = CONN_COLOR[currentLens];
  if (connColor) {
    for (const n of nodes) {
      for (const lid of (n.links||[])) {
        const m = nodes.find(k => k.id === lid);
        if (!m) continue;
        const isHov = hovered && (
          hovered.id === n.id || hovered.id === m.id ||
          (hovered.links||[]).includes(n.id) || (hovered.links||[]).includes(m.id)
        );
        const anyFilter = activeFilters.size > 0 || searchQuery.trim();
        if (anyFilter && !isActive(n) && !isActive(m)) continue;
        const [x1, y1] = toScreen(n.rx, n.ry);
        const [x2, y2] = toScreen(m.rx, m.ry);
        ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
        ctx.strokeStyle = isHov ? 'rgba(255,255,255,0.5)' : connColor;
        ctx.lineWidth   = isHov ? 1.2 : 0.7;
        ctx.stroke();
      }
    }
  }

  // ── NÓS ─────────────────────────────────────────────────
  for (const n of nodes) {
    const [sx, sy] = toScreen(n.rx, n.ry);
    const sr      = n.r * zoom;
    const active  = isActive(n);
    const isHov   = hovered && hovered.id === n.id;
    const isConn  = hovered && ((hovered.links||[]).includes(n.id)||(n.links||[]).includes(hovered.id));
    const isDragging = editDragNode && editDragNode.id === n.id;

    const dotR = Math.max(sr * 0.40, 3);

    // fill
    let fillColor;
    if (isDragging)       fillColor = '#ffcc33';
    else if (n.type==='ref') fillColor = active ? '#3a3a55' : '#1c1c2a';
    else                  fillColor = active ? n.color : '#1e2030';

    ctx.beginPath(); ctx.arc(sx, sy, dotR, 0, Math.PI * 2);
    ctx.fillStyle = fillColor;
    ctx.fill();

    // anel
    if (n.type !== 'ref' && (active || editMode) && zoom > 0.4) {
      const ringR = dotR + Math.max(2.5, 3 * zoom);
      ctx.beginPath(); ctx.arc(sx, sy, ringR, 0, Math.PI * 2);
      ctx.strokeStyle = isDragging
        ? 'rgba(255,204,51,0.8)'
        : isHov ? n.color : (isConn ? n.color+'aa' : (editMode ? n.color+'55' : n.color+'33'));
      ctx.lineWidth = isDragging ? 1.5 : (isHov ? 1.5 : 0.8);
      ctx.stroke();
    }

    // coordenada enquanto arrasta
    if (isDragging) {
      ctx.font = '10px \'SF Mono\',monospace';
      ctx.fillStyle = 'rgba(255,204,51,0.95)';
      ctx.textAlign = 'left';
      ctx.fillText(`[${Math.round(n.rx)}, ${Math.round(n.ry)}]`, sx + dotR + 6, sy - 4);
    }

    // label
    if (!active && !isHov && !editMode) continue;
    const labelAlpha = isDragging ? 1 : (isHov ? 1 : (isConn ? 0.9 : (active ? 0.65 : (editMode ? 0.3 : 0))));
    if (labelAlpha < 0.05) continue;

    const labelSize = Math.max(10, Math.min(13, 11 * zoom));
    ctx.textAlign  = 'center';
    ctx.font       = `${isHov||isDragging ? 500 : 400} ${labelSize}px 'SF Mono','Fira Code',monospace`;
    ctx.fillStyle  = isDragging
      ? `rgba(255,204,51,${labelAlpha})`
      : `rgba(220,230,245,${labelAlpha})`;
    const textY = sy + dotR + 14 * Math.max(zoom, 0.6);
    ctx.fillText(n.label, sx, textY);

    if (zoom > 0.7 && n.type !== 'ref') {
      ctx.font      = `${Math.max(8, 8 * zoom)}px 'SF Mono',monospace`;
      ctx.fillStyle = `rgba(140,160,190,${labelAlpha * 0.6})`;
      ctx.fillText(n.sub, sx, textY + 13 * Math.max(zoom, 0.6));
    }
  }

  // indicador do modo edição no canvas
  if (editMode) {
    ctx.font = '10px \'SF Mono\',monospace';
    ctx.fillStyle = 'rgba(255,200,50,0.4)';
    ctx.textAlign = 'left';
    ctx.fillText('✦ EDITAR', 14, H - 14);
  }

  requestAnimationFrame(draw);
}
draw();

// ── MOUSE ─────────────────────────────────────────────────
function hitNode(wx, wy) {
  for (const n of nodes)
    if (Math.hypot(wx - n.rx, wy - n.ry) < Math.max(n.r * 1.5, 14)) return n;
  return null;
}

cvs.addEventListener('wheel', e => {
  e.preventDefault();
  const f = e.deltaY > 0 ? 0.9 : 1.1;
  const [wx, wy] = toWorld(e.clientX, e.clientY);
  zoom = Math.max(0.2, Math.min(5, zoom * f));
  panX = wx - (e.clientX - CX) / zoom;
  panY = wy - (e.clientY - CY) / zoom;
}, { passive: false });

cvs.addEventListener('mousedown', e => {
  dragX0 = dragPX = e.clientX;
  dragY0 = dragPY = e.clientY;
  editMoved = false;

  if (editMode) {
    const [wx, wy] = toWorld(e.clientX, e.clientY);
    editDragNode = hitNode(wx, wy);
    if (!editDragNode) dragging = true; // pan em espaço vazio
  } else {
    dragging = true;
  }
});

window.addEventListener('mouseup', e => {
  if (editMode) {
    if (editDragNode) {
      if (!editMoved) openDetail(editDragNode); // click sem mover = abre detalhe
      updateEditPanel();
    }
    editDragNode = null;
    dragging = false;
    cvs.style.cursor = hovered ? 'move' : 'crosshair';
    return;
  }
  if (dragging && Math.hypot(e.clientX-dragX0, e.clientY-dragY0) < 5 && hovered)
    openDetail(hovered);
  dragging = false;
});

window.addEventListener('mousemove', e => {
  // arrasta nó em modo edição
  if (editMode && editDragNode) {
    if (Math.hypot(e.clientX-dragX0, e.clientY-dragY0) > 4) editMoved = true;
    const [wx, wy] = toWorld(e.clientX, e.clientY);
    const rx = Math.round(wx), ry = Math.round(wy);
    editDragNode.rx = editDragNode.tx = rx;
    editDragNode.ry = editDragNode.ty = ry;
    editDragNode.lens[currentLens] = [rx, ry];
    cvs.style.cursor = 'move';
    return;
  }

  // pan
  if (dragging) {
    panX += (e.clientX - dragPX) / zoom;
    panY += (e.clientY - dragPY) / zoom;
    dragPX = e.clientX; dragPY = e.clientY;
  }

  // hover detection
  const [wx, wy] = toWorld(e.clientX, e.clientY);
  hovered = hitNode(wx, wy);
  cvs.style.cursor = editMode
    ? (hovered ? 'move' : (dragging ? 'grabbing' : 'crosshair'))
    : (hovered ? 'pointer' : (dragging ? 'grabbing' : 'grab'));
});

// ── TOUCH ─────────────────────────────────────────────────
let touchDist = 0;
cvs.addEventListener('touchstart', e => {
  if (e.touches.length === 1) {
    dragX0 = dragPX = e.touches[0].clientX;
    dragY0 = dragPY = e.touches[0].clientY;
    editMoved = false;
    if (editMode) {
      const [wx, wy] = toWorld(e.touches[0].clientX, e.touches[0].clientY);
      editDragNode = hitNode(wx, wy);
      if (!editDragNode) dragging = true;
    } else {
      dragging = true;
    }
  }
  if (e.touches.length === 2)
    touchDist = Math.hypot(e.touches[0].clientX-e.touches[1].clientX, e.touches[0].clientY-e.touches[1].clientY);
}, { passive: true });

cvs.addEventListener('touchmove', e => {
  e.preventDefault();
  if (editMode && editDragNode && e.touches.length === 1) {
    editMoved = true;
    const [wx, wy] = toWorld(e.touches[0].clientX, e.touches[0].clientY);
    const rx = Math.round(wx), ry = Math.round(wy);
    editDragNode.rx = editDragNode.tx = rx;
    editDragNode.ry = editDragNode.ty = ry;
    editDragNode.lens[currentLens] = [rx, ry];
    return;
  }
  if (e.touches.length === 1 && dragging) {
    panX += (e.touches[0].clientX - dragPX) / zoom;
    panY += (e.touches[0].clientY - dragPY) / zoom;
    dragPX = e.touches[0].clientX; dragPY = e.touches[0].clientY;
  }
  if (e.touches.length === 2) {
    const d = Math.hypot(e.touches[0].clientX-e.touches[1].clientX, e.touches[0].clientY-e.touches[1].clientY);
    const mx = (e.touches[0].clientX+e.touches[1].clientX)/2;
    const my = (e.touches[0].clientY+e.touches[1].clientY)/2;
    const [wx,wy] = toWorld(mx, my);
    zoom = Math.max(0.2, Math.min(5, zoom*(d/touchDist)));
    panX = wx-(mx-CX)/zoom; panY = wy-(my-CY)/zoom; touchDist = d;
  }
}, { passive: false });

cvs.addEventListener('touchend', e => {
  if (editMode && editDragNode) {
    if (!editMoved) openDetail(editDragNode);
    editDragNode = null; dragging = false; updateEditPanel(); return;
  }
  if (e.changedTouches.length===1 && dragging && Math.hypot(e.changedTouches[0].clientX-dragX0, e.changedTouches[0].clientY-dragY0)<10) {
    const [wx,wy] = toWorld(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
    const t = hitNode(wx, wy);
    if (t) openDetail(t);
  }
  dragging = false;
});

// ── PAINEL DETALHE ─────────────────────────────────────────
const detail = document.getElementById('detail');
document.getElementById('dc').onclick = () => detail.classList.remove('open');
window.addEventListener('keydown', e => {
  if (e.key === 'Escape') detail.classList.remove('open');
  if (e.key === 'e' && e.shiftKey) toggleEditMode();
});

function openDetail(n) {
  const heroEl = document.getElementById('dhero');
  if (heroEl) {
    if (n.hero) { heroEl.src = n.hero; heroEl.alt = n.label; heroEl.style.display = 'block'; }
    else { heroEl.style.display = 'none'; }
  }
  document.getElementById('dtype').textContent  = n.type;
  document.getElementById('dtitle').textContent = n.label;
  document.getElementById('dmeta').textContent  = n.sub;
  document.getElementById('dbody').innerHTML    = `<p>${n.desc}</p>`;

  const connEl = document.getElementById('dconn');
  if (connEl) {
    const linked = (n.links||[]).map(id=>nodes.find(m=>m.id===id)).filter(Boolean);
    connEl.innerHTML = linked.length
      ? `<div class="dconn-label">conexões</div>` + linked.map(m=>`<span class="dconn-item" data-id="${m.id}">${m.label}</span>`).join('')
      : '';
    connEl.querySelectorAll('.dconn-item').forEach(el =>
      el.addEventListener('click', () => { const t=nodes.find(m=>m.id===el.dataset.id); if(t) openDetail(t); })
    );
  }

  document.getElementById('dtags').innerHTML =
    [...(n.material||[]),...(n.people||[])].map(t=>`<span>${t}</span>`).join('');

  const link = document.getElementById('dlink');
  if (n.slug) { link.href = n.slug; link.style.display = 'inline-block'; }
  else        { link.style.display = 'none'; }
  detail.classList.add('open');
}

// ── UI ─────────────────────────────────────────────────────
document.querySelectorAll('.lens').forEach(b => b.addEventListener('click', () => setLens(b.dataset.l)));
document.getElementById('btn-edit').addEventListener('click', toggleEditMode);
document.getElementById('search').addEventListener('input', e => { searchQuery = e.target.value; updateCounter(); });
document.querySelectorAll('.fp').forEach(b => {
  b.addEventListener('click', () => {
    const key = `${b.dataset.t}:${b.dataset.v}`;
    if (activeFilters.has(key)) { activeFilters.delete(key); b.classList.remove('on'); }
    else                        { activeFilters.add(key);    b.classList.add('on');    }
    updateCounter();
  });
});

// copiar posições (lente atual)
document.getElementById('btn-copy-pos')?.addEventListener('click', () => {
  copyToClipboard(JSON.stringify(positionsForLens(currentLens), null, 2));
  const btn = document.getElementById('btn-copy-pos');
  if (btn) { btn.textContent = 'copiado ✓'; setTimeout(() => { btn.textContent = 'copiar posições'; }, 1800); }
});

// copiar tudo (todas as lentes, pronto para colar no mapa.json > nodes > id > lens)
document.getElementById('btn-copy-all')?.addEventListener('click', () => {
  copyToClipboard(JSON.stringify(allPositions(), null, 2));
  const btn = document.getElementById('btn-copy-all');
  if (btn) { btn.textContent = 'copiado ✓'; setTimeout(() => { btn.textContent = 'copiar tudo'; }, 1800); }
});

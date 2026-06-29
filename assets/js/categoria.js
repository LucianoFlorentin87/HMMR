/* categoria.js — página de categoría individual */

const BASE = (location.hostname === 'localhost' || location.hostname === '127.0.0.1') ? '' : '';
const PLACEHOLDER = 'https://via.placeholder.com/400x530/142438/C9963A?text=HMMR';

const coloresMap = {
  'Negro':'#111','Blanco':'#f5f5f5','Azul':'#1a4a8a','Celeste':'#4a90d9',
  'Gris':'#888','Beige':'#c9a96e','Verde':'#2d6a4f','Rojo':'#c8102e',
  'Marrón':'#6b3a2a','Arena':'#d4b896','Marino':'#0d2137','Crudo':'#e8dcc8',
};

function formatPrecio(n) {
  if (!n) return '';
  return 'Gs. ' + Math.round(n).toLocaleString('es-PY');
}
function precioGs(v) {
  if (!v) return 0;
  const s = String(v).replace(/[^\d.]/g, '');
  return parseFloat(s) || 0;
}
function imgSrc(p) {
  return p.imagenFallback || p.imagen || PLACEHOLDER;
}

// ---- URL PARAM ----
function getParam(name) {
  return new URLSearchParams(location.search).get(name) || '';
}

// ---- STATE ----
let todosProductos = [];
let categoriaActual = '';
let categoriaInfo = null;
let waNum = '595982372521';

// ---- INIT ----
document.addEventListener('DOMContentLoaded', async () => {
  categoriaActual = decodeURIComponent(getParam('cat'));
  if (!categoriaActual) { location.href = 'index.html'; return; }

  document.title = categoriaActual + ' — HMMR Jeans';

  await Promise.all([cargarConfig(), cargarProductos()]);
  initNavbar();
  initSearch();
  initModal();
});

// ---- CONFIG ----
async function cargarConfig() {
  try {
    const r = await fetch('assets/data/config.json?v=' + Date.now());
    const cfg = await r.json();

    // WhatsApp
    if (cfg.contacto && cfg.contacto.whatsapp) waNum = cfg.contacto.whatsapp;

    // Buscar info de esta categoría
    if (Array.isArray(cfg.categorias)) {
      categoriaInfo = cfg.categorias.find(c =>
        c.nombre === categoriaActual || c.filtro === categoriaActual
      ) || null;
    }

    // Actualizar hero de categoría
    const heroTitle   = document.getElementById('cat-hero-title');
    const heroCrumb   = document.getElementById('cat-breadcrumb-name');
    const heroBg      = document.getElementById('cat-hero-bg');
    const colTitle    = document.getElementById('coleccion-title');
    if (heroTitle) heroTitle.textContent = categoriaActual.toUpperCase();
    if (heroCrumb) heroCrumb.textContent = categoriaActual;
    if (colTitle)  colTitle.textContent  = categoriaActual;
    if (heroBg && categoriaInfo && categoriaInfo.imagen) {
      heroBg.style.backgroundImage = `url('${categoriaInfo.imagen}')`;
    }

    // Footer contacto
    const ft = document.getElementById('footer-telefono');
    const fe = document.getElementById('footer-email');
    if (ft && cfg.contacto.telefono) ft.textContent = cfg.contacto.telefono;
    if (fe && cfg.contacto.email)    fe.textContent = cfg.contacto.email;

    // WA flotante
    const waf = document.getElementById('whatsapp-float');
    if (waf) waf.href = `https://wa.me/${waNum}?text=Hola%20HMMR%20Jeans%2C%20me%20interesan%20sus%20productos`;

  } catch (e) {
    console.error('Config error:', e);
  }
}

// ---- PRODUCTOS ----
async function cargarProductos() {
  try {
    const r = await fetch('assets/data/productos.json?v=' + Date.now());
    const data = await r.json();
    todosProductos = data.productos || [];
  } catch (e) {
    console.error('Productos error:', e);
  }

  // Filtrar: usar filtro de config si existe, sino el nombre directamente
  const filtro = (categoriaInfo && categoriaInfo.filtro) ? categoriaInfo.filtro : categoriaActual;
  const lista = filtro === 'Todos'
    ? todosProductos
    : todosProductos.filter(p => p.categoria === filtro || p.categoria === categoriaActual);

  const countEl = document.getElementById('cat-count');
  if (countEl) countEl.textContent = lista.length + ' producto' + (lista.length !== 1 ? 's' : '');

  renderProductos(lista);
}

// ---- RENDER ----
function renderProductos(lista) {
  const grid = document.getElementById('grid-productos');
  const sinRes = document.getElementById('sin-resultados');
  if (!grid) return;

  if (!lista.length) {
    grid.innerHTML = '';
    if (sinRes) sinRes.style.display = 'flex';
    return;
  }
  if (sinRes) sinRes.style.display = 'none';

  grid.innerHTML = lista.map(p => {
    const badge = p.etiqueta
      ? `<span class="prod-badge ${p.oferta ? 'badge-sale' : p.nuevo ? 'badge-new' : 'badge-exclusive'}">${p.etiqueta}</span>` : '';
    const precioOrig = p.precioOriginal
      ? `<span class="price-was">${formatPrecio(precioGs(p.precioOriginal))}</span>` : '';
    const dots = (p.colores || []).map(c =>
      `<span class="color-dot" style="background:${coloresMap[c] || '#999'}" title="${c}"></span>`
    ).join('');
    const src = imgSrc(p);
    const fallback = p.imagenFallback || PLACEHOLDER;
    return `
    <div class="prod-card" data-id="${p.id}">
      <div class="prod-img-wrap">
        <div class="prod-img">
          ${badge}
          <img src="${src}" alt="${p.nombre}" loading="lazy" onerror="this.onerror=null;this.src='${fallback}'">
          <div class="prod-actions">
            <button class="prod-action-btn" onclick="abrirModal(${p.id})">
              <i class="fas fa-eye"></i> Ver
            </button>
            <button class="prod-action-btn" onclick="abrirModal(${p.id})">
              <i class="fas fa-shopping-bag"></i> Añadir
            </button>
          </div>
        </div>
      </div>
      <div class="prod-info">
        <p class="prod-brand">HMMR Jeans</p>
        <h3 class="prod-name">${p.nombre}</h3>
        <div class="prod-colors">${dots}</div>
        <div class="prod-price">
          <span class="price-now">${formatPrecio(precioGs(p.precio))}</span>
          ${precioOrig}
        </div>
      </div>
    </div>`;
  }).join('');
}

// ---- MODAL ----
let modalEl, modalBody;

function initModal() {
  modalEl   = document.getElementById('modal-producto');
  modalBody = document.getElementById('modal-body');
  if (!modalEl) return;
  modalEl.addEventListener('click', e => { if (e.target === modalEl) cerrarModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') cerrarModal(); });
}

function abrirModal(id) {
  const p = todosProductos.find(x => x.id === id);
  if (!p || !modalEl || !modalBody) return;

  const src = imgSrc(p);
  const tallas = (p.tallas || []).map(t =>
    `<button class="talla-btn" onclick="this.closest('.tallas-list').querySelectorAll('.talla-btn').forEach(b=>b.classList.remove('selected'));this.classList.add('selected')">${t}</button>`
  ).join('');
  const colores = (p.colores || []).map(c =>
    `<span class="color-dot" style="background:${coloresMap[c] || '#999'};width:22px;height:22px" title="${c}"></span>`
  ).join('');
  const waMsg = encodeURIComponent(`Hola HMMR Jeans, me interesa el producto: ${p.nombre} (Ref: ${p.id})`);

  modalBody.innerHTML = `
    <div style="display:grid;grid-template-columns:1fr 1fr">
      <div style="background:#091827;overflow:hidden;min-height:400px">
        <img src="${src}" alt="${p.nombre}" style="width:100%;height:100%;object-fit:cover;object-position:top" onerror="this.src='${PLACEHOLDER}'">
      </div>
      <div style="padding:36px 28px;display:flex;flex-direction:column;gap:12px">
        <p style="font-size:0.6rem;letter-spacing:3px;color:var(--gold);text-transform:uppercase">HMMR Jeans</p>
        <h2 style="font-family:'Playfair Display',serif;font-size:1.5rem;color:#fff;line-height:1.2">${p.nombre}</h2>
        <div style="display:flex;align-items:baseline;gap:12px;margin:4px 0">
          <span style="font-size:1.3rem;font-weight:700;color:#fff">${formatPrecio(precioGs(p.precio))}</span>
          ${p.precioOriginal ? `<span style="font-size:0.9rem;color:#888;text-decoration:line-through">${formatPrecio(precioGs(p.precioOriginal))}</span>` : ''}
        </div>
        ${p.descripcion ? `<p style="font-size:0.82rem;color:#aaa;line-height:1.7">${p.descripcion}</p>` : ''}
        ${colores ? `<div><p style="font-size:0.6rem;letter-spacing:2px;color:#666;text-transform:uppercase;margin-bottom:8px">COLORES</p><div style="display:flex;gap:8px;flex-wrap:wrap">${colores}</div></div>` : ''}
        ${tallas ? `<div class="tallas-wrap"><span class="tallas-label">TALLE</span><div class="tallas-list">${tallas}</div></div>` : ''}
        <a href="https://wa.me/${waNum}?text=${waMsg}" target="_blank" rel="noopener"
           style="display:flex;align-items:center;justify-content:center;gap:10px;padding:15px;background:#25D366;color:#fff;font-size:0.72rem;font-weight:700;letter-spacing:2px;text-transform:uppercase;text-decoration:none;margin-top:auto;transition:background 0.2s"
           onmouseover="this.style.background='#1da854'" onmouseout="this.style.background='#25D366'">
          <i class="fab fa-whatsapp" style="font-size:1.1rem"></i> CONSULTAR POR WHATSAPP
        </a>
      </div>
    </div>`;

  modalEl.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function cerrarModal() {
  if (modalEl) modalEl.classList.remove('open');
  document.body.style.overflow = '';
}

// ---- NAVBAR ----
function initNavbar() {
  const navbar = document.getElementById('navbar');
  const btt    = document.getElementById('backToTop');
  const menuBtn = document.getElementById('menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');

  window.addEventListener('scroll', () => {
    if (navbar) navbar.classList.toggle('scrolled', scrollY > 60);
    if (btt)    btt.classList.toggle('visible', scrollY > 400);
  });

  if (btt) btt.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', () => mobileMenu.classList.toggle('open'));
  }
}

// ---- SEARCH ----
function initSearch() {
  const btnSearch  = document.getElementById('btn-search');
  const overlay    = document.getElementById('search-overlay');
  const closeBtn   = document.getElementById('search-close');
  const input      = document.getElementById('search-input');
  const results    = document.getElementById('search-results');

  function abrirSearch() { if (overlay) { overlay.classList.add('open'); if (input) input.focus(); } }
  function cerrarSearch() { if (overlay) { overlay.classList.remove('open'); if (input) input.value = ''; if (results) results.innerHTML = ''; } }

  if (btnSearch) btnSearch.addEventListener('click', abrirSearch);
  if (closeBtn)  closeBtn.addEventListener('click', cerrarSearch);
  if (overlay)   overlay.addEventListener('click', e => { if (e.target === overlay) cerrarSearch(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') cerrarSearch(); });

  if (input && results) {
    input.addEventListener('input', () => {
      const q = input.value.trim().toLowerCase();
      if (!q) { results.innerHTML = ''; return; }
      const found = todosProductos.filter(p =>
        p.nombre.toLowerCase().includes(q) || (p.descripcion || '').toLowerCase().includes(q)
      ).slice(0, 6);
      if (!found.length) { results.innerHTML = '<p style="color:#666;font-size:0.82rem;padding:12px 0">Sin resultados</p>'; return; }
      results.innerHTML = found.map(p => `
        <div class="search-result-item" onclick="abrirModal(${p.id});cerrarSearch()" style="cursor:pointer">
          <img src="${imgSrc(p)}" alt="${p.nombre}" onerror="this.src='${PLACEHOLDER}'">
          <div>
            <p class="sr-name">${p.nombre}</p>
            <p class="sr-price">${formatPrecio(precioGs(p.precio))}</p>
          </div>
        </div>`).join('');
    });
  }
}

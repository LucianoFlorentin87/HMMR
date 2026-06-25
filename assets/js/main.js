/* ============================================================
   HMMR JEANS — main.js
   ============================================================ */

// ---- ANNOUNCEMENT BAR HEIGHT OFFSET ----
const annBar = document.getElementById('announcement-bar');
const navbar = document.getElementById('navbar');

function syncNavbarOffset() {
  if (annBar && annBar.style.display !== 'none') {
    const h = annBar.offsetHeight;
    navbar.style.top = h + 'px';
    navbar.classList.add('has-bar');
  } else {
    navbar.style.top = '0';
    navbar.classList.remove('has-bar');
  }
}
syncNavbarOffset();

// ---- NAVBAR SCROLL ----
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
  document.getElementById('backToTop').classList.toggle('visible', window.scrollY > 400);
}, { passive: true });

// ---- MOBILE MENU ----
document.getElementById('menu-btn').addEventListener('click', () => {
  const m = document.getElementById('mobile-menu');
  m.classList.toggle('open');
  const icon = document.querySelector('#menu-btn i');
  icon.className = m.classList.contains('open') ? 'fas fa-times' : 'fas fa-bars';
});
document.querySelectorAll('#mobile-menu a').forEach(a => {
  a.addEventListener('click', () => {
    document.getElementById('mobile-menu').classList.remove('open');
    document.querySelector('#menu-btn i').className = 'fas fa-bars';
  });
});

// ---- BACK TO TOP ----
document.getElementById('backToTop').addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ---- PRODUCT DATA ----
let todosProductos = [];

const coloresMap = {
  'azul': '#2563eb', 'negro': '#111',   'gris': '#6b7280',
  'azul claro': '#93c5fd', 'blanco': '#f5f5f5', 'blanco roto': '#ede9d0',
  'khaki': '#a08050', 'verde': '#4a7c59', 'bordo': '#800020'
};

function formatPrecio(num) {
  return 'GS. ' + num.toLocaleString('es-PY');
}

function precioGs(precio) {
  // Convertir precio ARS → representación en Gs (visual)
  return precio * 1000;
}

// ---- IMAGE WITH FALLBACK ----
function imgSrc(p) {
  // Si la imagen es una ruta local (no empieza con http), usar directamente el fallback
  const local = p.imagen && !p.imagen.startsWith('http');
  if (local) return p.imagenFallback || 'https://via.placeholder.com/400x530/142438/C9963A?text=HMMR';
  return p.imagen || p.imagenFallback || 'https://via.placeholder.com/400x530/142438/C9963A?text=HMMR';
}
function imgError(el, p) {
  if (p.imagenFallback) el.src = p.imagenFallback;
  else el.src = 'https://via.placeholder.com/400x530/142438/C9963A?text=HMMR';
}

// ---- RENDER PRODUCTS ----
function renderProductos(lista, containerId = 'grid-productos') {
  const grid = document.getElementById(containerId);
  const sinRes = document.getElementById('sin-resultados');
  if (!grid) return;

  if (!lista.length) {
    grid.innerHTML = '';
    if (sinRes) sinRes.style.display = 'block';
    return;
  }
  if (sinRes) sinRes.style.display = 'none';

  grid.innerHTML = lista.map(p => {
    const badge = p.etiqueta
      ? `<span class="prod-badge ${p.oferta ? 'badge-sale' : p.nuevo ? 'badge-new' : 'badge-exclusive'}">${p.etiqueta}</span>` : '';
    const precioOrig = p.precioOriginal
      ? `<span class="price-was">${formatPrecio(precioGs(p.precioOriginal))}</span>` : '';
    const dots = p.colores.map(c =>
      `<span class="color-dot" style="background:${coloresMap[c] || '#999'}" title="${c}"></span>`
    ).join('');
    const brandLbl = p.categoria === 'Doom Free' ? 'Doom Free Design' : 'HMMR Jeans';
    const src = imgSrc(p);
    const fallback = p.imagenFallback || 'https://via.placeholder.com/400x530/142438/C9963A?text=HMMR';

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
            <button class="prod-action-btn fav" onclick="toggleFav(this)">
              <i class="far fa-heart"></i>
            </button>
          </div>
        </div>
      </div>
      <div class="prod-info">
        <p class="prod-brand">${brandLbl}</p>
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

// ---- RENDER DESTACADOS (4 products with stars) ----
function renderDestacados(lista) {
  const grid = document.getElementById('destacados-grid');
  if (!grid) return;
  const items = lista.slice(0, 4);
  const ratings = [128, 96, 78, 64];
  grid.innerHTML = items.map((p, i) => {
    const src = imgSrc(p);
    const fallback = p.imagenFallback || 'https://via.placeholder.com/400x530/142438/C9963A?text=HMMR';
    const stars = p.estrellas ? Math.round(p.estrellas) : 4;
    const starHtml = '★'.repeat(stars) + (stars < 5 ? '<span style="opacity:.35">★</span>'.repeat(5-stars) : '');
    return `
    <div class="dest-card" onclick="abrirModal(${p.id})">
      <div class="dest-img">
        <img src="${src}" alt="${p.nombre}" loading="lazy" onerror="this.onerror=null;this.src='${fallback}'">
      </div>
      <div class="dest-info">
        <h3 class="dest-name">${p.nombre}</h3>
        <div class="dest-price">${formatPrecio(precioGs(p.precio))}</div>
        <div class="dest-bottom">
          <div class="dest-stars">${starHtml} <span>(${ratings[i] || 32})</span></div>
          <button class="dest-cart-btn" onclick="event.stopPropagation();agregarCarrito('${p.nombre}')">
            <i class="fas fa-shopping-bag"></i>
          </button>
        </div>
      </div>
    </div>`;
  }).join('');
}

// ---- GOOGLE SHEETS CONFIG ----
const SHEETS_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSmG6SKGKRJ2JxcBcHDXBv_BVBWgIeXAkaZ-WYBA6v7hVfjcf-56EK8j3N0HVJsRfRm7mESHaGhgz6U/pub?gid=2097976075&single=true&output=csv';

function parsearCSV(csv) {
  const rows = [];
  let cur = '', inQ = false, fields = [];
  for (let i = 0; i < csv.length; i++) {
    const ch = csv[i];
    if (ch === '"') {
      if (inQ && csv[i+1] === '"') { cur += '"'; i++; }
      else inQ = !inQ;
    } else if (ch === ',' && !inQ) {
      fields.push(cur); cur = '';
    } else if ((ch === '\n' || ch === '\r') && !inQ) {
      fields.push(cur); cur = '';
      if (fields.some(f => f.trim())) rows.push(fields);
      fields = [];
      if (ch === '\r' && csv[i+1] === '\n') i++;
    } else {
      cur += ch;
    }
  }
  if (cur || fields.length) { fields.push(cur); if (fields.some(f => f.trim())) rows.push(fields); }
  return rows;
}

function parsearSheets(csv) {
  const rows = parsearCSV(csv);
  if (rows.length < 2) return [];
  const cabeceras = rows[0].map(h => h.trim());
  return rows.slice(1).map((cols, i) => {
    const obj = {};
    cabeceras.forEach((h, idx) => { obj[h] = (cols[idx] || '').trim(); });
    return {
      id:             i + 1,
      nombre:         obj.nombre        || '',
      categoria:      obj.categoria     || 'HMMR Jeans',
      precio:         parseFloat(obj.precio)               || 0,
      precioOriginal: obj.precioOriginal ? parseFloat(obj.precioOriginal) : null,
      imagen:         obj.imagen        || '',
      imagenFallback: obj.imagenFallback || '',
      descripcion:    obj.descripcion   || '',
      colores:        obj.colores  ? obj.colores.split('|').map(c => c.trim()) : [],
      tallas:         obj.tallas   ? obj.tallas.split('|').map(t => t.trim())  : [],
      nuevo:          obj.nuevo  === 'si' || obj.nuevo  === 'true',
      oferta:         obj.oferta === 'si' || obj.oferta === 'true',
      etiqueta:       obj.etiqueta || null,
      estrellas:      parseFloat(obj.estrellas) || 4
    };
  }).filter(p => p.nombre);
}

// ---- LOAD PRODUCTS ----
async function cargarProductos() {
  let productos, categorias;

  // Intentar Google Sheets primero
  if (SHEETS_CSV_URL) {
    try {
      const resp = await fetch(SHEETS_CSV_URL);
      if (!resp.ok) throw new Error('HTTP ' + resp.status);
      const csv = await resp.text();
      const parsed = parsearSheets(csv);
      if (parsed.length > 0) {
        productos  = parsed;
        categorias = ['Todos', ...new Set(parsed.map(p => p.categoria))];
      }
    } catch (e) {
      console.warn('Google Sheets no disponible, usando JSON local:', e.message);
    }
  }

  // Fallback: JSON local
  if (!productos) {
    try {
      const resp = await fetch('assets/data/productos.json');
      const data = await resp.json();
      productos  = data.productos;
      categorias = data.categorias;
    } catch (e) {
      console.error('Error cargando productos:', e);
    }
  }

  if (!productos || productos.length === 0) {
    const g = document.getElementById('grid-productos');
    if (g) g.innerHTML = '<p style="text-align:center;padding:3rem;color:var(--gray-mid);grid-column:1/-1">No se pudieron cargar los productos.</p>';
    return;
  }

  todosProductos = productos;
  renderProductos(todosProductos);
  renderDestacados(todosProductos);
  crearFiltros(categorias);
}

// ---- FILTERS ----
function crearFiltros(categorias) {
  const cont = document.getElementById('filtros');
  if (!cont) return;
  cont.innerHTML = categorias.map((cat, i) =>
    `<button class="filter-btn ${i === 0 ? 'active' : ''}" data-cat="${cat}">${cat}</button>`
  ).join('');

  cont.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      cont.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.dataset.cat;
      renderProductos(cat === 'Todos' ? todosProductos : todosProductos.filter(p => p.categoria === cat));
    });
  });
}

// ---- TESTIMONIALS ----
function cargarTestimonios(lista) {
  const cont = document.getElementById('grid-testimonios');
  if (!cont) return;
  const stars = n => '★'.repeat(n) + '☆'.repeat(5 - n);
  cont.innerHTML = lista.map(t => `
    <div class="testi-card">
      <div class="testi-stars">${stars(t.estrellas)}</div>
      <p class="testi-text">"${t.texto}"</p>
      <div>
        <p class="testi-author">${t.nombre}</p>
        <p class="testi-city">${t.ciudad}</p>
      </div>
    </div>
  `).join('');
}

// ---- SEARCH ----
const searchOverlay = document.getElementById('search-overlay');
const searchInput   = document.getElementById('search-input');

document.getElementById('btn-search').addEventListener('click', () => {
  searchOverlay.classList.add('open');
  setTimeout(() => searchInput.focus(), 100);
  document.body.style.overflow = 'hidden';
});

document.getElementById('search-close').addEventListener('click', cerrarSearch);
searchOverlay.addEventListener('click', e => { if (e.target === searchOverlay) cerrarSearch(); });

function cerrarSearch() {
  searchOverlay.classList.remove('open');
  document.body.style.overflow = '';
  searchInput.value = '';
  document.getElementById('search-results').innerHTML = '';
}

searchInput.addEventListener('input', () => {
  const q = searchInput.value.trim().toLowerCase();
  const resultsEl = document.getElementById('search-results');
  if (!q) { resultsEl.innerHTML = ''; return; }

  const found = todosProductos.filter(p =>
    p.nombre.toLowerCase().includes(q) ||
    p.categoria.toLowerCase().includes(q) ||
    (p.descripcion && p.descripcion.toLowerCase().includes(q)) ||
    p.colores.some(c => c.toLowerCase().includes(q))
  );

  if (!found.length) {
    resultsEl.innerHTML = '<p class="search-no-results">Sin resultados para "' + searchInput.value + '"</p>';
    return;
  }
  resultsEl.innerHTML = found.slice(0, 6).map(p => `
    <div class="search-result-card" onclick="cerrarSearch();abrirModal(${p.id})">
      <img src="${p.imagen}" alt="${p.nombre}"
        onerror="this.src='https://via.placeholder.com/400x530/142438/C9963A?text=HMMR'">
      <div class="search-result-info">
        <p>${p.categoria}</p>
        <strong>${p.nombre}</strong>
        <span style="font-size:0.72rem;color:var(--gold);font-weight:700">${formatPrecio(precioGs(p.precio))}</span>
      </div>
    </div>
  `).join('');
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    cerrarSearch();
    cerrarCartSidebar();
    document.getElementById('user-modal').classList.remove('open');
    document.body.style.overflow = '';
  }
});


// ---- CART SIDEBAR ----
let carrito = [];

document.getElementById('btn-cart').addEventListener('click', abrirCartSidebar);
document.getElementById('cart-close').addEventListener('click', cerrarCartSidebar);
document.getElementById('cart-overlay-bg').addEventListener('click', cerrarCartSidebar);
document.getElementById('cart-clear').addEventListener('click', () => {
  carrito = [];
  actualizarCartUI();
});
document.getElementById('cart-go-shop').addEventListener('click', cerrarCartSidebar);

function abrirCartSidebar() {
  document.getElementById('cart-sidebar').classList.add('open');
  document.getElementById('cart-overlay-bg').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function cerrarCartSidebar() {
  document.getElementById('cart-sidebar').classList.remove('open');
  document.getElementById('cart-overlay-bg').classList.remove('open');
  document.body.style.overflow = '';
}

function actualizarCartUI() {
  const count = carrito.reduce((s, i) => s + i.qty, 0);
  const total = carrito.reduce((s, i) => s + i.precio * i.qty, 0);
  const counter = document.querySelector('.nav-cart-count');
  if (counter) counter.textContent = count;
  document.querySelector('.cart-header-count').textContent = '(' + count + ')';

  const list = document.getElementById('cart-items-list');
  const footer = document.getElementById('cart-footer');
  document.getElementById('cart-total-price').textContent = formatPrecio(total);

  if (!carrito.length) {
    footer.style.display = 'none';
    list.innerHTML = `
      <div class="cart-empty">
        <i class="fas fa-shopping-bag"></i>
        <p>Tu carrito está vacío</p>
        <a href="#coleccion" class="btn-primary" style="font-size:0.7rem;padding:12px 24px" id="cart-go-shop">Ver Colección</a>
      </div>`;
    document.getElementById('cart-go-shop').addEventListener('click', cerrarCartSidebar);
    return;
  }

  footer.style.display = 'block';
  list.innerHTML = carrito.map((item, idx) => `
    <div class="cart-item">
      <img src="${item.imagen}" alt="${item.nombre}"
        onerror="this.src='https://via.placeholder.com/400x530/142438/C9963A?text=HMMR'">
      <div class="cart-item-info">
        <p>${item.categoria}</p>
        <strong>${item.nombre}</strong>
        <span class="cart-item-price">${formatPrecio(item.precio)}</span>
        <div class="cart-item-qty">
          <button onclick="cambiarQty(${idx},-1)">−</button>
          <span>${item.qty}</span>
          <button onclick="cambiarQty(${idx},1)">+</button>
        </div>
      </div>
      <button class="cart-item-remove" onclick="eliminarDelCarrito(${idx})"><i class="fas fa-trash-alt"></i></button>
    </div>
  `).join('');

  // Update WhatsApp checkout link with products
  const items = carrito.map(i => `${i.qty}x ${i.nombre}`).join(', ');
  document.querySelector('.cart-checkout-btn').href =
    `https://wa.me/595981000001?text=Hola%20HMMR%2C%20quiero%20pedir%3A%20${encodeURIComponent(items)}`;
}

function cambiarQty(idx, delta) {
  carrito[idx].qty += delta;
  if (carrito[idx].qty <= 0) carrito.splice(idx, 1);
  actualizarCartUI();
}

function eliminarDelCarrito(idx) {
  carrito.splice(idx, 1);
  actualizarCartUI();
}


// ---- CART NOTIFICATION ----
function agregarCarrito(nombre) {
  const prod = todosProductos.find(p => p.nombre === nombre);
  if (prod) {
    const existing = carrito.find(i => i.id === prod.id);
    if (existing) {
      existing.qty += 1;
    } else {
      carrito.push({
        id: prod.id,
        nombre: prod.nombre,
        categoria: prod.categoria,
        imagen: prod.imagen,
        precio: precioGs(prod.precio),
        qty: 1
      });
    }
    actualizarCartUI();
  }

  const notif = document.getElementById('cart-notification');
  document.getElementById('cart-item-name').textContent = nombre;
  notif.classList.add('show');
  setTimeout(() => notif.classList.remove('show'), 3500);
}

// ---- USER MODAL ----
document.getElementById('btn-user').addEventListener('click', () => {
  document.getElementById('user-modal').classList.add('open');
  document.body.style.overflow = 'hidden';
});
document.getElementById('user-modal-close').addEventListener('click', () => {
  document.getElementById('user-modal').classList.remove('open');
  document.body.style.overflow = '';
});
document.getElementById('user-modal').addEventListener('click', e => {
  if (e.target === document.getElementById('user-modal')) {
    document.getElementById('user-modal').classList.remove('open');
    document.body.style.overflow = '';
  }
});
document.querySelectorAll('.user-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.user-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById('tab-login').style.display = tab.dataset.tab === 'login' ? '' : 'none';
    document.getElementById('tab-registro').style.display = tab.dataset.tab === 'registro' ? '' : 'none';
  });
});
document.querySelectorAll('.user-submit-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const label = btn.textContent.trim();
    btn.textContent = '✓ ¡Listo!';
    btn.style.background = '#22c55e';
    setTimeout(() => {
      btn.textContent = label;
      btn.style.background = '';
      document.getElementById('user-modal').classList.remove('open');
      document.body.style.overflow = '';
    }, 2000);
  });
});


// ---- FAVORITES ----
function toggleFav(btn) {
  const ico = btn.querySelector('i');
  const isActive = ico.classList.contains('fas');
  ico.classList.toggle('far', isActive);
  ico.classList.toggle('fas', !isActive);
  btn.style.background = isActive ? '' : 'var(--gold)';
  btn.style.color = isActive ? '' : 'var(--ink)';
}

// ---- MODAL ----
function abrirModal(id) {
  const p = todosProductos.find(x => x.id === id);
  if (!p) return;

  const dots = p.colores.map(c =>
    `<span class="color-dot" style="background:${coloresMap[c]||'#999'};width:14px;height:14px" title="${c}"></span>`
  ).join('');
  const badge = p.etiqueta
    ? `<span class="prod-badge ${p.oferta?'badge-sale':p.nuevo?'badge-new':'badge-exclusive'}" style="position:static;display:inline-block;margin-bottom:0.75rem">${p.etiqueta}</span>` : '';
  const precioOrig = p.precioOriginal
    ? `<span class="price-was" style="font-size:0.9rem">${formatPrecio(precioGs(p.precioOriginal))}</span>` : '';

  const tallasHtml = p.tallas && p.tallas.length
    ? `<div class="tallas-wrap">
        <span class="tallas-label">Talle</span>
        <div class="tallas-list">
          ${p.tallas.map(t => `<button class="talla-btn" onclick="selectTalla(this)">${t}</button>`).join('')}
        </div>
       </div>` : '';

  const src = imgSrc(p);
  const fallback = p.imagenFallback || 'https://via.placeholder.com/400x530/142438/C9963A?text=HMMR';

  document.getElementById('modal-body').innerHTML = `
    <div style="display:grid;grid-template-columns:1fr 1fr">
      <img src="${src}" alt="${p.nombre}"
        style="width:100%;height:480px;object-fit:cover;object-position:top"
        onerror="this.onerror=null;this.src='${fallback}'">
      <div style="padding:2.5rem;display:flex;flex-direction:column;justify-content:space-between;background:var(--chalk)">
        <div>
          ${badge}
          <p style="font-size:0.58rem;letter-spacing:3px;text-transform:uppercase;color:var(--gray-mid);margin-bottom:4px">
            ${p.categoria === 'Doom Free' ? 'Doom Free Design' : 'HMMR Jeans'}
          </p>
          <h2 style="font-family:'Playfair Display',serif;font-size:1.6rem;font-weight:900;color:var(--ink);line-height:1.1;margin-bottom:1rem">${p.nombre}</h2>
          <div style="width:30px;height:2px;background:var(--red);margin-bottom:1.25rem"></div>
          <p style="font-size:0.82rem;color:var(--gray-mid);line-height:1.75;margin-bottom:1.5rem">${p.descripcion}</p>
          <div style="margin-bottom:1.25rem">
            <p style="font-size:0.6rem;letter-spacing:3px;text-transform:uppercase;color:var(--gray-mid);font-weight:600;margin-bottom:0.5rem">Colores disponibles</p>
            <div style="display:flex;gap:6px">${dots}</div>
          </div>
          <div style="margin-bottom:0.5rem">
            <span style="font-size:1.4rem;font-weight:900;color:var(--ink)">${formatPrecio(precioGs(p.precio))}</span>
            ${precioOrig}
          </div>
          ${tallasHtml}
          <p style="font-size:0.68rem;color:var(--gray-mid);margin-bottom:1.75rem">
            <i class="fas fa-shield-alt" style="color:var(--gold);margin-right:4px"></i> Garantía 30 días · Envío a todo Paraguay
          </p>
        </div>
        <div style="display:flex;flex-direction:column;gap:8px">
          <button onclick="agregarCarrito('${p.nombre}');cerrarModal()"
            style="background:var(--red);color:#fff;border:2px solid var(--red);padding:15px;font-size:0.72rem;font-weight:700;letter-spacing:2px;text-transform:uppercase;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;transition:all 0.2s;font-family:'Inter',sans-serif;width:100%"
            onmouseover="this.style.background='transparent';this.style.color='var(--red)'"
            onmouseout="this.style.background='var(--red)';this.style.color='#fff'">
            <i class="fas fa-shopping-bag"></i> Agregar al Carrito
          </button>
          <a href="https://wa.me/595981000001?text=Hola%20HMMR%2C%20me%20interesa%20el%20${encodeURIComponent(p.nombre)}"
            target="_blank" rel="noopener"
            style="background:var(--ink);color:#fff;padding:12px;font-size:0.7rem;font-weight:700;letter-spacing:2px;text-transform:uppercase;display:flex;align-items:center;justify-content:center;gap:8px;text-decoration:none;transition:background 0.2s"
            onmouseover="this.style.background='#25D366'"
            onmouseout="this.style.background='var(--ink)'">
            <i class="fab fa-whatsapp"></i> Consultar por WhatsApp
          </a>
        </div>
      </div>
    </div>`;

  document.getElementById('modal-producto').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function cerrarModal() {
  document.getElementById('modal-producto').classList.remove('open');
  document.body.style.overflow = '';
}

function selectTalla(btn) {
  btn.closest('.tallas-list').querySelectorAll('.talla-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
}

// ---- FILTER BY CATEGORY (from visual categories) ----
function filtrarCategoria(cat) {
  setTimeout(() => {
    const btns = document.querySelectorAll('#filtros .filter-btn');
    btns.forEach(b => {
      b.classList.remove('active');
      if (b.dataset.cat === cat) b.classList.add('active');
    });
    renderProductos(cat === 'Todos' ? todosProductos : todosProductos.filter(p => p.categoria === cat));
  }, 300);
}
document.getElementById('modal-producto').addEventListener('click', e => {
  if (e.target === e.currentTarget) cerrarModal();
});

// ---- COUNTDOWN ----
function initCountdown() {
  const fin = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);
  function tick() {
    const diff = fin - Date.now();
    if (diff <= 0) return;
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = String(v).padStart(2, '0'); };
    set('cd-dias', d); set('cd-horas', h); set('cd-mins', m); set('cd-segs', s);
  }
  setInterval(tick, 1000);
  tick();
}

// ---- CONTACT FORM ----
const formContacto = document.getElementById('form-contacto');
if (formContacto) {
  formContacto.addEventListener('submit', e => {
    e.preventDefault();
    const btn = e.target.querySelector('.btn-submit');
    if (!btn) return;
    btn.innerHTML = '<i class="fas fa-check"></i> ¡Mensaje enviado!';
    btn.style.background = '#22c55e';
    btn.style.borderColor = '#22c55e';
    setTimeout(() => {
      e.target.reset();
      btn.innerHTML = '<i class="fas fa-paper-plane"></i> Enviar Mensaje';
      btn.style.background = '';
      btn.style.borderColor = '';
    }, 3500);
  });
}

// ---- SMOOTH SECTION REVEAL ----
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.style.opacity = '1';
      e.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.08 });

document.querySelectorAll('section').forEach(sec => {
  sec.style.opacity = '0';
  sec.style.transform = 'translateY(20px)';
  sec.style.transition = 'opacity 0.7s ease, transform 0.7s ease';
  observer.observe(sec);
});

// ---- PRODUCT CAROUSEL (estilo Baco, 4 por página) ----
function initProductCarousel() {
  const grid = document.getElementById('prodCarousel');
  const dotsWrap = document.getElementById('carouselDots');
  if (!grid || !todosProductos.length) return;

  const ITEMS_PER_PAGE = 4;
  const hmmrProds = todosProductos.filter(p => p.categoria === 'HMMR Jeans');
  const pages = Math.ceil(hmmrProds.length / ITEMS_PER_PAGE);
  let page = 0;

  function renderPage(p) {
    const start = p * ITEMS_PER_PAGE;
    const slice = hmmrProds.slice(start, start + ITEMS_PER_PAGE);
    grid.innerHTML = slice.map(prod => {
      const badge = prod.etiqueta
        ? `<span class="prod-badge ${prod.oferta ? 'badge-sale' : prod.nuevo ? 'badge-new' : 'badge-exclusive'}">${prod.etiqueta}</span>` : '';
      const precioOrig = prod.precioOriginal
        ? `<span class="price-was">${formatPrecio(precioGs(prod.precioOriginal))}</span>` : '';
      const src = imgSrc(prod);
      const fallback = prod.imagenFallback || 'https://via.placeholder.com/400x530/142438/C9963A?text=HMMR';
      return `
        <div class="prod-card" onclick="abrirModal(${prod.id})">
          <div class="prod-img-wrap">
            <div class="prod-img">
              ${badge}
              <img src="${src}" alt="${prod.nombre}" loading="lazy" onerror="this.onerror=null;this.src='${fallback}'">
            </div>
          </div>
          <div class="prod-info">
            <h3 class="prod-name">${prod.nombre}</h3>
            <div class="prod-price">
              <span class="price-now">${formatPrecio(precioGs(prod.precio))}</span>
              ${precioOrig}
            </div>
          </div>
        </div>`;
    }).join('');
    // update dots
    dotsWrap.querySelectorAll('.carousel-dot').forEach((d,i) => d.classList.toggle('active', i === p));
  }

  // build dots
  dotsWrap.innerHTML = Array.from({length: pages}, (_,i) =>
    `<button class="carousel-dot${i===0?' active':''}" data-page="${i}"></button>`
  ).join('');
  dotsWrap.querySelectorAll('.carousel-dot').forEach(d =>
    d.addEventListener('click', () => { page = +d.dataset.page; renderPage(page); })
  );

  document.getElementById('carouselPrev').addEventListener('click', () => {
    page = (page - 1 + pages) % pages; renderPage(page);
  });
  document.getElementById('carouselNext').addEventListener('click', () => {
    page = (page + 1) % pages; renderPage(page);
  });

  renderPage(0);
}

// ---- HERO SLIDER ----
function initHeroSlider() {
  const slides = document.querySelectorAll('#hero .slide');
  const dots   = document.querySelectorAll('.hero-dot');
  if (!slides.length) return;
  let current = 0, timer;

  function goTo(idx) {
    slides[current].classList.remove('active');
    if (dots[current]) dots[current].classList.remove('active');
    current = (idx + slides.length) % slides.length;
    slides[current].classList.add('active');
    if (dots[current]) dots[current].classList.add('active');
  }

  function next() { goTo(current + 1); }
  function prev() { goTo(current - 1); }

  function startAuto() { timer = setInterval(next, 5000); }
  function resetAuto()  { clearInterval(timer); startAuto(); }

  const btnNext = document.getElementById('heroNext');
  const btnPrev = document.getElementById('heroPrev');
  if (btnNext) btnNext.addEventListener('click', () => { next(); resetAuto(); });
  if (btnPrev) btnPrev.addEventListener('click', () => { prev(); resetAuto(); });
  dots.forEach(d => d.addEventListener('click', () => { goTo(+d.dataset.slide); resetAuto(); }));

  startAuto();
}

// ---- APPLY SITE CONFIG ----
async function aplicarConfig() {
  try {
    const r = await fetch('assets/data/config.json?v=' + Date.now());
    if (!r.ok) return;
    const cfg = await r.json();

    // HERO SLIDES
    if (cfg.hero && cfg.hero.slides) {
      const heroEl = document.getElementById('hero');
      const slides = cfg.hero.slides;
      // Reemplazar slides existentes
      const existingSlides = heroEl ? heroEl.querySelectorAll('.slide') : [];
      existingSlides.forEach(s => s.remove());
      if (heroEl) {
        slides.forEach((s, i) => {
          const div = document.createElement('div');
          div.className = 'slide' + (i === 0 ? ' active' : '');
          div.innerHTML = `
            <img class="slide-img" src="${s.imagen}" alt="${s.titulo}">
            <div class="slide-overlay"></div>
            <div class="slide-content">
              <div class="slide-pretitle">${s.pretitulo || ''}</div>
              <div class="slide-bigword">${s.titulo}</div>
              <p class="slide-tagline">${s.subtitulo || ''}</p>
              <a href="${s.link || '#'}" class="btn-hero">${s.boton || 'VER'}</a>
            </div>`;
          heroEl.insertBefore(div, heroEl.querySelector('.hero-arrow'));
        });
        // Actualizar dots
        const dotsWrap = document.getElementById('heroDots');
        if (dotsWrap) {
          dotsWrap.innerHTML = slides.map((_, i) =>
            `<button class="hero-dot${i===0?' active':''}" data-slide="${i}"></button>`
          ).join('');
        }
      }
    }

    // CATEGORÍAS
    if (cfg.categorias && cfg.categorias.length) {
      const catWrap = document.querySelector('#categorias .categories');
      if (catWrap) {
        catWrap.innerHTML = cfg.categorias.map(c => `
          <a href="#coleccion" class="category-card" onclick="document.getElementById('coleccion').style.display='block';filtrarCategoria('${c.filtro}')">
            <img src="${c.imagen}" alt="${c.nombre}" />
            <div class="cat-overlay">
              <span class="cat-name">${c.nombre}</span>
              <span class="cat-link">VER MÁS →</span>
            </div>
          </a>`).join('');
      }
    }

    // COLECCION BANNER
    if (cfg.coleccionBanner) {
      const cb = cfg.coleccionBanner;
      const sm = document.querySelector('.cbanner-small');
      const mn = document.querySelector('.cbanner-main');
      const yr = document.querySelector('.cbanner-year');
      const ri = document.querySelector('.cbanner-right img');
      if (sm) sm.textContent = cb.subtitulo || '';
      if (mn) mn.textContent = cb.titulo || '';
      if (yr) yr.textContent = cb.ano || '';
      if (ri) ri.src = cb.imagen || '';
    }

    // NOSOTROS
    if (cfg.nosotros) {
      const n = cfg.nosotros;
      const h1 = document.querySelector('.nos-h1');
      const h2 = document.querySelector('.nos-h2');
      const p  = document.querySelector('.nos-p');
      const im = document.querySelector('.nos-img img');
      if (h1) h1.textContent = n.titulo || '';
      if (h2) h2.textContent = n.subtitulo || '';
      if (p)  p.textContent  = n.texto || '';
      if (im) im.src         = n.imagen || '';
    }

    // INSTAGRAM
    if (cfg.instagram) {
      const ig = cfg.instagram;
      const handle = document.querySelector('.insta-handle');
      const grid   = document.querySelector('.insta-grid');
      if (handle) handle.textContent = ig.handle || '';
      if (grid && ig.fotos) {
        grid.innerHTML = ig.fotos.map(url =>
          `<div class="insta-post"><img src="${url}" alt="Instagram HMMR" /></div>`
        ).join('');
      }
    }

    // CONTACTO
    if (cfg.contacto) {
      const c = cfg.contacto;
      const waFloat = document.getElementById('whatsapp-float');
      if (waFloat && c.whatsapp) {
        waFloat.href = `https://wa.me/${c.whatsapp}?text=Hola%20HMMR%20Jeans%2C%20me%20interesan%20sus%20productos`;
      }
      const waBtn = document.querySelector('.btn-wa');
      if (waBtn && c.whatsapp) {
        waBtn.href = `https://wa.me/${c.whatsapp}?text=Hola%20HMMR%20Jeans%2C%20necesito%20ayuda`;
      }
    }
  } catch(e) {
    console.warn('config.json no disponible:', e.message);
  }
}

// ---- INIT ----
async function init() {
  await aplicarConfig();
  cargarProductos();
  initHeroSlider();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

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
  return num.toLocaleString('es-PY') + ' Gs';
}

function precioGs(precio) {
  // Convertir precio ARS → representación en Gs (visual)
  return precio * 1000;
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

    return `
    <div class="prod-card" data-id="${p.id}">
      <div class="prod-img">
        ${badge}
        <img src="${p.imagen}" alt="${p.nombre}" loading="lazy"
          onerror="this.src='https://via.placeholder.com/400x530/142438/C9963A?text=HMMR'">
        <div class="prod-actions">
          <button class="prod-action-btn" onclick="abrirModal(${p.id})">
            <i class="fas fa-eye"></i> Ver
          </button>
          <button class="prod-action-btn" onclick="agregarCarrito('${p.nombre}')">
            <i class="fas fa-shopping-bag"></i> Añadir
          </button>
          <button class="prod-action-btn fav" onclick="toggleFav(this)">
            <i class="far fa-heart"></i>
          </button>
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

// ---- LOAD PRODUCTS ----
async function cargarProductos() {
  try {
    const resp = await fetch('assets/data/productos.json');
    const data = await resp.json();
    todosProductos = data.productos;

    // Grid principal
    renderProductos(todosProductos);

    // Nuevos ingresos (horizontal scroll) — solo productos nuevos
    const nuevos = todosProductos.filter(p => p.nuevo);
    renderProductos(nuevos.length ? nuevos : todosProductos.slice(0, 5), 'scroll-nuevos');

    crearFiltros(data.categorias);
    cargarTestimonios(data.testimonios);
  } catch (err) {
    const g = document.getElementById('grid-productos');
    if (g) g.innerHTML = '<p style="text-align:center;padding:3rem;color:var(--gray-mid);grid-column:1/-1">No se pudieron cargar los productos.</p>';
  }
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

// ---- CART NOTIFICATION ----
function agregarCarrito(nombre) {
  const notif = document.getElementById('cart-notification');
  document.getElementById('cart-item-name').textContent = nombre;
  notif.classList.add('show');
  // Update counter
  const counter = document.querySelector('.nav-cart-count');
  if (counter) counter.textContent = (parseInt(counter.textContent) || 0) + 1;
  setTimeout(() => notif.classList.remove('show'), 3500);
}

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

  document.getElementById('modal-body').innerHTML = `
    <div style="display:grid;grid-template-columns:1fr 1fr">
      <img src="${p.imagen}" alt="${p.nombre}"
        style="width:100%;height:480px;object-fit:cover;object-position:top"
        onerror="this.src='https://via.placeholder.com/400x530/142438/C9963A?text=HMMR'">
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
document.getElementById('form-contacto').addEventListener('submit', e => {
  e.preventDefault();
  const btn = e.target.querySelector('.btn-submit');
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

// ---- INIT ----
document.addEventListener('DOMContentLoaded', () => {
  cargarProductos();
  initCountdown();
});

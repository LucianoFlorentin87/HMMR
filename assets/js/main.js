/* ===================================================
   HMMR JEANS — main.js
   Carga productos desde JSON, filtros, countdown, etc.
   =================================================== */

// ------- NAVBAR scrolled -------
window.addEventListener('scroll', () => {
  const nav = document.getElementById('navbar');
  const btn = document.getElementById('backToTop');
  if (window.scrollY > 80) { nav.classList.add('scrolled'); }
  else { nav.classList.remove('scrolled'); }
  if (window.scrollY > 400) { btn.classList.add('visible'); }
  else { btn.classList.remove('visible'); }
});

document.getElementById('backToTop').addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ------- MENÚ MÓVIL -------
const menuBtn  = document.getElementById('menu-btn');
const mobileMenu = document.getElementById('mobile-menu');
menuBtn.addEventListener('click', () => {
  mobileMenu.classList.toggle('hidden');
});
document.querySelectorAll('#mobile-menu a').forEach(link => {
  link.addEventListener('click', () => mobileMenu.classList.add('hidden'));
});

// ------- CARGAR PRODUCTOS DESDE JSON -------
let todosProductos = [];

async function cargarProductos() {
  try {
    const resp = await fetch('assets/data/productos.json');
    const data = await resp.json();
    todosProductos = data.productos;
    renderProductos(todosProductos);
    crearFiltros(data.categorias);
    cargarTestimonios(data.testimonios);
  } catch (err) {
    console.error('Error cargando productos:', err);
    document.getElementById('grid-productos').innerHTML =
      '<p class="text-center text-white/50 col-span-full py-10">No se pudieron cargar los productos.</p>';
  }
}

function formatPrecio(num) {
  return '$' + num.toLocaleString('es-AR');
}

function renderProductos(lista) {
  const grid = document.getElementById('grid-productos');
  const sinRes = document.getElementById('sin-resultados');

  if (!lista.length) {
    grid.innerHTML = '';
    sinRes.style.display = 'block';
    return;
  }
  sinRes.style.display = 'none';

  const coloresMap = {
    'azul': '#2563eb', 'negro': '#111', 'gris': '#6b7280',
    'azul claro': '#93c5fd', 'blanco': '#f5f5f5', 'blanco roto': '#ede9d0',
    'khaki': '#a08050'
  };

  grid.innerHTML = lista.map(p => {
    const badge = p.etiqueta
      ? `<span class="producto-badge ${p.oferta ? 'badge-oferta' : 'badge-nuevo'}">${p.etiqueta}</span>` : '';
    const precioOrig = p.precioOriginal
      ? `<span class="precio-original">${formatPrecio(p.precioOriginal)}</span>` : '';
    const dots = p.colores.map(c =>
      `<span class="colores-dot" style="background:${coloresMap[c] || '#999'}" title="${c}"></span>`
    ).join('');

    return `
    <div class="producto-card" data-id="${p.id}" data-cat="${p.categoria}">
      <div class="producto-img">
        ${badge}
        <img src="${p.imagen}" alt="${p.nombre}" loading="lazy" onerror="this.src='https://via.placeholder.com/400x530/0A1F44/C79A3B?text=HMMR'">
        <div class="producto-actions">
          <button class="action-btn" title="Ver producto" onclick="abrirModal(${p.id})">
            <i class="fas fa-eye"></i>
          </button>
          <button class="action-btn" title="Agregar al carrito" onclick="agregarCarrito('${p.nombre}')">
            <i class="fas fa-shopping-bag"></i>
          </button>
          <button class="action-btn" title="Favorito" onclick="toggleFav(this)">
            <i class="far fa-heart"></i>
          </button>
        </div>
      </div>
      <div class="producto-info">
        <p class="producto-cat">${p.categoria}</p>
        <h3 class="producto-nombre">${p.nombre}</h3>
        <div class="mb-2">${dots}</div>
        <div>
          <span class="precio-actual">${formatPrecio(p.precio)}</span>
          ${precioOrig}
        </div>
      </div>
    </div>`;
  }).join('');
}

// ------- FILTROS -------
function crearFiltros(categorias) {
  const cont = document.getElementById('filtros');
  cont.innerHTML = categorias.map((cat, i) =>
    `<button class="filter-btn ${i === 0 ? 'active' : ''}" data-cat="${cat}">${cat}</button>`
  ).join('');

  cont.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      cont.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.dataset.cat;
      const filtrados = cat === 'Todos' ? todosProductos
        : todosProductos.filter(p => p.categoria === cat);
      renderProductos(filtrados);
    });
  });
}

// ------- TESTIMONIOS -------
function cargarTestimonios(lista) {
  const cont = document.getElementById('grid-testimonios');
  const estrellas = n => '★'.repeat(n) + '☆'.repeat(5 - n);
  cont.innerHTML = lista.map(t => `
    <div class="testimonio-card">
      <div class="stars">${estrellas(t.estrellas)}</div>
      <p class="testimonio-texto">"${t.texto}"</p>
      <div>
        <p class="testimonio-autor">${t.nombre}</p>
        <p class="testimonio-ciudad">${t.ciudad}</p>
      </div>
    </div>
  `).join('');
}

// ------- CARRITO (notificación) -------
function agregarCarrito(nombre) {
  const notif = document.getElementById('cart-notification');
  notif.querySelector('#cart-item-name').textContent = nombre;
  notif.classList.add('show');
  setTimeout(() => notif.classList.remove('show'), 3000);
}

// ------- FAVORITOS -------
function toggleFav(btn) {
  const ico = btn.querySelector('i');
  if (ico.classList.contains('far')) {
    ico.classList.replace('far', 'fas');
    btn.style.background = '#C8102E';
    btn.style.color = '#fff';
  } else {
    ico.classList.replace('fas', 'far');
    btn.style.background = '';
    btn.style.color = '';
  }
}

// ------- MODAL PRODUCTO -------
function abrirModal(id) {
  const p = todosProductos.find(x => x.id === id);
  if (!p) return;
  const modal = document.getElementById('modal-producto');
  const coloresMap = {
    'azul': '#2563eb', 'negro': '#111', 'gris': '#6b7280',
    'azul claro': '#93c5fd', 'blanco': '#f5f5f5', 'blanco roto': '#ede9d0', 'khaki': '#a08050'
  };
  const dots = p.colores.map(c =>
    `<span class="colores-dot" style="background:${coloresMap[c]||'#999'};width:16px;height:16px" title="${c}"></span>`
  ).join('');
  const badge = p.etiqueta ? `<span class="producto-badge ${p.oferta?'badge-oferta':'badge-nuevo'} mb-3 inline-block">${p.etiqueta}</span>` : '';
  const precioOrig = p.precioOriginal ? `<span class="precio-original text-lg">${formatPrecio(p.precioOriginal)}</span>` : '';

  modal.querySelector('#modal-body').innerHTML = `
    <div class="grid grid-cols-1 md:grid-cols-2 gap-0">
      <img src="${p.imagen}" alt="${p.nombre}" class="w-full object-cover" style="max-height:420px;border-radius:6px 0 0 6px" onerror="this.src='https://via.placeholder.com/400x530/0A1F44/C79A3B?text=HMMR'">
      <div class="p-6 flex flex-col justify-between">
        <div>
          ${badge}
          <p class="producto-cat mb-1">${p.categoria}</p>
          <h2 class="section-title text-2xl mb-2">${p.nombre}</h2>
          <div class="divider-gold"></div>
          <p style="color:rgba(255,255,255,0.6);font-size:0.9rem;line-height:1.7;margin-bottom:1.5rem">${p.descripcion}</p>
          <div class="mb-4">
            <p class="section-label mb-2">Colores disponibles</p>
            <div class="flex gap-2">${dots}</div>
          </div>
          <div class="mb-6">
            <span class="precio-actual text-2xl">${formatPrecio(p.precio)}</span>
            ${precioOrig}
          </div>
        </div>
        <button class="btn-primary-hmmr w-full text-center" onclick="agregarCarrito('${p.nombre}');cerrarModal()">
          <i class="fas fa-shopping-bag mr-2"></i> Agregar al carrito
        </button>
      </div>
    </div>`;
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function cerrarModal() {
  document.getElementById('modal-producto').classList.remove('open');
  document.body.style.overflow = '';
}
document.getElementById('modal-producto').addEventListener('click', e => {
  if (e.target === e.currentTarget) cerrarModal();
});

// ------- COUNTDOWN -------
function initCountdown() {
  const fin = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
  function tick() {
    const diff = fin - Date.now();
    if (diff <= 0) { clearInterval(t); return; }
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    document.getElementById('cd-dias').textContent  = String(d).padStart(2,'0');
    document.getElementById('cd-horas').textContent = String(h).padStart(2,'0');
    document.getElementById('cd-mins').textContent  = String(m).padStart(2,'0');
    document.getElementById('cd-segs').textContent  = String(s).padStart(2,'0');
  }
  const t = setInterval(tick, 1000);
  tick();
}

// ------- FORMULARIO CONTACTO -------
document.getElementById('form-contacto').addEventListener('submit', e => {
  e.preventDefault();
  const btn = e.target.querySelector('button[type=submit]');
  btn.innerHTML = '<i class="fas fa-check mr-2"></i> ¡Mensaje enviado!';
  btn.style.background = '#22c55e';
  btn.style.color = '#fff';
  setTimeout(() => {
    e.target.reset();
    btn.innerHTML = '<i class="fas fa-paper-plane mr-2"></i> Enviar Mensaje';
    btn.style.background = '';
    btn.style.color = '';
  }, 3000);
});

// ------- INIT -------
document.addEventListener('DOMContentLoaded', () => {
  cargarProductos();
  initCountdown();
});

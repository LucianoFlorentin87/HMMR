// ------- NAVBAR -------
window.addEventListener('scroll', () => {
  const nav = document.getElementById('navbar');
  const btn = document.getElementById('backToTop');
  nav.classList.toggle('scrolled', window.scrollY > 60);
  btn.classList.toggle('visible', window.scrollY > 400);
});

document.getElementById('backToTop').addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ------- MENÚ MÓVIL -------
document.getElementById('menu-btn').addEventListener('click', () => {
  document.getElementById('mobile-menu').classList.toggle('open');
});
document.querySelectorAll('#mobile-menu a').forEach(link => {
  link.addEventListener('click', () =>
    document.getElementById('mobile-menu').classList.remove('open')
  );
});

// ------- PRODUCTOS -------
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
    document.getElementById('grid-productos').innerHTML =
      '<p style="text-align:center;padding:3rem;color:var(--stone);grid-column:1/-1">No se pudieron cargar los productos.</p>';
  }
}

function formatPrecio(num) {
  return '$' + num.toLocaleString('es-AR');
}

const coloresMap = {
  'azul': '#2563eb', 'negro': '#111', 'gris': '#6b7280',
  'azul claro': '#93c5fd', 'blanco': '#f5f5f5', 'blanco roto': '#ede9d0',
  'khaki': '#a08050'
};

function renderProductos(lista) {
  const grid = document.getElementById('grid-productos');
  const sinRes = document.getElementById('sin-resultados');

  if (!lista.length) {
    grid.innerHTML = '';
    sinRes.style.display = 'block';
    return;
  }
  sinRes.style.display = 'none';

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
        <img src="${p.imagen}" alt="${p.nombre}" loading="lazy"
          onerror="this.src='https://via.placeholder.com/400x530/F0EAE0/0A0A0A?text=HMMR'">
        <div class="producto-actions">
          <button class="action-btn" onclick="abrirModal(${p.id})">
            <i class="fas fa-eye"></i> Ver
          </button>
          <button class="action-btn" onclick="agregarCarrito('${p.nombre}')">
            <i class="fas fa-shopping-bag"></i> Añadir
          </button>
          <button class="action-btn fav-btn" onclick="toggleFav(this)" title="Favorito">
            <i class="far fa-heart"></i>
          </button>
        </div>
      </div>
      <div class="producto-info">
        <p class="producto-cat">${p.categoria}</p>
        <h3 class="producto-nombre">${p.nombre}</h3>
        <div style="margin-bottom:0.6rem">${dots}</div>
        <div>
          <span class="precio-actual">${formatPrecio(p.precio)}</span>
          ${precioOrig}
        </div>
      </div>
    </div>`;
  }).join('');
}

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
      renderProductos(cat === 'Todos' ? todosProductos : todosProductos.filter(p => p.categoria === cat));
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

// ------- CARRITO -------
function agregarCarrito(nombre) {
  const notif = document.getElementById('cart-notification');
  notif.querySelector('#cart-item-name').textContent = nombre;
  notif.classList.add('show');
  setTimeout(() => notif.classList.remove('show'), 3000);
}

// ------- FAVORITOS -------
function toggleFav(btn) {
  const ico = btn.querySelector('i');
  const activo = ico.classList.contains('fas');
  ico.classList.toggle('far', activo);
  ico.classList.toggle('fas', !activo);
  btn.style.background = activo ? '' : '#C4622D';
  btn.style.color = activo ? '' : '#fff';
}

// ------- MODAL -------
function abrirModal(id) {
  const p = todosProductos.find(x => x.id === id);
  if (!p) return;
  const dots = p.colores.map(c =>
    `<span class="colores-dot" style="background:${coloresMap[c]||'#999'};width:14px;height:14px" title="${c}"></span>`
  ).join('');
  const badge = p.etiqueta
    ? `<span class="producto-badge ${p.oferta?'badge-oferta':'badge-nuevo'}" style="position:static;display:inline-block;margin-bottom:0.75rem">${p.etiqueta}</span>` : '';
  const precioOrig = p.precioOriginal
    ? `<span class="precio-original" style="font-size:1rem">${formatPrecio(p.precioOriginal)}</span>` : '';

  document.getElementById('modal-body').innerHTML = `
    <div style="display:grid;grid-template-columns:1fr 1fr">
      <img src="${p.imagen}" alt="${p.nombre}"
        style="width:100%;height:460px;object-fit:cover;object-position:top"
        onerror="this.src='https://via.placeholder.com/400x530/F0EAE0/0A0A0A?text=HMMR'">
      <div style="padding:2.5rem;display:flex;flex-direction:column;justify-content:space-between;background:var(--chalk)">
        <div>
          ${badge}
          <p class="producto-cat" style="margin-bottom:0.4rem">${p.categoria}</p>
          <h2 style="font-family:'Playfair Display',serif;font-size:1.6rem;font-weight:800;color:var(--ink);line-height:1.1;margin-bottom:1rem">${p.nombre}</h2>
          <div style="width:30px;height:2px;background:var(--copper);margin-bottom:1.25rem"></div>
          <p style="font-size:0.85rem;color:var(--stone);line-height:1.75;margin-bottom:1.5rem">${p.descripcion}</p>
          <div style="margin-bottom:1.25rem">
            <p style="font-size:0.62rem;letter-spacing:3px;text-transform:uppercase;color:var(--stone);font-weight:600;margin-bottom:0.5rem">Colores</p>
            <div style="display:flex;gap:6px">${dots}</div>
          </div>
          <div style="margin-bottom:2rem">
            <span class="precio-actual" style="font-size:1.4rem">${formatPrecio(p.precio)}</span>
            ${precioOrig}
          </div>
        </div>
        <button onclick="agregarCarrito('${p.nombre}');cerrarModal()"
          style="background:var(--ink);color:#fff;border:none;padding:16px;font-size:0.75rem;font-weight:700;letter-spacing:2px;text-transform:uppercase;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:0.75rem;transition:background 0.3s;font-family:'Inter',sans-serif;width:100%"
          onmouseover="this.style.background='var(--copper)'"
          onmouseout="this.style.background='var(--ink)'">
          <i class="fas fa-shopping-bag"></i> Agregar al Carrito
        </button>
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

// ------- COUNTDOWN -------
function initCountdown() {
  const fin = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
  function tick() {
    const diff = fin - Date.now();
    if (diff <= 0) return;
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    document.getElementById('cd-dias').textContent  = String(d).padStart(2,'0');
    document.getElementById('cd-horas').textContent = String(h).padStart(2,'0');
    document.getElementById('cd-mins').textContent  = String(m).padStart(2,'0');
    document.getElementById('cd-segs').textContent  = String(s).padStart(2,'0');
  }
  setInterval(tick, 1000);
  tick();
}

// ------- FORMULARIO -------
document.getElementById('form-contacto').addEventListener('submit', e => {
  e.preventDefault();
  const btn = e.target.querySelector('button[type=submit]');
  btn.innerHTML = '<i class="fas fa-check"></i> ¡Mensaje enviado!';
  btn.style.background = '#22c55e';
  setTimeout(() => {
    e.target.reset();
    btn.innerHTML = '<i class="fas fa-paper-plane"></i> Enviar Mensaje';
    btn.style.background = '';
  }, 3000);
});

// ------- INIT -------
document.addEventListener('DOMContentLoaded', () => {
  cargarProductos();
  initCountdown();
});

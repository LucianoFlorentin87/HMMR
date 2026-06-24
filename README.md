# 🛍️ HMMR Jeans — Sitio Web

Sitio estático para negocio de ropa denim, construido con HTML, Tailwind CSS y JavaScript vanilla.

## Estructura del proyecto

```
tienda-hmmr-jeans/
├── index.html              ← Página principal (todo el sitio)
├── assets/
│   ├── css/
│   │   └── styles.css      ← Estilos personalizados HMMR
│   ├── js/
│   │   └── main.js         ← Lógica: productos, filtros, countdown
│   └── data/
│       └── productos.json  ← Base de datos de productos (JSON)
└── README.md
```

## Cómo correrlo localmente

```bash
# Con VS Code + extensión Live Server:
# Click derecho en index.html → "Open with Live Server"

# Con Python (si lo tenés instalado):
python -m http.server 8080
# Luego abrí http://localhost:8080

# Con Node.js:
npx serve .
```

## Stack tecnológico

| Herramienta | Uso |
|---|---|
| HTML5 | Estructura del sitio |
| Tailwind CSS (CDN) | Utilidades de diseño |
| CSS personalizado | Paleta HMMR, componentes |
| Font Awesome | Íconos |
| Google Fonts | Tipografías (Inter + Playfair Display) |
| JavaScript Vanilla | Filtros, modal, countdown, carrito |
| JSON | Base de datos de productos |

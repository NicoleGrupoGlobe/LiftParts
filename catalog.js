/* ============================================================
   Globe Lift Parts — Catalog Logic
   Data source: products.json  (overwrite that file + /images
   to update the catalog without touching this script).
   ============================================================ */

// ── State ───────────────────────────────────────────────────
const state = {
  products: [],       // full product list loaded from JSON
  activeCategory: 'all',
  searchQuery: '',
};

// ── DOM refs ─────────────────────────────────────────────────
const grid        = document.getElementById('product-grid');
const pillsEl     = document.getElementById('filter-pills');
const countEl     = document.getElementById('result-count');
const searchInput = document.getElementById('search-input');
const searchBtn   = document.getElementById('search-btn');

// ── Bootstrap ───────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', init);

async function init() {
  await loadProducts();
  buildPills();
  render();
  bindEvents();
}

// ── Data loading ─────────────────────────────────────────────
async function loadProducts() {
  try {
    const res = await fetch('products.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    state.products = await res.json();
  } catch (err) {
    console.warn('Could not load products.json:', err.message);
    state.products = [];
    showLoadError();
  }
}

function showLoadError() {
  grid.innerHTML = `
    <div class="empty-state">
      <div class="empty-state__icon">⚠️</div>
      <p class="empty-state__title">No se pudo cargar el catálogo</p>
      <p class="empty-state__msg">Verifica que el archivo <code>products.json</code> esté disponible e intenta recargar la página.</p>
    </div>`;
}

// ── Category pills ────────────────────────────────────────────
function buildPills() {
  // Derive unique categories from data, sorted alphabetically
  const categories = ['all', ...new Set(state.products.map(p => p.category).filter(Boolean).sort())];

  pillsEl.innerHTML = categories.map(cat => `
    <button
      class="pill${cat === state.activeCategory ? ' active' : ''}"
      data-category="${cat}"
      aria-pressed="${cat === state.activeCategory}"
    >
      ${cat === 'all' ? 'Todos' : cat}
    </button>
  `).join('');
}

// ── Filtering ─────────────────────────────────────────────────
function getFiltered() {
  const q = state.searchQuery.toLowerCase().trim();
  return state.products.filter(p => {
    const matchCategory =
      state.activeCategory === 'all' || p.category === state.activeCategory;

    if (!q) return matchCategory;

    const haystack = [
      p.name,
      p.sku,
      p.description,
      ...(p.tags || []),
    ].join(' ').toLowerCase();

    return matchCategory && haystack.includes(q);
  });
}

// ── Rendering ─────────────────────────────────────────────────
function render() {
  const filtered = getFiltered();

  // Update result count
  countEl.innerHTML = `
    Mostrando <strong>${filtered.length}</strong>
    ${filtered.length === 1 ? 'producto' : 'productos'}
    ${state.activeCategory !== 'all' ? `en <strong>${state.activeCategory}</strong>` : ''}
    ${state.searchQuery ? `para "<strong>${escHtml(state.searchQuery)}</strong>"` : ''}
  `;

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <div class="empty-state__icon">🔍</div>
        <p class="empty-state__title">Sin resultados</p>
        <p class="empty-state__msg">No se encontraron productos que coincidan con tu búsqueda.</p>
      </div>`;
    return;
  }

  grid.innerHTML = filtered.map(product => cardHTML(product)).join('');
}

function cardHTML(p) {
  const tagsHTML = (p.tags || [])
    .map(t => `<span class="tag">${escHtml(t)}</span>`)
    .join('');

  const imageHTML = p.image
    ? `<img src="${escAttr(p.image)}" alt="${escAttr(p.name)}" loading="lazy" onerror="this.parentElement.innerHTML='<span class=\\'img-placeholder\\'>📦</span>'">`
    : `<span class="img-placeholder">📦</span>`;

  return `
    <article class="card">
      <div class="card__image">${imageHTML}</div>
      <div class="card__body">
        <h3 class="card__name">${escHtml(p.name)}</h3>
        <p class="card__sku">${escHtml(p.sku)}</p>
        <p class="card__desc">${escHtml(p.description)}</p>
        ${tagsHTML ? `<div class="card__tags">${tagsHTML}</div>` : ''}
      </div>
    </article>`;
}

// ── Events ────────────────────────────────────────────────────
function bindEvents() {
  // Search on button click
  searchBtn.addEventListener('click', () => {
    state.searchQuery = searchInput.value;
    render();
  });

  // Search on Enter key
  searchInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      state.searchQuery = searchInput.value;
      render();
    }
  });

  // Live search (optional: filter as the user types)
  searchInput.addEventListener('input', () => {
    state.searchQuery = searchInput.value;
    render();
  });

  // Category pills (event delegation)
  pillsEl.addEventListener('click', e => {
    const btn = e.target.closest('.pill');
    if (!btn) return;

    state.activeCategory = btn.dataset.category;

    // Update active pill styling
    pillsEl.querySelectorAll('.pill').forEach(p => {
      p.classList.toggle('active', p.dataset.category === state.activeCategory);
      p.setAttribute('aria-pressed', p.dataset.category === state.activeCategory);
    });

    render();
  });
}

// ── Utilities ─────────────────────────────────────────────────
// Safe HTML escaping to avoid XSS when rendering product data
function escHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escAttr(str) {
  return String(str ?? '').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

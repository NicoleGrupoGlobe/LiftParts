#!/usr/bin/env python3
"""
Globe Lift Parts — Generador de catálogo web desde Excel.

Uso:
    python generate_catalog.py

El script busca LiftParts_Final_MVP.xlsx en el mismo directorio.
Genera productos.json y, si index.html no tiene estructura de catálogo,
genera una página estática completa y responsiva.
"""

import json
import os
import re
import sys

try:
    import pandas as pd
except ImportError:
    sys.exit("ERROR: pandas no instalado. Ejecuta: pip install pandas openpyxl")

# ── Configuración ──────────────────────────────────────────────────────────────
BASE_DIR    = os.path.dirname(os.path.abspath(__file__))
EXCEL_FILE  = os.path.join(BASE_DIR, "LiftParts_Final_MVP.xlsx")
SHEET_NAME  = "Hoja1"
OUTPUT_JSON = os.path.join(BASE_DIR, "productos.json")
OUTPUT_HTML = os.path.join(BASE_DIR, "index.html")

# Columnas del Excel (0-based): A=0, B=1, C=2, J=9, K=10, L=11, M=12, N=13
COL_IMAGEN  = 0   # A — imagen (referencia)
COL_SKU     = 1   # B — SKU Lift Parts
COL_DESC    = 2   # C — descripción
COL_PARTNUM = 9   # J — part number fabricante
COL_GLOBE   = 10  # K — código Globe Mantenciones
COL_SUB     = 11  # L — sub nombres / sinónimos
COL_EQUIPO  = 12  # M — tipo de equipo
COL_MARCA   = 13  # N — marca

# ── Utilidades ─────────────────────────────────────────────────────────────────

def clean(val):
    """Convierte a string limpio; devuelve '' si es NaN, #VALUE!, etc."""
    if val is None:
        return ""
    s = str(val).strip()
    if s.lower() in ("#value!", "nan", "none", "#n/a", "#ref!", ""):
        return ""
    return s

def split_lines(val):
    """Divide una celda con múltiples valores separados por saltos de línea."""
    s = clean(val)
    if not s:
        return []
    return [x.strip() for x in re.split(r"\r\n|\r|\n", s) if x.strip()]

def safe_col(row, idx):
    """Lee una columna por índice de forma segura."""
    try:
        return row.iloc[idx]
    except IndexError:
        return ""

# ── Lectura y procesamiento del Excel ─────────────────────────────────────────

def leer_productos():
    if not os.path.exists(EXCEL_FILE):
        sys.exit(f"ERROR: No se encontró el archivo Excel en:\n  {EXCEL_FILE}")

    print(f"Leyendo {os.path.basename(EXCEL_FILE)}...")
    df = pd.read_excel(EXCEL_FILE, sheet_name=SHEET_NAME, header=0, dtype=str)

    productos = []

    for _, row in df.iterrows():
        # Omitir filas con #VALUE! en columna A
        col_a = str(safe_col(row, COL_IMAGEN)).strip().upper()
        if col_a == "#VALUE!":
            continue

        skus  = split_lines(safe_col(row, COL_SKU))
        descs = split_lines(safe_col(row, COL_DESC))

        if not skus:
            continue

        # Campos únicos por fila
        part_number  = clean(safe_col(row, COL_PARTNUM))
        codigo_globe = clean(safe_col(row, COL_GLOBE))
        sub_nombres  = clean(safe_col(row, COL_SUB))
        equipo       = clean(safe_col(row, COL_EQUIPO))
        marca        = clean(safe_col(row, COL_MARCA))

        # Una variante por SKU
        for i, sku in enumerate(skus):
            if not sku:
                continue
            desc = descs[i] if i < len(descs) else (descs[0] if descs else "")
            productos.append({
                "sku":          sku,
                "descripcion":  desc,
                "part_number":  part_number,
                "codigo_globe": codigo_globe,
                "sub_nombres":  sub_nombres,
                "equipo":       equipo,
                "marca":        marca,
            })

    print(f"  → {len(productos)} productos procesados.")
    return productos

# ── Generación de productos.json ───────────────────────────────────────────────

def escribir_json(productos):
    with open(OUTPUT_JSON, "w", encoding="utf-8") as f:
        json.dump(productos, f, ensure_ascii=False, indent=2)
    print(f"✓ productos.json generado ({len(productos)} productos).")

# ── Generación / actualización de index.html ──────────────────────────────────

CATALOG_MARKER = "<!-- GLOBE-CATALOG -->"

def html_necesita_estructura():
    """True si index.html no existe o no tiene el marcador del catálogo."""
    if not os.path.exists(OUTPUT_HTML):
        return True
    with open(OUTPUT_HTML, encoding="utf-8") as f:
        return CATALOG_MARKER not in f.read()

def generar_html_completo():
    html = f"""\
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Globe Lift Parts — Catálogo de Productos</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&display=swap" rel="stylesheet" />
  <style>
    :root {{
      --accent:  #6F9719;
      --accent2: #557318;
      --navy:    #1a2b5e;
      --text:    #1a1a1a;
      --muted:   #6b7280;
      --border:  #e5e7eb;
      --surface: #f9fafb;
      --radius:  8px;
      --font:    'DM Sans', system-ui, sans-serif;
    }}
    *, *::before, *::after {{ box-sizing: border-box; margin: 0; padding: 0; }}
    body {{ font-family: var(--font); color: var(--text); background: #fff; -webkit-font-smoothing: antialiased; }}
    img  {{ display: block; max-width: 100%; }}
    a    {{ color: inherit; text-decoration: none; }}

    /* ── Navbar ── */
    .navbar {{
      position: sticky; top: 0; z-index: 100;
      background: #2d2d2d; height: 60px;
      display: flex; align-items: center;
      padding: 0 32px;
    }}
    .navbar__logo {{ color: #fff; font-size: 1rem; font-weight: 700; letter-spacing: .04em; }}
    .navbar__logo span {{ color: var(--accent); }}

    /* ── Filtros ── */
    .filters {{
      background: var(--surface); border-bottom: 1px solid var(--border);
      padding: 16px 32px;
    }}
    .filters__row {{
      max-width: 1280px; margin: 0 auto;
      display: flex; flex-wrap: wrap; gap: 12px; align-items: center;
    }}
    .search-box {{
      display: flex; flex: 1; min-width: 220px;
      border: 1.5px solid var(--border); border-radius: var(--radius);
      overflow: hidden; background: #fff;
    }}
    .search-box input {{
      flex: 1; padding: 9px 14px; border: none; outline: none;
      font-family: var(--font); font-size: .9rem;
    }}
    .search-box input::placeholder {{ color: var(--muted); }}
    .filter-select {{
      padding: 9px 12px; border: 1.5px solid var(--border);
      border-radius: var(--radius); font-family: var(--font);
      font-size: .85rem; background: #fff; cursor: pointer;
      color: var(--text);
    }}
    .filter-select:focus {{ outline: none; border-color: var(--accent); }}
    .btn-reset {{
      padding: 9px 18px; background: var(--accent); color: #fff;
      border: none; border-radius: var(--radius); font-family: var(--font);
      font-size: .85rem; font-weight: 600; cursor: pointer;
    }}
    .btn-reset:hover {{ background: var(--accent2); }}

    /* ── Grid ── */
    .catalog {{
      max-width: 1280px; margin: 0 auto; padding: 28px 32px 64px;
    }}
    .result-count {{
      font-size: .85rem; color: var(--muted); margin-bottom: 18px; font-weight: 500;
    }}
    .grid {{
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 18px;
    }}

    /* ── Tarjeta ── */
    .card {{
      border: 1px solid var(--border); border-radius: var(--radius);
      padding: 18px; display: flex; flex-direction: column; gap: 8px;
      transition: box-shadow .18s, transform .18s;
      background: #fff;
    }}
    .card:hover {{ box-shadow: 0 8px 24px rgba(0,0,0,.10); transform: translateY(-2px); }}
    .card__sku  {{ font-size: .7rem; font-weight: 700; color: var(--accent); letter-spacing: .05em; text-transform: uppercase; }}
    .card__desc {{ font-size: .9rem; font-weight: 700; line-height: 1.35; color: var(--text); }}
    .card__meta {{ font-size: .78rem; color: var(--muted); line-height: 1.6; margin-top: 4px; }}
    .card__meta span {{ display: block; }}
    .badge {{
      display: inline-block; margin-top: 6px;
      font-size: .68rem; font-weight: 600; padding: 2px 8px;
      border-radius: 4px; background: rgba(111,151,25,.10); color: var(--accent);
    }}
    .badge.navy {{ background: rgba(26,43,94,.10); color: var(--navy); }}

    /* ── Empty state ── */
    .empty {{
      grid-column: 1/-1; text-align: center; padding: 80px 24px; color: var(--muted);
    }}
    .empty p {{ font-size: 1rem; font-weight: 600; margin-top: 12px; }}

    /* ── Footer ── */
    .footer {{
      background: #2d2d2d; color: rgba(255,255,255,.6);
      padding: 32px; text-align: center; font-size: .82rem;
    }}

    @media (max-width: 640px) {{
      .filters__row {{ flex-direction: column; align-items: stretch; }}
      .catalog {{ padding: 20px 16px 48px; }}
    }}
  </style>
</head>
<body>
{CATALOG_MARKER}

<header class="navbar">
  <div class="navbar__logo">GLOBE <span>LIFT PARTS</span></div>
</header>

<section class="filters">
  <div class="filters__row">
    <div class="search-box">
      <input type="search" id="searchInput" placeholder="Buscar por SKU, descripción, sinónimos…" />
    </div>
    <select id="filterEquipo" class="filter-select">
      <option value="">Todos los equipos</option>
    </select>
    <select id="filterMarca" class="filter-select">
      <option value="">Todas las marcas</option>
    </select>
    <button class="btn-reset" onclick="resetFiltros()">Limpiar</button>
  </div>
</section>

<main class="catalog">
  <p class="result-count" id="resultCount"></p>
  <div class="grid" id="productGrid"></div>
</main>

<footer class="footer">
  © 2026 Grupo Globe — Todos los derechos reservados
</footer>

<script>
  let allProducts = [];

  async function init() {{
    const res = await fetch('productos.json');
    allProducts = await res.json();
    poblarFiltros(allProducts);
    render(allProducts);
  }}

  function poblarFiltros(products) {{
    const equipos = [...new Set(products.map(p => p.equipo).filter(Boolean))].sort();
    const marcas  = [...new Set(products.map(p => p.marca).filter(Boolean))].sort();
    const sel = (id, vals) => {{
      const el = document.getElementById(id);
      vals.forEach(v => {{ const o = document.createElement('option'); o.value = o.textContent = v; el.appendChild(o); }});
    }};
    sel('filterEquipo', equipos);
    sel('filterMarca', marcas);
  }}

  function filtrar() {{
    const q      = document.getElementById('searchInput').value.toLowerCase().trim();
    const equipo = document.getElementById('filterEquipo').value;
    const marca  = document.getElementById('filterMarca').value;
    return allProducts.filter(p => {{
      if (equipo && p.equipo !== equipo) return false;
      if (marca  && p.marca  !== marca)  return false;
      if (!q) return true;
      const haystack = [p.sku, p.descripcion, p.sub_nombres, p.part_number, p.codigo_globe]
        .join(' ').toLowerCase();
      return haystack.includes(q);
    }});
  }}

  function render(products) {{
    const grid  = document.getElementById('productGrid');
    const count = document.getElementById('resultCount');
    count.innerHTML = `Mostrando <strong>${{products.length}}</strong> producto${{products.length !== 1 ? 's' : ''}}`;
    if (!products.length) {{
      grid.innerHTML = '<div class="empty"><div style="font-size:2.5rem">🔍</div><p>Sin resultados para tu búsqueda.</p></div>';
      return;
    }}
    grid.innerHTML = products.map(p => `
      <div class="card">
        <div class="card__sku">${{esc(p.sku)}}</div>
        <div class="card__desc">${{esc(p.descripcion)}}</div>
        <div class="card__meta">
          ${{p.part_number  ? `<span>Nº Fabricante: <strong>${{esc(p.part_number)}}</strong></span>` : ''}}
          ${{p.codigo_globe ? `<span>Cód. Globe: <strong>${{esc(p.codigo_globe)}}</strong></span>` : ''}}
          ${{p.sub_nombres  ? `<span>También: ${{esc(p.sub_nombres)}}</span>` : ''}}
        </div>
        ${{p.marca  ? `<span class="badge">${{esc(p.marca)}}</span>` : ''}}
        ${{p.equipo ? `<span class="badge navy">${{esc(p.equipo)}}</span>` : ''}}
      </div>`).join('');
  }}

  function esc(s) {{
    return String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }}

  function resetFiltros() {{
    document.getElementById('searchInput').value = '';
    document.getElementById('filterEquipo').value = '';
    document.getElementById('filterMarca').value = '';
    render(allProducts);
  }}

  ['searchInput','filterEquipo','filterMarca'].forEach(id =>
    document.getElementById(id).addEventListener('input', () => render(filtrar()))
  );

  init();
</script>
</body>
</html>
"""
    with open(OUTPUT_HTML, "w", encoding="utf-8") as f:
        f.write(html)
    print(f"✓ index.html generado desde cero.")

def actualizar_script_en_html():
    """Si index.html ya existe con el marcador, solo confirma que cargará productos.json."""
    print("✓ index.html ya tiene estructura de catálogo. Solo se actualizó productos.json.")

# ── Main ───────────────────────────────────────────────────────────────────────

def main():
    productos = leer_productos()
    escribir_json(productos)

    if html_necesita_estructura():
        generar_html_completo()
    else:
        actualizar_script_en_html()

    print("\n¡Listo! Abre index.html en el navegador para ver el catálogo.")
    print(f"(Asegúrate de servir los archivos con un servidor local, no con file://)")

if __name__ == "__main__":
    main()

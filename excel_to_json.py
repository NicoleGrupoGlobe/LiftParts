#!/usr/bin/env python3
"""
Genera public/products.json desde LiftParts BD Mod + Marca .xlsx
Uso: python excel_to_json.py
"""

import json
import os
import re
import sys

try:
    import pandas as pd
except ImportError:
    sys.exit("ERROR: pandas no instalado. Ejecuta: pip install pandas openpyxl")

BASE_DIR    = os.path.dirname(os.path.abspath(__file__))
EXCEL_FILE  = os.path.join(BASE_DIR, "LiftParts BD Mod + Marca .xlsx")
OUTPUT_JSON = os.path.join(BASE_DIR, "public", "products.json")

# Column indices (0-based) — verify by running with --headers flag
COL_SKU     = 1   # B — "Códigos Lift Parts SKU"
COL_NAME    = 2   # C — "DESCRIPCIÓN"
COL_PARTNUM = 9   # J — "Part Number Fabricante"
COL_EQUIPO  = 12  # M — "EQUIP0"
COL_MARCA   = 13  # N — "Marca"

EQUIP_MAP = {
    "ASCENSOR":                  "Ascensores",
    "ESCALA MECANICA":           "Escaleras Mecánicas",
    "ESCALA MECANICA - ASCENSOR": None,   # → categoryGroups ambos
}


def clean(val):
    if val is None:
        return ""
    s = str(val).strip()
    if s.lower() in ("#value!", "nan", "none", "#n/a", "#ref!", ""):
        return ""
    return s


def split_lines(val):
    s = clean(val)
    if not s:
        return []
    return [x.strip() for x in re.split(r"\r\n|\r|\n", s) if x.strip()]


def safe_col(row, idx):
    try:
        return row.iloc[idx]
    except IndexError:
        return ""


def derive_category(sku):
    prefix = sku.split("-")[0].upper() if "-" in sku else sku[:3].upper()
    return prefix


def leer_productos(df):
    productos = []
    uid = 1

    for _, row in df.iterrows():
        col_a = str(safe_col(row, 0)).strip().upper()
        if col_a == "#VALUE!":
            continue

        skus  = split_lines(safe_col(row, COL_SKU))
        names = split_lines(safe_col(row, COL_NAME))

        if not skus:
            continue

        part_number = clean(safe_col(row, COL_PARTNUM))
        equip_raw   = clean(safe_col(row, COL_EQUIPO))
        marca       = clean(safe_col(row, COL_MARCA))

        equip_key      = equip_raw.upper().strip()
        mapped         = EQUIP_MAP.get(equip_key)
        category_group = mapped if mapped else ""
        is_ambos       = equip_key in EQUIP_MAP and EQUIP_MAP[equip_key] is None

        for i, sku in enumerate(skus):
            if not sku:
                continue
            name     = names[i] if i < len(names) else (names[0] if names else "")
            category = derive_category(sku)

            entry = {
                "id":            str(uid),
                "sku":           sku,
                "name":          name,
                "partNumber":    part_number,
                "brand":         marca,
                "category":      category,
                "categoryGroup": category_group,
                "image":         "",
                "stock":         0,
            }

            if is_ambos:
                entry["categoryGroups"] = ["Ascensores", "Escaleras Mecánicas"]

            productos.append(entry)
            uid += 1

    return productos


def print_headers(df):
    print("Columnas detectadas en el Excel:")
    for i, col in enumerate(df.columns):
        print(f"  {i}: {col}")


def main():
    if not os.path.exists(EXCEL_FILE):
        sys.exit(f"ERROR: No se encontró el archivo:\n  {EXCEL_FILE}")

    print(f"Leyendo {os.path.basename(EXCEL_FILE)}...")
    df = pd.read_excel(EXCEL_FILE, sheet_name=0, header=0, dtype=str)

    if "--headers" in sys.argv:
        print_headers(df)
        return

    print_headers(df)  # always show for verification

    productos = leer_productos(df)
    print(f"  → {len(productos)} productos procesados.")

    os.makedirs(os.path.dirname(OUTPUT_JSON), exist_ok=True)
    with open(OUTPUT_JSON, "w", encoding="utf-8") as f:
        json.dump(productos, f, ensure_ascii=False, indent=2)
    print(f"✓ public/products.json generado ({len(productos)} productos).")


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""Inventory routes + tables for RPL AI LMS docs.

Scans src/routes/** for pages + API methods, migrations/** for tables.
Output: markdown table ready to paste into docs/FEATURES.md or console.

Usage:
  python3 tools/inventory-routes.py            # console summary
  python3 tools/inventory-routes.py --routes   # full route inventory
  python3 tools/inventory-routes.py --tables   # table list
  python3 tools/inventory-routes.py --markdown # FEATURES.md-ready table
"""
import argparse
import os
import re
import sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
ROUTES_DIR = os.path.join(ROOT, "src", "routes")
MIGRATIONS_DIR = os.path.join(ROOT, "migrations")


def inventory_routes():
    out = []
    for dirpath, dirs, files in os.walk(ROUTES_DIR):
        dirs[:] = [d for d in dirs if not d.startswith(".")]
        rel = os.path.relpath(dirpath, ROUTES_DIR)
        if rel == ".":
            continue
        methods = set()
        has_page = False
        for f in files:
            if f.startswith("+page"):
                has_page = True
            elif f.startswith("+") and f.endswith(".ts"):
                try:
                    with open(os.path.join(dirpath, f), encoding="utf-8") as fh:
                        src = fh.read()
                    methods.update(
                        re.findall(r"export async function (GET|POST|PUT|PATCH|DELETE)", src)
                    )
                except OSError:
                    pass
        if has_page or methods:
            out.append((rel, sorted(methods)))
    return sorted(out)


def inventory_tables():
    tables = set()
    for f in sorted(os.listdir(MIGRATIONS_DIR)):
        if not f.endswith(".sql"):
            continue
        try:
            with open(os.path.join(MIGRATIONS_DIR, f), encoding="utf-8") as fh:
                src = fh.read()
        except OSError:
            continue
        for m in re.finditer(r"CREATE TABLE (?:IF NOT EXISTS )?([a-z_0-9]+)", src):
            tables.add(m.group(1))
    return sorted(tables)


def print_routes(routes):
    print(f"ROUTES: {len(routes)}")
    for rel, methods in routes:
        kind = ",".join(methods) if methods else "PAGE"
        print(f"  {rel}\t[{kind}]")


def print_tables(tables):
    print(f"TABLES: {len(tables)}")
    for t in tables:
        print(f"  {t}")


def main():
    ap = argparse.ArgumentParser(description="RPL AI LMS inventory")
    ap.add_argument("--routes", action="store_true", help="show route inventory")
    ap.add_argument("--tables", action="store_true", help="show table inventory")
    ap.add_argument("--markdown", action="store_true", help="markdown summary")
    args = ap.parse_args()

    routes = inventory_routes()
    tables = inventory_tables()

    if args.markdown:
        print("## Inventory snapshot")
        print()
        print(f"- **Routes:** {len(routes)} (pages + API endpoints)")
        print(f"- **Tables:** {len(tables)} (migrations, incl. seed/legacy)")
        print(f"- **Migrations:** {len([f for f in os.listdir(MIGRATIONS_DIR) if f.endswith('.sql')])}")
        return

    print_routes(routes) if args.routes else None
    print_tables(tables) if args.tables else None

    if not args.routes and not args.tables:
        print_routes(routes)
        print()
        print_tables(tables)


if __name__ == "__main__":
    sys.exit(main())

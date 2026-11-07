#!/usr/bin/env python3
"""Genera public/data/clp-annex-vi.json (+ .meta.json) desde la tabla Excel no oficial del
Anexo VI del Reglamento CLP (UE) 1272/2008 (ATP 23). Requiere: pip install openpyxl

Uso: python scripts/build-clp-json.py [ruta_xlsx]
"""
import json
import re
import sys
from datetime import date
from pathlib import Path

import openpyxl

ROOT = Path(__file__).resolve().parent.parent
DEFAULT_XLSX = (ROOT / 'data' / 'fundamentos ssoma' / 'SGA - PRODUCTOS QUIMICOS-20261106'
                / 'annex_vi_clp_table_atp23_en.xlsx')
OUT_DIR = ROOT / 'public' / 'data'

# Columnas de la hoja ATP23 (fila de cabecera = 'Index No').
COLS = {
    'Index No': 'i', 'ATP': 'atp', 'Chemical Name': 'n', 'EC No': 'ec', 'CAS No': 'cas',
    'Hazard Class and Category Code(s)': 'c',
    'Classification Hazard Statement Code(s)': 'h',
    'Labelling Pictogram, Signal Word Code(s)': 'p',
    'Labelling Suppl. Hazard Statement Code(s)': 'e',
    'M, SCL, ATE': 'l', 'Notes': 'nt',
}


def clean(v, sep=' '):
    if v is None:
        return ''
    s = str(v).replace('\r', '\n')
    parts = [re.sub(r'[ \t]+', ' ', x).strip() for x in s.split('\n')]
    parts = [x for x in parts if x]
    s = sep.join(parts)
    return '' if s in ('-', '—') else s


def main():
    xlsx = Path(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_XLSX
    wb = openpyxl.load_workbook(xlsx, read_only=True, data_only=True)
    ws = wb['ATP23']
    rows = ws.iter_rows(values_only=True)
    disclaimer = None
    header = None
    out = []
    atps = set()
    for r in rows:
        if header is None:
            if r and r[0] == 'Index No':
                header = {name: idx for idx, name in enumerate(r) if name}
            elif r and r[0] and disclaimer is None:
                disclaimer = clean(r[0])
            continue
        if not r or not r[0]:
            continue
        g = lambda name: r[header[name]] if name in header else None
        rec = {
            'i': clean(g('Index No')),
            'n': clean(g('Chemical Name')),
            'ec': clean(g('EC No')),
            'cas': clean(g('CAS No')),
            'c': clean(g('Hazard Class and Category Code(s)'), '; '),
            'h': clean(g('Classification Hazard Statement Code(s)'), ' '),
            'p': clean(g('Labelling Pictogram, Signal Word Code(s)'), ' '),
            'l': clean(g('M, SCL, ATE'), '; '),
        }
        e = clean(g('Labelling Suppl. Hazard Statement Code(s)'), ' ')
        if e:
            rec['e'] = e
        nt = clean(g('Notes'), ' ')
        if nt:
            rec['nt'] = nt
        if len(rec['l']) > 160:
            rec['l'] = rec['l'][:157] + '...'
        rec = {k: v for k, v in rec.items() if v != '' or k in ('i', 'n')}
        out.append(rec)
        atps.add(clean(g('ATP')))
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    jp = OUT_DIR / 'clp-annex-vi.json'
    jp.write_text(json.dumps(out, ensure_ascii=False, separators=(',', ':')), encoding='utf-8')
    meta = {
        'source': 'Reglamento (CE) 1272/2008 (CLP), Anexo VI, parte 3 - tabla Excel no oficial (hoja ATP23)',
        'atp': '23',
        'rows': len(out),
        'generated': date.today().isoformat(),
        'fields': 'i=N.º índice; n=nombre químico (EN); ec; cas; c=clase y categoría; h=códigos H de clasificación; '
                  'p=pictogramas y palabra de advertencia (Dgr=Peligro, Wng=Atención); e=EUH suplementarios; '
                  'l=límites específicos/factores M/ETA; nt=notas',
        'disclaimer': disclaimer or '',
    }
    (OUT_DIR / 'clp-annex-vi.meta.json').write_text(
        json.dumps(meta, ensure_ascii=False, indent=2), encoding='utf-8')
    print(f'{len(out)} registros, {jp.stat().st_size / 1024:.0f} KB')


if __name__ == '__main__':
    main()

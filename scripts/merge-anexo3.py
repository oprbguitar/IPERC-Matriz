"""Cruza el Anexo 3 peruano (OCR del CLP en español, rev. 01.12.2023) con el Anexo VI CLP ATP 23.

Uso: python -I scripts/merge-anexo3.py "<ruta>/Anexo_3_Listado_Clasificacion_Anticipada_Completo.md"
Ejecutar después de scripts/build-clp-json.py. Agrega el nombre en español ('es') y la marca 'a3'
a public/data/clp-annex-vi.json, y escribe public/data/anexo3-contraste.json con el resumen.
"""
import json
import re
import sys
from pathlib import Path

src = Path(sys.argv[1])
clp_path = Path('public/data/clp-annex-vi.json')
clp = json.loads(clp_path.read_text(encoding='utf-8'))
text = src.read_text(encoding='utf-8')

# Línea de sustancia: [prefijo OCR] 001-002-00-4 [|] Nombre ... [CE] [CAS]; a veces el nombre va en la línea siguiente.
IDX_RE = re.compile(r'^\W*(?:\d{1,4}\s+)?\W?\d?(\d{3}-\d{3}-\d{2}-[\dXx])(?![\d-])\s*[|¦]?\s*(.*)$')
EC_RE = re.compile(r'(?<![\d-])\d{3}-\d{3}-\d(?![\d-])')
CAS_RE = re.compile(r'(?<![\d-])\d{2,7}-\d{2}-\d(?![\d-])')
ONLY_NUMBERS = re.compile(r'^[\d\s\-|.,]*$')
# Fragmentos de otras columnas que el OCR confunde con el nombre.
DROP_RE = re.compile(r'^(?:reproducci|plazo|medio|ambiente|acuático|categor|exposici|órganos|cutánea|ocular|aguda)|\d{3}-?\d{3,4}$', re.I)
JUNK_RE = re.compile(
    r'\s(?:=|—|Corrosi|Toxicidad|Líquido|Liquido|Gases?\s|Sólido|Solido|Aerosol|Peligro|Sensibiliz|Carcinog|Mutag|Lesiones|'
    r'Sustancias y|Explosiv|Irritaci|Pirofór|Comburente|Autorreac|Peróxido|Tóxico)|\s?H\d{3}|GHS0'
)


def clean(rest: str) -> str:
    cut = len(rest)
    for pattern in (EC_RE, CAS_RE):
        match = pattern.search(rest)
        if match:
            cut = min(cut, match.start())
    name = rest[:cut]
    # El OCR mezcla columnas: se corta al llegar a una clase de peligro, código H/GHS o separador.
    junk = JUNK_RE.search(name)
    if junk:
        name = name[:junk.start()]
    name = re.sub(r'[|¦\[\]{}]', ' ', name)
    name = re.sub(r'\s{2,}', ' ', name).strip(' -.,;:(')
    if name.count('(') > name.count(')'):
        name = name[:name.rfind('(')].strip(' -.,;:')
    return name


lines = text.splitlines()
found: dict[str, dict[str, str]] = {}
for n, line in enumerate(lines):
    m = IDX_RE.match(line)
    if not m:
        continue
    idx = m.group(1).upper()
    if idx in found:
        continue
    rest = m.group(2)
    name = clean(rest)
    if len(name) < 3:
        for nxt in lines[n + 1:n + 4]:
            if nxt.strip() and not ONLY_NUMBERS.match(nxt):
                rest = nxt
                name = clean(nxt)
                break
    if len(name) < 4 or name[0].isdigit() or DROP_RE.search(name):
        continue
    name = re.sub(r'\s*[—-]+$', '', name)
    ec = EC_RE.search(rest)
    cas = CAS_RE.search(rest[ec.end():] if ec else rest)
    found[idx] = {'es': name[:140], 'ec': ec.group(0) if ec else '', 'cas': cas.group(0) if cas else ''}

by_idx = {row['i'].upper(): row for row in clp}
matched = 0
ec_diff = []
for idx, item in found.items():
    row = by_idx.get(idx)
    if not row:
        continue
    matched += 1
    row['es'] = item['es']
    row['a3'] = 1
    if item['ec'] and row.get('ec') and item['ec'] != row['ec']:
        ec_diff.append(idx)

only_a3 = sorted(i for i in found if i not in by_idx)
only_clp = sorted(i for i in by_idx if i not in found)
clp_path.write_text(json.dumps(clp, ensure_ascii=False, separators=(',', ':')), encoding='utf-8')

numbers = [int(x) for x in re.findall(r'^\s*(\d{4})\s*$', text, re.M) if int(x) < 5000]
summary = {
    'source': 'Anexo 3 del Reglamento de la Ley de Gestión Integral de Sustancias Químicas (D.S. 005-2026-MINAM): Anexo VI CLP en español, rev. 01.12.2023 (OCR, 1351 páginas)',
    'declaredEntries': max(numbers) if numbers else None,
    'parsedIndexes': len(found),
    'clpRows': len(clp),
    'matched': matched,
    'onlyInAnexo3Count': len(only_a3),
    'onlyInAnexo3': [{'i': i, 'es': found[i]['es']} for i in only_a3[:60]],
    'onlyInClpCount': len(only_clp),
    'onlyInClpSample': [{'i': i, 'n': by_idx[i]['n'], 'cas': by_idx[i].get('cas', '')} for i in only_clp[:80]],
    'ecDifferences': len(ec_diff),
}
Path('public/data/anexo3-contraste.json').write_text(json.dumps(summary, ensure_ascii=False, indent=1), encoding='utf-8')
print({k: v for k, v in summary.items() if not isinstance(v, list)})

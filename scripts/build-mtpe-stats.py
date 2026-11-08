"""
Estadísticas oficiales de notificaciones de accidentes de trabajo, incidentes peligrosos y
enfermedades ocupacionales (MTPE, Sistema de Accidentes de Trabajo - SAT).

Lee la página de estadísticas del MTPE, ubica la publicación mensual en gob.pe, descarga el Excel
de anexos y extrae los cuadros clave. Salida: public/data/mtpe-notificaciones.json

Uso:  python -I -X utf8 scripts/build-mtpe-stats.py [año_inicial]
Caché de descargas: data/mtpe-cache/ (ignorada por git).
"""
import json
import re
import sys
import time
import unicodedata
import urllib.request
from pathlib import Path

import openpyxl

ROOT = Path(__file__).resolve().parent.parent
CACHE = ROOT / 'data' / 'mtpe-cache'
# Público: solo el último mes (vista gratuita). Completo: lo sirve el Worker a usuarios premium.
OUT = ROOT / 'public' / 'data' / 'mtpe-ultimo-mes.json'
FULL = ROOT / 'worker' / 'data' / 'mtpe-notificaciones.json'
INDEX = 'https://www2.trabajo.gob.pe/estadisticas/estadisticas-accidentes-de-trabajo/'
UA = {'User-Agent': 'Mozilla/5.0 (ObservatorioPrevenirPeru; +https://sst.andesnova.solutions)'}
MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'setiembre', 'octubre', 'noviembre', 'diciembre']


def fetch(url: str) -> bytes:
    for attempt in range(3):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60) as response:
                return response.read()
        except Exception:
            if attempt == 2:
                raise
            time.sleep(2)
    return b''


def fold(text: str) -> str:
    text = unicodedata.normalize('NFD', str(text)).encode('ascii', 'ignore').decode()
    return re.sub(r'\s+', ' ', text).strip().upper()


def nice(label: str) -> str:
    """Etiqueta legible: primera letra en mayúscula, resto en minúsculas, conserva siglas cortas."""
    text = re.sub(r'\s+', ' ', str(label)).strip().strip(':')
    text = re.sub(r'^[A-C]\)\s*', '', text)
    lower = text.lower()
    return lower[:1].upper() + lower[1:]


TABLES = {
    'regiones': 'SEGUN REGION (LUGAR DE OCURRENCIA)',
    'actividades': 'TIPO DE NOTIFICACIONES, SEGUN ACTIVIDAD ECONOMICA',
    'categorias': 'SEGUN CATEGORIA OCUPACIONAL',
    'turno': 'NO MORTALES POR SEXO, SEGUN TURNO',
    'tipos': 'ACCIDENTES DE TRABAJO POR ACTIVIDAD ECONOMICA, SEGUN TIPO DE ACCIDENTE',
    'agentes': 'ACCIDENTES DE TRABAJO POR SEXO, SEGUN AGENTE CAUSANTE',
    'cuerpo': 'ACCIDENTES DE TRABAJO POR SEXO, SEGUN PARTE DEL CUERPO AFECTADA',
    'lesion': 'NATURALEZA DE LA LESION',
    'consecuencias': 'SEGUN CONSECUENCIAS DEL ACCIDENTE',
    'mortalesTipo': 'MORTALES POR ACTIVIDAD ECONOMICA, SEGUN TIPO DE ACCIDENTE',
    'mortalesAgente': 'MORTALES POR ACTIVIDAD ECONOMICA, SEGUN AGENTE CAUSANTE',
    'incidentes': 'INCIDENTES PELIGROSOS, SEGUN TIPO DE INCIDENTE',
    'enfermedades': 'POR SEXO, SEGUN TIPO DE ENFERMEDAD',
}
# Categorías principales de forma del accidente (clasificación OIT usada por el SAT).
PARENT_TYPES = [
    'ATRAPADA POR UN OBJETO O ENTRE OBJETOS', 'CAIDAS DE OBJETOS', 'CAIDAS DE PERSONAS', 'CONTACTO CON LA CORRIENTE ELECTRICA',
    'ESFUERZOS EXCESIVOS O FALSOS MOVIMIENTOS', 'EXPOSICION A, O CONTACTO CON, SUSTANCIAS NOCIVAS O RADIACIONES',
    'EXPOSICION A, O CONTACTO CON, TEMPERATURAS EXTREMAS', 'PISADAS SOBRE, CHOQUES CONTRA, O GOLPES POR OBJETOS, A EXCEPCION DE CAIDAS DE OBJETOS',
    'PUNZO CORTANTES', 'OTRAS FORMAS DE ACCIDENTE NO CLASIFICADAS POR FALTA DE DATOS SUFICIENTES',
]
SKIP = re.compile(r'^(FUENTE|ELABORADO|NOTA|ACTIVIDAD ECONOMICA$|[A-Q] {1,3}[A-Z])')


def is_num(value) -> bool:
    return isinstance(value, (int, float)) and not isinstance(value, bool)


def parse_sheet(ws, key: str):
    rows = [list(row) for row in ws.iter_rows(values_only=True)]
    total_idx = None
    header_end = 0
    for i, row in enumerate(rows[:12]):
        folded = [fold(c) if isinstance(c, str) else '' for c in row]
        if 'ABSOLUTO' in folded:
            total_idx, header_end = folded.index('ABSOLUTO'), i
            break
        if 'TOTAL' in folded and total_idx is None:
            total_idx, header_end = folded.index('TOTAL'), i
    # Columnas de tipo de notificación (regiones/actividades/categorías)
    sub = rows[header_end + 1] if header_end + 1 < len(rows) else []
    out = []
    seen = set()
    for row in rows[header_end + 1:]:
        label_cell = next((c for c in row[:3] if isinstance(c, str) and c.strip()), None)
        if not label_cell:
            continue
        label = fold(label_cell)
        if SKIP.match(label) or label in ('MASCULINO', 'FEMENINO'):
            continue
        start = row.index(label_cell) + 1
        if key == 'incidentes':
            numbers = [c for c in row[start:start + 3]]
            if not numbers or not is_num(numbers[0]):
                continue
            out.append({'label': nice(label_cell), 'value': int(numbers[0]), 'afectados': int(numbers[1] or 0) if is_num(numbers[1]) else 0, 'danos': float(numbers[2] or 0) if len(numbers) > 2 and is_num(numbers[2]) else 0})
            continue
        value = row[total_idx] if total_idx is not None and total_idx < len(row) else None
        if not is_num(value):
            nums = [c for c in row[start:] if is_num(c)]
            if not nums:
                continue
            value = nums[-1]
        if label in seen:
            continue
        seen.add(label)
        item = {'label': nice(label_cell), 'value': int(round(value))}
        if key in ('regiones', 'actividades', 'categorias'):
            types = [fold(c) if isinstance(c, str) else '' for c in sub]
            for col, name in enumerate(types):
                if not name or col >= len(row) or not is_num(row[col]):
                    continue
                if 'MORTAL' in name:
                    item['mortales'] = int(row[col])
                elif 'INCIDENTE' in name:
                    item['incidentes'] = int(row[col])
                elif 'ENFERMEDAD' in name:
                    item['enfermedades'] = int(row[col])
                elif 'ACCIDENTE' in name:
                    item['accidentes'] = int(row[col])
        if key in ('tipos', 'mortalesTipo'):
            item['parent'] = label in PARENT_TYPES
        out.append(item)
    return out


def parse_workbook(path: Path):
    wb = openpyxl.load_workbook(path, read_only=True, data_only=True)
    month = {}
    for ws in wb.worksheets:
        head = ' '.join(fold(c) for row in ws.iter_rows(min_row=1, max_row=6, values_only=True) for c in row if isinstance(c, str))
        # La hoja «Índice» menciona todos los cuadros: se descarta.
        if 'PORCENTAJES' in head or 'INDICE' in fold(ws.title) or sum(needle in head for needle in TABLES.values()) > 1:
            continue
        for key, needle in TABLES.items():
            if key not in month and needle in head:
                month[key] = parse_sheet(ws, key)
                break
    totals = next((row for row in month.get('regiones', []) if fold(row['label']) == 'TOTAL'), None)
    for key in list(month):
        month[key] = [row for row in month[key] if fold(row['label']) != 'TOTAL']
    if totals:
        month['totales'] = {k: totals.get(k, 0) for k in ('mortales', 'accidentes', 'incidentes', 'enfermedades')} | {'total': totals['value']}
    return month


def publications(start_year: int):
    html = fetch(INDEX).decode('utf-8', 'ignore')
    links = sorted(set(re.findall(r'https://www\.gob\.pe/institucion/mtpe/informes-publicaciones/\d+-notificaciones-de-accidentes[^"\']+', html)))
    found = {}
    for link in links:
        match = re.search(r'-(' + '|'.join(MONTHS) + r')-(\d{4})$', link)
        if not match:
            continue
        year, month = int(match.group(2)), MONTHS.index(match.group(1)) + 1
        if year >= start_year:
            found[(year, month)] = link
    return found


def main():
    start = int(sys.argv[1]) if len(sys.argv) > 1 else 2023
    CACHE.mkdir(parents=True, exist_ok=True)
    result = []
    for (year, month), page in sorted(publications(start).items()):
        period = f'{year}-{month:02d}'
        cached = CACHE / f'{period}.xlsx'
        meta = CACHE / f'{period}.json'
        if not cached.exists() or not meta.exists():
            html = fetch(page).decode('utf-8', 'ignore')
            xlsx = re.search(r'https://cdn\.www\.gob\.pe/uploads/document/file/[^"\']+?\.xlsx[^"\']*', html)
            pdf = re.search(r'https://cdn\.www\.gob\.pe/uploads/document/file/[^"\']+?\.pdf[^"\']*', html)
            if not xlsx:
                print('sin anexos', period)
                continue
            cached.write_bytes(fetch(xlsx.group(0).replace('&amp;', '&')))
            meta.write_text(json.dumps({'page': page, 'pdf': pdf.group(0).replace('&amp;', '&') if pdf else None}), encoding='utf-8')
            time.sleep(0.5)
        info = json.loads(meta.read_text(encoding='utf-8'))
        try:
            data = parse_workbook(cached)
        except Exception as error:  # Excel dañado o con otro formato
            print('error', period, error)
            continue
        if 'totales' not in data:
            print('sin totales', period)
            continue
        result.append({'period': period, 'year': year, 'month': month, 'source': info['page'], 'pdf': info['pdf'], **data})
        print('ok', period, data['totales'])
    series = [{'period': m['period'], **m['totales']} for m in result]
    payload = {'generated': time.strftime('%Y-%m-%d'), 'source': INDEX, 'series': series}
    FULL.parent.mkdir(parents=True, exist_ok=True)
    FULL.write_text(json.dumps({**payload, 'months': result}, ensure_ascii=False, separators=(',', ':')), encoding='utf-8')
    OUT.write_text(json.dumps({**payload, 'months': result[-1:]}, ensure_ascii=False, separators=(',', ':')), encoding='utf-8')
    print('escrito', FULL, len(result), 'meses', FULL.stat().st_size // 1024, 'KB; público', OUT.stat().st_size // 1024, 'KB')


if __name__ == '__main__':
    main()

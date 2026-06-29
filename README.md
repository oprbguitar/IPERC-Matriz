# IPERC Peru

Modular Peruvian IPERC matrix generator for occupational safety and health. The app is a rule-based generator, not a fixed spreadsheet template.

## What It Includes

- Clean 9-step wizard for company data, sector module, areas, positions, tasks, hazards, risk evaluation, controls, legal validation, and exports.
- General legal framework registry with Ley 29783, DS 005-2012-TR, RM 050-2013-TR, and Manual Tecnico IPERC SUNAFIL.
- Sector modules for public sector, construction, mining, hydrocarbons, health, manufacturing, and offices/administrative work.
- Hazard taxonomy, risk scoring, hierarchy-of-controls recommendations, evidence requirements, and traceable generated IPERC rows.
- Export actions for Excel-compatible matrix, PDF print report, Word technical report, and CSV dataset.
- Supabase/Postgres migration for companies, areas, job positions, tasks, hazards, risks, controls, legal norms/articles, assessments, links, evidence, versions, and approvals.

## Legal Safety Rule

The app must not invent legal obligations. `src/data/legalDatabase.ts` seeds required norms and sector modules, but `legalArticles` is intentionally empty until official sources are uploaded or internally verified. When no validated article exists, generated rows show `requires legal validation`.

## Run Locally

```bash
npm install
npm run dev
```

Production Supabase project:

```text
https://qxtfzhdoxlgwfwgwpljd.supabase.co
```

Current verified dev URL:

```text
http://127.0.0.1:5174/
```

GitHub Pages build uses `base: /IPERC-Matriz/`.

## Checks

```bash
npm run build
npm run lint
```

## Main Files

- `src/App.tsx` - wizard UI and workflow state.
- `src/data/hazards.ts` - hazard taxonomy and control templates.
- `src/data/legalDatabase.ts` - legal norm registry and sector modules.
- `src/lib/riskEngine.ts` - hazard matching, scoring, residual risk, and legal mapping.
- `src/lib/exporters.ts` - Excel, CSV, Word, and PDF/print exports.
- `supabase/migrations/001_iperc_schema.sql` - database schema.
- `supabase/seed.sql` - required legal framework seed records.

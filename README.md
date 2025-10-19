# Colonial Demographics Visualization (working title)

This repository rebuilds and visualizes the colonial American religious
landscape using transparent data pipelines and an interactive web map.
Together the scripts and the Vite/React/MapLibre app let you explore how
congregations were founded (1607–1776) and what the denominational mix
looked like when the United States was born.

---

## 📦 Project Layout

```
christianNation/
├─ data/
│  ├─ raw/                     # transcribed & downloaded source tables
│  ├─ processed/               # artifacts served to the web app
│  ├─ mappings/                # normalization helpers (belief & colony)
│  ├─ samples/                 # tiny CSV snippets for docs/testing
│  └─ catalog.csv              # human-readable dataset catalog
├─ docs/                       # sourcing notes, provenance
├─ scripts/                    # Python data preparation / ETL scripts
├─ web/                        # Vite + React + MapLibre app
├─ Makefile                    # convenience targets for normalization
└─ README.md                   # this file
```

---

## 🚀 Quick Start

### Requirements
- Python 3.9+
- Node.js 18+ (or latest LTS)

### 1. Regenerate processed data
```bash
cd christianNation

# Explicit: run each script
python3 scripts/prepare_pre1776_foundings.py
python3 scripts/normalize_1776.py
python3 scripts/prepare_congregation_timeline.py

# OR rely on make (skips up-to-date outputs)
make normalize
```

### 2. Launch the web app
```bash
cd web
npm install
npm run dev     # http://localhost:5173 by default
```
> Tip: after updating data, restart the dev server and hard refresh
> (⌘⇧R / Ctrl+Shift+R) so the browser fetches the latest GeoJSON/JSON.

---

## 🧠 What the scripts do

| Script | Purpose |
| ------ | ------- |
| `prepare_pre1776_foundings.py` | Ingests curated CSVs of early congregational foundings, normalizes labels & colonies, emits:<br>• `pre1776_colony_profiles.geojson` (per-colony/year breakdown with counts & percent share)<br>• `pre1776_foundings_timeline.json` (cumulative timeline for the chart). 1776 counts are back-estimated via Finke & Stark totals. |
| `normalize_1776.py` | Joins Finke & Stark 1776 tables to produce colony-level denominational percentages (`composition_1776.csv`). |
| `prepare_congregation_timeline.py` | Creates `congregation_timeline.json` for the “Founding Growth” chart (1776 ↔ 1850). |
| `normalize_voyages.py` | Normalizes the SlaveVoyages export for potential migration overlays (data stored as `migration_slavevoyages_1600_1790.csv`). |

Mappings (`data/mappings/denomination_map.csv`, `colony_map.csv`) ensure
consistent naming across sources.

---

## 🗺️ Web Map (React + MapLibre)

- **`ColonyMap.tsx`** renders the map, handles clicks, and feeds the info
  panel with belief labels, congregation counts, and percent shares.
- **`TimelineControls.tsx`** manages the timeline slider & year label.
- **`TrendChart.tsx`** draws the cumulative congregation chart (1776 ↔ 1850).
- **`NarrativePanel.tsx`** provides contextual notes and source links.

UX characteristics:
- Info panel (bottom-left) stays open until another colony is selected.
- Legend lives bottom-right; the year badge sits top-left.
- Each panel row shows colored belief label, `count`, and `% share`.

---

## 📊 Processed Artifact Schemas

### `data/processed/pre1776_colony_profiles.geojson`
Feature properties include:
- `year`, `colony`
- `dominant_belief`, `dominant_share`
- `percentages`: belief → % share (0–100)
- `counts`: belief → congregations (int)
- `breakdown`: array of `{ belief, count, share }`
- `source`, `source_urls`

### `data/processed/composition_1776.csv`
Normalized 1776 snapshot with `percent_share`, `congregations_total`, and
membership-rate columns.

### `data/processed/congregation_timeline.json`
Small structure for the “Founding Growth” chart.

---

## ✅ Troubleshooting

- **Panel shows numbers instead of labels** — restart `npm run dev` after
  regenerating data and hard refresh. The code rebuilds rows from the raw
  `percentages` + `counts` map to avoid label loss.
- **Panel or legend overlap** — adjust `.map-info-panel` and `.legend` in
  `web/src/index.css`.
- **Large files on GitHub** — enable Git LFS (`git lfs install`, `git lfs track "*.csv"`)
  before pushing hefty data.

---

## 📚 Sources & Attribution

Detailed provenance lives in `docs/sourcing-log.md` and `data/catalog.csv`.
Key sources include:
- Finke, Roger & Stark, Rodney (1989). *American Religion in 1776: A Statistical Portrait.*
- Curated founding lists (Quaker, Huguenot, Moravian, Anglican, Jewish, Congregationalist, etc.) with institutional citations.

Please credit the original authors/institutions in any derivative work.

---

## 🛣️ Roadmap Ideas
- Expand pre-1776 coverage (e.g., additional Dutch Reformed / Anglican sources).
- Add migration arcs using SlaveVoyages + other passenger manifests.
- Surface legal milestone annotations (e.g., toleration acts, statutes).
- Export/shareable permalink states for specific timeline views.

---

## 🤝 Contributing
Pull requests & issues welcome! Guidelines:
1. Prefer editing scripts/raw sources over hand-editing processed artifacts.
2. Include citations for any new data source.
3. Run `make normalize` before submitting to ensure artifacts rebuild cleanly.

---

## 📝 License
Choose a code license (MIT/Apache recommended). Note that raw/processed data
may have separate usage terms—check `docs/sourcing-log.md`.

---

Maintained as a transparency-first project to help explain colonial-era
religious diversity with data rather than myth.

import csv
import json
from collections import defaultdict
from pathlib import Path

RAW_DIR = Path("data/raw/pre1776_foundings")
DENMAP_PATH = Path("data/mappings/denomination_map.csv")
COLMAP_PATH = Path("data/mappings/colony_map.csv")
FINKe_TABLE3 = Path("data/raw/finke_stark_1776_table3_denominational_profiles.csv")
TABLE2_SUMMARY = Path("data/raw/finke_stark_1776_table2_membership_rates.csv")
OUT_TIMELINE = Path("data/processed/pre1776_foundings_timeline.json")
OUT_COLONY = Path("data/processed/pre1776_colony_profiles.geojson")
PUBLIC_TIMELINE = Path("web/public/data/pre1776_foundings_timeline.json")
PUBLIC_COLONY = Path("web/public/data/pre1776_colony_profiles.geojson")

OUT_TIMELINE.parent.mkdir(parents=True, exist_ok=True)
OUT_COLONY.parent.mkdir(parents=True, exist_ok=True)
PUBLIC_TIMELINE.parent.mkdir(parents=True, exist_ok=True)
PUBLIC_COLONY.parent.mkdir(parents=True, exist_ok=True)

COLONY_COORDS = {
    "Massachusetts": (-71.382, 42.407),
    "New Hampshire": (-71.572, 43.193),
    "Connecticut": (-72.695, 41.603),
    "Rhode Island": (-71.509, 41.680),
    "New York": (-74.005, 40.712),
    "Pennsylvania": (-77.194, 41.203),
    "New Jersey": (-74.405, 40.058),
    "Delaware": (-75.527, 38.910),
    "Maryland": (-76.641, 39.045),
    "Virginia": (-78.656, 37.431),
    "North Carolina": (-79.019, 35.759),
    "South Carolina": (-81.163, 33.837),
    "Georgia": (-83.753, 32.165),
}


def load_map(path: Path, src: str, dest: str):
    mapping = {}
    if not path.exists():
        return mapping
    with path.open(newline="", encoding="utf-8") as handle:
        reader = csv.DictReader(handle)
        for row in reader:
            mapping[row[src].strip()] = row[dest].strip()
    return mapping


den_map = load_map(DENMAP_PATH, "source_label", "belief_group")
col_map = load_map(COLMAP_PATH, "source_colony", "destination_colony")


class FoundingData:
    def __init__(self):
        self.increments = defaultdict(lambda: defaultdict(lambda: defaultdict(float)))
        self.sources = defaultdict(lambda: defaultdict(set))
        self.all_years = set()
        self.all_beliefs = set()
        self.all_colonies = set()

    def add_record(self, year: int, colony: str, belief: str, count: float, source_url: str):
        if count <= 0:
            return
        self.increments[year][colony][belief] += count
        if source_url:
            self.sources[year][colony].add(source_url)
        self.all_years.add(year)
        self.all_beliefs.add(belief)
        self.all_colonies.add(colony)


def canonical_belief(label: str) -> str:
    key = label.strip()
    return den_map.get(key, key)


def canonical_colony(label: str) -> str:
    key = label.strip()
    return col_map.get(key, key)


def parse_metric_value(value: str) -> float:
    try:
        return float(value)
    except (TypeError, ValueError):
        return 0.0


def ingest_raw_files(storage: FoundingData):
    if not RAW_DIR.exists():
        raise SystemExit("Missing data/raw/pre1776_foundings directory")

    for path in sorted(RAW_DIR.glob("*.csv")):
        with path.open(newline="", encoding="utf-8") as handle:
            # Skip leading blank lines so DictReader sees the header row
            while True:
                position = handle.tell()
                line = handle.readline()
                if not line:
                    break
                if line.strip():
                    handle.seek(position)
                    break
            reader = csv.DictReader(handle)
            if not reader.fieldnames:
                continue
            for row in reader:
                if not row:
                    continue
                year_raw = (row.get("founding_year") or row.get("year") or "").strip()
                if not year_raw:
                    continue
                try:
                    year = int(float(year_raw))
                except ValueError:
                    continue
                colony = canonical_colony(row.get("colony", "").strip())
                if not colony:
                    continue
                belief = canonical_belief(row.get("belief_group", "").strip())
                if not belief:
                    continue
                count = parse_metric_value(row.get("metric_value", "1"))
                source_url = (row.get("source_url") or "").strip()
                storage.add_record(year, colony, belief, count, source_url)


def build_cumulative_snapshots(storage: FoundingData):
    years_sorted = sorted(storage.all_years)
    snapshots = {}
    cumulative = defaultdict(lambda: defaultdict(float))

    for year in years_sorted:
        for colony, belief_counts in storage.increments[year].items():
            for belief, value in belief_counts.items():
                cumulative[colony][belief] += value
        # Deep copy the current cumulative state for the year
        snapshot = {}
        for colony, belief_counts in cumulative.items():
            snapshot[colony] = dict(belief_counts)
        snapshots[year] = snapshot
    return years_sorted, snapshots


def load_finke_1776_percentages():
    percentages = defaultdict(dict)
    if not FINKe_TABLE3.exists():
        return percentages
    with FINKe_TABLE3.open(newline="", encoding="utf-8") as handle:
        reader = csv.DictReader(handle)
        for row in reader:
            belief = canonical_belief(row.get("denomination", "").strip())
            if not belief:
                continue
            for code, colony in (
                ("ME", "Maine"),
                ("NH", "New Hampshire"),
                ("VT", "Vermont"),
                ("MA", "Massachusetts"),
                ("RI", "Rhode Island"),
                ("CT", "Connecticut"),
                ("NY", "New York"),
                ("PA", "Pennsylvania"),
                ("NJ", "New Jersey"),
                ("DE", "Delaware"),
                ("MD", "Maryland"),
                ("VA", "Virginia"),
                ("NC", "North Carolina"),
                ("SC", "South Carolina"),
                ("GA", "Georgia"),
            ):
                value = (row.get(code) or "").strip()
                if not value:
                    continue
                try:
                    percent = float(value)
                except ValueError:
                    percent = 0.0
                if percent <= 0:
                    continue
                percentages[colony][belief] = percent
    return percentages


def load_finke_totals():
    totals = {}
    if not TABLE2_SUMMARY.exists():
        return totals
    with TABLE2_SUMMARY.open(newline="", encoding="utf-8") as handle:
        reader = csv.DictReader(handle)
        for row in reader:
            colony = (row.get("colony") or "").strip()
            if not colony:
                continue
            value = (row.get("congregations_total") or "").strip()
            try:
                totals[colony] = int(float(value))
            except ValueError:
                totals[colony] = 0
    return totals




def make_breakdown(counts, percentages):
    breakdown = []
    beliefs = set(counts.keys()) | set(percentages.keys())
    for belief in beliefs:
        count = counts.get(belief, 0)
        share = percentages.get(belief, 0.0)
        breakdown.append({"belief": belief, "count": round(count), "share": round(share, 3)})
    breakdown.sort(key=lambda item: item["share"], reverse=True)
    return breakdown


def build_timeline_json(years_sorted, snapshots):
    if not years_sorted:
        return {
            "years": [],
            "series": [],
            "metric": "congregations_founded_cumulative",
            "source": "Pre-1776 founding compilations",
        }

    beliefs = sorted({belief for snapshot in snapshots.values() for colony in snapshot.values() for belief in colony})
    series = {belief: [] for belief in beliefs}

    for year in years_sorted:
        year_totals = defaultdict(float)
        for colony_counts in snapshots[year].values():
            for belief, count in colony_counts.items():
                year_totals[belief] += count
        for belief in beliefs:
            series[belief].append(year_totals.get(belief, 0.0))

    extended_years = list(years_sorted)
    if extended_years and extended_years[-1] < 1776:
        extended_years.append(1776)
        for belief in beliefs:
            last_value = series[belief][-1] if series[belief] else 0.0
            series[belief].append(last_value)

    return {
        "years": extended_years,
        "series": [
            {"belief_group": belief, "values": [round(v, 3) for v in values]}
            for belief, values in series.items()
        ],
        "metric": "congregations_founded_cumulative",
        "source": "Compiled pre-1776 founding datasets",
        "notes": "Cumulative number of congregations founded by belief group based on curated regional datasets (1607-1775).",
    }


def build_colony_feature_collection(storage: FoundingData, years_sorted, snapshots):
    features = []
    metadata_sources = set()
    for year in years_sorted:
        snapshot = snapshots[year]
        for colony, belief_counts in snapshot.items():
            totalsum = sum(belief_counts.values())
            if totalsum <= 0 or colony not in COLONY_COORDS:
                continue
            counts = {}
            percentages = {}
            for belief, count in belief_counts.items():
                if count <= 0:
                    continue
                counts[belief] = count
                percentages[belief] = (count / totalsum) * 100
            if not percentages:
                continue
            dominant_belief = max(percentages.items(), key=lambda item: item[1])[0]
            dominant_share = percentages[dominant_belief]
            coords = COLONY_COORDS[colony]
            source_urls = sorted(storage.sources.get(year, {}).get(colony, []))
            metadata_sources.update(storage.sources.get(year, {}).get(colony, []))
            features.append(
                {
                    "type": "Feature",
                    "geometry": {"type": "Point", "coordinates": [coords[0], coords[1]]},
                    "properties": {
                        "year": year,
                        "colony": colony,
                        "dominant_belief": dominant_belief,
                        "dominant_share": round(dominant_share, 2),
                        "percentages": {k: round(v, 2) for k, v in percentages.items()},
                        "counts": {k: round(v) for k, v in counts.items()},
                        "breakdown": make_breakdown(counts, percentages),
                        "source": "Pre-1776 founding compilations",
                        "source_urls": source_urls,
                    },
                }
            )
    # Append 1776 snapshot from Finke & Stark
    finke_percentages = load_finke_1776_percentages()
    finke_totals = load_finke_totals()
    if finke_percentages:
        for colony, percentages in finke_percentages.items():
            if colony not in COLONY_COORDS or not percentages:
                continue
            total_congregations = finke_totals.get(colony, 0)
            counts = {}
            if total_congregations:
                for belief, percent in percentages.items():
                    counts[belief] = total_congregations * (percent / 100.0)
            dominant_belief = max(percentages.items(), key=lambda item: item[1])[0]
            dominant_share = percentages[dominant_belief]
            coords = COLONY_COORDS[colony]
            features.append(
                {
                    "type": "Feature",
                    "geometry": {"type": "Point", "coordinates": [coords[0], coords[1]]},
                    "properties": {
                        "year": 1776,
                        "colony": colony,
                        "dominant_belief": dominant_belief,
                        "dominant_share": round(dominant_share, 2),
                        "percentages": {k: round(v, 2) for k, v in percentages.items()},
                        "counts": {k: round(v) for k, v in counts.items()},
                        "breakdown": make_breakdown(counts, percentages),
                        "source": "Finke & Stark (1776 tables)",
                        "source_urls": ["https://www.jstor.org/stable/3710731"],
                    },
                }
            )

    return {
        "type": "FeatureCollection",
        "features": features,
        "metadata": {
            "description": "Cumulative congregational founding shares by colony and year (1607-1776)",
            "sources": sorted(metadata_sources),
        },
    }


if __name__ == "__main__":
    storage = FoundingData()
    ingest_raw_files(storage)
    years_sorted, snapshots = build_cumulative_snapshots(storage)

    timeline_payload = build_timeline_json(years_sorted, snapshots)
    colony_feature_collection = build_colony_feature_collection(storage, years_sorted, snapshots)

    OUT_TIMELINE.write_text(json.dumps(timeline_payload, indent=2), encoding="utf-8")
    OUT_COLONY.write_text(json.dumps(colony_feature_collection, indent=2), encoding="utf-8")
    PUBLIC_TIMELINE.write_text(json.dumps(timeline_payload, indent=2), encoding="utf-8")
    PUBLIC_COLONY.write_text(json.dumps(colony_feature_collection, indent=2), encoding="utf-8")
    print("Wrote pre-1776 founding datasets to processed/ and public data directories")

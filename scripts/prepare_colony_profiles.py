import csv
import json
from pathlib import Path

RAW = Path("data/raw/finke_stark_1776_table3_denominational_profiles.csv")
OUT_PROCESSED = Path("data/processed/colony_profiles_1776.geojson")
OUT_PUBLIC = Path("web/public/data/colony_profiles_1776.geojson")

OUT_PROCESSED.parent.mkdir(parents=True, exist_ok=True)
OUT_PUBLIC.parent.mkdir(parents=True, exist_ok=True)

COLONY_HEADERS = {
    "ME": "Maine",
    "NH": "New Hampshire",
    "VT": "Vermont",
    "MA": "Massachusetts",
    "RI": "Rhode Island",
    "CT": "Connecticut",
    "NY": "New York",
    "PA": "Pennsylvania",
    "NJ": "New Jersey",
    "DE": "Delaware",
    "MD": "Maryland",
    "VA": "Virginia",
    "NC": "North Carolina",
    "SC": "South Carolina",
    "GA": "Georgia",
}

AGGREGATE_KEYS = {"NEW_ENGLAND", "MIDDLE_COLONIES", "SOUTHERN_COLONIES"}

BELIEF_MAP = {
    "Congregationalist": "Congregationalist",
    "Congregational": "Congregationalist",
    "Separatist/Congregational": "Congregationalist",
    "Presbyterian": "Presbyterian",
    "Presbyterian (Reformed)": "Presbyterian",
    "Baptist": "Baptist",
    "General Baptist": "Baptist",
    "Episcopal": "Episcopalian/Anglican",
    "Episcopalian": "Episcopalian/Anglican",
    "Anglican": "Episcopalian/Anglican",
    "Anglican (Church of England)": "Episcopalian/Anglican",
    "Quaker": "Quaker",
    "Quaker (Religious Society of Friends)": "Quaker",
    "German Reformed": "Reformed (German)",
    "Reformed (German)": "Reformed (German)",
    "Lutheran": "Lutheran",
    "Lutheran (German)": "Lutheran",
    "Lutheran (German/Scandinavian)": "Lutheran",
    "Dutch Reformed": "Reformed (Dutch)",
    "Reformed (Dutch)": "Reformed (Dutch)",
    "Methodist": "Methodist",
    "Roman Catholic": "Roman Catholic",
    "Catholic (Roman)": "Roman Catholic",
    "Moravian": "Moravian",
    "Moravian (Unitas Fratrum)": "Moravian",
    "Jewish": "Jewish",
    "Jewish (Sephardic)": "Jewish",
    "Jewish (Sephardic/Ashkenazic)": "Jewish",
    "Huguenot": "Huguenot",
    "Huguenot (French Protestant)": "Huguenot",
    "Huguenot/Swiss Reformed": "Huguenot",
    "Other": "Other",
}

CANONICAL_ORDER = list(dict.fromkeys(BELIEF_MAP.values()))

COLONY_COORDS = {
    "Maine": (-68.985, 45.253),
    "New Hampshire": (-71.572, 43.193),
    "Vermont": (-72.577, 44.558),
    "Massachusetts": (-71.382, 42.407),
    "Rhode Island": (-71.509, 41.680),
    "Connecticut": (-72.695, 41.603),
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


def read_table(path: Path):
    with path.open(newline="", encoding="utf-8") as handle:
        reader = csv.DictReader(handle)
        for row in reader:
            yield row


def build_colony_profiles(rows):
    profiles = {name: {} for name in COLONY_HEADERS.values()}
    for row in rows:
        denomination = row["denomination"].strip()
        if denomination in AGGREGATE_KEYS:
            continue
        canonical = BELIEF_MAP.get(denomination, denomination)
        for key, colony in COLONY_HEADERS.items():
            value = row.get(key, "").strip()
            try:
                percent = float(value) if value else 0.0
            except ValueError:
                percent = 0.0
            profiles[colony][canonical] = percent
    for values in profiles.values():
        for label in CANONICAL_ORDER:
            values.setdefault(label, 0.0)
    return profiles


def feature_for_colony(colony: str, values: dict):
    if colony not in COLONY_COORDS:
        return None
    dominant_belief = ""
    dominant_share = 0.0
    for belief, percent in values.items():
        if percent > dominant_share:
            dominant_belief = belief
            dominant_share = percent
    coordinates = COLONY_COORDS[colony]
    return {
        "type": "Feature",
        "geometry": {"type": "Point", "coordinates": [coordinates[0], coordinates[1]]},
        "properties": {
            "colony": colony,
            "dominant_belief": dominant_belief,
            "dominant_share": dominant_share,
            "percentages": values,
            "source": "Finke & Stark (1989)",
            "documentation_url": "https://www.jstor.org/stable/3710731",
        },
    }


def main():
    if not RAW.exists():
        raise SystemExit(
            "Missing data/raw/finke_stark_1776_table3_denominational_profiles.csv."
        )
    profiles = build_colony_profiles(read_table(RAW))
    features = []
    for colony, values in profiles.items():
        feature = feature_for_colony(colony, values)
        if feature:
            features.append(feature)
    feature_collection = {
        "type": "FeatureCollection",
        "features": features,
        "metadata": {
            "description": "Colony-level denominational percentages for 1776",
            "source": "Finke & Stark (1989)",
            "generated_by": "scripts/prepare_colony_profiles.py",
        },
    }
    for destination in (OUT_PROCESSED, OUT_PUBLIC):
        destination.parent.mkdir(parents=True, exist_ok=True)
        destination.write_text(json.dumps(feature_collection, indent=2), encoding="utf-8")
    print(f"Wrote {OUT_PROCESSED} and copied to {OUT_PUBLIC}")


if __name__ == "__main__":
    main()

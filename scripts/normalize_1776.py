import csv
from pathlib import Path

TABLE2 = Path("data/raw/finke_stark_1776_table2_membership_rates.csv")
TABLE3 = Path("data/raw/finke_stark_1776_table3_denominational_profiles.csv")
DENMAP = Path("data/mappings/denomination_map.csv")
OUT = Path("data/processed/composition_1776.csv")

OUT.parent.mkdir(parents=True, exist_ok=True)

COLONY_COLUMNS = {
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

AGGREGATE_ROWS = {"New England", "Middle Colonies", "Southern Colonies", "National"}


def load_map(path: Path, source_field: str, target_field: str):
    mapping = {}
    with path.open(newline="", encoding="utf-8") as handle:
        reader = csv.DictReader(handle)
        for row in reader:
            mapping[row[source_field].strip()] = row[target_field].strip()
    return mapping


den_map = load_map(DENMAP, "source_label", "belief_group")


def load_colony_stats(path: Path):
    stats = {}
    with path.open(newline="", encoding="utf-8") as handle:
        reader = csv.DictReader(handle)
        for row in reader:
            colony = row["colony"].strip()
            if colony in AGGREGATE_ROWS:
                continue
            stats[colony] = {
                "congregations_total": row.get("congregations_total", "").strip(),
                "membership_rate": row.get("membership_rate", "").strip(),
                "membership_rate_whites": row.get("membership_rate_whites", "").strip(),
            }
    return stats


def load_profiles(path: Path):
    profiles = {colony: {} for colony in COLONY_COLUMNS.values()}
    with path.open(newline="", encoding="utf-8") as handle:
        reader = csv.DictReader(handle)
        for row in reader:
            raw_denom = row["denomination"].strip()
            belief = den_map.get(raw_denom, raw_denom)
            for code, colony in COLONY_COLUMNS.items():
                value = row.get(code, "").strip()
                try:
                    percent = float(value) if value else 0.0
                except ValueError:
                    percent = 0.0
                profiles.setdefault(colony, {})[belief] = percent
    return profiles


colony_stats = load_colony_stats(TABLE2)
profiles = load_profiles(TABLE3)

with OUT.open("w", newline="", encoding="utf-8") as handle:
    writer = csv.writer(handle)
    writer.writerow(
        [
            "year",
            "origin_region",
            "destination_colony",
            "belief_group",
            "percent_share",
            "congregations_total",
            "membership_rate",
            "membership_rate_whites",
            "source",
            "documentation_url",
        ]
    )

    for colony in COLONY_COLUMNS.values():
        percentages = profiles.get(colony, {})
        stats = colony_stats.get(colony, {})
        for belief, percent in sorted(percentages.items(), key=lambda item: item[1], reverse=True):
            if percent == 0:
                continue
            percent_str = f"{percent:.2f}".rstrip("0").rstrip(".")
            writer.writerow(
                [
                    "1776",
                    "",
                    colony,
                    belief,
                    percent_str,
                    stats.get("congregations_total", ""),
                    stats.get("membership_rate", ""),
                    stats.get("membership_rate_whites", ""),
                    "Finke & Stark (1989)",
                    "https://www.jstor.org/stable/3710731",
                ]
            )

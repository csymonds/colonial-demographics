import csv
import os
import sys
from pathlib import Path

RAW = Path("data/raw/slavevoyages_voyages.csv")
OUT = Path("data/processed/migration_slavevoyages_1600_1790.csv")

OUT.parent.mkdir(parents=True, exist_ok=True)

COLUMNS = {
    "year": "yearam",
    "origin_region": "embark_region",
    "destination_colony": "disembark_region",
    "population_estimate": "slaximp",
}


def read_rows(path):
    with path.open(newline="", encoding="utf-8") as handle:
        reader = csv.DictReader(handle)
        for row in reader:
            yield row


def pick(row, src_col):
    for key in (src_col, src_col.upper(), src_col.lower()):
        if key in row and row[key] not in (None, ""):
            return row[key]
    return ""


def main():
    if not RAW.exists():
        print(
            f"Missing {RAW}. Export the CSV from SlaveVoyages and place it there.",
            file=sys.stderr,
        )
        sys.exit(1)

    with OUT.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.writer(handle)
        writer.writerow(
            [
                "year",
                "origin_region",
                "destination_colony",
                "belief_group",
                "population_estimate",
                "ship_count",
                "source",
                "documentation_url",
            ]
        )
        for row in read_rows(RAW):
            year = pick(row, COLUMNS["year"])
            origin = pick(row, COLUMNS["origin_region"])
            dest = pick(row, COLUMNS["destination_colony"])
            landed = pick(row, COLUMNS["population_estimate"])
            if year and year.isdigit():
                y = int(year)
                if 1600 <= y <= 1790:
                    keep = any(
                        token in dest
                        for token in [
                            "North America",
                            "United States",
                            "New York",
                            "Virginia",
                            "Maryland",
                            "Pennsylvania",
                            "Massachusetts",
                            "Rhode Island",
                            "Connecticut",
                            "New Jersey",
                            "North Carolina",
                            "South Carolina",
                            "Georgia",
                            "Delaware",
                            "New Hampshire",
                        ]
                    )
                    if keep:
                        writer.writerow(
                            [
                                y,
                                origin,
                                dest,
                                "",
                                landed or "",
                                1,
                                "SlaveVoyages",
                                "https://www.slavevoyages.org/",
                            ]
                        )


if __name__ == "__main__":
    main()

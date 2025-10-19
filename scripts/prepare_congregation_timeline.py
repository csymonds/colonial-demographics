import csv
import json
from pathlib import Path

TABLE1 = Path("data/raw/finke_stark_1776_table1_congregations.csv")
TABLE5 = Path("data/raw/finke_stark_1776_table5_congregations_1776_1850.csv")
OUT_PROCESSED = Path("data/processed/congregation_timeline.json")
OUT_PUBLIC = Path("web/public/data/congregation_timeline.json")

OUT_PROCESSED.parent.mkdir(parents=True, exist_ok=True)
OUT_PUBLIC.parent.mkdir(parents=True, exist_ok=True)

DENOM_MAP = {
    "Congregational": "Congregationalist",
    "Congregationalist": "Congregationalist",
    "Presbyterian": "Presbyterian",
    "Baptist": "Baptist",
    "Episcopal": "Episcopalian/Anglican",
    "Episcopalian": "Episcopalian/Anglican",
    "Anglican": "Episcopalian/Anglican",
    "Quaker": "Quaker",
    "German Reformed": "Reformed (German)",
    "Reformed (German)": "Reformed (German)",
    "Lutheran": "Lutheran",
    "Dutch Reformed": "Reformed (Dutch)",
    "Reformed (Dutch)": "Reformed (Dutch)",
    "Methodist": "Methodist",
    "Roman Catholic": "Roman Catholic",
    "Moravian": "Moravian",
    "Jewish": "Jewish",
    "Other Protestants": "Other",
    "Other": "Other",
    "Separatist and Independent": "Other",
    "Dunker": "Other",
    "Mennonite": "Other",
    "Huguenot": "Other",
    "Sandemanian": "Other",
}

EXCLUDE_LABELS = {"TOTAL PROTESTANTS"}


def read_table(path: Path, value_field: str, percent: bool = False):
    data = {}
    with path.open(newline="", encoding="utf-8") as handle:
        reader = csv.DictReader(handle)
        for row in reader:
            raw_label = row["denomination" if "denomination" in row else "Denomination"].strip()
            label_upper = raw_label.upper()
            if label_upper in EXCLUDE_LABELS or raw_label == "Notes":
                continue
            canonical = DENOM_MAP.get(raw_label, raw_label)
            number = row.get(value_field, "").strip()
            if not number:
                continue
            try:
                value = float(number)
            except ValueError:
                continue
            data[canonical] = data.get(canonical, 0.0) + value
    return data


def load_1776_counts():
    return read_table(TABLE1, "number")


def load_1850_counts():
    return read_table(TABLE5, "1850_Number")


def main():
    if not TABLE1.exists() or not TABLE5.exists():
        raise SystemExit("Missing required raw tables for congregation timeline.")

    counts_1776 = load_1776_counts()
    counts_1850 = load_1850_counts()

    years = [1776, 1850]
    belief_groups = sorted({*counts_1776.keys(), *counts_1850.keys()})

    series = []
    for belief in belief_groups:
        series.append(
            {
                "belief_group": belief,
                "values": [counts_1776.get(belief, 0.0), counts_1850.get(belief, 0.0)],
            }
        )

    payload = {
        "years": years,
        "series": series,
        "metric": "congregations",
        "source": "Finke & Stark (1989)",
        "documentation_url": "https://www.jstor.org/stable/3710731",
        "notes": "Counts shown are national congregation totals for 1776 and 1850.",
    }

    data_json = json.dumps(payload, indent=2)
    OUT_PROCESSED.write_text(data_json, encoding="utf-8")
    OUT_PUBLIC.write_text(data_json, encoding="utf-8")
    print(f"Wrote {OUT_PROCESSED} and copied to {OUT_PUBLIC}")


if __name__ == "__main__":
    main()

RAW_DIR = data/raw
PROC_DIR = data/processed

.PHONY: all normalize clean

all: normalize

normalize: $(PROC_DIR)/migration_slavevoyages_1600_1790.csv $(PROC_DIR)/composition_1776.csv $(PROC_DIR)/colony_profiles_1776.geojson $(PROC_DIR)/congregation_timeline.json $(PROC_DIR)/pre1776_foundings_timeline.json $(PROC_DIR)/pre1776_colony_profiles.geojson

$(PROC_DIR)/migration_slavevoyages_1600_1790.csv: $(RAW_DIR)/slavevoyages_voyages.csv scripts/normalize_voyages.py
	python3 scripts/normalize_voyages.py
	@echo "wrote $@"

$(PROC_DIR)/composition_1776.csv: data/raw/finke_stark_1776_table2_membership_rates.csv data/raw/finke_stark_1776_table3_denominational_profiles.csv scripts/normalize_1776.py data/mappings/denomination_map.csv
	python3 scripts/normalize_1776.py
	@echo "wrote $@"

$(PROC_DIR)/colony_profiles_1776.geojson: data/raw/finke_stark_1776_table3_denominational_profiles.csv scripts/prepare_colony_profiles.py
	python3 scripts/prepare_colony_profiles.py
	@echo "wrote $@ and synced public copy"

$(PROC_DIR)/congregation_timeline.json: data/raw/finke_stark_1776_table1_congregations.csv data/raw/finke_stark_1776_table5_congregations_1776_1850.csv scripts/prepare_congregation_timeline.py
	python3 scripts/prepare_congregation_timeline.py
	@echo "wrote $@ and synced public copy"

PRE1776_RAW = $(wildcard data/raw/pre1776_foundings/*.csv)

$(PROC_DIR)/pre1776_foundings_timeline.json $(PROC_DIR)/pre1776_colony_profiles.geojson: $(PRE1776_RAW) scripts/prepare_pre1776_foundings.py data/mappings/denomination_map.csv data/mappings/colony_map.csv data/raw/finke_stark_1776_table3_denominational_profiles.csv
	python3 scripts/prepare_pre1776_foundings.py
	@echo "wrote pre-1776 founding datasets and synced public copies"

clean:
	rm -rf $(PROC_DIR)/*.csv $(PROC_DIR)/*.geojson

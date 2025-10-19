### Finke & Stark (1989) — *American Religion in 1776: A Statistical Portrait*

- **Host:** Association for the Sociology of Religion / Oxford University Press
- **URL:** https://www.jstor.org/stable/3710731
- **Access:** Open via JSTOR / institutional login
- **Format:** CSV (derived from PDF transcription, pp. 43–49)
- **Coverage:** 1775–1850, Colonial America → Early Republic
- **Variables:** colony, denomination, percentage, congregation count, membership rate, year comparisons
- **License:** Fair Use (for academic research / educational visualization)
- **Reliability:** High — original statistical synthesis from primary denominational rolls (Finke & Stark 1989)
- **Processing Notes:** Data transcribed manually, verified against PDF; stored as 5 tables in data/raw/.
- **Use:** Supports timeline slider and composition map layers (religious diversity visualization).



---

### Early‑Colonial Religion & Migration Sources (1600–1776)

#### Mayflower / Pilgrim era (c. 1620)

- **Mayflower Passenger List (Bradford ms.; transcript + links)**
  - **Host:** Pilgrim Hall Museum
  - **URL:** https://www.pilgrimhall.org/list_passengers.htm
  - **Access / License:** Public webpage; research/education use (site terms apply)
  - **Coverage:** 1620 voyage passenger roster; links to primary facsimiles
  - **Geography:** Plymouth Colony (Plymouth, New Plymouth)
  - **Variables:** passenger_name, family_group, role (saint/stranger where known), notes, links to documents
  - **Format:** HTML table with outbound links; suitable for manual transcription to CSV
  - **Reliability:** High — based on Gov. William Bradford’s list and contemporary records; museum curation
  - **Use:** Seed “migration_early” for 1620; belief_group = Separatist/Pilgrim (English Puritan separatists)
  - **Transcription Notes:** Manual scrape of table; cross‑link ship_name="Mayflower (1620)"; cite Bradford ms. page when available.

- **Mayflower Passenger List + Bradford Manuscript Facsimile**
  - **Host:** MayflowerHistory.com (Caleb Johnson) with link to State Library of Massachusetts facsimile
  - **URL:** https://mayflowerhistory.com/mayflower-passenger-list
  - **Access / License:** Public webpage; facsimile PDF via State Library; cite per source
  - **Coverage:** Complete passenger list; PDF of Bradford’s list (~1651 copy)
  - **Geography:** Plymouth Colony
  - **Variables:** passenger_name, household, notes, source_link
  - **Format:** HTML + PDF; manual transcription
  - **Reliability:** High — scholarly site with primary‑source linkage
  - **Use:** Cross‑validation of Pilgrim Hall list; attach page refs for provenance

- **Mayflower Compact (legal milestone)**
  - **Host:** Yale Law School, Avalon Project
  - **URL:** https://avalon.law.yale.edu/17th_century/mayflower.asp
  - **Access / License:** Public educational use
  - **Coverage:** 1620
  - **Variables:** year, colony, title, summary, full_text_url
  - **Format:** HTML; no transcription beyond metadata
  - **Reliability:** High — curated documentary edition
  - **Use:** “legal” layer (timeline annotations)

#### Great Migration / Puritan New England (1630s)

- **Winthrop Fleet Passenger Lists & Origins (book scan)**
  - **Host:** Internet Archive (The Winthrop fleet of 1630; Banks)
  - **URL:** https://archive.org/download/winthropfleetof100bank/winthropfleetof100bank.pdf
  - **Access / License:** Public domain scan (check IA item rights)
  - **Coverage:** 1630 fleet; ships, provisional lists; passenger origins
  - **Geography:** New England (Massachusetts Bay)
  - **Variables:** passenger_name, ship_name, origin_parish/county, notes
  - **Format:** PDF (scanned); **manual transcription required** (pages with lists)
  - **Reliability:** Medium‑High — classic secondary compilation from primary journals; note ambiguities
  - **Use:** “migration_early” 1630 cohort tagged belief_group = Puritan (Congregational)
  - **Questions:** Some identifications are provisional; keep a column `certainty`.

#### Quaker migration & meetings (1660s–1700s)

- **Quaker Arrivals in Philadelphia 1682–1705 (certificates of removal)**
  - **Host:** Dunham‑Wilcox‑Trove (transcribed from Friends records)
  - **URL:** https://dunhamwilcox.net/pa/phil_quaker1.htm
  - **Access / License:** Public webpage; credit transcriber per page header
  - **Coverage:** 1682–1705
  - **Geography:** Pennsylvania (Philadelphia Monthly Meeting)
  - **Variables:** name, former_meeting (origin), arrival_meeting, date (certificate), remarks
  - **Format:** HTML lists; **manual transcription required**
  - **Reliability:** Medium — derivative transcript; cross‑check against archival scans when possible
  - **Use:** “migration_early” with belief_group = Quaker (Friends)

- **Pennsylvania State Archives: Ships’ Passenger Lists/Oaths of Allegiance (German‑speaking immigrants)**
  - **Host:** Pennsylvania State Archives (research guide)
  - **URL:** https://www.pa.gov/agencies/phmc/pa-state-archives/research-online/research-guides/ships-passenger-lists
  - **Access / License:** Public guide linking to digitized microfilm and published compilations (Egle 1892; Strassburger & Hinke 1934)
  - **Coverage:** 1727–1775 (pre‑Revolution arrivals; non‑British subjects)
  - **Geography:** Port of Philadelphia
  - **Variables:** ship_name, arrival_date, passenger_name, oath_list, origin_region (German/Swiss/Dutch/French), notes
  - **Format:** Microfilm scans + published PDFs; transcription needed from published lists
  - **Reliability:** High for lists; note that **British subjects are excluded** in this corpus
  - **Use:** “migration_early” (Palatine/German Reformed/Lutheran/Anabaptist streams); belief_group sometimes inferable but mostly `unknown_protestant` — include `inference_flag`.

- **Pennsylvania German Pioneers (published lists, 1727–1808)**
  - **Host:** Internet Archive (Strassburger & Hinke)
  - **URL:** https://archive.org/download/pennsylvaniagerm42stra/pennsylvaniagerm42stra.pdf
  - **Access / License:** Public domain scan
  - **Coverage:** 1727–1775 (subset relevant)
  - **Geography:** Philadelphia
  - **Variables:** arrival_date, ship_name, passenger_name; some signatures lists
  - **Format:** PDF; transcription or OCR + cleaning required
  - **Reliability:** High — standard reference edition
  - **Use:** “migration_early” (German‑speaking flows)

#### Huguenot migration (South Carolina focus)

- **Huguenot Passenger Lists to Carolina (Richmond 1679; Margaret 1685)**
  - **Host:** Huguenot Society of America (blog summaries with list excerpts)
  - **URL(s):**
    - Richmond (1679): https://huguenotsociety.org/blog/passengers-on-the-margaret-1685nbsp-b5lcj
    - Margaret (1685): https://huguenotsociety.org/blog/passengers-on-the-margaret-1685nbsp
  - **Access / License:** Public webpages; cite society and post date
  - **Coverage:** 1679 & 1685 lists of French Protestant refugees bound for Carolina
  - **Geography:** London → Carolina; settlers in Santee/Goose Creek/Cooper River regions
  - **Variables:** passenger_name, family_group_count (where noted), destination=Carolina, year, ship_name
  - **Format:** HTML narrative with enumerated names; **manual transcription required**
  - **Reliability:** Medium — secondary summaries referencing archival lists; good for seed data
  - **Use:** “migration_early” with belief_group = Huguenot (French Protestant)

- **The Huguenots of Colonial South Carolina (monograph with counts)**
  - **Host:** Internet Archive (Hirsch)
  - **URL:** https://archive.org/download/huguenotsofcolon01hirs/huguenotsofcolon01hirs.pdf
  - **Access / License:** Public domain scan
  - **Coverage:** 1680–1725 (arrival waves; settlement areas)
  - **Geography:** South Carolina Lowcountry
  - **Variables:** narrative counts (e.g., refugees in Charleston by 1700), settlement locales
  - **Format:** PDF; **requires manual extraction of any numeric tables**
  - **Reliability:** Medium — early synthesis; use cautiously with citations
  - **Use:** Context + small composition points by decade/region

#### Moravian migration & congregation records (1730s–1760s)

- **Moravian Archives & Historical Society (digitized resources / finding aids)**
  - **Host:** Moravian Historical Society; Moravian Church Archives (Bethlehem)
  - **URLs:**
    - Digitized resources portal: https://www.moravianhistory.org/digitizedresources
    - Archives home: https://www.moravianchurcharchives.org/
  - **Access / License:** Public research portals; some digitized materials; usage per repository policy
  - **Coverage:** 1730s–1770s (immigration to Georgia/PA; congregations Bethlehem/Nazareth, etc.)
  - **Geography:** Pennsylvania, Georgia; EWI missions (note: some Caribbean)
  - **Variables:** arrival accounts, membership registers, ship names (e.g., *Two Brothers* 1735), founding dates
  - **Format:** Mixed (PDFs, finding aids); **manual transcription from specific items**
  - **Reliability:** High (primary repositories)
  - **Use:** “migration_early” + “composition_early” via congregation founding dates and member rolls

#### Jewish population & congregation milestones (1654–1776)

- **The Colonial American Jew, 1492–1776 (Marcus) & derived estimates**
  - **Host:** Internet Archive (Marcus volumes); American Jewish Archives (derived tables)
  - **URLs:**
    - Marcus vols.: https://archive.org/details/colonialamerican0003marc
    - AJHS/AJA derived estimates PDF (Sarna after Marcus/Diamond): https://kennethsstern.com/wp-content/uploads/2018/09/as-class-jewish-population-figures-session-924072016.pdf
  - **Access / License:** Public domain scans (Marcus); classroom PDF (attribution required)
  - **Coverage:** 1654–1776 (New Amsterdam/NYC; Newport; Philadelphia; Charleston; Savannah)
  - **Geography:** Key port cities
  - **Variables:** population_estimates by city/decade; synagogue founding dates
  - **Format:** PDF; **manual extraction to CSV** (composition snapshots by decade)
  - **Reliability:** High for scholarly consensus estimates; note uncertainty ranges
  - **Use:** “composition_early” (Jewish communities) + legal/civic milestones (rights petitions, synagogue charters)

#### Legal / charter milestones tied to religious freedom (1600–1776)

- **Maryland Toleration Act (1649)** — Avalon Project — https://avalon.law.yale.edu/18th_century/maryland_toleration.asp
- **Rhode Island Royal Charter (1663)** — Avalon Project — https://avalon.law.yale.edu/17th_century/ri04.asp
- **Pennsylvania Frame of Government (1682)** — Avalon Project — https://avalon.law.yale.edu/17th_century/pa04.asp
- **Penn’s Charter of Liberties (1682)** — Avalon Project — https://avalon.law.yale.edu/17th_century/pa03.asp
- **New York “Charter of Liberties” (1691) incl. limited liberty of conscience** — New York Courts PDF — https://history.nycourts.gov/wp-content/uploads/2019/01/Publications_Charter-Liberties-1691-compressed.pdf
- **Library of Congress exhibition** (Religion & the Founding of the American Republic) — overview & artifact links — https://www.loc.gov/exhibits/religion/

**How these support the viz**
- Provide early (1620s–1680s) anchor points for **migration_early** with ship‑level rows (Pilgrim, Winthrop, Huguenot, Quaker, Palatine/German)
- Enable **composition_early** via: synagogue founding/population estimates; parish/meeting founding dates; localized counts (e.g., Huguenots in Charleston by 1700)
- Populate **legal** timeline with charters, compacts, and toleration acts for on‑hover summaries and filter toggles

**Unresolved / follow‑ups**
- Seek machine‑readable tables for Winthrop passenger lists (check HathiTrust/IA OCR); otherwise plan focused manual transcription of list pages with a `certainty` flag
- For Quaker certificates of removal, identify image scans to verify transcriptions; add `source_callnum` where available
- Extract decade‑level Jewish population estimates by city (Marcus/Sarna) and create `metric_type=population_estimate`
- Investigate Anglican parish founding lists by colony (e.g., Virginia vestry books; Colonial Williamsburg research guides) for pre‑1776 **congregational count** snapshots
- For Pennsylvania German arrivals, target 1727–1775 subset and derive origin_region (Palatinate/Swiss/etc.) when stated; **do not** infer denomination unless noted by source
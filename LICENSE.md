# Licensing and Sources

Copyright © 2026 Fr. Christopher Brannan, O.P.

This repository uses a dual-licensing structure to distinguish between the **application software** and the **curated textual datasets**.

---

## 1. Application Software and Markup

* **License**: [GNU Affero General Public License v3.0 (AGPL-3.0)](./LICENSE)
* **Applies to**:
  * Frontend application source code and Svelte components (`src/`)
  * UI styling, layouts, and interactive logic
  * Build, testing, and deployment scripts (`scripts/`, configuration files)
  * Data extraction scripts (`tf-fast/extract_datasets.py`)

Under the AGPL v3, you are free to run, copy, distribute, study, and modify this software. If you run a modified version of this application on a network server or public website, you must provide access to the corresponding source code of the modified version under the terms of the AGPL v3.

For the full legal text, see the bare [LICENSE](./LICENSE) file or visit <https://www.gnu.org/licenses/agpl-3.0.html>.

---

## 2. Textual Data, Concordances, and Annotations

* **License**: [Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)](./LICENSE-DATA)
* **Applies to**:
  * Static JSON datasets in `static/data/` (e.g., `sblgnt`, `n1904`, `vulgate`, `web`)
  * Extracted pericope alignments, word tokens, and verse structures
  * Concordance mappings and lexical index files

Under CC BY-SA 4.0, you are free to share (copy and redistribute in any medium or format) and adapt (remix, transform, and build upon) the material for any purpose, even commercially, provided you give appropriate credit and distribute your contributions under the same license.

For the full legal text, see the bare [LICENSE-DATA](./LICENSE-DATA) file or visit <https://creativecommons.org/licenses/by-sa/4.0/>.

---

## 3. Upstream Sources, Editions, and Attributions

The datasets curated in this project are based on the following underlying texts and scholarship:

### The Greek New Testament: SBL Edition (SBLGNT)
* **License**: [Creative Commons Attribution 4.0 International (CC BY 4.0)](https://creativecommons.org/licenses/by/4.0/).
* **Copyright**: © 2010 Society of Biblical Literature and Logos Bible Software. Edited by Michael W. Holmes. See the [SBLGNT License](https://www.sblgnt.com/license/) and [GitHub repository](https://github.com/Faithlife/SBLGNT/blob/master/LICENSE).
  

### Eberhard Nestle's Greek New Testament (1904)
* **Status**: Public Domain.
* Based on the 1904 British and Foreign Bible Society edition, processed with Text-Fabric.

### Latin Vulgate (Clementine Edition)
* **Status**: Public Domain.
* Clementine edition of the Latin Vulgate, digitized and structured for lexical lookup.

### World English Bible (WEB Catholic Edition)
* **Status**: Public Domain.
* Modern English translation of the Holy Bible in the public domain.

### Kurt Aland's *Synopsis Quattuor Evangeliorum*
* Pericope boundaries, grouping, and parallel designations are structured around the outline of Kurt Aland's *Synopsis Quattuor Evangeliorum* 13th Revised Edition (Deutsche Bibelgesellschaft: Stuttgart, 1986).

### Text-Fabric
* The data processing and morphological extractions utilize [Text-Fabric](https://github.com/annotation/text-fabric), developed by Dirk Roorda (KNAW/HUC).

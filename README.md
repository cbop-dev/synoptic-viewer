# synoptic-viewer 2.0

The front-end of a Gospel Synopsis Viewer web application (https://synopsis.cbop.faith), providing a visual synoptic (side-by-side) comparison of parallel texts of the Greek NT Gospels, based on the passage selection and outline of Kurt Aland's *Synopsis Quattuor Evangeliorum*.

### ⚡ Synoptic Viewer 2.0 (Zero-Backend Engine)
In Synoptic Viewer 2.0, all [Text-Fabric](https://github.com/annotation/text-fabric) datasets (SBLGNT, N1904, Vulgate, WEB Catholic) are pre-extracted to static JSON at build time. The application runs **100% in-memory in the browser with ZERO runtime Python microservice required**, eliminating the previous 6–8 GB RAM requirement and speeding up large pericope views from 30–60 seconds to **< 50 milliseconds (> 200x faster)**.

It allows for both entering passages to lookup parallels, and user-selection of Aland's sections and groupings. 

## Features:

* **Zero runtime backend**: Runs entirely offline in the browser or on any static CDN / GitHub Pages.
* **Choose NT version**:
    1. SBL Greek NT (2010) (default)
    2. Nestle's *NTG* (1904).
    3. Vulgate (Latin; Clementine): lexeme info, but no glosses.
    4. World English Bible, Catholic edition.
* **Apparatus notes**: SBL GNT displays full textual apparatus notes! Click on the note icon next to a biblical reference in the results panel.
* **Highlighting matching phrases**: color coding by type of match (which 2-4 gospels share it). Must have 3+ consecutive words in match.
    * *Lexically identical matches*: same lexemes, but potentially different morphology. (Ignores certain words like particles and some conjunctions)
    * *Exact matches*: lexically and morphologically identical
* **Lexical highlighting & Instant Lexicon**: clicking on any word highlights every instance of the lexeme in all displayed texts and provides instant lemma definitions, part-of-speech, and concordance stats.
* **Unique words outlining**: clicking the "unique" button color-outlines lexemes that are unique to a particular book in a given set of parallel pericopes.
* **Sorting/filtering** by book, which puts the pericopes in order based on the given book, and eliminates duplicate sections.
* **Focus** on a book, placing visual prominence on that book in the left column with the other gospels grouped on the right.
* **Custom greek highlight**: in the "Words" panel options, highlight specific inflected forms across all texts.
* **Custom synopsis & Polyglot viewer**: view any set(s) of NT texts in up to 4 parallel columns across different ancient and modern translations.

## Requirements

* Node.js 20+ (Node 22.3+ recommended)
* Optional: Python 3.13 + `text-fabric` only if re-extracting fresh Text-Fabric datasets at build time.

## Installation & Building

```bash
git clone https://github.com/cbop-dev/synoptic-viewer
cd synoptic-viewer
npm install

# Run unit test suite (offline, no server needed):
npm run test:unit -- --run

# Run local development server:
npm run dev

# Build 1: Static site for GitHub Pages or static hosting:
ADAPTER=static npm run build

# Build 2: Production Node.js server:
npm run build
node build
```

### Re-extracting Text-Fabric Datasets (Build-time only):
If updating or regenerating the static datasets:
```bash
.venv/bin/python ../tf-fast/extract_datasets.py --datasets sblgnt,n1904,vulgate,web --output static/data
```

## Licensing and Sources

This project is released under a dual-licensing model:

* **Application Code & Markup**: Licensed under the [GNU Affero General Public License v3.0 (AGPL-3.0)](./LICENSE).
* **Textual Data & Datasets**: Curated static datasets under `static/data/` are licensed under [Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)](./LICENSE-DATA).
* **Underlying Text Sources & Attributions**: Includes the SBL Greek New Testament (© 2010 Society of Biblical Literature and Logos Bible Software; licensed under [CC BY 4.0](https://www.sblgnt.com/license/)), Nestle 1904 GNT (Public Domain), Clementine Vulgate (Public Domain), World English Bible Catholic Edition (Public Domain), and outline structure from Kurt Aland's *Synopsis Quattuor Evangeliorum*.

For complete component breakdowns, permissions, and attribution notices, see [LICENSE.md](./LICENSE.md), or review the bare [LICENSE](./LICENSE) and [LICENSE-DATA](./LICENSE-DATA) files.

## TO DO:

- [x] include Aland's secondary parallels
- [x] SBLGNT
- [x] add Latin Vulgate and WEB Catholic (English) versions!
- [X] Improve color-coding matching phrases.
- [X] Lexeme type-to-search.
- [ ] More README documentation: requirements, installation, testing, usage.
- [ ] Further testing and performance improvements.

### Dreams:

- [ ] Find/adopt more granular parallel scheme.
- [X] Find/import newer Greek NT version to use (SBL GNT added in version 0.4.0!)
- [ ] Grammatical highlighting.
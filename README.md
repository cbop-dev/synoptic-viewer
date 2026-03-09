# synoptic-viewer

The front-end of a Gospel Synopsis Viewer web application (https://synopsis.cbop.faith), providing a visual synoptic (side-by-side) comparision of parallel texts of the Greek NT Gospels, based on the passage selection and outline of Kurt Aland's *Synopsis Quattuor Evangeliorum*. This application depends upon a running instance of the [tf-fast](https://github.com/cbop-dev/tf-fast) python application which serves (via REST/JSON calls over http) a [text-fabric](https://github.com/annotation/text-fabric) version of the Greek NT (currently [SBL Greek New Testament](https://www.sblgnt.com), or (optionally) from [Nestle's 1904 Greek New Testament](https://github.com/CenterBLC/N1904).)

It allows for both entering passages to lookup parallels, and user-selection of Aland's sections and groupings. 

## Features:

Current features (ver. 0.6) include: 

* **Choose NT version:**: now with several options, including some non-Greek ones: 
    1. SBL Greek NT (2010) (default)
    2. Nestle's *NTG* (1904).
    3. Vulgate (Latin; Clementine): lexeme info, but no glosses.
    4. World English Bible, Catholic edition. (No lexeme features.)
* SBL GNT will display apparatus notes! Click on the note icon next to a biblical reference in the results panel.
* **Highlighting matching phrases**: color coding by type of match (which 2-4 gospels share it). Must have 3+ consecutive words in match.
    * *Lexically identical matches*: same lexemes, but potentially different morphology. (Ignores certain words like particles and some conjunctions)
    * *Exact matches*: lexically and morphologically identical
* **lexical highlighting**: clicking on any word highlights every instance of the lexeme in all displayed texts.
* **unique words outlining**: clicking the "unique" button color-outlines lexemes that are unique to a particular book in a given set of parallel pericopes.
* **sorting/filtering** by book, which puts the pericopes in order based on the given book, and eliminates those sections of Aland's which duplicate that given book's pericopes.
* **focus** on a book, which in addition to sorting/filtering by the given book, also places the visual focus on that book by making it's text larger and more prominent in the left column, and places the other gospels in a single column on the right.
* **Custom greek highlight**: in the "Words" panel options, click the "Custom" tab and type (Latin characters automatically become Greek) any Greek word form and click "Toggle" and this will be highlighted everywhere! (useful for looking for specific forms, e.g., "με" but not "εγω", etc.)
* **Custom synopsis**: on the "Custom" tab/panel, view any set(s) of NT texts, in up to 4 parallel columns! Lexical highlighting and 

## Demo

![demo clip](https://github.com/user-attachments/assets/d504712b-8589-4a38-bbb0-16b41ea16c62) 

(This is of a VERY VERY OLD version showing some of the key features. The latest does MUCH more!!)

## Requirements

* Installed and running instance of [`tf-fast`](https://github.com/cbop-dev/tf-fast) (best to run this on the same server as synoptic-viewer, to avoid CORS issues). Latest version (0.6) requires tf-fast 1.2.

* node 22.3+
* *more?*

## Installation:

```
git clone https://github.com/cbop-dev/synoptic-viewer
cd synoptic-viewer
npm install
## to test, first edit src/lib/env/env.js and make 'testing' = 'true'
# then run: npm run test:unit

## run development version:
npm run dev

## build for production:
npm run build

### then run for production:
node build
```

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
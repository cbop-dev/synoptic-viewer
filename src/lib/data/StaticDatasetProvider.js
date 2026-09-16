import { browser } from '$app/environment';
import { base } from '$app/paths';

/**
 * Normalizes dataset names to static folder keys.
 * @param {string} name 
 * @returns {string}
 */
export function normalizeVersion(name) {
    if (!name) return 'sblgnt';
    const lower = name.toLowerCase().trim();
    if (lower === 'sbl' || lower === 'sblgnt') return 'sblgnt';
    if (lower === 'nt' || lower === 'n1904') return 'n1904';
    if (lower === 'vul' || lower === 'vulgate') return 'vulgate';
    if (lower === 'web' || lower === 'webc') return 'web';
    return lower;
}

const GOSPEL_ABBREVS = new Set(['Matt', 'Mark', 'Luke', 'John']);

/**
 * StaticDatasetProvider - Build-time static data provider for Synoptic Viewer 2.0.
 */
export class StaticDatasetProvider {
    constructor() {
        /** @type {Map<string, any>} */
        this.gospelsCache = new Map();
        /** @type {Map<string, any>} */
        this.booksCache = new Map();
        /** @type {Map<string, any>} */
        this.lexemesCache = new Map();
        /** @type {Map<string, any>} */
        this.concordanceCache = new Map();
        /** @type {Map<string, any>} */
        this.booksMetaCache = new Map();
    }

    /**
     * Loads a JSON file either via fetch (in browser) or via node:fs (in Vitest / SSR).
     * @param {string} relativePath - Path relative to static/
     * @returns {Promise<any>}
     */
    async loadJson(relativePath) {
        // In test environments (Vitest node or jsdom), load directly via node:fs
        if (typeof process !== 'undefined' && process.env && (process.env.VITEST || process.env.TEST)) {
            try {
                const fs = await import(/* @vite-ignore */ 'node:fs/promises');
                const path = await import(/* @vite-ignore */ 'node:path');
                const filePath = path.resolve(process.cwd(), 'static', relativePath);
                const content = await fs.readFile(filePath, 'utf-8');
                return JSON.parse(content);
            } catch (err) {
                console.warn(`[StaticDatasetProvider] Could not load ${relativePath} via fs:`, err);
            }
        }

        if (browser) {
            const url = `${base}/${relativePath}`.replace(/\/+/g, '/');
            const res = await fetch(url);
            if (!res.ok) {
                console.warn(`[StaticDatasetProvider] Failed to fetch ${url}: ${res.statusText}`);
                return null;
            }
            return await res.json();
        } else {
            try {
                const fs = await import(/* @vite-ignore */ 'node:fs/promises');
                const fileUrl = new URL(`../../../static/${relativePath}`, import.meta.url);
                const content = await fs.readFile(fileUrl, 'utf-8');
                return JSON.parse(content);
            } catch (err) {
                // Fallback in case of unexpected environment
                try {
                    const url = `${base}/${relativePath}`.replace(/\/+/g, '/');
                    const res = await fetch(url);
                    return await res.json();
                } catch (fetchErr) {
                    console.warn(`[StaticDatasetProvider] Could not load ${relativePath}:`, err);
                    return null;
                }
            }
        }
    }

    /**
     * Ensure gospels combined data is loaded for a version.
     * @param {string} version 
     * @returns {Promise<any>}
     */
    async ensureGospels(version) {
        const v = normalizeVersion(version);
        if (!this.gospelsCache.has(v)) {
            const loadPromise = this.loadJson(`data/${v}/gospels.json`);
            this.gospelsCache.set(v, loadPromise);
            const data = await loadPromise;
            this.gospelsCache.set(v, data);
            return data;
        }
        return await this.gospelsCache.get(v);
    }

    /**
     * Ensure a specific book is loaded for a version.
     * @param {string} version 
     * @param {string} bookAbbrev 
     * @returns {Promise<any>}
     */
    async ensureBook(version, bookAbbrev) {
        const v = normalizeVersion(version);
        const abbrev = bookAbbrev.trim();

        // Check if it is a Gospel and gospels.json has it
        if (GOSPEL_ABBREVS.has(abbrev)) {
            const gospels = await this.ensureGospels(v);
            if (gospels && gospels[abbrev]) {
                return gospels[abbrev];
            }
        }

        const cacheKey = `${v}/${abbrev}`;
        if (!this.booksCache.has(cacheKey)) {
            const filename = abbrev.replace(/\s+/g, '_') + '.json';
            const loadPromise = this.loadJson(`data/${v}/books/${filename}`);
            this.booksCache.set(cacheKey, loadPromise);
            const data = await loadPromise;
            this.booksCache.set(cacheKey, data);
            return data;
        }
        return await this.booksCache.get(cacheKey);
    }

    /**
     * Ensure lexemes dictionary is loaded for a version.
     * @param {string} version 
     * @returns {Promise<any>}
     */
    async ensureLexemes(version) {
        const v = normalizeVersion(version);
        if (!this.lexemesCache.has(v)) {
            const loadPromise = this.loadJson(`data/${v}/lexemes.json`);
            this.lexemesCache.set(v, loadPromise);
            const data = await loadPromise;
            this.lexemesCache.set(v, data);
            return data;
        }
        return await this.lexemesCache.get(v);
    }

    /**
     * Ensure concordance dictionary is loaded for a version.
     * @param {string} version 
     * @returns {Promise<any>}
     */
    async ensureConcordance(version) {
        const v = normalizeVersion(version);
        if (!this.concordanceCache.has(v)) {
            const loadPromise = this.loadJson(`data/${v}/concordance.json`);
            this.concordanceCache.set(v, loadPromise);
            const data = await loadPromise;
            this.concordanceCache.set(v, data);
            return data;
        }
        return await this.concordanceCache.get(v);
    }

    /**
     * Look up lexical information for a lemma ID.
     * @param {string} version 
     * @param {number|string} lexId 
     * @returns {Promise<any>}
     */
    async getLexInfo(version, lexId) {
        const lexemes = await this.ensureLexemes(version);
        if (!lexemes) return null;
        return lexemes[String(lexId)] || null;
    }

    /**
     * Look up concordance stats and occurrences for a lemma ID.
     * @param {string} version 
     * @param {number|string} lexId 
     * @returns {Promise<any>}
     */
    async getLexRefsCounts(version, lexId) {
        const conc = await this.ensureConcordance(version);
        if (!conc) return null;
        return conc[String(lexId)] || null;
    }

    /**
     * Fetch verse text by book, chapter, and verse.
     * @param {string} version 
     * @param {string} book 
     * @param {string|number} chap 
     * @param {string|number} v 
     * @param {any} [server] 
     * @returns {Promise<string>}
     */
    async getVerseText(version, book, chap = '1', v = '1', server = null) {
        const bookAbbrev = server?.getBookAbbrev(book) || book;
        const bookData = await this.ensureBook(version, bookAbbrev);
        if (!bookData || !bookData.chapters) return '';

        const cStr = String(chap).replace(/[a-zA-Z]/g, '').trim();
        const vStr = String(v).replace(/[a-zA-Z]/g, '').trim();
        const verseObj = bookData.chapters[cStr]?.[vStr];
        return verseObj?.raw_text || '';
    }

    /**
     * Get concatenated text for a range of verses.
     * @param {string} version 
     * @param {string} book 
     * @param {string|number} chap 
     * @param {string|number} start 
     * @param {string|number} end 
     * @param {boolean} [showVerses=true] 
     * @param {any} [server] 
     * @returns {Promise<{text: string}>}
     */
    async getVersesFromRange(version, book, chap, start, end, showVerses = true, server = null) {
        const bookAbbrev = server?.getBookAbbrev(book) || book;
        const bookData = await this.ensureBook(version, bookAbbrev);
        if (!bookData || !bookData.chapters) return { text: '' };

        const cStr = String(chap).trim();
        const startV = parseInt(String(start).trim(), 10);
        const endV = parseInt(String(end).trim(), 10);
        const chObj = bookData.chapters[cStr];
        if (!chObj) return { text: '' };

        const textParts = [];
        for (let i = startV; i <= endV; i++) {
            const vObj = chObj[String(i)];
            if (vObj) {
                if (showVerses) {
                    textParts.push(vObj.text);
                } else {
                    textParts.push(vObj.raw_text);
                }
            }
        }
        return { text: textParts.join(' ') };
    }

    /**
     * Resolves an array of { book, chapter, verses } objects into formatted texts, word tokens, and apparatus notes.
     * @param {string} version 
     * @param {{book:string,chapter:number|null,verses:number[]}[]} bcvArray 
     * @param {boolean} [showVerses=true] 
     * @param {boolean} [lexemes=true] 
     * @param {boolean} [showNotes=false] 
     * @param {any} [server=null] 
     * @returns {Promise<{texts: any[], lexemes?: any}>}
     */
    async getTexts(version, bcvArray, showVerses = true, lexemes = true, showNotes = false, server = null) {
        const v = normalizeVersion(version);
        const textsResponse = [];

        // Pre-load gospels in case the query touches any Gospel
        await this.ensureGospels(v);

        for (const item of bcvArray) {
            const bookAbbrev = server?.getBookAbbrev(item.book) || item.book;
            const bookData = await this.ensureBook(v, bookAbbrev);

            const textParts = [];
            const verseWordsList = [];
            const notesList = [];

            if (bookData && bookData.chapters) {
                const cStr = item.chapter ? String(item.chapter) : null;
                const chObj = cStr ? bookData.chapters[cStr] : null;

                let versesToFetch = [];
                if (chObj) {
                    if (item.verses && item.verses.length > 0) {
                        versesToFetch = item.verses;
                    } else {
                        // Whole chapter
                        versesToFetch = Object.keys(chObj).map(Number).sort((a, b) => a - b);
                    }
                }

                for (const vNum of versesToFetch) {
                    const verseObj = chObj ? chObj[String(vNum)] : null;
                    if (verseObj) {
                        if (showVerses) {
                            textParts.push(verseObj.text);
                        } else {
                            textParts.push(verseObj.raw_text);
                        }

                        if (lexemes && verseObj.words) {
                            verseWordsList.push({
                                verse: Number(vNum),
                                words: verseObj.words
                            });
                        }

                        if (showNotes && verseObj.notes && verseObj.notes.length) {
                            notesList.push(...verseObj.notes);
                        }
                    }
                }
            }

            let refStr = bookAbbrev;
            if (item.chapter) {
                refStr += ` ${item.chapter}`;
                if (item.verses && item.verses.length) {
                    refStr += `:${item.verses.join(',')}`;
                }
            }

            textsResponse.push({
                text: textParts.join(' '),
                reference: refStr,
                words: verseWordsList,
                notes: notesList
            });
        }

        const retObj = {
            texts: textsResponse
        };

        // Extract response lexemes dictionary
        if (lexemes) {
            const responseLexemes = {};
            const allLexDict = await this.ensureLexemes(v);
            if (allLexDict) {
                for (const t of textsResponse) {
                    for (const vw of t.words) {
                        for (const w of vw.words) {
                            if (w.id > 0) {
                                const lInfo = allLexDict[String(w.id)];
                                if (lInfo && lInfo.lemma) {
                                    const lemma = lInfo.lemma;
                                    if (!responseLexemes[lemma]) {
                                        responseLexemes[lemma] = {
                                            id: w.id,
                                            count: 1,
                                            beta: lInfo.beta
                                        };
                                    } else {
                                        responseLexemes[lemma].count += 1;
                                    }
                                }
                            }
                        }
                    }
                }
            }
            retObj.lexemes = responseLexemes;
        }

        return retObj;
    }
}

export const staticProvider = new StaticDatasetProvider();

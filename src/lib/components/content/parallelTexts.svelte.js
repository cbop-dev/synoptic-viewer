import { mylog } from "$lib/env/env.js";
import { ColorUtils } from "$lib/utils/color-utils";
import { untrack } from "svelte";

import { GreekUtils } from "$lib/utils/greek-utils";
import { combineRefs, formatBibRefs, expandRefs } from '$lib/utils/bibleRefUtils.js';
import * as BibleUtils from '$lib/utils/bibleRefUtils.js'
//import { findAllCommonSubarraysAmongHybrid } from "$lib/utils/sais-array2";
import { findMaximalCommonSubarraysAcrossColumns2, findMaximalCommonTextPhrasesAcrossColumns } from "$lib/utils/column-subarrays2.js";
import mathUtils from "$lib/utils/math-utils";
import * as ArrayUtils from "$lib/utils/array-utils";


/**
 * @class
 */
export class Word {
    id = 0;
    word = '';
    clean = '';
    lang='greek';
    /**
     * 
     * @param {number} id 
     * @param {string} word 
     */
    constructor(id = 0, word = '',lang='greek') {
        this.id = id;
        this.word = word.trim();
        this.lang=lang;
        this.clean = this.word ? (lang=='greek'  ? GreekUtils.removeApparatusMarks(this.word).trim() : this.word) : '';
        //if (this.word!=this.clean){
        //mylog(`Word(${this.word}) cleaned of apparatus marks='${this.clean}'`)
        //}

    }
    /**
     * @type {Set<string>}
     */
    specialCss = new Set();
    /**
     * @description various types of phrase that this word instance is in. Useful, e.g., for assigning css classes for matching phrases. not sure about the 'index': might refer to the index in the parent object's tracking of phrases.
     * @type {{lexical:LexPhraseAndLocations[],exact:LexPhraseAndLocations[]}}
     */
    phrases = { lexical: [], exact: [] };
}
export class VerseWords {
    verse = 0;
    /**
     * @type {Word[]} words
     */
    words = [];

    /**
     * 
     * @param {{words:{id:number,word:string}[],verse:number}[]} objArray 
     * @returns {VerseWords[]}
     */
    static buildFromObj(objArray) {
        // mylog(`buildFromObj param=${objArray}`,true )
        const vWordsArray = []


        for (const verseObj of objArray) {


            if (verseObj.verse && verseObj.words) {
                let vWords = new VerseWords();
                vWords.verse = verseObj.verse;

                for (const word of verseObj.words) {
                    if (word.id >= 0 && word.word) {
                        const wordObj = new Word(word.id, word.word);
                        vWords.words.push(wordObj);
                    }
                }
                vWordsArray.push(vWords);
            }
        }



        return vWordsArray;
    }
}

export class TextAndRef {
    reference = '';
    text = '';
    /**
     * @type {string} note
     */
    note = '';
    /**
     * @type {VerseWords[]} vwords
     */
    vwords = [];

    /**
     * @type {[number,number][]}
     * @description contains a "flattened" array of the words in  vWords[].words. Each item is an array [i,j] where i is an & *index into vwords, and j is an index into vwords[i].words. The order matches the textual order contained in tjostext.
     */
    verseWordMap = [];

    /**
     * 
     * @param {string} ref 
     * @param {string} txt 
     * @param {VerseWords[]} [vwords=[]] 
     * @param {string} [note=''] 
     */
    constructor(ref = '', txt = '', vwords = [], note = '') {
        this.reference = ref;
        this.text = txt;
        this.vwords = [];
        this.note = note;
        if (this.vwords.length) {
            this.buildVerseWordMap();
        }
    }
    /**
     * a 2-d array of Word objects, which maps a word index from this.text to the matching word object in this.vwords[i].words[j]
     * key: index of word in this.text
     * value: [i,j], such that this.vwords[i].words[k].word matches the word in this.text.split(" ")[key]
     */
    buildVerseWordMap(force = false) {
        if (force || (!this.verseWordMap.length && this.vwords.length)) {
            this.verseWordMap = [];
            for (const [v, verseWords] of this.vwords.entries()) {
                for (const [w, word] of verseWords.words.entries()) {
                    this.verseWordMap.push([v, w]);

                }

            }
        }
    }

    getWordIdArray() {
        this.buildVerseWordMap();
        return this.verseWordMap.map(([vi, wi]) => this.vwords[vi].words[wi].id);
    }

    /**
     * 
     * @param {number} verseIndex 
     * @param {number} wordIndex 
     * @returns {Word|null}
     */
    getWordByIndices(verseIndex, wordIndex) {
        if (verseIndex < this.vwords.length && wordIndex < this.vwords[verseIndex].words.length)
            return this.vwords[verseIndex].words[wordIndex];
        else
            return null
    }

    /**
     * 
     * @param {number} textIndex  the index of a word in `this.text`
     * @returns {Word|null} the corresponding word object if found in this.vWords
     */
    getWordByIndex(textIndex) {
        this.buildVerseWordMap();
        const lookupArray = this.verseWordMap[textIndex] ? this.verseWordMap[textIndex] : null;
        if (lookupArray && lookupArray.length == 2 && this.vwords[lookupArray[0]]
            && this.vwords[lookupArray[0]].words[lookupArray[1]]) {
            return this.vwords[lookupArray[0]].words[lookupArray[1]];
        }
        else {
            return null;
        }

    }

    /***
     * @param {number} textIndex
     * @returns {VerseWordIndex|null}
     */
    getVerseWordIndices(textIndex) {
        this.buildVerseWordMap();
        const vWarray = this.verseWordMap[textIndex] ? this.verseWordMap[textIndex] : null;
        if (vWarray && vWarray.length) {
            return new VerseWordIndex(vWarray[0], vWarray[1]);
        }
        else {
            return null;
        }

    }
}


/** 
 * @class TextRefVersePhraseLocation
 * @description represents the location of a phrase in a TextAndRef object.
 */
export class TextRefVersePhraseLocation {
    trIndex = 0;
    /**
    * @type {VerseWordIndex[]} vWordIndices
    */
    vWordIndices = [];
    /**
    * 
    * @param {number} trI 
    * @param {VerseWordIndex[]} [vWordIndices=[]] 
    */
    constructor(trI = 0, vWordIndices = []) {
        this.trIndex = trI;
        this.vWordIndices = vWordIndices;
    }

    /**
     * 
     * @param {number} vIndex 
     * @param {number} wIndex 
     */
    add(vIndex, wIndex) {
        this.vWordIndices.push(new VerseWordIndex(vIndex, wIndex));
    }

    /**
     * ?????
     * @param {number} vIndex 
     * @param {number} wIndex 
     * @returns 
     */
    has(vIndex, wIndex) {
        return false;
    }
    /*
        stringify(){
            JSON.stringify('');
        }
            */
}

export class VerseWordIndex {
    verseIndex = 0;
    wordIndex = 0;

    constructor(v = 0, w = 0) {
        this.verseIndex = v;
        this.wordIndex = w;
    }
}





/**
 * @description Objects of this class represent a set of texts that belong in the same column of a group of parallel columns of text.
 * The name may be poorly chosen. :-(
 */
export class ParallelColumn {
    /**
     * @type {TextAndRef[]} textRefs
     */
    textRefs = $state([]);
    /**
     * @type {Set<number>} lexemes
     */
    lexemes = new Set();
    /**
 * @type {Set<number>} unique -- lexemes unique to this book vis-a-vis its parallels in this group
 */
    unique = new Set();

    /**
     * @type {TextAndRef[]}
     */
    secondary = $state([]);
    lang='greek';



    /**
     * 
     * @param {number} lexID
     * @returns boolean 
     */
    isUnique(lexID) {
        mylog("checking if " + lexID + " is in (" + Array.from(this.unique).join(",") + ")");
        return this.unique.has(lexID);
    }
    /**
     * 
     * @param {TextAndRef[]} [textRefs=[]]
     * @param {TextAndRef[]} [secondary=[]] 
     */
    constructor(textRefs = [], secondary = [],lang='greek') {
        this.textRefs = textRefs;
        this.secondary = secondary;
        this.lang=lang;

    }
}

export class GospelPericopeGroupIndices {
    /**
     * @type {{main: number[], secondary: number[]}} matt
     */
    matt = { main: [], secondary: [] };
    /**
     * @type {{main: number[], secondary: number[]}} mark
     */
    mark = { main: [], secondary: [] };
    /**
     * @type {{main: number[], secondary: number[]}} luke
     */
    luke = { main: [], secondary: [] };
    /**
     * @type {{main: number[], secondary: number[]}}john
     */
    john = { main: [], secondary: [] };
    /**
     * @type {{main: number[], secondary: number[]}}
     */
    other = { main: [], secondary: [] };

    /**
     * 
     * @param {number[]} matt - the main textRefs for Matt. Secondary must be added manually!
     * @param {number[]}  mark - the main textRefs for Mark. Secondary must be added manually!
     * @param {number[]}  luke - the main textRefs for Luke. Secondary must be added manually!
     * @param {number[]}  john - the main textRefs for John. Secondary must be added manually!
     * @param {number[]} other 
     */
    constructor(mattMain = [], markMain = [], lukeMain = [], johnMain = [], otherMain = []) {
        this.matt.main = mattMain
        this.mark.main = markMain;
        this.luke.main = lukeMain;
        this.john.main = johnMain;
        this.other.main = otherMain;
    }
}

export function stripWord(str) {
    return GreekUtils.removeDiacritics(str.replace(/[,. ·:;]/, ""));
}

/**
 * 
 * @param {string[]} inputLines Lines of input, where each line represents multiple columns and each column is separated by a pipe ("|") character.
 */
export function parseMultipleGroups(inputLines) {

}
/**
 * @param {string[]} inputStrings 
 * @returns {ParallelColumn[]}
 */
export function parseSingleGroup(inputStrings) {
    /**
     * @type {ParallelColumn[]} thePars
     */
    let thePars = []
    inputStrings.entries().forEach(([i, textA]) => {

        const cleanedFormatted = formatBibRefs(textA && textA.length ? textA.trim().replaceAll(/\n+/g, ";").replaceAll(/;+/g, ";") : '');
        mylog("parseSingleGroup:cleaned refs = " + cleanedFormatted)
        const tAndRefs = BibleUtils.expandRefs(cleanedFormatted, false).map((r) => new TextAndRef(r));
        mylog("parsedRefs:");
        mylog(tAndRefs);
        //const tAndRefs = [new TextAndRef(cleanedFormatted)]
        thePars.push(new ParallelColumn(tAndRefs));
    });


    return thePars;
}


/**
 * @class ParallelPhraseLocation
 * @description stores single location of a phrase (which can be multiple words): at column, textAndRef, verse, and word(s).
 */
export class ParallelPhraseLocation {
    /**
     * 
     * @param {number} [column=0]
     * @param {TextRefVersePhraseLocation} [phraseLocation=newTextRefVersePhraseLocation()] 
     * @param {boolean} [secondary=false] whether the location is found in the secondary texts.
     */
    constructor(column = 0, phraseLocation = new TextRefVersePhraseLocation(), secondary = false) {
        this.column = column;
        this.secondary = secondary;
        this.singleColumnLocation = phraseLocation;
    }


}

/**
 * @class LexPhraseAndLocations
 * @description stores a matching phrase and all of its locations in a parallel group.
 */
export class LexPhraseAndLocations {

    /**
     * 
     * @param {LexicalPhrase} phrase 
     * @param {ParallelPhraseLocation[]} locations 
     */
    constructor(phrase = new LexicalPhrase(), locations = [], phraseIndex = 0) {
        this.phrase = phrase;
        this.multiColumnLocations = locations;
        this.phraseIndex = phraseIndex
    }

    /**
     * @description Computes the "index" of a match type, where the match type is determined by the combination of columns 
     * in which the phrase is found when this includes at least 2 columns.
     * The total number of possible match combination is 2^n - n - 1, where n is the number of columns in the ParallelColumn groups.
     * The index is computed by treating the columns ALMOST like bits in a binary number, where the least significant bit is the first column, and the most significant bit is the last column. 
     * BUT, any "binary number" with only 1 bit set is skipped, since that would mean the phrase is only found in one column.
     * @param {number} numColumns - the number of columns in the ParallelColumn group (to check for matches) (what happens if this is different than the actual columns?)
     * @returns {number} the index of the type of match. Returns -1 if fewer than 2 flags are active.
     */
    calcMatchTypeIndex(numColumns) {
        
        const phraseColumnFlags = ArrayUtils.newArray(numColumns, false);

        //NB: each item in this.multiColumnLocations has a column (number) property, corresponding to the column index, from left to right.
        this.multiColumnLocations.forEach((colLocs)=>{
            if (colLocs.column < phraseColumnFlags.length) phraseColumnFlags[colLocs.column] = true;
        });

        let bitValue = 0;
        let activeCount = 0;

        for (let i = 0; i < phraseColumnFlags.length; i++) {
            if (phraseColumnFlags[i]) {
                bitValue |= (1 << i);
                activeCount++;
            }
        }

        // Requirement: only combinations of 2 or more columns
        if (activeCount < 2) return -1;

        /**
         * Subtracting invalid indices:
         * 1. The 0 case (no flags): always subtract 1.
         * 2. The single-flag cases: we count how many single bits 
         * exist that are numerically less than our current bitValue.
         */
        let singleBitOffsets = 0;
        for (let i = 0; i < phraseColumnFlags.length; i++) {
            if ((1 << i) < bitValue) {
                singleBitOffsets++;
            }
        }
        
        const ret =  bitValue - 1 - singleBitOffsets;
        if (ret >= 0){
          //  mylog(`calcMatchType(${numColumns}):${bitValue} - 1 - ${singleBitOffsets} = ${bitValue - 1 - singleBitOffsets}`,true)
        }
        return ret;
    }


    /**
     * Decodes a matchTypeIndex back into its original column flags.
     * @param {number} index - The index to reverse.
     * @param {number} numColumns - The n-value used for the original calculation.
     * @returns {boolean[] | null} - The original flag array or null if out of bounds.
     */
    static reverseCalcColumnMatchesFromMatchTypeIndex(index, numColumns) {
        if (index < 0) return null;

        let validMatchCounter = 0;
        const maxBitValue = 1 << numColumns;

        // Iterate through all bit combinations from 0 to 2^n - 1
        for (let bitValue = 0; bitValue < maxBitValue; bitValue++) {
            
            // Use your existing math utility to skip r=0 and r=1 cases
            if (mathUtils.calcBinaryOnes(bitValue, numColumns) >= 2) {
                
                // If this is the "n-th" valid combination, we found our match
                if (validMatchCounter === index) {
                    return LexPhraseAndLocations.convertBitValueToFlags(bitValue, numColumns);
                }
                
                validMatchCounter++;
            }
        }

        return null;
    }

    /**
     * @description Helper to expand an integer into a boolean array based on bit positions.
     * @param {number} bitValue 
     * @param {number} numColumns 
     * @returns {boolean[]} 
     */
    static convertBitValueToFlags(bitValue, numColumns) {
        const flags = new Array(numColumns);
        for (let i = 0; i < numColumns; i++) {
            // Check if the i-th bit is set
            flags[i] = (bitValue & (1 << i)) !== 0;
        }
        return flags;
    }
}



/**
 * @class ParallelColumnGroup
 * @description a group of parallel texts, tracking common and unique lexemes, which can be displayed in parallel columns. Each column can contain several texts. 
 * The common/exact phrases found are "pairwise common" *across* columns: i.e., common between a text of one column and that in a different column.
 */
export class ParallelColumnGroup {

    title = '';
    lang='greek';
    /**
     * @type {ParallelColumn[]} parallelColumns
     */
    parallelColumns = $state([]);

    // the number of columns where we care about finding matches
    //must be set manually if it is to be ued
    //matchColNum = $derived(0);

    /** 
    * @type {number[]}
    * @description used when finding matching phrases (lex identical and perfect), such that if the column index is in this array, that columns texts are ignore for the column matching!
    */
    colPhraseHideFilter = $state([]);
    /**
     * 
     * @param {ParallelColumn[]} parTexts 
     */
    constructor(parTexts = [],lang="greek") {
        this.parallelColumns = parTexts;
        this.maxMatchCols=this.parallelColumns.length;
        this.lang=lang;
    }

    lexemes = $state(new Set());
    commonLexes = $state(new Set());
    /**
     * @type {string[]} matchingWords
     */
    matchingWords = $state([]);

    updatedCounter = $state(0);
    /**
     * @type {Map<LexicalPhrase,{words:Word[], css:Set<string>}>}
     */
    lexIdenticalPhrasesMap = $state(new Map());


    /**
     * @type {LexPhraseAndLocations[]} lexIdenticalPhrasesLocations
     * @description all the matching lexical phrases and their locations. 
     */
    lexIdenticalPhrasesLocations = [];

    /**
     * @type {{bg:string,font:string,border:string}[]}
     * @description palette for the matching phrases.
     */
    lexIdenticalPhrasePalette = []; //rethinking...perhaps have this by indexed by the column match type!
    /**
     * @description reverse lookup for finding phrases index by location: i.e., lexIdenticalPhrasesIndexDict[col][tR][v][w]=index of lexIdenticalPhrasesLocations and of lexIdenticalPhrasesCssClasses;
     * @type {Object<number,Object<number,Object<number,Object<number,number>>>>}
     */
    lexIdenticalPhrasesIndexDict = {}
    /**
     * @type {string[]} lexIdenticalPhrasesCssClasses
     * @description css Classes for the matching phrases. 
     */
    lexIdenticalPhrasesCssClasses = [];


    /**
     * @description phrases that are perfect matches--same lexemes, same form (exact string match).
     * @type {Object<string,ParallelPhraseLocation[]>}
     */
    //not used?
    //exactlyIdenticalPhrases = {}


    /**
     * @description reverse map from location to whether word is part of exact phrase match.
     * @type {Map}
     */
    //exactPhrasesLocations=
    /**
     * @param {LexicalPhrase} phrase 
     */
    getCssClassesForPhrase(phrase) {
        const css = this.lexIdenticalPhrasesMap.get(phrase)?.css;
        return css && css.size ? Array.from(css) : [];

    }

    /**
     * 
     * @param {number} col 
     * @param {number} tr 
     * @param {number} verse 
     * @param {number} word 
     */
    wordIsInMatchingPhrase(col, tr, verse, word) {
        return Object.keys(this.lexIdenticalPhrasesIndexDict).includes(String(col)) && Object.keys(this.lexIdenticalPhrasesIndexDict[col]).includes(String(tr)) &&
            Object.keys(this.lexIdenticalPhrasesIndexDict[col][tr]).includes(String(verse))
            && (Object.keys(this.lexIdenticalPhrasesIndexDict[col][tr][verse]).includes(String(word)));
        //NB: using something like keys.includes() is important for many reasons. One:a value of 0 would otherwise return false. We just want to know if the entry exists.
    }
    //4-d array!! [colIdx][textAndRefIdx][verseIdx][wordIdx]=

    //lexIdenticalPhrasesDict=[];
    //key: t


    //lookupLexIdenticalPhrases(col,tRIndex,){

    //}

    resetAllPhrases() {
        //mylog("ParallelColumnsGroup.resetAllPhrases()!",true);
        this.parallelColumns.forEach((col) => {
            const tRefs = col.secondary.length ? [...col.secondary, ...col.textRefs] : col.textRefs;
            tRefs.forEach((tr) => {
                tr.vwords.forEach((vw) => {
                    vw.words.forEach((w) => {
                        w.phrases.exact.length = 0;
                        w.phrases.lexical.length = 0;
                        //mylog("cleared phrase!",true);
                    })
                })
            })
        })
    }


    /**
     * @type {{bg:string,font:string}[]}
     * @description colors for matching columns, with matching 5 types of matches:
     * 0. Matt + Mk
     * 1. Matt + Mk + Lk
     * 2. Matt + Lk
     * 3. Mk + Lk
     * 4. Any solo synoptic + Jn
     * 
     * NB: John only factors in the last category. Otherwise, whether John has matching phrase does not matter for #'s 0-3.
     */

    //static matchingColumnsColors = ColorUtils.myColorPalette(5);
    /** 
     * @param {number} [minLength=2] 
     * @param {boolean} [includeSecondary=false] 
     * @param {boolean} [markidenticalPhrases=false] 
     * @param {number[]} [excludeCols=[]] indices of columns to ignore from comparison. NOT USED YET.
     * @param {any[]} [ignoreWordIDs=[]] 
     * @description finds all the lexically identical phrases across columns! amazing!
     */
    buildLexIdenticalPhrases(minLength = 2, includeSecondary = false, markidenticalPhrases = false, excludeCols = [],ignoreWordIDs=[]) {
        //mylog(`ParColGroup.buildLexidentical(excludeCols=[${excludeCols.join(',')}]`,true);
        //untrack(()=>this.resetAllPhrases());
        this.resetAllPhrases();


        const theColumns = this.parallelColumns.map((col, index) => excludeCols.includes(index) ? [] : (
            [...col.textRefs.map((tr) => tr.getWordIdArray()), ...col.secondary.map((sec) => sec.getWordIdArray())]));
        // mylog(`buildLexIdPhrase.thecolumns:[${theColumns.map((c,i)=> c.length ? i : -1).filter((i)=>i>=0).join(',')}]`,true);
        //        mylog(`buildLexIdPhrase.thecolumns[0].length:${theColumns[0].length}`,true);
        const commonSubarrays = findMaximalCommonSubarraysAcrossColumns2(theColumns, minLength, ignoreWordIDs).toSorted((a, b) => a.subarray.length - b.subarray.length);
        //console.log(`buildLexIdenticalPhrases commonSubarrays:`,commonSubarrays)
        this.lexIdenticalPhrasesLocations = [];
        this.lexIdenticalPhrasesMap.clear();

        for (const [phraseIndex, subarray] of commonSubarrays.entries()) {
            const lexPhrase = new LexicalPhrase(subarray.subarray);
            const lexPhraseAndLocations = new LexPhraseAndLocations(lexPhrase, [], phraseIndex);

            //TODO: use or remove this next variable!
            //innovation: determine and use the type of match (e.g., which combination of columns this matches? Let another component figure out how to style, since ti will depend upon how many columns we have, etc.) so far it is not used 
            const parallelMatchTypeFlag = mathUtils.sum(Array.from(new Set(subarray.occurrences.map((oc)=>oc.columnIndex))));
            for (const occurrence of subarray.occurrences) {  //second loop: each column, of that phrase
                const colIndex = occurrence.columnIndex;
                const isSecondary = occurrence.textIndex >= this.parallelColumns[colIndex].textRefs.length;
                const textIndex = isSecondary ? occurrence.textIndex - this.parallelColumns[colIndex].textRefs.length : occurrence.textIndex;
                const tRef = isSecondary ? this.parallelColumns[colIndex].secondary[textIndex] : this.parallelColumns[colIndex].textRefs[textIndex];
                if (!excludeCols.includes(colIndex)) {
                    for (const { start: start, end: end } of occurrence.spans) {

                        const phraseRange = mathUtils.range(end - start + 1, start);
                        /**
                        * @type {Word[]}
                        */
                        const words = phraseRange.map((trIdx) => tRef.getWordByIndex(trIdx)).filter((w) => w != null);

                        //const vWIndices = tRef.getVerseWordIndices(start)

                        if (!this.lexIdenticalPhrasesMap.has(lexPhrase)) {
                            this.lexIdenticalPhrasesMap.set(lexPhrase, { words: words, css: new Set(['lexical-phrase']) })
                        }
                        else {
                            this.lexIdenticalPhrasesMap.get(lexPhrase)?.words?.push(...words);
                        }

                        words.forEach((w) => {
                            w.phrases.lexical.push(lexPhraseAndLocations);
                        });

                        /**
                         * @type {VerseWordIndex[]}
                         */
                        //const phraseLocation=new ParallelPhraseLocation(colIndex,new TextRefVersePhraseLocation(textIndex));
                        const vWordIndices = phraseRange.map((wIdx) => tRef.getVerseWordIndices(wIdx)).filter((o) => o != null);
                        if (vWordIndices && vWordIndices.length) {
                            const trVpL = new TextRefVersePhraseLocation(textIndex, vWordIndices);
                            const phraseLocation = new ParallelPhraseLocation(colIndex, trVpL, isSecondary);
                            lexPhraseAndLocations.multiColumnLocations.push(phraseLocation);
                        }
                    }
                }
            }

            this.lexIdenticalPhrasesLocations.push(lexPhraseAndLocations);
            this.updatedCounter++;
        }

        if (markidenticalPhrases) {

            /**
             * @type {Object<string,ParallelPhraseLocation[]>[]} stringPhrasesAndLocs
             * @description string phrases found in each column. Each array index corresponds with the group column. Each Array item is an object keyed by the string phrase and mapped to a LexPhraseAndLocations object.
             */
            const stringPhrasesAndLocs = Array.from(mathUtils.range(this.parallelColumns.length, 0)).map(_ => { return {}; });

           // this.exactlyIdenticalPhrases = {};
            for (const phraseAndLoc of this.lexIdenticalPhrasesLocations) {
                for (const loc of phraseAndLoc.multiColumnLocations) {
                    if (loc.secondary) {
                        //mylog("got loc.secondary!",true);
                    }
                    const rawPhrase = this.getTextFromLocation(loc, true).toLocaleLowerCase();
                    const exactPhrase = this.lang == 'greek' ? GreekUtils.onlyPlainGreek(rawPhrase).trim() : rawPhrase.replace(/[^\p{L}\s]/gu, '').trim(); ;

                    if (exactPhrase) {

                        if (!stringPhrasesAndLocs[loc.column][exactPhrase]) {
                            stringPhrasesAndLocs[loc.column][exactPhrase] = []

                        }

                        stringPhrasesAndLocs[loc.column][exactPhrase].push(loc);
                    }
                }
            }
            const commonSubphrases = findMaximalCommonTextPhrasesAcrossColumns(stringPhrasesAndLocs.map((o) => Object.keys(o)), 3);


            commonSubphrases.forEach((commonPhraseObject, subPhraseIndex) => {

                const subphrase = commonPhraseObject.subarray;

                //this is an exactly matching (sub)phrase. need to map the 'column'/textindex/spans to the verse-word ranges in stringPhrasesAndLocs
                commonPhraseObject.occurrences.forEach((occurrence) => {
                    //gotta find the word object...*:
                    occurrence.textIndex
                    const [exactPhrase, lexIdenticalLocations] = Object.entries(stringPhrasesAndLocs[occurrence.columnIndex])[occurrence.textIndex];
                    const exactPhraseAndLocations = new LexPhraseAndLocations(new LexicalPhrase(), lexIdenticalLocations, subPhraseIndex);
                    //const stuff1= stringPhrasesAndLocs[occurrence.columnIndex]
                    // const fred = stuff1['stinrg'];

                    /**
                    // * @type {ParallelPhraseLocation[]} lexIdenticalLocations
                     */
                    lexIdenticalLocations.forEach((lexPhraseLoc) => {
                        const superPhraseWords = this.getWordsFromLocation(lexPhraseLoc);
                        //constPhraseWords
                        occurrence.spans.forEach((span) => {

                            const phraseWords = superPhraseWords.slice(span.start, span.end + 1);
                            phraseWords.forEach((aWord) => {
                                if (aWord) {
                                    aWord.phrases.exact.push(exactPhraseAndLocations);
                                    if (lexPhraseLoc.secondary) {
                                        // mylog("Got/marked secondary phrase!",true)
                                    }
                                    {
                                        //mylog("Got/marked main phrase!",true)
                                    }
                                }
                                else {
                                    //mylog("buildLexIdPhrases.matchExact: for LexPhraseLoc, could get a ! secondary:"+lexPhraseLoc.secondary, true)
                                }

                            });

                            //  });

                        });

                    });


                })


            })
        }

        let numPhrases = this.lexIdenticalPhrasesMap.size;

        this.lexIdenticalPhrasesMap.values().forEach((obj, index) => {

            obj.css.add('lexical-phrase-' + String((index % 14) + 1));
            //obj.css.add('underline').add('bold').add('bg-yellow-50');
        });



        this.lexIdenticalPhrasePalette=ParallelColumnGroup.getLexIdenticalPhrasePalette(this.parallelColumns.length);
        
        //TODO: figure out how to use this index!!
    }

    /**
     * 
     * @param {number} cols 
     */
    static getLexIdenticalPhrasePalette(cols,includeExtraMiscColor=true){
        //would be 2**cols - cols - 1 if we didn't have the extra misc color, because this would be
        // the total number of possible matching columns.
        const numMatchTypes = 2**cols - cols - (includeExtraMiscColor?0:1);
        
        //mylog(`buildLexIdenticalPhrases(): numCols = ${this.paletteMatchCols}; numMatchTypes=${numMatchTypes}`,true);
        const pal= ColorUtils.myColorPalette(numMatchTypes, 1, 1,7);
//        mylog(`getLexIdenticalPhrasePalette(${cols}): numMatchTypes=${numMatchTypes}; pal.length=${pal.length}`,true);
        return pal;
    }
    /**
     * 
     * @param {boolean} includeSecondary 
     * @param {number[]} [excludeCols=[]] indices of columns to exclude from consideration
     */
    markUniqueAndIdenticalWords(includeSecondary = false, excludeCols = []) {
        /**
         * @type {Object<string,Set<number>>} wordsBooks
         */
        const wordsByPar = {};//word:string => <set of book indexes in which word is found>

        //const bookWords=[new Set(),new Set(),new Set(),new Set()];//array of words in [matt,mark,luke,john]
        /**
         * 
         * @param {string} str 
         * @returns 
         */

        //this.wordIds=new Set()
        const booksToLoop = this.parallelColumns.entries().filter(([i, p]) => !excludeCols.includes(i));
        //        mylog(`ParColGroup.markUnique(), booksToLoop.length:${[...booksToLoop].length}`,true);
        for (const [index, par] of booksToLoop) {
            const theRefsList = includeSecondary && par.secondary && par.secondary.length ? [...par.textRefs, ...par.secondary] : par.textRefs;
            for (const tR of theRefsList) {
                for (const vW of tR.vwords) {
                    for (const word of vW.words) {

                        par.lexemes.add(word.id);
                        this.lexemes.add(word.id);

                        //track identically matching words across gospels: 
                        const theWord = stripWord(word.word);
                        //bookWords[index].add(theWord);
                        if (!wordsByPar[theWord])
                            wordsByPar[theWord] = new Set([index]);
                        else
                            wordsByPar[theWord].add(index);
                    }
                }
            }
        }

        for (const [index, par] of this.parallelColumns.entries()) {
            //   this.commonLexes=this.commonLexes.intersection(book.lexemes);
            const otherParIndexes = new Set(mathUtils.range(this.parallelColumns.length));
            otherParIndexes.delete(index);
            let uniques = new Set(par.lexemes);

            for (const otherParI of otherParIndexes) {
                //mylog("doing difference of ");
                uniques = uniques.difference(this.parallelColumns[otherParI].lexemes);

            }
            par.unique = uniques;




        }


        this.commonLexes = this.parallelColumns.map((p) => p.lexemes).reduce((common, thisSet) => common.intersection(thisSet))

        this.matchingWords = Object.entries(wordsByPar).filter(([word, parIndexSet]) => parIndexSet.size > 1)
            .map(([word, parIndexSet]) => word);
        this.updatedCounter++;
    }



    /**
     * 
     * @param {number[]} exclude - the indexes of parallelColumns to exclude
     * @returns {string} a single string which combines and consolidates all the references in the includes ParallelColumns
     */
    getRefs(exclude = [], includeSecondary = false) {
        let refs = [];

        for (const [index, par] of this.parallelColumns.entries().filter(([i, p]) => !exclude.includes(i))) {
            if (par.textRefs.length) {
                const refsMapped = par.textRefs.map((tr) => tr.reference)
                //mylog(`getRefs.refsMapped=[${refsMapped.join("//")}]`);
                refs.push(formatBibRefs(refsMapped.join(";")))
            }
            if (includeSecondary && par.secondary && par.secondary.length) {
                const secondaryRefsMapped = par.secondary.map((tr) => tr.reference)
                //mylog(`getRefs.refsMapped=[${refsMapped.join("//")}]`);
                refs.push(formatBibRefs(secondaryRefsMapped.join(";")))
            }

        }



        return refs.join('; ');
    }

    /**
    * 
    * @param {ParallelPhraseLocation} parLocation 
    * @returns {Word[]}
    */
    getWordsFromLocation(parLocation) {
        if (parLocation.secondary) {
            //mylog("getting words from secondary location!", true);
        }
        const vWordsIdx = parLocation.singleColumnLocation.vWordIndices;
        const tR = this.getTextRefByLocation(parLocation);

        

        const words = tR ? vWordsIdx.map((vw) => tR.getWordByIndices(vw.verseIndex, vw.wordIndex)).filter((w) => w != null) : [];
        return words ? words : [];

    }

    /**
     * 
     * @param {ParallelPhraseLocation} parLocation 
     * @returns {string}
     */
    getTextFromLocation(parLocation, hideApp = false) {
        return this.getWordsFromLocation(parLocation).filter((w) => w.word)
            .map((w) => hideApp ? w.clean : w.word)
            .join(" ");

    }

    /**
     * 
     * @param {ParallelPhraseLocation} parLocation 
     */
    getTextRefByLocation(parLocation) {
        if (parLocation.secondary) {
            // mylog('getTextRefByLocation got secondary!',true);
        }
        return parLocation.secondary ?
            this.parallelColumns[parLocation.column].secondary[parLocation.singleColumnLocation.trIndex]
            :
            this.parallelColumns[parLocation.column].textRefs[parLocation.singleColumnLocation.trIndex];

    }
}

export class LexicalPhrase {
    /**
     * @type {number[]}
     */
    lexIds = [];

    /**
     * 
     * @param {number[]} lexes
     */
    constructor(lexes = []) {
        this.lexIds = [...lexes];
    }

    /**
     * 
     * @param {LexicalPhrase} phrase 
     * @returns {boolean}
     */
    matches(phrase) {
        let match = this.lexIds.length == phrase.lexIds.length;

        for (const [i, ID] of this.lexIds.entries()) {
            if (!match || ID != phrase.lexIds[i]) {
                match = false;
                break;
            }
        }

        return match;
    }

    /**
     * 
     * @param {number[]} idArray 
     * @returns {boolean}
     */
    matchesArray(idArray) {
        return this.matches(new LexicalPhrase(idArray))
    }

    stringifyIds() {
        return this.lexIds.join(",");
    }

    /**
     * 
     * @param {string} numListString 
     * @returns {LexicalPhrase}
     */
    fromString(numListString) {
        return new LexicalPhrase(numListString.split(",").map((s) => parseInt(s)));
    }
}

export class GospelPericopeGroup extends ParallelColumnGroup {
    title = $state('')
    id = $state(0);
    populated = $state(false);
    constructor(lang='greek') {
        
        
        const matt = new ParallelColumn();
        const mark = new ParallelColumn();
        const luke = new ParallelColumn();
        const john = new ParallelColumn();
        const other = new ParallelColumn();
        super([matt, mark, luke, john, other],4,lang);
        this.gospelCols = {
            matt: matt,
            mark: mark,
            luke: luke,
            john: john,
            other: other
        }

        this.matt = matt;
        this.mark = mark;
        this.luke = luke;
        this.john = john;
        this.other = other;
        this.maxMatchCols=4;

    }

    lexemes = new Set();
    commonLexes = new Set();

    /**
     * @type {string[]} matchingWords
     */
    matchingWords = [];
    /**
     * @type {{phrase:LexicalPhrase,textRefVerseWordIndices:TextRefVersePhraseLocation[]}[]}
     */
    similarPhrases = [];

    /**
     * @description finds and marks unique and identical words
     * @param {boolean} [includeSecondary=false] 
     * @param {number[]} [excludeCols=[]] indices of columns to exclude from consideration
     */
    markUniqueAndIdenticalWords(includeSecondary = false, excludeCols = []) {
        /**
         * @type {Object<string,Set<number>>} wordsBooks
         */
        const wordsBooks = {};//word:string => <set of book indexes in which word is found>

        //const bookWords=[new Set(),new Set(),new Set(),new Set()];//array of words in [matt,mark,luke,john]
        /**
         * 
         * @param {string} str 
         * @returns 
         */

        //this.wordIds=new Set()
        const booksToLoop = [this.gospelCols.matt, this.gospelCols.mark, this.gospelCols.luke, this.gospelCols.john].entries().filter(([i, b]) => !excludeCols.includes(i));
        //        mylog(`markUniqueAndIdenticalWords bookstoloop.length::${[...booksToLoop].length}]`,true);
        for (const [index, book] of booksToLoop) {
            for (const tR of book.textRefs) {
                for (const vW of tR.vwords) {
                    for (const word of vW.words) {

                        book.lexemes.add(word.id);
                        this.lexemes.add(word.id);

                        //track identically matching words across gospels: 
                        const theWord = stripWord(word.word);
                        //bookWords[index].add(theWord);
                        if (!wordsBooks[theWord])
                            wordsBooks[theWord] = new Set([index]);
                        else
                            wordsBooks[theWord].add(index);
                    }
                }
            }
        }
        // mylog("Mark unique words: filled in lexemes for each:")
        // mylog()
        const books = [this.gospelCols.matt, this.gospelCols.mark, this.gospelCols.luke, this.gospelCols.john];

        for (const [index, book] of books.entries()) {
            //   this.commonLexes=this.commonLexes.intersection(book.lexemes);
            const otherBookIndexes = new Set([0, 1, 2, 3]);
            otherBookIndexes.delete(index);
            let uniques = new Set(book.lexemes);

            for (const otherBookI of otherBookIndexes) {
                //mylog("doing difference of ");
                uniques = uniques.difference(books[otherBookI].lexemes);

            }
            book.unique = uniques;

            //mylog(`markUniq+Id words for book index ${index}: [${Array.from(book.unique).join(",")}]`, true)


        }


        this.commonLexes = this.lexemes.difference(this.gospelCols.matt.unique.union(this.gospelCols.mark.unique).union(
            this.gospelCols.luke.unique).union(this.gospelCols.john.unique));

        this.matchingWords = Object.entries(wordsBooks).filter(([word, bookIndexSet]) => bookIndexSet.size > 1)
            .map(([word, bookIndexSet]) => word);
    }


    /**
     * 
     * @param {number[]} exclude indexes of parallelColumn to exclude. By default here, it excludes "other"
     * @returns 
     */
    getRefs(exclude = [4]) {
        return super.getRefs(exclude);
        /*let refs=[];

        const includeOther=!exclude.includes(4);

        if (includeOther){
            for (const gosp of ['matt','mark','luke','john','other']){
                if(this[gosp].textRefs.length)
                    refs.push(combineRefs(this[gosp].textRefs.map((tr)=>tr.reference)))
                
            }
        }
        else{

            for (const gosp of ['matt','mark','luke','john']){
                if(this[gosp].textRefs.length) {
                    const gospRefs = this[gosp].textRefs.map((tr)=>tr.reference).join("; ").trim();
                    if (gospRefs.length) {
                        refs.push(formatBibRefs(gospRefs));
                    }
                }
                
            }
        }
        return refs.join('; ');  
        */




    }


}


export default {
    ParallelColumn, GospelPericopeGroup, TextAndRef, VerseWords, Word, GospelPericopeGroupIndices, stripWord, parseSingleGroup
}
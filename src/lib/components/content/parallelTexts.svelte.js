import { mylog } from "$lib/env/env.js";

import { GreekUtils } from "$lib/utils/greek-utils";
import {combineRefs, formatBibRefs,expandRefs} from '$lib/n1904/bibleRefUtils.js';
import * as BibleUtils from '$lib/n1904/bibleRefUtils.js'
import { findAllCommonSubarraysAmongHybrid } from "$lib/utils/sais-array2";
import mathUtils from "$lib/utils/math-utils";
import { form } from "$app/server";

/**
 * @class
 */
export class Word{
    id=0;
    word='';

    /**
     * @description various types of phrase that this word instance is in. Useful, e.g., for assigning css classes for matching phrases.
     * @type {Object<string,Set<LexicalPhrase>>}
     */
    phrases={};
}
export class VerseWords{
    verse=0;
    /**
     * @type {Word[]} words
     */
    words=[];

    /**
     * 
     * @param {{words:{id:number,word:string}[],verse:number}[]} objArray 
     * @returns {VerseWords[]}
     */
    static buildFromObj(objArray){
        mylog(`buildFromObj param=${objArray}`,true )
        const vWordsArray=[]
        
            
        for (const verseObj of objArray){
            
            
            if (verseObj.verse && verseObj.words){
                let vWords=new VerseWords();
                vWords.verse = verseObj.verse;
            
                for (const word of verseObj.words){
                    if (word.id && word.word) {
                        const wordObj=new Word()
                        wordObj.id=word.id;
                        wordObj.word=word.word;
                        vWords.words.push(wordObj);
                    }
                }
                vWordsArray.push(vWords);
            }      
        }

        
            
        return vWordsArray;
    }
}

export class TextAndRef{
    reference='';
    text='';
    /**
     * @type {string} note
     */
    note='';
    /**
     * @type {VerseWords[]} vwords
     */
    vwords=[];

    /**
     * @type {[number,number][]}
     * @description contains a "flattened" array of the words in  vWords[].words. Each item is an array [i,j] where i is an & *index into vwords, and j is an index into vwords[i].words. The order matches the textual order contained in tjostext.
     */
    verseWordMap=[];
    
    /**
     * 
     * @param {string} ref 
     * @param {string} txt 
     * @param {VerseWords[]} [vwords=[]] 
     * @param {string} [note=''] 
     */
    constructor(ref='',txt='',vwords=[], note=''){
        this.reference = ref;
        this.text = txt;
        this.vwords=[];
        this.note=note;
        if (this.vwords.length){
            this.buildVerseWordMap();
        }
    }
    /**
     * a 2-d array of Word objects, which maps a word index from this.text to the matching word object in this.vwords[i].words[j]
     * key: index of word in this.text
     * value: [i,j], such that this.vwords[i].words[k].word matches the word in this.text.split(" ")[key]
     */
    buildVerseWordMap(force=false){
        if(force || (!this.verseWordMap.length && this.vwords.length )){
            this.verseWordMap=[];
            for (const [v,verseWords] of this.vwords.entries()){
                for (const [w,word] of verseWords.words.entries()){
                    this.verseWordMap.push([v,w]);
                    
                }

            }
        }
    }

    getWordIdArray(){
        this.buildVerseWordMap();
        return this.verseWordMap.map(([vi,wi])=>this.vwords[vi].words[wi].id);
    }

    /**
     * 
     * @param {number} verseIndex 
     * @param {number} wordIndex 
     * @returns {Word|null}
     */
    getWordByIndices(verseIndex,wordIndex){
        if(verseIndex < this.vwords.length && wordIndex < this.vwords[verseIndex].words.length)
            return this.vwords[verseIndex].words[wordIndex];
        else   
            return null
    }

    /**
     * 
     * @param {number} textIndex  the index of a word in `this.text`
     * @returns {Word|null} the corresponding word object if found in this.vWords
     */
    getWordByIndex(textIndex){
        this.buildVerseWordMap();
        const lookupArray= this.verseWordMap[textIndex]? this.verseWordMap[textIndex] : null;
        if (lookupArray && lookupArray.length == 2 && this.vwords[lookupArray[0]] 
            && this.vwords[lookupArray[0]].words[lookupArray[1]])
        {
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
    getVerseWordIndices(textIndex){
        this.buildVerseWordMap();
        const vWarray = this.verseWordMap[textIndex]? this.verseWordMap[textIndex] : null;
        if (vWarray && vWarray.length){
            return new VerseWordIndex(vWarray[0],vWarray[1]);
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
export class TextRefVersePhraseLocation{
    trIndex=0;
    /**
    * @type {VerseWordIndex[]} vWordIndices
    */
    vWordIndices=[];
    /**
    * 
    * @param {number} trI 
    * @param {VerseWordIndex[]} [vWordIndices=[]] 
    */
    constructor(trI=0,vWordIndices=[]){
        this.trIndex=trI;
        this.vWordIndices=vWordIndices;
    }

    /**
     * 
     * @param {number} vIndex 
     * @param {number} wIndex 
     */
    add(vIndex,wIndex){
        this.vWordIndices.push(new VerseWordIndex(vIndex,wIndex));
    }

    /**
     * ?????
     * @param {number} vIndex 
     * @param {number} wIndex 
     * @returns 
     */
    has(vIndex,wIndex){
        return false;
    }
/*
    stringify(){
        JSON.stringify('');
    }
        */
}

export class VerseWordIndex{
    verseIndex=0;
    wordIndex=0;

    constructor(v=0,w=0){
        this.verseIndex=v;
        this.wordIndex=w;
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
    lexemes=new Set();
        /**
     * @type {Set<number>} unique -- lexemes unique to this book vis-a-vis its parallels in this group
     */
    unique= new Set();

    


    /**
     * 
     * @param {number} lexID
     * @returns boolean 
     */
    isUnique(lexID){
        mylog("checking if " +lexID +" is in ("+Array.from(this.unique).join(",")+")");
        return this.unique.has(lexID);
    }
    /**
     * 
     * @param {TextAndRef[]}     textRefs
     */
    constructor(textRefs=[]){
        this.textRefs = textRefs
        
     
    }
}

export class GospelPericopeGroupIndices {
    /**
     * @type {number[]} matt
     */
    matt=[];
    /**
     * @type {number[]} mark
     */
    mark=[];
    /**
     * @type {number[]} luke
     */
    luke=[];
        /**
     * @type {number[]} john
     */
    john=[];
    /**
     * @type {number[]} other
     */
    other=[];

    /**
     * 
     * @param {number[]} matt 
     * @param {number[]} mark 
     * @param {number[]} luke 
     * @param {number[]} john 
     * @param {number[]} other 
     */
    constructor(matt=[],mark=[],luke=[],john=[],other=[]){
        this.matt=matt;
        this.mark=mark;
        this.luke=luke;
        this.john=john;
        this.other=other;
    }
}

export function  stripWord(str){
            return GreekUtils.removeDiacritics(str.replace(/[,. ·:;]/,""));
}

/**
 * 
 * @param {string[]} inputLines Lines of input, where each line represents multiple columns and each column is separated by a pipe ("|") character.
 */
export function parseMultipleGroups(inputLines)
{

}
/**
 * @param {string[]} inputStrings 
 * @returns {ParallelColumn[]}
 */
export function parseSingleGroup(inputStrings){
    /**
     * @type {ParallelColumn[]} thePars
     */
    let thePars = []
    inputStrings.entries().forEach(([i,textA])=>{
        
        const cleanedFormatted = formatBibRefs(textA && textA.length ? textA.trim().replaceAll(/\n+/g,";").replaceAll(/;+/g,";") : '');
        mylog("parseSingleGroup:cleaned refs = " + cleanedFormatted)
        const tAndRefs = BibleUtils.expandRefs(cleanedFormatted,false).map((r)=>new TextAndRef(r));
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
export class ParallelPhraseLocation{
    constructor(column=0,phraseLocation=new TextRefVersePhraseLocation()){
        this.column=column;
        this.singleColumnLocation=phraseLocation;
    }
    
}

/**
 * @class LexPhraseAndLocations
 * @description stores a matching phrase and all of its locations in a parallel group.
 */
export class LexPhraseAndLocations{
    
    /**
     * 
     * @param {LexicalPhrase} phrase 
     * @param {ParallelPhraseLocation[]} locations 
     */
    constructor(phrase=new LexicalPhrase(),locations=[]){
        this.phrase=phrase;
        this.multiColumnLocations=locations;
    }
}



/**
 * @class ParallelColumnGroup
 * @description a group of parallel texts, tracking common and unique lexemes, which can be displayed in parallel columns.
 */
export class ParallelColumnGroup {

    /**
     * @type {ParallelColumn[]} parallelColumns
     */
    parallelColumns= $state([]);

    /**
     * 
     * @param {ParallelColumn[]} parTexts 
     */
    constructor(parTexts=[]){
        this.parallelColumns=parTexts;
    }

    lexemes=$state(new Set());
    commonLexes=$state(new Set());
    /**
     * @type {string[]} matchingWords
     */
    matchingWords=$state([]);

    updatedCounter=$state(0);
   /**
    * @type {Map<LexicalPhrase,{words:Word[], css:Set<string>}>}
    */
    lexIdenticalPhrasesMap=$state(new Map());
   
    
   /**
    * @type {LexPhraseAndLocations[]} lexIdenticalPhrasesLocations
    * @description all the matching lexical phrases and their locations. 
    */
   lexIdenticalPhrasesLocations=[];
   /**
    * @description reverse lookup for finding phrases index by location: i.e., lexIdenticalPhrasesIndexDict[col][tR][v][w]=index of lexIdenticalPhrasesLocations and of lexIdenticalPhrasesCssClasses;
    * @type {Object<number,Object<number,Object<number,Object<number,number>>>>}
    */
   lexIdenticalPhrasesIndexDict={}
   /**
    * @type {string[]} lexIdenticalPhrasesCssClasses
    * @description css Classes for the matching phrases. 
    */
   lexIdenticalPhrasesCssClasses=[];
   
   /**
    * @param {LexicalPhrase} phrase 
    */
    getCssClassesForPhrase(phrase){
        const css = this.lexIdenticalPhrasesMap.get(phrase)?.css;
        return css && css.size ? Array.from(css):[];

    }

   /**
    * 
    * @param {number} col 
    * @param {number} tr 
    * @param {number} verse 
    * @param {number} word 
    */
   wordIsInMatchingPhrase(col,tr,verse,word){
        return Object.keys(this.lexIdenticalPhrasesIndexDict).includes(String(col)) &&  Object.keys(this.lexIdenticalPhrasesIndexDict[col]).includes(String(tr)) &&
            Object.keys(this.lexIdenticalPhrasesIndexDict[col][tr]).includes(String(verse)) 
            && (Object.keys(this.lexIdenticalPhrasesIndexDict[col][tr][verse]).includes(String(word)));
            //NB: using something like keys.includes() is important for many reasons. One:a value of 0 would otherwise return false. We just want to know if the entry exists.
   }
   //4-d array!! [colIdx][textAndRefIdx][verseIdx][wordIdx]=

   //lexIdenticalPhrasesDict=[];
    //key: t
    

    //lookupLexIdenticalPhrases(col,tRIndex,){
       
    //}

    /** 
     *
     * @description finds all the lexically identical phrases across columns! amazing!
     */
    buildLexIdenticalPhrases(minLenth=2){
        mylog(`ParColGroup.buildLexidentical()...`);
        const combinedColumnIds=this.parallelColumns.map((col)=>col.textRefs.reduce(
            /**
             * 
             * @param {number[]} array 
             * @param {TextAndRef} tr 
             * @returns {number[]}
             */
            (array,tr)=>{
            if (array.length){
                return [...array,-1,...tr.getWordIdArray()]
            }
            else{
                return  tr.getWordIdArray();
            }
        },[]));

        const commonSubarrays = findAllCommonSubarraysAmongHybrid(combinedColumnIds,minLenth);

        this.lexIdenticalPhrasesLocations=[];

        //this.lexIdenticalPhrases=new Map();
        for (const subarray of commonSubarrays){ //first loop: by phrase
            const lexPhrase = new LexicalPhrase(subarray.subarray);
            const lexPhraseAndLocations= new LexPhraseAndLocations(lexPhrase);
            //need to gather all location of this phrase. LexPhraseAndLocations contains all location, spanning several columns.  here we go:
            for (const rangesObj of subarray.arrays){  //second loop: each column, of that phrase
                const colIndex=rangesObj.arrayIndex;  //NB: rangesObj.arrayIndex is the column index.
                
                
                for (const [start,end] of rangesObj.ranges){ 
                    //3rd loop: each instance of the phrase in a single column. need to split this into its separate bible sections if the column has more than one
                    
                    /**
                    * @description one location of current phrase
                    */
                    const phraseLocation=new ParallelPhraseLocation(colIndex);//single location of this phrase identified by column, textAndRef, verse, word(s)

                    
                    //We had combined all textRefs, so we must figure out which one this is. 
                    //We can simply count the "-1" separators leading up to the first index, since this was used to separate the texref ids in the combined array:
                    
                    let combinedSeparatorIndicies=[0]
                    for (let i=0; i<=combinedColumnIds.length && i<=start; i++){
                        if (combinedColumnIds[colIndex][i]==-1) {
                            
                            combinedSeparatorIndicies.push(i);
                        }
                    }
                    const correctTextRefIdx=combinedSeparatorIndicies.length-1;
                    const correctedStart=start+combinedSeparatorIndicies[correctTextRefIdx]
                    const correctedEnd=end+combinedSeparatorIndicies[correctTextRefIdx];
                    const phraseRange=mathUtils.range(correctedEnd-correctedStart+1,correctedStart);
                    const tRef=this.parallelColumns[colIndex].textRefs[correctTextRefIdx];
                    // Magic!


                    /**
                     * @type {Word[]}
                     */
                    const words = phraseRange.map((trIdx)=>tRef.getWordByIndex(trIdx)).filter((w)=>w!=null);
                    mylog(`Got words in matching phrase:[${words.map((w)=>w.word)}]`, true)
                    if (!this.lexIdenticalPhrasesMap.has(lexPhrase)){
                        this.lexIdenticalPhrasesMap.set(lexPhrase,{words:words, css:new Set(['lexical-phrase'])})
                    }
                    else{
                        this.lexIdenticalPhrasesMap.get(lexPhrase)?.words?.push(...words);
                    }

                    words.forEach((w)=>{
                        if (!w.phrases['lexical']){
                            w.phrases['lexical']=new Set();

                        }
                        w.phrases['lexical'].add(lexPhrase);
                        
                    });

                    words.forEach((w)=>{
                        
                    })
                    /**
                     * @type {VerseWordIndex[]}
                     */
                    const vWordIndices=phraseRange.map((wIdx)=>tRef.getVerseWordIndices(wIdx)).filter((o)=>o!=null);
                    if (vWordIndices && vWordIndices.length) {
                        const trVpL = new TextRefVersePhraseLocation(correctTextRefIdx,vWordIndices);
                        phraseLocation.singleColumnLocation=trVpL;
                    }
                    lexPhraseAndLocations.multiColumnLocations.push(phraseLocation);
                    //const tRidx=new TextRefVersePhraseLocation(correctTextRefIdx,vWordI);   
                }
                    
            }
            
            this.lexIdenticalPhrasesLocations.push(lexPhraseAndLocations);
            this.updatedCounter++;
        }

        const numPhrases = this.lexIdenticalPhrasesMap.size;
        
        this.lexIdenticalPhrasesMap.values().forEach((obj,index)=>{
            
            obj.css.add('lexical-phrase-'+(index+1));
            //obj.css.add('underline').add('bold').add('bg-yellow-50');
        })

        
    
        /*
        mylog("========================================================",true)
        mylog("Build the lexIdenPhrasesIndexDict. Here it is:", true)
        mylog(this.lexIdenticalPhrasesIndexDict, true)
        mylog("========================================================",true)
        */
        
    }


    markUniqueAndIdenticalWords(){
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
        for (const [index,par] of this.parallelColumns.entries()){
            for (const tR of par.textRefs){
                for (const vW of tR.vwords){
                    for (const word of vW.words){
                        
                        par.lexemes.add(word.id);
                        this.lexemes.add(word.id);
                                                    
                        //track identically matching words across gospels: 
                        const theWord=stripWord(word.word);
                        //bookWords[index].add(theWord);
                        if (!wordsByPar[theWord])
                            wordsByPar[theWord]=new Set([index]);
                        else
                            wordsByPar[theWord].add(index);
                    }
                }
            }
        }
       
         for (const [index,par] of this.parallelColumns.entries()){
        //   this.commonLexes=this.commonLexes.intersection(book.lexemes);
            const otherParIndexes= new Set(mathUtils.range(this.parallelColumns.length));
            otherParIndexes.delete(index);
            let uniques = new Set(par.lexemes);
            
            for (const otherParI of otherParIndexes){
                //mylog("doing difference of ");
                uniques = uniques.difference(this.parallelColumns[otherParI].lexemes);
                
            }    
            par.unique=uniques;

            
           

        }


        this.commonLexes=this.parallelColumns.map((p)=>p.lexemes).reduce((common,thisSet)=>common.intersection(thisSet))
        
        this.matchingWords=Object.entries(wordsByPar).filter(([word,parIndexSet])=>parIndexSet.size>1)
            .map(([word,parIndexSet])=>word);
    }


    
    /**
     * 
     * @param {number[]} exclude - the indexes of parallelColumns to exclude
     * @returns {string} a single string which combines and consolidates all the references in the includes ParallelColumns
     */
    getRefs(exclude=[]){
        let refs=[];
        
        for (const [index,par] of this.parallelColumns.entries().filter(([i,p])=>!exclude.includes(i))){
            if(par.textRefs.length) {
                const refsMapped = par.textRefs.map((tr)=>tr.reference)
                mylog(`getRefs.refsMapped=[${refsMapped.join("//")}]`, true);
                refs.push(formatBibRefs(refsMapped.join(";")))
            }
            
        }
        
       
    
        return refs.join('; ');  
    }

}

export class LexicalPhrase{
    /**
     * @type {number[]}
     */
    lexIds=[];
    
    /**
     * 
     * @param {number[]} lexes
     */
    constructor(lexes=[]){
        this.lexIds=[...lexes];
    }

    /**
     * 
     * @param {LexicalPhrase} phrase 
     * @returns {boolean}
     */
    matches(phrase){
        let match=this.lexIds.length == phrase.lexIds.length;

        for(const [i,ID] of this.lexIds.entries()){
            if (!match || ID!=phrase.lexIds[i]){
                match=false;
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
    matchesArray(idArray){
        return this.matches(new LexicalPhrase(idArray))
    }

    stringifyIds(){
        return this.lexIds.join(",");
    }

    /**
     * 
     * @param {string} numListString 
     * @returns {LexicalPhrase}
     */
    fromString(numListString){
        return new LexicalPhrase(numListString.split(",").map((s)=>parseInt(s)));
    }
}

export class GospelPericopeGroup extends ParallelColumnGroup{
    title = $state('')
    id=$state(0);
    
    constructor(){
        
        const matt = new ParallelColumn();
        const mark = new ParallelColumn();
        const luke = new ParallelColumn();
        const john = new ParallelColumn();
        const other = new ParallelColumn();
        super([matt,mark,luke,john,other]);
        this.gospelCols={
            matt:matt,
            mark:mark,
            luke:luke,
            john:john,
            other:other
        }

        this.matt=matt;
        this.mark=mark;
        this.luke=luke;
        this.john=john;
        this.other=other;

    }
    
    lexemes=new Set();
    commonLexes=new Set();

    /**
     * @type {string[]} matchingWords
     */
    matchingWords=[];
    /**
     * @type {{phrase:LexicalPhrase,textRefVerseWordIndices:TextRefVersePhraseLocation[]}[]}
     */
    similarPhrases=[];

    markUniqueAndIdenticalWords(){
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
        for (const [index,book] of [this.gospelCols.matt,this.gospelCols.mark,this.gospelCols.luke,this.gospelCols.john].entries()){
            for (const tR of book.textRefs){
                for (const vW of tR.vwords){
                    for (const word of vW.words){
                        
                        book.lexemes.add(word.id);
                        this.lexemes.add(word.id);
                                                    
                        //track identically matching words across gospels: 
                        const theWord=stripWord(word.word);
                        //bookWords[index].add(theWord);
                        if (!wordsBooks[theWord])
                            wordsBooks[theWord]=new Set([index]);
                        else
                            wordsBooks[theWord].add(index);
                    }
                }
            }
        }
       // mylog("Mark unique words: filled in lexemes for each:")
       // mylog()
        const books=[this.gospelCols.matt,this.gospelCols.mark,this.gospelCols.luke,this.gospelCols.john];

        for (const [index,book] of books.entries()){
        //   this.commonLexes=this.commonLexes.intersection(book.lexemes);
            const otherBookIndexes= new Set([0,1,2,3]);
            otherBookIndexes.delete(index);
            let uniques = new Set(book.lexemes);
            
            for (const otherBookI of otherBookIndexes){
                //mylog("doing difference of ");
                uniques = uniques.difference(books[otherBookI].lexemes);
                
            }    
            book.unique=uniques;

            
           

        }


        this.commonLexes=this.lexemes.difference(this.gospelCols.matt.unique.union(this.gospelCols.mark.unique).union(
            this.gospelCols.luke.unique).union(this.gospelCols.john.unique));
        
        this.matchingWords=Object.entries(wordsBooks).filter(([word,bookIndexSet])=>bookIndexSet.size>1)
            .map(([word,bookIndexSet])=>word);
    }


    /**
     * 
     * @param {number[]} exclude indexes of parallelColumn to exclude. By default here, it excludes "other"
     * @returns 
     */
    getRefs(exclude=[4]){
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
    ParallelColumn, GospelPericopeGroup,TextAndRef,VerseWords,Word,GospelPericopeGroupIndices,stripWord, parseSingleGroup
}
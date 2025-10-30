import { mylog } from "$lib/env/env.js";

import { GreekUtils } from "$lib/utils/greek-utils";
import {combineRefs, formatBibRefs,expandRefs} from '$lib/n1904/bibleRefUtils.js'
import mathUtils from "$lib/utils/math-utils";
export class Word{
    id=0;
    word='';
}
export class VerseWords{
    verse=0;
    /**
     * @type {Word[]} words
     */
    words=[];
}
export class TextAndRef{
    reference='';
    text='';
    /**
     * @type {VerseWords[]} words
     */
    words=[];
    
    /**
     * 
     * @param {string} ref 
     * @param {string} txt 
     * @param {VerseWords[]} [words=[]] 
     */
    constructor(ref='',txt='',words=[]){
        this.reference = ref;
        this.text = txt;
        this.words=[];

    }
}

/**
 * @description Objects of this class represent a set of texts that belong in the same column of a group of parallel columns of text.
 * The name may be poorly chosen. :-(
 */
export class ParallelText {
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
 * @param {string[]} inputStrings 
 * @returns {ParallelText[]}
 */
export function parseRefs(inputStrings){
    /**
     * @type {ParallelText[]} thePars
     */
    let thePars = []
    inputStrings.entries().forEach(([i,textA])=>{
        
        const cleaned = textA && textA.length ? textA.trim().replaceAll(/\n+/g,";").replaceAll(/;+/g,";") : '';
        const tAndRefs = expandRefs(cleaned).map((str)=>new TextAndRef(str));
        thePars.push(new ParallelText(tAndRefs));
    });

     
    return thePars;
}


/**
 * @description a group of parallel texts, tracking common and unique lexemes, which can be displayed in parallel columns.
 */
export class ParallelTextGroup {

    /**
     * @type {ParallelText[]} parallelTexts
     */
    parallelTexts= $state([]);

    /**
     * 
     * @param {ParallelText[]} parTexts 
     */
    constructor(parTexts=[]){
        this.parallelTexts=parTexts;
    }

    lexemes=$state(new Set());
    commonLexes=$state(new Set());
    /**
     * @type {string[]} matchingWords
     */
    matchingWords=$state([]);

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
        for (const [index,par] of this.parallelTexts.entries()){
            for (const tR of par.textRefs){
                for (const vW of tR.words){
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
       
         for (const [index,par] of this.parallelTexts.entries()){
        //   this.commonLexes=this.commonLexes.intersection(book.lexemes);
            const otherParIndexes= new Set(mathUtils.range(this.parallelTexts.length));
            otherParIndexes.delete(index);
            let uniques = new Set(par.lexemes);
            
            for (const otherParI of otherParIndexes){
                //mylog("doing difference of ");
                uniques = uniques.difference(this.parallelTexts[otherParI].lexemes);
                
            }    
            par.unique=uniques;

            
           

        }


        this.commonLexes=this.parallelTexts.map((p)=>p.lexemes).reduce((common,thisSet)=>common.intersection(thisSet))
        
        this.matchingWords=Object.entries(wordsByPar).filter(([word,parIndexSet])=>parIndexSet.size>1)
            .map(([word,parIndexSet])=>word);
    }

    /**
     * 
     * @param {number[]} exclude - the indexes of parallelTexts to exclude
     * @returns {string} a single string which combines and consolidates all the references in the includes ParallelTexts
     */
    getRefs(exclude=[]){
        let refs=[];
        
        for (const [index,par] of this.parallelTexts.entries().filter(([i,p])=>!exclude.includes(i))){
            if(par.textRefs.length)
                refs.push(combineRefs(par.textRefs.map((tr)=>tr.reference)))
            
        }
        
       
    
        return refs.join('; ');  
    }

}

export class GospelPericopeGroup{
    title = $state('')
    id=$state(0);
    matt = new ParallelText();
    mark = new ParallelText();
    luke = new ParallelText();
    john = new ParallelText();
    other = new ParallelText();
    lexemes=new Set();
    commonLexes=new Set();
    /**
     * @type {string[]} matchingWords
     */
    matchingWords=[];

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
        for (const [index,book] of [this.matt,this.mark,this.luke,this.john].entries()){
            for (const tR of book.textRefs){
                for (const vW of tR.words){
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
        const books=[this.matt,this.mark,this.luke,this.john];

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


        this.commonLexes=this.lexemes.difference(this.matt.unique.union(this.mark.unique).union(
            this.luke.unique).union(this.john.unique));
        
        this.matchingWords=Object.entries(wordsBooks).filter(([word,bookIndexSet])=>bookIndexSet.size>1)
            .map(([word,bookIndexSet])=>word);
    }

    getRefs(includeOther=false){
        let refs=[];
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
    }
}


export default {
    ParallelText, GospelPericopeGroup,TextAndRef,VerseWords,Word,GospelPericopeGroupIndices,stripWord, parseRefs
}
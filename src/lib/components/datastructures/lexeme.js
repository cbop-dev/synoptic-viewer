import { GreekUtils } from "$lib/utils/greek-utils.js";

export class LexemeInfo {
    /**
     * 
     * @param {number} id 
     * @param {string} lemma 
     * @param {string} gloss 
     * @param {number} count  -- number of times in the selected books
     */
    constructor(id=0,lemma='',gloss='',count=0) {
        if (id == 0 || lemma =='')
            this.ready=false;
        else
            this.ready=true;
        this.id=id;
        //this.posDict=posDict;
        this.lemma=lemma;
        
        this.plain = GreekUtils.removeDiacritics(lemma);
        this.gloss=gloss;
        this.stats=new LexStats(count);

      
    }


   // static posDict = {};

    /**
     * 
     * @param {string} lemma 
     * @returns {string}
     */
    static makePlain(lemma){
        return lemma
    }
    /**
     * @returns {LexemeInfo}
     */
    copy() {
        const lex= new LexemeInfo(this.id, this.lemma, this.gloss);
        lex.stats=this.stats.copy();
        return lex;
    }
    /**
     * 
     * @param {LexemeInfo} lex 
     */
    copyFrom(lex){
        for (const [k,v] of Object.entries(lex)){
            this[k] = v;
        }
    }
    /**
     * @returns number|null
     */
    /*getPosNum() {
        const found = Object.entries(this.constructor.posDict).filter(([k,o])=>o['desc']==this.pos)
      //  //console.debug("getPostnum of '" + this.pos + "': " + (found.length > 0 ? 'nothing' : found[0]));
        const theVal = found.length > 0 ? found[0][0] : null;
      //  //console.debug("typeof theVal:" + typeof theVal)
        return Number(theVal);
    }*/

    
    /**
     * @returns {string|undefined|null}
     */
/*
    get pos(){
        return this._pos;
    }
*/
    /**
     * @param {string} desc
     */
/*    set pos(desc){
        this._pos=desc;
       // //console.debug("set, lex.pos: " + this._pos );
        this.posNum=this.getPosNum();
      //  //console.debug('setting pos to "' + desc +'", num='+this.posNum );
    }
*/

}

// toString=false,decimals=4){ .toFixed(decimals)

export class LexStats {


    /**
     * @type {string[]} references
     */
    references=[];
    
    /**
     * @type{Object<number,number>} counts of this lexeme in each NT book. key: book id, value: counts for each book.
     */
    //bookCounts={};
    
    /**
     * 
     * @param {string[]} references 
     * @param {number} thisLexTotalCount 
     * @param {number} corpusWordsTotal 
     * @param {Object<number,LemmaBookStats>} [bookStats={}] 

     */
    constructor(thisLexTotalCount=0,corpusWordsTotal=0,references=[],bookStats={}) {
        this.references=references;
        //this.bookCounts=bookCounts;
        this.count=thisLexTotalCount;
        this.corpusWordTotal=corpusWordsTotal;
        this.totalFreq=0;
        
        /**
         * @type {Object<number,LemmaBookStats>}  bookStats
         */
        this.bookStats=bookStats;
        /*this.sectionFreq=0;
        this.sectTotalFreqRatio=0;
        this.sectionCount=lexSectionCount;
        this.sectionWordsTotal=sectionWordsTotal;
        */
        this.calculated=false;
        if(this.count && this.corpusWordTotal){
            this.calculateFrequencies();
            this.calculated=true;

        }
        

    }

    

    /**
     * @param {number} bookId 
     * @param {number} bookLexCount 
     * @param {number} bookWordsTotal 
     * @param {number} ntLexCount 
     * @param {number} ntWords 
     */
    addAndCalcBookStatsIfNeeded(bookId,bookLexCount,bookWordsTotal,ntLexCount,ntWords,force=false){
        if (force || !this.bookStats[bookId]){

            const lbStats=new LemmaBookStats(bookLexCount,bookWordsTotal,ntLexCount,ntWords);
            this.bookStats[bookId]=lbStats;
            /*
            const freq = LexStats.calcTotalFrequency(bookLexCount,bookWordsTotal);
            this.bookStats[bookId]={count:bookLexCount,words:bookWordsTotal,
                 freq: freq, bookTotalFreqRatio: LexStats.calcFreqRatio(freq,this.totalFreq)}
                 */
        }
        //this.calculateFrequencies(true);
    }

    /**
     */
    calculateFrequencies(force=false){
        if (force || !this.calculated){
            this.totalFreq = this.totalFreq ? this.totalFreq : LexStats.calcTotalFrequency(this.count,this.corpusWordTotal);
        }

    }

    /**
     * 
     * @param {number} particularWordCount the number of times a specific word appears in a corpus
     * @param {number} totalCorpusWordsCount the total number of ALL words in that corpus
     * @returns the frequency per 1000 words. namely: 1000 * particularWordCount / totalCorpusWordsCount;
     */
    static calcTotalFrequency(particularWordCount,totalCorpusWordsCount){
        if (totalCorpusWordsCount > 0){
            return 1000 * particularWordCount / totalCorpusWordsCount;
        }
        else
            return 0;

    }


     /**
     * 
     * @param {number} sectFreq 
     * @param {number} totalFreq 
     * @returns {number} frequency as number or string. Returns 0 if totalFreq=0.
     */
    static calcFreqRatio(sectFreq,totalFreq){
        if (sectFreq && sectFreq> 0 &&  totalFreq && totalFreq > 0) {
                return sectFreq/totalFreq;
        }
        else
            return 0;
        
    }
    
    copy(){
        const stats=new LexStats();
        for (const [k,v] of Object.entries(this)){
            if (k!='bookStats' && k!='references')
                stats[k] = v;
        }
        stats.bookStats=Object.fromEntries(Object.entries(this.bookStats));
        stats.references=[...this.references]
        return stats;
    }
}

export class LemmaBookStats{
    /**
     * @param {number} bookCount  the Number of times this lemma appears in this book
     * @param {number} bookTotal the total number of words in this book
     * @param {number} ntCount the number of times this lemma appears in the entire NT
     * @param {number} ntTotal the total number of words in the NT
     
     */
    constructor(bookCount=0,bookTotal=0,ntCount=0,ntTotal=0){
        this.lexCounts={
            book:bookCount,
            nt:ntCount,
            restNT:ntCount-bookCount
        };
        this.words={
            book:bookTotal,
            nt:ntTotal,
            restNT:ntTotal-bookTotal
        }
        this.freq={
            book:LexStats.calcTotalFrequency(this.lexCounts.book,this.words.book),
            nt:LexStats.calcTotalFrequency(this.lexCounts.nt,this.words.nt),
            restNT:LexStats.calcTotalFrequency(this.lexCounts.restNT,this.words.restNT)
        }
        this.freqRatio=LexStats.calcFreqRatio(this.freq.book,this.freq.restNT);

    }
}
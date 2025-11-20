import { GreekUtils } from "$lib/utils/greek-utils";
export class Lexeme {
    /**
     * 
     * @param {number} id 
     * @param {string} lemma 
     * @param {string} gloss 
     * @param {number} count  -- number of times in the selected books
     * @param {number} total -- number of times in corpus
     * @param {string} pos 
     * @param {string} beta 
     * @param {number|null} [freqSectTotalRatio=null] 
     * @param {number|null} [sectFreq=null] 
     * @param {number|null} [totalFreq=null] 
     */
    constructor(id=0,lemma='',gloss='',count=0,pos='',total=0,beta='',sectFreq=null,totalFreq=null,freqSectTotalRatio=null,posDict={}) {
        if (id == 0 || lemma =='')
            this.ready=false;
        else
            this.ready=true;
        this.id=id;
        this.posDict=posDict;
        this.lemma=lemma;
        this.plain = GreekUtils.removeDiacritics(lemma);
        this.gloss=gloss;
        this.count=count
        this.pos=pos; 
        //this.posNum=this.getPosNum();    
        this.total=total;
        this.beta=beta;
        this.sectFreq=sectFreq;
        this.totalFreq=totalFreq;
        this.freqSectTotalRatio = freqSectTotalRatio ? 
            freqSectTotalRatio 
            : (this.sectFreq && this.sectFreq> 0 &&  this.totalFreq && this.totalFreq > 0) ? 
                    (this.sectFreq/this.totalFreq).toFixed(4) 
                    : null;
    }


    static posDict = {};

    /**
     * 
     * @param {string} lemma 
     * @returns {string}
     */
    static makePlain(lemma){
        return lemma
    }
    /**
     * 
     */
    copy() {
        return new Lexeme(this.id, this.lemma, this.gloss, this.count, this.pos, this.total, this.beta,this.sectFreq,this.totalFreq,
            this.freqSectTotalRatio,this.posDict)
    }
    /**
     * 
     * @param {Lexeme} lex 
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

export class LexemeInfo extends Lexeme {
    /**
     * @type {string[]} references
     */
    references=[];
    
    /**
     * @type{Object<string,string>} counts of this lexeme in each NT book. key: book abbreviation, value: counts for each book.
     */
    bookCounts={};
    
    /**
     * 
     * @param {number} id 
     */
    constructor(id=0,lemma='',gloss='',count=0,pos='',total=0,beta='',sectFreq=null,totalFreq=null,freqSectTotalRatio=null,posDict={}) {
            super(id,lemma,gloss,count,pos,total,beta,sectFreq,totalFreq,freqSectTotalRatio,posDict);
    }

}

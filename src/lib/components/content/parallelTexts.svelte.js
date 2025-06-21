import { mylog } from "$lib/env/env.js";
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
    
}
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
        mylog("checking if " +lexID +" is in ("+Array.from(this.unique).join(",")+")", true);
        return this.unique.has(lexID);
    }
    /**
     * 
     * @param {TextAndRef[]}     textRefs
     */
    constructor(textRefs=[]){
        this.textRefs = textRefs
        
     //   this.references=references;
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
    markUniqueWords(){
        
        //this.wordIds=new Set()
        for (const book of [this.matt,this.mark,this.luke,this.john]){
            for (const tR of book.textRefs){
                for (const vW of tR.words){
                    for (const word of vW.words){

                        book.lexemes.add(word.id);
                        this.lexemes.add(word.id);
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
                mylog("doing difference of ");
                uniques = uniques.difference(books[otherBookI].lexemes);
                
            }    
            book.unique=uniques;
        }

        this.commonLexes=this.lexemes.difference(this.matt.unique.union(this.mark.unique).union(
            this.luke.unique).union(this.john.unique));      
    }
}
export default {
    ParallelText, GospelPericopeGroup,TextAndRef,VerseWords,Word,GospelPericopeGroupIndices
}
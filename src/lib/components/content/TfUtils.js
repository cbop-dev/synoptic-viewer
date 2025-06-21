import ParTexts from "./parallelTexts.svelte.js";
import {ParallelText, GospelPericopeGroup,TextAndRef,VerseWords,Word,GospelPericopeGroupIndices} from "./parallelTexts.svelte.js";
 
import gospelParallels from '@cbop-dev/aland-gospel-synopsis'
import { tfServer, TfServer } from "$lib/n1904/tfN1904";
import { mylog } from "$lib/env/env";
import * as bibleUtils from '$lib/n1904/bibleRefUtils.js'
import * as mathUtils from '$lib/utils/math-utils.js';



/**
 * 
 * @param {string} bookAbbrev
 * @param {string} ref
 * @returns {{reference: string, text: string}[]}
 */
export function getTextRefsArray(bookAbbrev, ref){
    let textRefArray = [];
        for (const r of ref.split(";")){
            const textRef = new ParTexts.TextAndRef()
            const [c,vv] = r.split(":");
            let theRef = '';
            if(c && vv) {
                if (vv.includes(',')){ //got indivdual verses/ranges
                    
                    for (const v of vv.split(',')){
                        theRef = bookAbbrev? bookAbbrev + " ": '';
                        theRef += c+":"+v;
                      //  textRef.reference=theRef;
                       // textRef.text=''
                      //  textRefArray.push(textRef);
                    }

                }   
                else{
                    theRef =  bookAbbrev? bookAbbrev + " " + r : r;
                   // textRef.reference=theRef
                   // textRefArray.push({reference: theRef, text: ''});
                }
            }
            else{
                theRef =  bookAbbrev? bookAbbrev + " " + ref : ref;
               // textRefArray.push({reference: theRef, text: ''});
            }
                
            textRef.reference=theRef;
            textRefArray.push(textRef);
        }
        return textRefArray;
}


/**
 * @name buildGroupsArray
 * @param {number[]} pericopeNums
 * @returns  {GospelPericopeGroup[]}
 */
export function getGroupsArray(pericopeNums){
    return pericopeNums.map((pericope)=>{
        const row = gospelParallels.alandSynopsis.lookupPericope(pericope);
        const perGroup = new GospelPericopeGroup();
        perGroup.id = row.pericope;
        perGroup.title = row.pericope + ": " + row.title;
        if (row.Matt.ref)
            perGroup.matt.textRefs.push(...getTextRefsArray("Matt", row.Matt.ref));
        if (row.Mark.ref)
            perGroup.mark.textRefs.push(...getTextRefsArray("Mark", row.Mark.ref));
        if (row.Luke.ref)
            perGroup.luke.textRefs.push(...getTextRefsArray("Luke", row.Luke.ref));
        if (row.John.ref)
            perGroup.john.textRefs.push(...getTextRefsArray("John", row.John.ref));
        if (row.other.ref)
            perGroup.other.textRefs.push(...getTextRefsArray("", row.other.ref));
            
        return perGroup;

    });
}

/**
 * 
 * @param  {GospelPericopeGroup[]} groupsArray
 * @returns {{groupsIndices: GospelPericopeGroupIndices[], refsArray: string[]}} 
 **/
export function getRefsArrays(groupsArray){
    let refIndex = 0;
    /**
     * @type {GospelPericopeGroupIndices[]} groupsIndices
     */
    const groupsIndices=[];
    /**
     * @type {string[]} refsArray 
     */
    const refsArray=[];
    //TODO: test this. Does it work?
    for (let [gi, group] of groupsArray.entries()){
        const groupIndices=new GospelPericopeGroupIndices();
        
        for (const book of ['matt','mark','luke','john','other']){
            for (const ref of group[book].textRefs){
                if (refsArray.includes(ref.reference)){ //already fetching this ref. Double-dip!
                    groupIndices[book].push(refsArray.indexOf(ref.reference));
                }
                else{
                    refsArray.push(ref.reference);
                    groupIndices[book].push(refIndex);
                    refIndex++; 
                }
                
            }

        }

        groupsIndices.push(groupIndices)
    }
    mylog('getPericopeRefs finishing. groupsIndices=');
    mylog(groupsIndices)
    return {groupsIndices,refsArray}
}

/**
 * 
 * @param {GospelPericopeGroup} group 

 */


/**
 * 
 * @param {string[]} refs
 * @returns {{book:string,chapter:number|null,verses:number[]}[]}
 */
function getBCVarrayFromRefs(refs){
    /**
     * @type {{book:string,chapter:number|null,verses:number[]}[]} bcvArray
     */
    const bcvArray = [];
    for (const ref of refs){
        const bookCv=bibleUtils.getBookChapVerseFromRef(ref);
        bookCv.chap = bookCv.chap ? bookCv.chap.replaceAll(/[a-zA-Z]/g,'') : ''
        bookCv.v = bookCv.v ? bookCv.v.replaceAll(/[a-zA-Z]/g,'') : ''
        const bookName = TfServer.getBookNameBySyn(bookCv.book);
        //mylog('fetchGroupText got bookname ' + bookName + " for: " + bookCv.book);

        /**
         * @type {number[]} verseArray
         */
        let verseArray = [];
        if(bookCv.v){//create array of verses:
                verseArray = mathUtils.createNumArrayFromStringListRange(bookCv.v); 
        }
        bcvArray.push({book: bookName, chapter: bookCv.chap ? Number(bookCv.chap) : null, verses: verseArray});
    }
    return bcvArray;
}

export default {getTextRefsArray,getRefsArrays,getGroupsArray,getBCVarrayFromRefs}
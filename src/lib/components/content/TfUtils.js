import ParTexts from "./parallelTexts.svelte.js";
import {ParallelText, ParallelTextGroup, GospelPericopeGroup,TextAndRef,VerseWords,Word,GospelPericopeGroupIndices} from "./parallelTexts.svelte.js";
 
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
           
            const [c,vv] = r.split(":");
            
            if(c && vv) {
                if (vv.includes(',')){ //got indivdual verses/ranges
                    
                    
                    for (const v of vv.split(',')){
                        const textRef = new ParTexts.TextAndRef();
                        let theRef = bookAbbrev? bookAbbrev + " " : " ";
                        theRef += c+":";
                        theRef += v;
                        textRef.reference=theRef;
                        textRefArray.push(textRef);
                    }

                }   
                else{
                    const theRef =  bookAbbrev? bookAbbrev + " " + r : r;
                    const textRef = new ParTexts.TextAndRef();
                    textRef.reference=theRef;
                    textRefArray.push(textRef);
                }
            }
            else{
                theRef =  bookAbbrev? bookAbbrev + " " + ref : ref;
                const textRef = new ParTexts.TextAndRef();
                    textRef.reference=theRef;
                    textRefArray.push(textRef);
            }
                
     
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


//TODO: finish this! still in progess, broken!!!
/**
 * 
 *  @param {ParallelText[]} parallelTexts 
 *  @return {{parallelIndices: number[][], refsArray: string[]}} 
 *  @description returns two arrays: parallelIndices, a 2-dimensional array of numbers, each of which is an index into refsArray. 
 */
export function getParallelRefsArrays(parallelTexts){
     //let refIndex = 0;
    /**
     * @type {number[][]} groupsIndices
     */
    const parallelIndices=[];
    /**
     * @type {string[]} refsArray 
     */
    const refsArray=[];

    
    for (let [index, parText] of parallelTexts.entries()){
        const thisParIndices=[];
        
        for (const [i,txtAndRef] of parText.textRefs.entries()){
            
            if (refsArray.includes(txtAndRef.reference)){ //already fetching this ref. Double-dip!
                thisParIndices.push(refsArray.indexOf(txtAndRef.reference));
            }
            else{
                const length = refsArray.push(txtAndRef.reference);
                thisParIndices.push(length-1);
                
            }
            
        }

        parallelIndices.push(thisParIndices);
     

        
    }
    mylog('getPericopeRefs finishing. groupsIndices=');
    mylog(parallelIndices)
    return {parallelIndices: parallelIndices,refsArray: refsArray}
}


/**
 * @param {ParallelTextGroup} parallelTextGroup 
 * @param {Object} response
 * @param {{parallelIndices: number[][], refsArray: string[]}} parRefsObj 
 * @param {boolean} [words=true] 
 */
export function populateTexts(parallelTextGroup, response, parRefsObj, words=true){


    for (const [index,par] of parallelTextGroup.parallelTexts.entries()){
        //mylog("checking group # " + group.id +" , title: '"+ group.title + ", index: " + index);
    
        for (const [i,textRef] of par.textRefs.entries()){
            // mylog("checking ref: " + textRef.reference);
            const queryIndex= parRefsObj.parallelIndices[index][i];
            if (response && response.texts && response.texts[queryIndex]){
                textRef.text= response.texts[queryIndex].text;
                if (words){
                    
                    textRef.words=response.texts[queryIndex].words;
                }
                // mylog("populating fetched text for group index "+index + ", ref: '" + textRef.reference
                // + "', queryIndex = " + queryIndex +", text='"+textRef.text +"'", true);
            }
            
        }
        
        parallelTextGroup.markUniqueAndIdenticalWords();        
    }
    mylog("DONE! Populated the ParTexts()! We have " + parallelTextGroup.parallelTexts.length + " par Texts.")
    mylog("here's what we got: " 
        + parallelTextGroup.parallelTexts.map((p)=>p.textRefs.map((tr)=>tr.text).join(";"))
        .join("|"));
    mylog("^==================================^")

}


/**
 * 
 * @param  {GospelPericopeGroup[]} groupsArray
 * @returns {{groupsIndices: GospelPericopeGroupIndices[], refsArray: string[]}} 
 **/
export function getGroupRefsArrays(groupsArray){
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

export default {getTextRefsArray,getGroupRefsArrays,getGroupsArray,getBCVarrayFromRefs,getParallelRefsArrays,populateTexts}
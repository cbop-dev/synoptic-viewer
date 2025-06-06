import { mylog } from "$lib/env/env";
import { tfNtBooksDict } from "./ntbooks";
import * as mathUtils from '$lib/utils/math-utils.js';
/**
 * @description - returns true if one NT reference is contained within another, e.g., refIncludes("Matt 1:1,3-10", "Matt 1:4") and  
 *                  refIncludes("Rev", "Rev 2") each return true, because the last parameter is contained in the first;
 *                 but refIncludes("Mark 1", "Mark 2:2"), refIncludes("Luke 1:4", "Luke 1:7"), and  refIncludes("Luke 16", "Mark 16:2")
 *                  each return false, because the later are not contained in the former.
 * @param {string} containingRef -- a reference to a book, chapter, verse, chapter-range or verse-range. 
 * @param {string} includedRef --  a reference to a book, chapter, or verse. NOT a range!(?) todo: allow for includedrange!
 * @returns {boolean} true if the includedRef is contained in the containerRef
 */
export function refIncludes(containingRef, includedRef) {
    //mylog("refIncludes("+[containingRef,includedRef].join(',')+")...");
    let passed = true;
    const logMsgFunc = "refIncludes('" + containingRef + ", '" + includedRef + "')";
    const containingObj = getBookChapVerseFromRef(containingRef.trim().replaceAll(/\s+/g, ' '));
    const includedObj = getBookChapVerseFromRef(includedRef.trim().replaceAll(/\s+/g, ' '));
    if (containingObj.book != includedObj.book) {
        passed = false;
    }
    
    if (containingObj.chap?.includes('-')) { //chap range!
        if(containingObj.v?.includes('-')){
            //oops! bad input: to many ranges
            //mylog(logMsgFunc  + " bad input: both verse and chapter ranges");
        }
        else {
            const allowedChaps = createNumArrayFromStringListRange(containingObj.chap);
            //keep going...
            const includedChap = parseInt(includedObj.chap)
            if (includedChap && !allowedChaps.includes(includedChap)) {  //failed: not in range
                passed = false;
               // mylog(logMsgFunc + "-->false: included is not in container  chapter range");
            }
            else { //we passed! do nothing!

            }
        }   
    }
    else if (containingObj.v?.includes('-')){ //verse range!
        if (containingObj.chap != includedObj.chap) {
            passed = false;
        }
        else {//chapters match, but do verses?
            const allowedVerses=createNumArrayFromStringListRange(containingObj.v);

            const includedV = parseInt(includedObj.v);
            if (includedV && !allowedVerses.includes(includedV)) { //oops: not in range
                passed = false;

            }
            else { //we passed! do nothing!
                
            }
        }
    }
    else { //not a range: let's see what we've got!
        if (containingObj.chap && 
            containingObj.chap != includedObj.chap){ //not within the container chapter
            passed = false;
        }
        else if(containingObj.v && containingObj.v != includedObj.v){ //book and chap match. Do the verses?
            passed = false; 
        }  
    }
    //mylog("refIncludes -> " + passed)
    return passed;
}

export function cleanString(str){
    return str.replaceAll(/\s+/g, ' ').trim();
}

export function cleanNumString(numString){
    return cleanString(numString);
}
/**
 * 
 * @param {string} numString - a list of integers or integer ranges, separated by commas. Eg., "1,2,4-7", "3", "3-6,4", etc.
 * @returns {number[]} - an array of all the numbers in the given list, e.g., "1,2,4-7" --> [1,2,4,5,6,7], etc.
 */
export function createNumArrayFromStringListRange(numString){
    numString=cleanNumString(numString);
    const nums=[];
    const sepGroups = cleanNumString(numString).split(',');
    for (const group of sepGroups){
        const ranges = group.split("-");
        const min = parseInt(ranges[0]);
        const max = ranges.length > 1 ? parseInt(ranges[1]) : null;

        if (ranges.length > 2) //bad input!
            return [];
        else if (ranges.length == 2 && max){
            if (min < max){
                for (let i = min; i <= max; i++) {
                    if (!nums.includes(i))
                        nums.push(i);
                }
            }
            
        }
        else if (ranges.length == 1){ //no range, just a plain number!
            
            if (!nums.includes(min))
                nums.push(min);
        }
        else{
            //bad input?; don't add anything.
        }
    }
    return nums.sort();
}

/**
 * 
 * @param {string} string 
 * @returns {{book:string|null, chap:string|null}}
 */
export function splitBookChap(string){
    const matches = cleanString(string).match(/^(([1-3]+ +)?[a-zA-Z]+)( +([0-9a-z-]+))?$/); //reading 'chapters' which might actually be verses, i.e., Jude 3a
    let theBook = null,theChap = theBook;

    if (matches && matches.length >=5){ //got chapter
        theBook = matches[1];
        theChap = matches[4] ? matches[4] : null;
    }
    else if(matches && matches[1]){//just a book
        theBook=matches[1];
      
    }
    else{
        //error
        mylog("splitBookChap could not parse '"+string+"'");
    }

   // mylog("splitBookChap(string)->{b:" + theBook + ", c:"+theChap+"}");
    return {book: theBook, chap: theChap}
}


/**
 * 
 * @param {string} refString  -- NT ref string of a book, chapter,  verse, or a chapter range or verse range.
 *      E.g.:"1 Cor 2:3", "1 Cor 2", "1 Cor 2:3-4", "1 Cor 2-3" but NOT "1 Cor-2 Cor" nor "1 Cor 2-3:4-5" (which doesn't make sense)
 * @returns {{book:string|null, chap:string|null, v:string|null}}
 */

export function getBookChapVerseFromRef(refString){


    refString=cleanString(refString);
    let book = null,  chap = book, v = book;
    //NB books with only 1 chap: [Phlm, Jude,2 John, 3 John]
    let badInput = false;
    if (refString.split(":").length == 2){//got explicit verses
        let bookChap ='';
        [bookChap,v] = refString.split(":");
        if (v){ //got verses as expected
            const bookChapObj = splitBookChap(bookChap);
            book = bookChapObj.book;
            chap = bookChapObj.chap;
        }
        else{ //what?? bad input: colon with not verses! (e.g., "Eph 2:")
            badInput=true;
            mylog("bad input with colon: '"+refString+"'");
        }
    }
    else { //no verses, just book and chap
        const bookChapObj = splitBookChap(refString);
        book = bookChapObj.book;
        chap = bookChapObj.chap;
        if(!chap){
           // mylog("getBookChapVerseFromRef("+refString+") got no chap!"+chap)
        }

    }
    return {book: book,chap: chap, v: v}
}

/**
 * 
 * @param {string} string  - chapter and verse(s). E.g.,  "1:3" or "2" or even "2-3" (w/o verses)
 * @returns {{chapter:string, verse:string}}
 */
export function getChapVerseFromRef(string){
    string = cleanString(string);
    const vSplit = string.split(":");
    const chap = vSplit.length > 0 ? vSplit[0] : null;
    const v = vSplit.length > 0 ? (vSplit[1] ? vSplit[1] : null) : null;
    return {chap: vSplit[0], v: v}

}


//TODO delete and/or test this. A better/tested on is further below!
/**
 * 
 * @param {string} ref1 -- chapter and verse reference, eg., "1:3" or "2" or even "2-3" (w/o verses)
 * @param {string} ref2 -- (same)
 * @returns -1 if ref1 is earlier than ref2, 1 if opposite; 0 if they're the same or they begin at same point/verse.
 */
export function sortChapVerseFunc(ref1, ref2) {
    const logMsgFunc = "sortChapVerseFunc(" +[ref1,ref2].join(',') + ")";
    const chapV1 = getChapVerseFromRef(ref1); 
    const chapV2 = getChapVerseFromRef(ref2);
  //  mylog("...getChapVerseFromRef gives us: ")
  //  mylog(chapV1);
   // mylog(chapV2);
    let retVal = 0;
    
    if (chapV1.chap && chapV2.chap) {//each has a chapter...
        const chapRange1 = createNumArrayFromStringListRange(chapV1.chap);
        const chapRange2 = createNumArrayFromStringListRange(chapV2.chap);
        if (chapRange1.length > 0 && chapRange2.length > 0){
            if (chapRange1[0] == chapRange2[0]){ //same chapter, need to compare verses...
                if (chapV1.v && chapV2.v){ //have verses...
                    const vRange1 = createNumArrayFromStringListRange(chapV1.v);
                    const vRange2 = createNumArrayFromStringListRange(chapV2.v);
                    if (vRange1.length > 0 && vRange2.length > 0){
                        retVal = vRange1[0] - vRange2[0];
                       // mylog(logMsgFunc + ": compared vv [" + [vRange1[0],vRange1[1]].join(',') + "], returning: " + retVal);
                    }
                    else{ //only one with a verse? start with whole chapter. bad input?? keep same order for now.
                       // mylog(logMsgFunc+": got chaps, and vv, but keeping same order of " +[ref1,ref2].join(","));
                    }
                }
                else{ //only 1 with vv. put whole chapter first:
                    if (!chapV1.v) {
                        retVal = -1;
                      //  mylog(logMsgFunc+": only one with vv, returning -1")

                    }
                    else{
                        retVal = 1;//second has chapter, put it first
                      //  mylog(logMsgFunc+": only one with vv, returning 1")
                    }
                }
            }
            else{ //different chaps, lets compare them alone:
                retVal = chapRange1[0] - chapRange2[0]
               // mylog(logMsgFunc+": diff chaps, returning  one with vv, returning "+retVal);
            }
        }
        else{ //have, at most, only one ref with a chapter

            if (!chapV1.chap)
                retVal = -1;
            else
                retVal = 1;
        }

    }
    else{ //at most only one ref has chapters!@
        if (!chapV1.chap)
            retVal = -1;
        else 
            retVal = 1;
    }
   // mylog(logMsgFunc + ": returning " +  retVal)
    return retVal;



}

/**
 * 
 * @param {string} refString -- biblical references, with diffrerent chapters or books separated by semi-colons. 
 * NB: ranges must not cross chapter boundaries: e.g., Mark 2:1-3:4 is invalid and will not work (yet).
 * @returns {string[]} an array of NT references, where each can stand on its own. 
 *  E.g,: expandRefs("2 Tim 1:12; 2:3)"-->["2 Tim 1:12", "2 Tim 2:3"]; 
 *  and : expandRefs("Matt 3:2-10")-->["Matt 3:2", "Matt 3:3", ... "Matt 3:10"]
 */
export function expandRefs(refString){
    const refArray = [];
    refString = cleanString(refString);
    let latestBook = '';
    for (const ref of refString.split(";")){
        let bookCv = getBookChapVerseFromRef(ref);
        mylog("expandRefs: bookCv of '"+ref +"'= "+[bookCv.book,bookCv.chap,bookCv.v].join(','));
        if (bookCv.book){
            latestBook = bookCv.book;
        }
        else if (latestBook){
            
            bookCv = getBookChapVerseFromRef(latestBook + " " + ref);
        }
        
        if(bookCv.book) {
               if (bookCv.v?.includes(',')){
                for (const vv of bookCv.v.split(',')){
                    if (vv.includes('-')){
                        for (const v of mathUtils.createNumArrayFromStringListRange(vv)){
                            refArray.push(bookCv.book + " " + bookCv.chap + (v?  ":" + v : '')) ;
                        }
                    }
                    else{
                            refArray.push(bookCv.book + " " + bookCv.chap + (vv?  ":" + vv : ''));
                    }
                }
            }
            else if (bookCv.v?.includes('-')){
                for (const v of mathUtils.createNumArrayFromStringListRange(bookCv.v)){
                    refArray.push(bookCv.book + " " + bookCv.chap + (v? ":" + v: ''));
                }
            }
            else{
                refArray.push(bookCv.book + " " + bookCv.chap + (bookCv.v ? ":" + bookCv.v : ''));
            }
        }
        else{
            //can't do anything: we don't know what book it is!
        }
        
    }
    return refArray;
}

//TODO: review/test these functions, take from lxxweb app:

/**
 * 
 * @param {string[]} refArray  -- an array of strings where each string represents a single bible reference, whether a book, chapter or verse.
 *              NB: book names (or abbreviations) must not contain any spaces. (e.g, '2Sam' works, but not '2 Sam' or 'II Sam')
 * @returns -- a string with the bible references grouped and  combined by book and chapter, such that larger sections swallow smaller ones.
 *         e.g., ["Gen", "Gen 1"] => "Gen", but ["Gen 1", "Gen 2:4", "Exod 3:2"] => "Gen 1; 2:4; Ex 3:2".
 */
export function combineRefs(refArray) {

    //console.debug("combineRefs() with:")
    //console.debug(refArray)
    /**
     * @type {Object.<string,string[]|string>}
     */
    let refList={}
    for (const ref of refArray){
        const parts = ref.trim().replace(":", " ").split(" ");
        ////console.debug(parts)
        //refList[parts[0]] = parts.slice(1)
        if (parts[0] && ! refList[parts[0]]) {
            refList[parts[0]]={};
        }
        if (parts.length == 1) { //only got a chapter
            refList[parts[0]] ='all';
        }
        if (parts.length == 2 && refList[parts[0]] != 'all'){ //got a book and a whole chapter, but don't have whole book
            refList[parts[0]][parts[1]] = 'all'; //wipe out whatever was there before!
        }
        else if (parts.length == 3) {
            if (!refList[parts[0]][parts[1]]){
                refList[parts[0]][parts[1]] = [parts[2]];
            }
            else if (refList[parts[0]][parts[1]] != 'all' && refList[parts[0]][parts[1]].push){
                refList[parts[0]][parts[1]].push(parts[2]);
            }
        } 
    }
    // //console.debug("reflist")
    // //console.debug(refList)

    
    const combined = Object.entries(refList).map(([b,chapList])=>
        (chapList == 'all' || Object.keys(chapList).length == 0) ? 
            b :
            (b + " " + Object.entries(chapList).sort((a,b)=>a[0]-b[0]).map(
                ([c,vv])=>                
                vv.includes("all") ? 
                    c 
                    : c + ":" + joinInRanges(vv.sort((a,b)=>Number(a)-Number(b)))
            ).join("; "))
    ).join("; ")
    ////console.debug("combineRefs->'" + combined + ";");
    return combined
}

/**
 * @param {Array.<number|string>} numArray array of numbers(or numeric strings
 * @returns {string} a string of the numbers, sorted with ranges, each range/number separated by 'separator'
 *  E.g. joinInRanges([1,3,2,5,5,6], ",") => "1-3,5-6".
 * NB: this also tries to remove duplicates
 */
export function joinInRanges(numArray, separator=",", spreader="-"){

    let uniqueArray = [...new Set(numArray.map((x)=>Number(x)))].sort((x,y)=>x-y);
    //  //console.debug("uniq array: [" + uniqueArray.join("/") + "]");
    //  //console.debug("uniqArray.entries():" + [...uniqueArray]);

    let rangeString = '';
    let curRangeStart = uniqueArray[0];
    let curRangeEnd= uniqueArray[0];
    if (uniqueArray.length == 1) {//only one guy, all by himself....
        rangeString += curRangeEnd.toString();   
    }
    else {
        for (let [i,num] of uniqueArray.entries()){
            //  //console.debug("got i = " + i+"; num=" + num + " curSt=" + curRangeStart + "; curEnd=" + curRangeEnd);
                //num=Number(num);
                if (i == 0) { //first item; do nothing unless its also the last (see last condition)
    
                }
                else if (num == (curRangeEnd + 1))//extending the current range
                    curRangeEnd=num;
                else {//add previous range, start new one:
                    if (rangeString.length > 0)//not at beginning
                        rangeString+=separator;
                    if (curRangeStart == curRangeEnd) { // had only singeton:
                        rangeString += curRangeEnd.toString();
                    }
                    else { // found end of range:
                        rangeString += curRangeStart.toString() + spreader + curRangeEnd.toString();
                        
                    }
    
                    //reset new range:
                    curRangeStart = num;
                    curRangeEnd = num;
                }
                if (i == uniqueArray.length-1 && i > 0) { //last item, but not solo
                    if (rangeString.length > 0) // not first thing to add...
                    rangeString += separator;
                    if (num == curRangeStart){//last man standing...
                        rangeString += num.toString();
                    }
                    else { //ended with range:
                    rangeString += curRangeStart.toString()+spreader+curRangeEnd.toString();
                    }
                }
            }
    }
    
    return rangeString;
}

/**
 * @description Sorting function for array of chapter:verse references as in ["12:3", "15:2"].
 * refs can include verse ranges ("12:3-4") just be a chapter number ("12"), in which case the first verse in the range will be used for sorting,
 * such that entire chapters will appear before verses: ["12", "12:1", "12:1-3"], etc.
 * @param {string} cv1
 * * @param {string} cv2
 */
export function sortChapVerseRefs(cv1, cv2){
    const a = cv1.split(":");
    const b = cv2.split(":");
    //mylog("sortChapVerse!")
    let retVal = 0;
    if (a[0]==b[0])
        if (a[1] && b[1]) {
            retVal = parseInt(a[1]) - parseInt(b[1]);
        }
        else if (!a[1])
            retVal = -1;
        else if (!b[1])
            retVal =  1;
        else 
            retVal = 0;
    else if(a[0] && b[0])
        retVal = parseInt(a[0])-parseInt(b[0]);
    else if(!a[0]) //don't have a; keep it first.
        retVal = -1
    else if (!b[0]) // have a but not b, put b first.
        retVal = 1;
    else // no real difference between em!
        retVal = 0;
   // mylog("sortChaVerseRef("+cv1+","+cv2+")=" +retVal+")");
    return retVal;
}
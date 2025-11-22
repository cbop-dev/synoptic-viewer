import * as MathUtils from "./math-utils";
import { mylog } from "$lib/env/env";

/**
 * 
 * @param {string[]} strings - an array of strings, used as *what* is searched, when considered as a "sentence" (as if concatenated by spaces)
 * @param {string[]} searchStrings - an array of strings to search *for*, which may contains spaces, to look for in `strings` when the latter is joined as a single phrase (words separated by a space)
 * @returns {Object<string,number[][]>} - indexes of `strings`, where each `searchStrings` item was found. Key is item of `searchStrings`. 
 * The 2-d array is as follows:
 * 1. First level: an array of arrays, all belonings to the specific searchString keyed. 
 * 2. Second: each of these arrays contains the indices the words in `strings` of a specific instance of a match of the searchString found. 
 * 
 * This is 2-d because the same match can occur multiple times in the same searched string.
 * 
 * @description E.g., findPhrases(['the','list','is','short'], ["is short", "list is","is"]) returns [[[2,3]],[[1,2]],[[1],[2]]]  since the first query ("is short") matches the union of the 3rd and 4th words of 'strings', while "is" matches twice, at index 1 and 2, respectively, 
 *  
 * TODO: make this return every match, not just first!
 *
 */
export function findPhrases(strings,searchStrings){
    //const searchMatter = strings.reduce((sentence,word)=>sentence + " " + word.trim());
    /**
     * @type {Object<string,number[][]>} ret
     */
    const ret={};
    const searchedSentence=strings.map((s)=>s.trim()).join(" ");
    //mylog(`findPhrases([${strings.join(',')}],['${searchStrings.join("','")}'])`);
    //useful for finding *where* the matched words are found. Making this to "save" overhead of re-caldulating lengths. Necessary?
   // const searchedWordsLengths=strings.map((s)=>s.length);

    for (const [phraseIndex,rawSearchPhrase] of searchStrings.entries()){
        const searchPhrase = rawSearchPhrase.trim().replaceAll(/\s+/g,' ');
        /**
         * @type {number[][]} matchedIndexes
         */
        let matchedPhrase2sIndices = [];
        //mylog(`findPhrases(), at '${rawSearchPhrase}',index:${phraseIndex}`)
        searchedSentence.matchAll(new RegExp(searchPhrase, 'gi')).map(m=>m.index).forEach((foundSentenceIndex,ind)=>{
            //mylog(`findPhrases.match index:${foundSentenceIndex}`);
        
            
            //const searchPhraseLength = searchPhrase.length; //again, useful to "save" overhead?
                let foundSearchWordStartIndex={found: false, index:0} //i.e., whether we've found the start index in the searched for the match, and which one
            // let foundSearchWordEndIndex={found: false, index: strings.length -1}//i.e., whether we've found the end index in the searched for the match, and which one.
            


           
            let lettersCounted=0;
            for (const [i,searchedWord] of strings.entries()){
                if (!foundSearchWordStartIndex.found){
                    if (foundSentenceIndex < lettersCounted + searchedWord.length) { //
                        foundSearchWordStartIndex.found=true;
                        foundSearchWordStartIndex.index=i;
                        break;
                    }                        
                }
            
                lettersCounted+=searchedWord.length + 1; //NB: must account for space between words! Add one after each word.
            }


            let foundSearchWordEndIndex = foundSearchWordStartIndex.index + searchPhrase.split(" ").length-1;
            matchedPhrase2sIndices.push(MathUtils.range(foundSearchWordEndIndex - foundSearchWordStartIndex.index +1,
                        foundSearchWordStartIndex.index));
            
           // mylog(`in findPhrases loop (); foundIndex=${foundSentenceIndex};  foundSearchWordEndIndex = ${foundSearchWordEndIndex} - foundSearchWordStartIndex.index=${foundSearchWordStartIndex.index}  `);

        
        //mylog("pushing into ret: [" +matchedIndexes.join(",")+"]", true);
        
            

        });
       
        //mylog(`findPhrases end of loop #${phraseIndex}: matchedPhrase2sIndices.length=${matchedPhrase2sIndices.length}`)
        if(matchedPhrase2sIndices.length)
            ret[rawSearchPhrase] = matchedPhrase2sIndices;
        

    }
   // mylog("findMatchtingPhrases returning: ", true);
    //mylog(ret);
    return ret;
}

/**
 * 
 * @param {string[]} array 
 * @returns 
 */
export function filterEmptyStringItems(array){
    return array.map((s)=>s.trim()).filter((s)=>s);
}

/**
 * 
 * @param {string} string 
 * @param {string} delimiter 
 * @returns {string[]}
 */
export function splitAndFilterStrings(string,delimiter){
    return filterEmptyStringItems(string.split(delimiter));
}
/**
 * 
 * @param {any} array 
 * @returns 
 */
export function filterEmptyItems(array){
    return array.filter((o)=>o);
}
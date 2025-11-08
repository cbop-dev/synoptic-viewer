import * as MathUtils from "./math-utils";
import { mylog } from "$lib/env/env";
/**
 * 
 * @param {string[]} strings - an array of strings, used as *what* is searched, when considered as a "sentence" (as if concatenated by spaces)
 * @param {string[]} searchStrings - an array of strings to search *for*, which may contains spaces, to look for in `strings` when the latter is joined as a single phrase (words separated by a space)
 * @returns {Object<string,number[]>} - indexes of `strings`, where each `searchStrings` item was found. Key is item of `searchStrings`
 * @description E.g., findMatchingPhrases(['the','list','is','short'], ["is short", "list is"]) returns [[2,3],[1,2]]  since the first query ("is short") matches the union of the 3rd and 4th words of 'strings'.
 * 
 *
 */
export function findMatchingPhrases(strings,searchStrings){
    //const searchMatter = strings.reduce((sentence,word)=>sentence + " " + word.trim());
    /**
     * @type {Object<string,number[]} ret
     */
    const ret={};
    const searchedSentence=strings.map((s)=>s.trim()).join(" ");
    mylog(`findMatchingPhrases([${strings.join(',')}],['${searchStrings.join("','")}'])`);
    //useful for finding *where* the matched words are found. Making this to "save" overhead of re-caldulating lengths. Necessary?
   // const searchedWordsLengths=strings.map((s)=>s.length);

    for (const [phraseIndex,rawSearchPhrase] of searchStrings.entries()){
        const searchPhrase = rawSearchPhrase.trim().replaceAll(/\s+/g,' ');
        /**
         * @type {number[]} matchedIndexes
         */
        let matchedIndexes = [];
        
        //const searchPhraseLength = searchPhrase.length; //again, useful to "save" overhead?
        let foundSearchWordStartIndex={found: false, index:0} //i.e., whether we've found the start index in the searched for the match, and which one
       // let foundSearchWordEndIndex={found: false, index: strings.length -1}//i.e., whether we've found the end index in the searched for the match, and which one.
        
        let foundSentenceIndex=searchedSentence.indexOf(searchPhrase); 
        if (foundSentenceIndex >= 0) //i.e., if >=0 the sentence has it. But which words?...
        {
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
            matchedIndexes = MathUtils.range(foundSearchWordEndIndex - foundSearchWordStartIndex.index +1,
                        foundSearchWordStartIndex.index);
            
            mylog(`in findMatchingPhrases loop (); foundIndex=${foundSentenceIndex};  foundSearchWordEndIndex = ${foundSearchWordEndIndex} - foundSearchWordStartIndex.index=${foundSearchWordStartIndex.index}  `);

        }
       //mylog("pushing into ret: [" +matchedIndexes.join(",")+"]", true);
       if(matchedIndexes.length){
            mylog(`found something, pushing into ret[${rawSearchPhrase}] [${matchedIndexes.join(",")}"]"`, true);
            ret[rawSearchPhrase]=matchedIndexes;
       }
        

    }
   // mylog("findMatchtingPhrases returning: ", true);
    //mylog(ret);
    return ret;
}


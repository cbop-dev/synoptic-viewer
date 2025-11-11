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
 * @description Finds all matching phrases between two texts, where a phrase is two or more words separated by spaces (and the spaces are ignored/irrelevant)
 * @param {string[]} text1 - an array of strings, where each item is a word--these should have no leading or trailing spaces (and each, in fact, will be trim to remove such, as well as any punctuation).
 * @param {string[]} text2 - another one, like the first.
 * @param {number} [minWordLength=2] - minimum word length to search for. If this is set to 1, then every matching word between the two textswill be found.
 * @returns {Object<string,number[][]>}} -  a dictionary of all "longest" matching phrases, i.e., a matching phrase but ignoring all matching subphrases of this matching phrase. Thus, if "this phrase is awesome" in text1 is found in text2, we don't care that "this phrase" is also contained therein as we just want the longer phrase--UNLES there is also a separate instance of "this phrase" in one of the two texts that is NOT part of a "this phrase is awesome" super-phrase!!
 The keys,values of returns object are as follows:
 * each key is a matching phrase (string), with spaces separating words, 
 * and the value an object with two two-dimensional arrays of indexes (aptly named "text1" and "text2"), which contains an arrays of indexes into text1,  where each array contains indexes identifing the words (items) in text1 or text2 which constitute a single matching phrase.
 * 
 * E.g.: discoverMatchingPhrases(["this","is","a","sentence"],["this","is","also","a","sentence","which","is","a","sentence"]) ==>:
 *              {
 *               "this is": {text1: [[0,1]],text2:[[0,1]]},
 *               "is a":{text1:[[1,2]], text2:[[6,7]]}
 *               "a sentence": {text[[2,3]],[[3,4],[7,8]]} //NB: two matches of "a sentence" in text2!
 *              }
 *  
 *     Capisci?
 */
export function discoverMatchingLongestPhrases(text1, text2,minWordLength=2){
    
    let matchingPhrasesDict={}
    /** 
     *    algorithm:
     *      1. sort two texts by word length, start with shorter.
     *      2. let i = index of beginning of phrase: for each word (i = 0...N):
     *             a. 
     * 
     **/
    const theTexts = [text1, text2]
    const shorterTextIndex=text1.length <= text2.length ? 0 : 1;
    const shorterText=theTexts[shorterTextIndex];
    const longerText=theTexts[(shorterTextIndex==0 ? 1 : 0)]
    
    //work backwards from the END of all possible phrases, since we only care about LONGER strings, and no phrase can be longer that ends at the end, and begins at the beginning!
    for (let endPhraseIdx=shorterText.length-1, endWord=shorterText[endPhraseIdx]; 
            endPhraseIdx >=0; endPhraseIdx--) 
    {
        for (let startPhraseIdx=0, startPhrase=shorterText[startPhraseIdx]; startPhraseIdx < endPhraseIdx; startPhraseIdx++){
            //TODO: this!
        }

    }



    return matchingPhrasesDict;
}
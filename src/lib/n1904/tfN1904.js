
//import { mylog } from '../env/env';
import { mylog,apiURI } from '$lib/env/env.js';
import * as env from '$lib/env/env.js'
import ntlexemes from './n1904-lexemes.json';
import ntChaps from './tfN1904chaps.json';
import { tfNtBooksDict } from './ntbooks.js';
import * as bibleUtils from './bibleRefUtils.js';
import * as TfUtils from '$lib/components/content/TfUtils.js';
import { ParallelText, GospelPericopeGroup,TextAndRef,VerseWords,Word,GospelPericopeGroupIndices } from '$lib/components/content/parallelTexts.svelte';

const debugOn=true;
export const lexemes = ntlexemes;


export class N1904Server extends TfUtils.TfServer {
    ready = false;
    server=env.tfserverurl;
    dbURI="/nt";
    lexemes = ntlexemes;
    booksDict=tfNtBooksDict;
    /**
     * @description fetches the texts found in the given pericope groups, and fills in the text data in the given group object.
     *          Takes fetch options and optionally runs "markUniqueWords" if 'lexemes' is true
     * @param {GospelPericopeGroup[]} groups
     * @param {boolean} lexemes 
     * @param {boolean} showVerses 
     * @param {boolean} markUnique 
     * @returns {Promise<Object>} the Response object. NB: the 'group' object has also been modified by being populated with the fetched texts. 
     */
    async fetchAndPopulateGroupsPericopes(groups,showVerses=false,lexemes=false,markUnique=false){
      //  mylog("fetchAndPopluating...", debugOn)
      
        const refsArrays=TfUtils.getGroupRefsArrays(groups);
        const bcvFetchArray=this.getBCVarrayFromRefs(refsArrays.refsArray);
       // console.log("about to fetch...")
        const fetchedTextsResponse = await this.getTexts(bcvFetchArray,showVerses,lexemes);
       

        this.populateGroupTexts(groups,refsArrays,fetchedTextsResponse,showVerses,lexemes,markUnique);

        return fetchedTextsResponse;
    }

    /**
     * @param {GospelPericopeGroup[]} groups
     * @param {Object} fetchedResponse
     * @param {{groupsIndices: GospelPericopeGroupIndices[], refsArray: string[]}} refsArrays
     * @param {boolean} lexemes 
     * @param {boolean} showVerses 
     * @param {boolean} markUnique 
     */
    populateGroupTexts(groups,refsArrays,fetchedResponse, showVerses=false,lexemes=false,markUnique=false){
        for (const group of groups){
            for (const book of ['matt', 'mark', 'luke', 'john','other']){
                for (const [i,textRef] of group[book].textRefs.entries()){
                    //mylog("checking ref: " + textRef.reference);
                    const queryIndex= refsArrays.groupsIndices[0][book][i];
                    if (fetchedResponse && fetchedResponse['texts'] && fetchedResponse['texts'][queryIndex]){
                        textRef.text= fetchedResponse['texts'][queryIndex].text;
                        if (lexemes){
                            
                            textRef.words=fetchedResponse['texts'][queryIndex].words;
                        }
                        // mylog("populating fetched text for group index "+index + ", ref: '" + textRef.reference
                        // + "', queryIndex = " + queryIndex +", text='"+textRef.text +"'", true);
                    }
                    
                }
            }   

            if(markUnique){
                group.markUniqueAndIdenticalWords();
                
            }   

        }
    }

}



//const NT = use("CenterBLC/SBLGNT", version="2022")

//python.exit() 

//const tfServer = new N1904Server('n1904',ntlexemes,ntChaps,tfNtBooksDict,env.tfserverurl,'/nt')

mylog("in tf.js...")
//export {tfServer}

//import { mylog } from '../env/env';
import { mylog,apiURI } from '$lib/env/env.js';
import * as env from '$lib/env/env.js'
/**
 * @type {{lexemes:Object<number,{id:number,count:number,beta:string}>}}
 * totalWords:number,
 * numLexes:number}} ntlexemes
 */
import ntlexemes from './n1904-lexemes.json';
import ntChaps from './tfN1904chaps.json';

/**
* @type {Object<number,{name:string,abbrev:string, syn:string[],words:number,chapters:number,lemmas:number}>} tfNtBooksDict
*/
import { tfNtBooksDict } from './ntbooks.js';
import * as bibleUtils from './bibleRefUtils.js';
import * as TfUtils from '$lib/components/content/TfUtils.js';
import { ParallelColumn, GospelPericopeGroup,TextAndRef,VerseWords,Word,GospelPericopeGroupIndices } from '$lib/components/content/parallelTexts.svelte';

const debugOn=true;
export const lexemes = ntlexemes;


export class N1904Server extends TfUtils.TfServer {
    ready = false;
    longname="Nestle's 1904 Novum Testamentum Graece"
    name=this.longname;
    shortname="Nestle 1904 NT";
    abbrev="n1904";
    param=this.abbrev;
    server=env.tfserverurl;
    dbURI="/nt";

    /**
     * @type {Object<string,{id:number,count:number, beta:string}>} 
     */
    lexemes = ntlexemes.lexemes;
    booksDict=tfNtBooksDict;
    totalWords=ntlexemes.totalWords;
    numLexemes=ntlexemes.numLexemes;
 

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
                    const queryIndex= refsArrays.groupsIndices[0][book].main[i];
                    if (fetchedResponse && fetchedResponse['texts'] && fetchedResponse['texts'][queryIndex]){
                        textRef.text= fetchedResponse['texts'][queryIndex].text;
                        if (lexemes){
                            
                            textRef.vwords=VerseWords.buildFromObj(fetchedResponse['texts'][queryIndex].words);
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
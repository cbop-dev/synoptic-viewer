
//import { mylog } from '../env/env';
//import { mylog,apiURI } from '$lib/env/env.js';
import { mylog} from '$lib/env/env.js';

/**
 * @type {{lexemes:Object<number,{name:string,abbrev:string, syn:string[],words:number,chapters:number,lemmas:number}>,
 * totalWords:number,
 * numLexes:number}} ntlexemes
 */
import ntlexemes from './sblgnt-lexemes.json';

import { tfNtBooksDict } from './ntbooks.js';
//import * as bibleUtils from './bibleRefUtils.js';
//import sblgntlexemes from './sblgnt-lexemes.json';
import * as env from '$lib/env/env.js'
//import TfUtils from '$lib/components/content/TfUtils.js';
import { N1904Server } from '$lib/n1904/tfN1904.js';
//import { ParallelColumn, GospelPericopeGroup,TextAndRef,VerseWords,Word,GospelPericopeGroupIndices } from '$lib/components/content/parallelTexts.svelte';

const debugOn=true;
export const lexemes = ntlexemes;

export class SblGntServer extends N1904Server{
    static abbrev='sblgnt';
    dbURI="/sblgnt";
    longname="SBL Greek New Testament (2010)";
    name="SBL Greek NT"
    shortname="SBL GNT";
    abbrev=SblGntServer.abbrev;
    server=env.tfserverurl;
    param=this.abbrev;
    
    /**
     * @type {Object<string,{id:number,count:number, beta:string}>} 
     */
    lexemes = ntlexemes.lexemes;
    numLexemes=ntlexemes.numLexemes;
    totalWords=ntlexemes.totalWords;

    /**
     * @type {Object<number,{name:string,abbrev:string, syn:string[],words:number,chapters:number,lemmas:number}>} booksDict
     */
    booksDict=tfNtBooksDict;
    showNotes=true;

    getNoteFooter(){
        return "Apparatus notes taken from The Greek New Testament: SBL Edition (https://www.sblgnt.com), copyright 2010, Society of Biblical Literature (https://sbl-site.org) and Logos Bible Software (https://logos.com). License information: https://www.sblgnt.com/license/.";
    }
    
    
}

//const NT = use("CenterBLC/SBLGNT", version="2022")

//python.exit() 

//const tfServer = new SblGnt();

mylog("in tf.js...")
//export {tfServer}
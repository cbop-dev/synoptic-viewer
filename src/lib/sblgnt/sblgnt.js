
//import { mylog } from '../env/env';
import { mylog,apiURI } from '$lib/env/env.js';
import ntlexemes from './sblgnt-lexemes.json';
import { tfNtBooksDict } from './ntbooks.js';
//import * as bibleUtils from './bibleRefUtils.js';
import sblgntlexemes from './sblgnt-lexemes.json';
import * as env from '$lib/env/env.js'
import TfUtils from '$lib/components/content/TfUtils.js';
import { N1904Server } from '$lib/n1904/tfN1904.js';
import { ParallelText, GospelPericopeGroup,TextAndRef,VerseWords,Word,GospelPericopeGroupIndices } from '$lib/components/content/parallelTexts.svelte';

const debugOn=true;
export const lexemes = ntlexemes;

export class SblGnt extends N1904Server{
   dbURI="/sblgnt";

    server=env.tfserverurl;
    
    lexemes = ntlexemes;
    booksDict=tfNtBooksDict;
}

//const NT = use("CenterBLC/SBLGNT", version="2022")

//python.exit() 

const tfServer = new SblGnt();

mylog("in tf.js...")
export {tfServer}
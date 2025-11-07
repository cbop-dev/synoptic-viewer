
//import { mylog } from '../env/env';
import { mylog,apiURI,useSbl } from '$lib/env/env.js';
import * as BibleUtils from '$lib/n1904/bibleRefUtils.js';
import TfUtils from '$lib/components/content/TfUtils';
import { ParallelText, TextAndRef,VerseWords,Word } from '$lib/components/content/parallelTexts.svelte';
import { N1904Server } from '$lib/n1904/tfN1904';
import { SblGntServer } from '$lib/sblgnt/sblgnt';



const n1904 = new N1904Server()
const sbl= new SblGntServer()

export function getServer(){
    if (useSbl){
        return sbl
    }
    else
        return n1904;
}
//export {sbl as tfServer}
export {sbl, n1904, sbl as tfServer}

//export {n1904 as tfServer}



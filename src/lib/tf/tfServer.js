
//import { mylog } from '../env/env';
import { mylog,apiURI,useSbl } from '$lib/env/env.js';
import * as BibleUtils from '$lib/utils/bibleRefUtils.js';
import TfUtils from '$lib/components/content/TfUtils';
import { ParallelColumn, TextAndRef,VerseWords,Word } from '$lib/components/content/parallelTexts.svelte';
import { N1904Server } from '$lib/n1904/tfN1904';
import { SblGntServer } from '$lib/sblgnt/sblgnt';
import { VulgateServer } from '$lib/tf/tfVulgate';
import { WebcServer } from '$lib/tf/tfWebc';
import { TfServer } from '$lib/components/content/TfUtils';
//import { tfBibleBookNames } from '@cbop-dev/tf-bible-booknames';

export const n1904 = new N1904Server();
export const sbl = new SblGntServer();
export const vulgate = new VulgateServer();
export const web = new WebcServer();

const serverDict={
    'sbl':sbl,
    'n1904':n1904,
    'vulgate':vulgate,
    'web':web,
    'sblgnt':sbl,
}

/**
 * 
 * @param {string} name 
 * @returns {TfServer}
 */
export function getServer(name='sbl'){
    const server = Object.keys(serverDict).includes(name) ? serverDict[name] : sbl;
    return server;
    
        
}



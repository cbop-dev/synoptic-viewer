import { mylog } from '$lib/env/env.js';
import { json } from '@sveltejs/kit';
//import { getRequestParamsObj } from '$lib/components/content/urlParams.js';
import { getRequestParamsObj3,SynopsisOptions3} from '$lib/components/content/SynopsisClasses.svelte.js';
import { URLParam } from '$lib/components/content/urlParams.js';


export async function load({ url }) {
  /**
   *
   */
  //const theOpts = getRequestParamsObj2(url.searchParams);
  //mylog(theOpts)
 // mylog(`Server got options type:${typeof theOpts}`, true)
  //mylog(theOpts);
  const myoptions=SynopsisOptions3.fromURLParams(getRequestParamsObj3(url.searchParams));
//  mylog("+page.js: options-- highlighOnClick="+myoptions.viewOptions.highlightOnClick)
  return {options: myoptions}
}

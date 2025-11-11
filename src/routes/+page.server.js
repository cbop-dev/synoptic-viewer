import { mylog } from '$lib/env/env.js';
import { json } from '@sveltejs/kit';
//import { getRequestParamsObj } from '$lib/components/content/urlParams.js';
import { getRequestParamsObj } from '$lib/components/content/SynopsisClasses.svelte.js';


export async function load({ url, params }) {
  
  const theOpts = getRequestParamsObj(url.searchParams);
  mylog(theOpts)
  mylog("server got options:")
  mylog(theOpts);
  return {options: theOpts}
}

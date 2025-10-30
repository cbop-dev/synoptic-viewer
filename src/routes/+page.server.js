import { mylog } from '$lib/env/env.js';
import { json } from '@sveltejs/kit';
import { getRequestParamsObj } from '$lib/components/content/urlParams.js';



export async function load({ url, params }) {
  
  
  return {request: getRequestParamsObj(url.searchParams)}
}

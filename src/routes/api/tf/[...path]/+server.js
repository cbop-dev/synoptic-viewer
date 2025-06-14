//import { page } from '$app/state';
//import { PUBLIC_BASE_URL } from '$env/static/public';
import { json } from '@sveltejs/kit';
import {tfserverurl, mylog, debug } from '$lib/env/env.js'
//const server="http://localhost:5000/"
export async function GET({ url, params }) {
	const uri = params.path;
	const theParams=url.searchParams.toString();
	//console.log("api/tf uri = " + uri)
	
	const fetchUrl=tfserverurl+uri+ (theParams ? '?' +theParams : '');
	mylog('api server, fetch('+fetchUrl+")")
	const res = await fetch(fetchUrl);

	return res;
	//return json({params: params, url: fetchUrl});
}

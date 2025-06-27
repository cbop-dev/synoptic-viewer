//import { page } from '$app/state';
//import { PUBLIC_BASE_URL } from '$env/static/public';
import { json } from '@sveltejs/kit';
import {tfserverurl, mylog, debug } from '$lib/env/env.js'
//const server="http://localhost:5000/"
export async function GET({ url, params }) {
	const uri = params.path;
	const theParams=url.searchParams.toString();
	//mylog("api/tf uri = " + uri)
	//mylog("api route received request from " + url.origin +"; hostname = " + url.hostname,true);
	const fetchUrl=tfserverurl+"/"+uri+ (theParams ? '?' +theParams : '');
	//mylog('api server, fetch('+fetchUrl+")")
	const res = await fetch(fetchUrl);

	return res;
	//return json({params: params, url: fetchUrl});
}
//TODO: test this!
export async function POST({ url, request, params, cookies }) {
	//const { refs, sections,options } = await request.json();
	//mylog("/api/tf/ POST request: ");
	//mylog(request);
	//mylog("api route received request from " + url.origin +"; hostname = " + url.hostname,true);
	//mylog("/api/xxxxtf/ POST request.body: ");
	//mylog(request.body);
	//const theBody = await request.json();
	const fetchurl =  tfserverurl+"/" + params.path;
	const theBody = await request.json();
	//mylog(" POST request body to forward: " + JSON.stringify(theBody));
	const response = await fetch(fetchurl, {
		method: "post",
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(theBody)
	});
	return response;
}

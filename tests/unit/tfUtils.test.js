import { describe, it, expect,test} from 'vitest';
//import { tfServer, TfServer } from '$lib/n1904/tfN1904';
import * as tfu from '$lib/components/content/TfUtils.js' ;
import { mylog } from '$lib/env/env';
import gospelParallels from '@cbop-dev/aland-gospel-synopsis';
import { ParallelColumn, TextAndRef } from '$lib/components/content/parallelTexts.svelte.js';

test('test test!', async () => {
	//console.log("MODE: " + import.meta.env.MODE);
	expect(import.meta.env.MODE).toEqual("test");
	//await expect(page.locator('h1')).toBeVisible();
});


test('TfUtils getTextRefsArray', async () => {
	
	expect(import.meta.env.MODE).toEqual("test");
	
	const theArray = tfu.getTextRefsArray("Matt","16:15,19");
	expect(theArray.length).toBe(2);
	expect(theArray[0].reference).toEqual("Matt 16:15");
	expect(theArray[1].reference).toEqual("Matt 16:19");


});


test('getParallelRefsArrays test!', async () => {
	//console.log("MODE: " + import.meta.env.MODE);
	expect(import.meta.env.MODE).toEqual("test");
	//await expect(page.locator('h1')).toBeVisible();
	const refs =[
		"Matt 3:12", "John 3:16", "Matt 3:12"
	]

	const indices = [[0],[1],[0]]
	const pars = [];
	for (const r of refs){
		pars.push(new ParallelColumn([new TextAndRef(r)]));
	}

	const ret = tfu.getParallelRefsArrays(pars)
	mylog("ret:");
	mylog(ret);
	for (const [x,arr] of ret.parallelIndices.entries()) {
		for (const [y,refIndex] of arr.entries()){
			expect(ret.refsArray[refIndex].length).toBeGreaterThan(0);
			mylog("refIndex " + refIndex + ": ref = '" +ret.refsArray[refIndex] + "'" );
			expect(pars[x].textRefs[y].reference).toEqual(ret.refsArray[refIndex]);
			expect(indices[x][y]).toEqual(refIndex);
		}
	}
});

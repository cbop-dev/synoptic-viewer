import { describe, it, expect,test} from 'vitest';
import { tfServer, TfServer } from '$lib/n1904/tfN1904';
import * as tfu from '$lib/components/content/TfUtils' ;
import { mylog } from '$lib/env/env';
import gospelParallels from '@cbop-dev/aland-gospel-synopsis';

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
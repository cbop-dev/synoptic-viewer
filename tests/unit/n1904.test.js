import { test, expect } from "vitest";
import * as bibleUtils from "$lib/utils/bibleRefUtils";
import { N1904Server } from "$lib/n1904/tfN1904";
const n1904=new N1904Server();
test('dummy', async () => {
	const tests=[]
    for (const t of tests) {
        
    }
	expect(true).toBe(true);
	//await expect(page.locator('h1')).toBeVisible();
});


test('getBookAbbrevById(n1904)', async () => {
	const tests=[{id: 137780, abbrev:'Matt'}]
    for (const t of tests) {
        expect(n1904.getBookAbbrevById(t.id)).toEqual(t.abbrev)
    }
	expect(true).toBe(true);
	//await expect(page.locator('h1')).toBeVisible();
});




test('getNodeFromRef(n1904)', async () => {
	const tests=[
		{ref: 'Matt 1:1', bookname: 'Matt', booknode: 137780, node: 137780},
		{ref: '2 Tim 1:1',bookname: 'II Timothy', booknode: 137795},
		{ref: 'II Corinthians 5:19',bookname: 'II_Corinthians', booknode: 137787},
		{ref: 'II_Corinthians 5:19',bookname: 'II_Corinthians', booknode: 137787},
		
	]
    for (const t of tests) {
        const node = await n1904.getNodeFromRef(t.ref);
		const bcv = bibleUtils.getBookChapVerseFromRef(t.ref);
		expect(bcv.book.length > 0 ).toBe(true);
		console.log(`getNodeFromRef('${t.ref}') --> ${node}`);
		expect(node).toBeGreaterThan(0);
		//expect(false).toBe(true);
    }
	expect(true).toBe(true);
	//await expect(page.locator('h1')).toBeVisible();
});



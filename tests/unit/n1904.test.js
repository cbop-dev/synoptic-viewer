import { test, expect } from "vitest";
import * as bibleUtils from "$lib/n1904/bibleRefUtils";
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


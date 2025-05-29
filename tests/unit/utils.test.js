import { describe, it, expect,test} from 'vitest';
import { tfServer, TfServer } from '$lib/n1904/tfN1904';
import { mylog } from '$lib/env/env';
import * as mathUtils from '$lib/utils/math-utils.js';
import * as bibleRefUtils from '$lib/n1904/bibleRefUtils.js';

test('dummy', async () => {
	const tests=[
        {input: '', output: ''}

    ];
    for (const t of tests){

    }
	expect(true).toBe(true);

});

test('createNumArrayFromStringListRange', async () => {
	
    const tests=[
        {ref: "2-12", array:[2,3,4,5,6,7,8,9,10,11,12]}
    ]

    for (const t of tests){
        const getArray = mathUtils.createNumArrayFromStringListRange(t.ref);
        expect(getArray).toEqual(t.array);

    }

	expect(true).toBe(true);
	//await expect(page.locator('h1')).toBeVisible();
});

test('expandRefs', async () => {
	const tests = [
        {input: "2 Tim 1:12; 2:3", output: ["2 Tim 1:12", "2 Tim 2:3"]},
        {input: "Matt 3:2-10", output : ["Matt 3:2", "Matt 3:3", "Matt 3:4","Matt 3:5","Matt 3:6","Matt 3:7","Matt 3:8","Matt 3:9","Matt 3:10"]},
        {input: "1 Tim 1:12-13,16; 2:3; Rom 14:4; 15:1-2; 16", output: ["1 Tim 1:12", "1 Tim 1:13", "1 Tim 1:16","1 Tim 2:3","Rom 14:4", 
            "Rom 15:1","Rom 15:2", "Rom 16"]},
        
     ];
     for (const t of tests){
        expect(bibleRefUtils.expandRefs(t.input)).toEqual(t.output);
     }
	expect(true).toBe(true);
	//await expect(page.locator('h1')).toBeVisible();
});


test('sortChapVerseRefsmmy', async () => {
	const tests=[
        {input: ["12:3", "12", "3:4"], output: ["3:4","12", "12:3"]},
        {input: ["12:3-4", "12", "1:3-11", "3:4", "1:2", "1", "1:4-5"], output: ["1", "1:2", "1:3-11", "1:4-5", "3:4","12", "12:3-4"]}

    ];
    for (const t of tests){
        expect(t.input.toSorted(bibleRefUtils.sortChapVerseRefs)).toEqual(t.output);
    }
	expect(true).toBe(true);

});
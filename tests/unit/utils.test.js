import { describe, it, expect,test} from 'vitest';
import { tfServer, TfServer } from '$lib/n1904/tfN1904';
import { mylog } from '$lib/env/env';
import * as mathUtils from '$lib/utils/math-utils.js';
import { GreekUtils } from '$lib/utils/greek-utils';
import * as bibleRefUtils from '$lib/n1904/bibleRefUtils.js';
import * as StringUtils from '$lib/utils/string-utils.js';

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
        {ref: "2-12", array:[2,3,4,5,6,7,8,9,10,11,12]},
        {ref:"3",array:[3]},
        {ref:"",array:[]},
        
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


test('sortChapVerseRefs', async () => {
	const tests=[
        {input: ["12:3", "12", "3:4"], output: ["3:4","12", "12:3"]},
        {input: ["12:3-4", "12", "1:3-11", "3:4", "1:2", "1", "1:4-5"], output: ["1", "1:2", "1:3-11", "1:4-5", "3:4","12", "12:3-4"]}

    ];
    for (const t of tests){
        expect(t.input.toSorted(bibleRefUtils.sortChapVerseRefs)).toEqual(t.output);
    }
	expect(true).toBe(true);

});

test('string utils', async () => {
	const tests=[
        {searched: ['short'], searchingFor: ["short"], output: {"short": [0]}},
        {searched: ['veryshort'], searchingFor: ["short"], output: {"short":[0]}},
        {searched: ['two','words'], searchingFor: ["words"], output: {"words":[1]}},
        {searched: ['two','words'], searchingFor: ["wordss"], output: {}},
        /*
        {searched: ['two','words'], searchingFor: ["two"], output: [[0]]},
        {searched: ['two','words'], searchingFor: ["two words"], output: [[0,1]]},
        {searched: ['has','three','words'], searchingFor: ["three words"], output: [[1,2]]},
        {searched: ['has','three','words'], searchingFor: ['has',"three words"], output: [[0],[1,2]]},
        {searched: ['has','three','words'], searchingFor: ['has',"three"], output: [[0],[1]]},
        {searched: ['has','three','words'], searchingFor: ['has three'], output: [[0,1]]},
        */
        {searched: ['the','list','is','short'], searchingFor: ["short", "is"], output: {"short":[3], "is":[1]}},//watch out! early match 
        /*
        {searched: ['the','list','is','short'], searchingFor: ["is short"], output: [[2,3]]},//watch out! early match
        {searched: ['the','list','is','short'], searchingFor: ["short", "is short"], output: [[3],[2,3]]},//watch out! early match
        {searched: ['the','list','is','short'], searchingFor: ["short", "list is"], output: [[3],[1,2]]},
        {searched: ['the','list','is','short'], searchingFor: ["is short", "list is"], output: [[2,3],[1,2]]},
        */
        {searched: ['χριστου','υι'], searchingFor: ["χριστου υι"], output: {"χριστου υι":[0,1]}},/*
        {searched: ['this', 'is', 'noncontiguous', 'match'], searchingFor: ["is match"], output: [[]]},*/
        {searched: ['a','partial', 'match!'], searchingFor: ["partial mat"], output: {"partial mat":[1,2]}},
         {searched: GreekUtils.onlyPlainGreek("Βίβλος γενέσεως Ἰησοῦ χριστοῦ υἱοῦ Δαυὶδ υἱοῦ Ἀβραάμ.".trim(),true,true).split(" "), searchingFor: ["δ υιου"], output: {"δ υιου": [5,6]}}
    ];
    for (const t of tests){
        //expect(true).toBe(true);
        expect(StringUtils.findPhrases(t.searched,t.searchingFor)).toEqual(t.output);
    }
	expect(true).toBe(true);
});



test('string sequences', async () => {
	const tests=[
        {input: '', output: ''}

    ];
    for (const t of tests){

    }
	expect(true).toBe(true);

});

import { describe, it, expect,test} from 'vitest';
import { mylog } from '$lib/env/env';
import { GospelPericopeGroup, LexicalPhrase } from '$lib/components/content/parallelTexts.svelte';
import { LexPhraseAndLocations, ParallelPhraseLocation } from '$lib/components/content/parallelTexts.svelte.js';
import { SblGntServer } from '$lib/sblgnt/sblgnt';


test('basic lexical phrase test!', async () => {
	

    const tests=[
        {input: [[1,2,3,4,5,6],[1,2,3,4,5,6]], output:true},
        {input: [[1,2,3,4,5,6],[1,2,3,4,6]], output:false}

    ]

    for (const t of tests){
        expect(new LexicalPhrase(t.input[0]).matches(new LexicalPhrase(t.input[1]))).toBe(t.output);
        
        //expect(true).toBe(false);
    }

	expect(import.meta.env.MODE).toEqual("test");
	//await expect(page.locator('h1')).toBeVisible();
});


test('exact phrase test!', async () => {
	

    const tests=[
        {input: ["Ὦ γενεὰ ἄπιστος","Ὦ γενεὰ ἄπιστος"],outputIncludes:["ω γενεα απιστος"]}
    

    ]

    for (const t of tests){
        
        
        //expect(true).toBe(false);
    }

	expect(import.meta.env.MODE).toEqual("test");
	//await expect(page.locator('h1')).toBeVisible();
});

 "Ὦ γενεὰ ἄπιστος";


test('calcMatchTypes and reverse tests!', async () => {
	

    const tests=[
       {colsIndices: [1,2],numCols:4,matchTypeIndex:2},
       {colsIndices: [0,1,2],numCols:5,matchTypeIndex:3},
       {colsIndices: [0,3],numCols:5,matchTypeIndex:4},
       {colsIndices: [1,3],numCols:5,matchTypeIndex:5},
       {colsIndices: [0,2],numCols:4,matchTypeIndex:1},
       {colsIndices: [0,1],numCols:2,matchTypeIndex:0},
       {colsIndices: [0],numCols:2,matchTypeIndex:-1},
       {colsIndices: [2],numCols:4,matchTypeIndex:-1}


    ]

    //const parallelPhraseLocation = new ParallelPhraseLocation(0);
    const lexPhraseAndLocations = new LexPhraseAndLocations(new LexicalPhrase(),
        [0,2].map((col)=>new ParallelPhraseLocation(col)));

    for (const t of tests){
        const lexPhraseAndLocations = new LexPhraseAndLocations(new LexicalPhrase(),
        t.colsIndices.map((col)=>new ParallelPhraseLocation(col)));
        const matchIndex = lexPhraseAndLocations.calcMatchTypeIndex(t.numCols);
        expect(matchIndex).toEqual(t.matchTypeIndex);
        if (matchIndex >= 0)
            expect(LexPhraseAndLocations.reverseCalcColumnMatchesFromMatchTypeIndex(matchIndex,t.numCols)?.map((b,i)=>[b,i])
            .filter(([b,i])=>b).map(([b,i])=>i)).toEqual(t.colsIndices);
        //expect(true).toBe(false);
    }

	
});




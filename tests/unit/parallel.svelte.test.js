import { describe, it, expect,test} from 'vitest';
import { tfServer,N1904Server } from '$lib/n1904/tfN1904.js';
import { mylog } from '$lib/env/env.js';
import { ParallelText, GospelPericopeGroup,TextAndRef,VerseWords,Word, parseRefs} from '$lib/components/content/parallelTexts.svelte.js';
import GP from '@cbop-dev/aland-gospel-synopsis';
import TfUtils from '$lib/components/content/TfUtils.js';
test('dummy', async () => {
	const tests =[
        {input:null,output:null}
    ]

    for (const t of tests){
        expect(true).toBe(true);
    }
	expect(true).toBe(true);
	//await expect(page.locator('h1')).toBeVisible();
});


test('Groups: unique words', async () => {
	const tests =[
        {aland: 198, uniques:{matt:new Set([3784]), mark:new Set([1422, 3603, 4119, 69]), luke:new Set([1147, 1302, 1394, 1459, 1508, 1824, 1888, 2541, 2957, 3592, 4118, 434, 4480, 4551, 4664, 475, 478, 4879, 531, 617, 736, 833]),
             john:new Set()},common:new Set([1048, 1145, 1306, 1488, 1539, 1697, 2201, 229, 2488, 2936, 3152, 3205, 3413, 3566, 3578, 3581, 3681,38,3970,4269,4570,4892,5379])}
    ]
   // expect(false).toBe(true);
    for (const t of tests){
        const group = TfUtils.getGroupsArray([t.aland])[0];
        const groupsArrays=TfUtils.getGroupRefsArrays([group]);
      //  mylog("gonna call fetchAndPopulate...");
        await tfServer.fetchAndPopulateGroupsPericopes([group],true,true,true)

        //group.markUniqueAndIdenticalWords();
        //console.log("marked uniq words!")
        for (const book of ['matt', 'mark', 'luke','john']){
           // mylog('checking ' + book + ':')
            expect(group[book].unique).toEqual(t.uniques[book]);
            expect(group.commonLexes).toEqual(t.common);
        }
    }
	expect(true).toBe(true);
	//await expect(page.locator('h1')).toBeVisible();
});


test('parseRefs', async () => {
	const tests =[
        {input:["Matt 3:12;"],output: [new ParallelText([new TextAndRef("Matt 3:12")])]}
    ]
    
    for (const t of tests){
        const results = parseRefs(t.input)
        expect(true).toBe(true);
        for (const [i,resultPt] of results.entries()) {
            for (const [j,resultRef] of resultPt.textRefs.entries()){
                expect(resultRef.reference).toEqual(t.output[i].textRefs[j].reference);
            }
        }
        
    }
	expect(true).toBe(true);
	//await expect(page.locator('h1')).toBeVisible();
});
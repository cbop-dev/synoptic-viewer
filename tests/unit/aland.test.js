import { describe, it, expect,test} from 'vitest';
//import { tfServer, TfServer } from '$lib/n1904/tfN1904';
import { mylog } from '$lib/env/env';

import gospelParallels from '@cbop-dev/aland-gospel-synopsis';
import MathUtils from '$lib/utils/math-utils.js';


test('dummy', async () => {
	const tests=[

    ]
    for (const t of tests) {
        expect(true).toBe(true);
    }
	
	//await expect(page.locator('h1')).toBeVisible();
});

test('alandSection filter/sort', () => {
	
    const alands=MathUtils.createNumArrayFromStringListRange(
        gospelParallels.alandSynopsis.lookupSection(12).pericopes);
    const alandsCopy = [...alands]
    const expected=MathUtils.createNumArrayFromStringListRange("251-268");

    expect(alands).toEqual(expected);
	
    gospelParallels.sortAlandPericopes(alands,gospelParallels.gospels.names.JOHN);
	expect(alands).not.toEqual(alandsCopy)
    const johnSorted=[251,252,253,254,255,256,257,258,259,260,261,262,265,263,264,266,267,268];
    expect(alands).toEqual(johnSorted);
});


test('alandSection gospels.isValie', () => {
	
   const tests = [
    {gospel:"", valid:false},
    {gospel:"Matthew", valid:true},
    {gospel:gospelParallels.gospels.names.MATTHEW, valid:true}
   ];

   for (const t of tests){
    expect(gospelParallels.gospels.isValid(t.gospel)).toEqual(t.valid);
   }
});

test('alandSection sort', () => {
	
     const tests=[
        //5: Luke only; 8. adoration = Matt+Lk, both primary); 10: Matt only; 13: all 4, all primary
        {input: [341,342], primary: '',output: [341,342]},
        {input: [341,342], primary: gospelParallels.gospels.names.JOHN,output: [342,341]},
         {input: [266,267], primary: gospelParallels.gospels.names.LUKE,output: [267,266]},
          {input: [251,267], primary: gospelParallels.gospels.names.LUKE,output: [267,251]},
        {input: [255,256], primary: gospelParallels.gospels.names.LUKE,output: [256,255]},
       {input:[251,252,253,254,255,256,257,258,259,260,261,262,263,264,265,266,267,268],
        primary: gospelParallels.gospels.names.LUKE,
        output:[267,251,256,252,253,254,255,257,258,259,260,261,262,264,265,266,263,268]}
        
    ];

    for (const t of tests){
        const copy = [...t.input];
       const sorted =gospelParallels.sortAlandPericopes(t.input,t.primary);
       
        /*mylog("original: ["+copy.join(',')+"], sorted for "+t.primary +
         " --> ["+t.input+"], sorted: [" +
         sorted.join(',')+"];", true)*/
        expect(t.input).toEqual(t.output);
    }
	expect(true).toBe(true);
	//await expect(page.locator('h1')).toBeVisible();
});

 
        
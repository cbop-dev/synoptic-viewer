import { describe, it, expect,test} from 'vitest';
import { mylog } from '$lib/env/env';
//import {IntegerSuffixArray} from '$lib/utils/suffix-array.js';
//import * as sais2 from "$lib/utils/sais-array2.js"
//import * as sais3 from "$lib/utils/common-subarrays.js"
//import {findMaximalCommonSubarrays } from "$lib/utils/sais-array4.js"
//import {findMaximalCommonSubarrays as findMaximalCommonSubarrays5  } from "$lib/utils/sais-array5.js"
import { findMaximalCommonSubarraysAcrossColumns } from '$lib/utils/column-subarrays2';
//import {findMaximalCommonSubarraysAcrossColumnsSA} from '$lib/utils/sa-column-subarrays.js';
//import * as ISA2 from '$lib/utils/suffix-array.js';
test('suffix dummy', async () => {
	const tests=[
        {input: '', output: ''}

    ];
    for (const t of tests){

    }
	expect(true).toBe(true);

});

/*

test('suffix array simple', async () => {
	
    const arr1 = [1, 2, 3, 4, 5, 1, 2, 3];
    const arr2 = [5, 1, 2, 3, 4, 1, 2, 3];

    const commons = IntegerSuffixArray.findAllCommonNonOverlappingSubarrays(arr1, arr2);
   // console.log("common non-overlapping result: ", commons);
    
    const tests=[
        {input: '', output: ''}

    ];
    for (const t of tests){

    }
	expect(true).toBe(true);

});




test('suffix array basic1', async () => {
	
   const tests=[
        {ar1:[1,2,6,3,10,11], ar2: [28,400],  output: []},
        {ar1:[1,2,3,4,5,6,7,8,9,10,11], ar2: [1,9,10,11,2,4,5,6,7,3], 
            output: [{subarray:[4,5,6,7],indicesInArray1:[3,6],indicesInArray2:[5,8]},{subarray:[9,10,11],indicesInArray1:[8,10],indicesInArray2:[1,3]}]},
            {ar1:[1,2,3,4,5,6,7,8,9,10,11], ar2: [1,9,10,11,2,4,5,6,7,3], minLen:4,
            output: [{subarray:[4,5,6,7],indicesInArray1:[3,6],indicesInArray2:[5,8]}]},
       // {ar1:"this is a sentence".split(''), ar2: "is this a sentence?".split(''),  minLen: 7, output: [{subarray: "is a sentence", indicesInArray1:[5,17], indicesInArray2:[5,17]}]},
 
    ];


    for (const t of tests){
        const res = IntegerSuffixArray.findAllCommonNonOverlappingSubarrays(t.ar1,t.ar2,t.minLen? t.minLen : 2);
        console.log("common subarrays: ", res);
        expect(res).toEqual(t.output)
    }
    expect(true).toBe(true);

});*/

/*

test('suffix array basic2', async () => {
	
   const tests=[
        {ar1:[1,2,6,3,10,11], ar2: [28,400],  output: []},
        {ar1:[1,2,3,4,5,6,7,8,9,10,11], ar2: [1,9,10,11,2,4,5,6,7,3], 
            output: [{subarray:[4,5,6,7],indicesInArray1:[3,6],indicesInArray2:[5,8]},{subarray:[9,10,11],indicesInArray1:[8,10],indicesInArray2:[1,3]}]},
    //        {ar1:[1,2,3,4,5,6,7,8,9,10,11], ar2: [1,9,10,11,2,4,5,6,7,3], minLen:4,
      //      output: [{subarray:[4,5,6,7],indicesInArray1:[3,6],indicesInArray2:[5,8]}]},
       // {ar1:"this is a sentence".split(''), ar2: "is this a sentence?".split(''),  minLen: 7, output: [{subarray: "is a sentence", indicesInArray1:[5,17], indicesInArray2:[5,17]}]},
 
    ];

    for (const t of tests){
        const res = ISA2.findAllCommonSubarraysAmong([t.ar1,t.ar2]);
        console.log("ISA2.findAllCommonSubarraysAmong ", JSON.stringify(res));
        console.log("\n")
        
    }
    expect(true).toBe(true);

});*/
/*
test('sais array', async () => {
	
    const tests=[
        {ar1:[1,2,6,3,10,11], ar2: [28,400],  output: []},
        {ar1:[1,2,3,4,5,6,7,8,9,10,11], ar2: [1,9,10,11,2,4,5,6,7,3], 
            output: [{subarray:[4,5,6,7],arrays:[{arrayIndex:0,ranges:[[3,6]]},{arrayIndex:1,ranges:[[5,8]]}]},{subarray:[9,10,11],arrays:[{arrayIndex:0,ranges:[[8,10]]},{arrayIndex:1,ranges:[[1,3]]}]}]},


            //output: [{subarray:[4,5,6,7],indicesInArray1:[3,6],indicesInArray2:[5,8]},{subarray:[9,10,11],indicesInArray1:[8,10],indicesInArray2:[1,3]}]},
    //        {ar1:[1,2,3,4,5,6,7,8,9,10,11], ar2: [1,9,10,11,2,4,5,6,7,3], minLen:4,
      //      output: [{subarray:[4,5,6,7],indicesInArray1:[3,6],indicesInArray2:[5,8]}]},
       // {ar1:"this is a sentence".split(''), ar2: "is this a sentence?".split(''),  minLen: 7, output: [{subarray: "is a sentence", indicesInArray1:[5,17], indicesInArray2:[5,17]}]},
 
    ];

    const variableTestArrays=[
         //{arrays:[[1,2],[1,2]],minLen:2,output:[{subarray:[1,2],arrays:[{arrayIndex:0,ranges:[[0,1]]},{arrayIndex:1,ranges:[[0,1]]}]}]},
          {arrays:[[1,2,3],[1,2,3]],minLen:2,output:[{subarray:[1,2,3],arrays:[{arrayIndex:0,ranges:[[0, 2]]},{arrayIndex:1,ranges:[[0,2]]}]}]},
       {arrays:[[1,2,3,4,5],[4,5,6,7,8,9,10,11]],minLen:3,output:[]},
        {arrays:[[4198,1156,3241,937,5452,3454,1482,1377,1058,3622,1710,3454,4046,836,1511,3241,3635,3536,836,3474,1058,3454,3828,4626,3608,5369,2179,4117,3454,4626,153,836,3647,3635,4198,4626,3828,1473,3454,1710,3454,3640,37,3454,3556,4626,2053,3454,925,4626,1091,3454,2289,4626,5447,1710,3640,2514,1899,1088,3454,731,1473,3454,1957,1319,1473,4450,2514,854,1473,3454,3651,1473,5447,2514,1473,854,3454,3649,1473,2514,3241,1520,1473,1508,3852,234,4366,1473,569,3454,4056,1435,1058,854,3454,446,3454,3764,836,854,2514,4626,3454,3828,4626,3454,3638,1435,1156,3241,854,3454,446,3629,3454,3828,4626,854,3454,3764,4626], [2514,3620,4594,4198,854,1486,4953,2179,2575,4953,2423,2514,3454,3828,4626,3454,1710,3454,3640,854,4626,3454,3764,4626], [2514,1091,1710,3454,1500,836,1710,4969,4953,4198,5447,3839,2986,4953,3454,3083,836,4177,836,2946,1315,1473,4198,2512,2514,2469,1315,3454,3083,836,2986,1156,836,3620,4198,2986,3828,37,3454,3556,4626,2053,3454,925,4626,3454,731,1473,3454,1957,1319,1473,3454,2575,2235,2514,854,1473,3454,266,1473,2514,1058,836,854,3822,3652,1473,2514,3241,1520,1473,1508,3852]],
            minLen:3,output:[{subarray:[3454,1710,3454,3640],arrays:[{arrayIndex:0,ranges:[[38,41]]},{arrayIndex:1,ranges:[[15,18]]}]},{subarray:[3454,3828,4626],arrays:[{arrayIndex:0,ranges:[[116,118]]},{arrayIndex:1,ranges:[[12,14]]}]},{subarray:[37,3454,3556,4626,2053,3454,925,4626],arrays:[{arrayIndex:0,ranges:[[42,49]]},{arrayIndex:2,ranges:[[37,44]]}]},{subarray:[1473,2514,3241,1520,1473,1508,3852],arrays:[{arrayIndex:0,ranges:[[80,86]]},{arrayIndex:2,ranges:[[67,73]]}]},{subarray:[3454,731,1473,3454,1957,1319,1473],arrays:[{arrayIndex:0,ranges:[[60,66]]},{arrayIndex:2,ranges:[[45,51]]}]},{subarray:[2514,854,1473,3454],arrays:[{arrayIndex:0,ranges:[[68,71]]},{arrayIndex:2,ranges:[[55,58]]}]}]},
        //^Lord's prayer parallels: Matt 6:7-15; Mark 11:25; Luke 11:1-4.
        {arrays:[[1,2,3,4,5],[3,4,5],[3,2,3,4,5,2,3],[2,3]],
            output:[
                {subarray:[2,3,4,5],arrays:[{arrayIndex:0,ranges:[[1,4]]},{arrayIndex:2,ranges:[[1,4]]}]},
                {subarray:[3,4,5],arrays:[{arrayIndex:0,ranges:[[2,4]]},{arrayIndex:1,ranges:[[0,2]]},{arrayIndex:2,ranges:[[2,4]]}]},
                {subarray:[2,3],arrays:[{arrayIndex:0,ranges:[[1,2]]},{arrayIndex:2,ranges:[[1,2],[5,6]]},{arrayIndex:3,ranges:[[0,1]]}]},

            ]},

    ]

      for (const [i,t] of tests.entries()){
     
        const saisRes=sais2.findAllCommonSubarraysAmongHybrid([t.ar1,t.ar2]);
      //  console.log(`sais2.findAllCommonSubarraysAmongHybrid #${i}`, JSON.stringify(saisRes));
      //  expect(saisRes).toEqual(t.output)
    }

    for (const [i,ct] of variableTestArrays.entries()){
        const saisRes=sais2.findAllCommonSubarraysAmongHybrid(ct.arrays,ct.minLen? ct.minLen:2);
        console.log("----")
        console.log(`sais.findAllCommonSubarraysAmongHybrid([[${ct.arrays.join("],[")}]]) #${i}: `, JSON.stringify(saisRes));
        expect(saisRes.length).toEqual(ct.output.length);
//        expect(saisRes).toEqual(ct.output);
    }
    expect(true).toBe(true);

});
 

test('findCommonSubarrays, sais2', async () => {
	const tests=[
          {arrays:[[1,2,3],[1,2,3]],minLen:2,output:[{subarray:[1,2,3],occurrences:[{arrayIndex:0,spans:[{start: 0, end:2}]},{arrayIndex:1,spans:[{start: 0,end:2}]}]}]},
          {arrays:[[1,2],[1,2]],minLen:2,output:[{subarray:[1,2],occurrences:[{arrayIndex:0,spans:[{start: 0, end:1}]},{arrayIndex:1,spans:[{start: 0,end:1}]}]}]},
           {arrays:[[1,2,3,4,5],[3,4,5],[3,2,3,4,5,2,3],[2,3]],
            output:[
                {subarray:[3,4,5],occurrences:[{arrayIndex:0,spans:[{start:2,end:4}]},{arrayIndex:1,spans:[{start:0,end:2}]},{arrayIndex:2,spans:[{start:2,end:4}]}]},
                {subarray:[2,3],occurrences:[{arrayIndex:0,spans:[{start:1,end:2}]},{arrayIndex:2,spans:[{start:1,end:2},{start:5,end:6}]},{arrayIndex:3,spans:[{start:0,end:1}]}]},
                {subarray:[2,3,4,5],occurrences:[{arrayIndex:0,spans:[{start:1,end:4}]},{arrayIndex:2,spans:[{start:1,end:4}]}]},
            
            ]},


    ];
    for (const [i,t] of tests.entries()){
        const result = sais2.findCommonSubarrays(t.arrays,t.minLen);
        //console.log(`findCommonSubarrays #${i}: `,JSON.stringify(result))
        //expect(result.length).toEqual(t.output.length);
        //expect(result).toEqual(t.output);
    }
	expect(true).toBe(true);

});
//findCommonSubarrays
*/
/*
test('findCommonSubarrays, sais3', async () => {
	const tests=[
          {arrays:[[1,2,3],[1,2,3]],minLen:2,output:[{subarray:[1,2,3],
            occurrences:[{arrayIndex:1,spans:[{start: 0,end:2}]},{arrayIndex:0,spans:[{start: 0, end:2}]}]}]},
          {arrays:[[1,2],[1,2]],minLen:2,output:[{subarray:[1,2],occurrences:[{arrayIndex:1,spans:[{start: 0,end:1}]},{arrayIndex:0,spans:[{start: 0, end:1}]}]}]},
          {arrays:[[1,2,3,4,5],[3,4,5],[3,2,3,4,5,2,3],[2,3]],
            output:[
                {subarray:[3,4,5],occurrences:[{arrayIndex:0,spans:[{start:2,end:4}]},{arrayIndex:1,spans:[{start:0,end:2}]},{arrayIndex:2,spans:[{start:2,end:4}]}]},
                {subarray:[2,3],occurrences:[{arrayIndex:0,spans:[{start:1,end:2}]},{arrayIndex:2,spans:[{start:1,end:2},{start:5,end:6}]},{arrayIndex:3,spans:[{start:0,end:1}]}]},
                {subarray:[2,3,4,5],occurrences:[{arrayIndex:0,spans:[{start:1,end:4}]},{arrayIndex:2,spans:[{start:1,end:4}]}]},
                
                

            ]},


    ];
    for (const [i,t] of tests.entries()){
        //const result = sais3.findCommonSubarrays(t.arrays,t.minLen);
        const result = findMaximalCommonSubarrays5(t.arrays,t.minLen);
        
     // console.log(`findMaximalCommonSubarrays sais5, #${i}: `,JSON.stringify(result))
       //expect(result.length).toEqual(t.output.length);
        //expect(result).toEqual(t.output);
    }
	expect(true).toBe(true);
    */
/*
    const testCases = [
  {
    arrays: [[1,2,3],[1,2,3]],
    minLen: 2,
  },
  {
    arrays: [[1,2,3,4],[2,3,4,5]],
    minLen: 2,
  },
  {
    arrays: [[1,2,1,2,3],[2,3,1,2,3]],
    minLen: 2,
  },
];

for (const {arrays, minLen} of testCases) {
  console.log('Arrays:', arrays, 'minLen:', minLen);
  const result = findMaximalCommonSubarrays(arrays, minLen);
  console.log('Result:');
  result.forEach(r => {
    console.log('Subarray:', r.subarray);
    r.occurrences.forEach(o => {
      console.log(`  Array ${o.arrayIndex}:`, o.spans.map(s => `[${s.start},${s.end}]`).join(', '));
    });
  });
  console.log('--------------------');


});
*/


test('findMaximalCommonSubarraysAcrossColumns: method comparison and tests', async () => {
	const tests=[
        {columns: [[[1,2,3]],[[1,2,3]]],minLen: 2,output:[{subarray:[1,2,3],occurrences:[{columnIndex:0,textIndex:0,spans:[{start:0,end:2}]},{columnIndex:1,textIndex:0,spans:[{start:0,end:2}]}]}]},
        {columns: 
            [
            [ [1,2,3], [2,3,4], [1,2,3,4] ], // column 0
            [ [1,2], [3,4,5], [10,3,1,2] ]   // column 1
            ],
         minLen: 2, output: [{subarray:[1,2],occurrences:[{columnIndex:0,textIndex:0,spans:[{start:0,end:1}]},{columnIndex:1,textIndex:0,spans:[{start:0,end:1}]},{columnIndex:1,textIndex:2,spans:[{start:2,end:3}]},{columnIndex:0,textIndex:2,spans:[{start:0,end:1}]}]},{subarray:[3,4],occurrences:[{columnIndex:0,textIndex:1,spans:[{start:1,end:2}]},{columnIndex:1,textIndex:1,spans:[{start:0,end:1}]},{columnIndex:0,textIndex:2,spans:[{start:2,end:3}]}]}]
        },
        {columns:[[[1,2,3,4,5]],[[3,4,5]],[[3,2,3,4,5,2,3]],[[2,3]]],
            output:[
                {subarray:[3,4,5],occurrences:[{columnIndex:0,textIndex:0,spans:[{start:2,end:4}]},{columnIndex:1,textIndex:0,spans:[{start:0,end:2}]},{columnIndex:2,textIndex:0,spans:[{start:2,end:4}]}]},
                {subarray:[2,3,4,5],occurrences:[{columnIndex:0,textIndex:0,spans:[{start:1,end:4}]},{columnIndex:2,textIndex:0,spans:[{start:1,end:4}]}]},
                {subarray:[2,3],occurrences:[{columnIndex:0,textIndex:0,spans:[{start:1,end:2}]},{columnIndex:2,textIndex:0,spans:[{start:1,end:2},{start:5,end:6}]},{columnIndex:3,textIndex:0,spans:[{start:0,end:1}]}]},
                
                
            ]},
        
    ];

    const methods = [
        {name:'findMaximalCommonSubarraysAcrossColumns', func:findMaximalCommonSubarraysAcrossColumns},
       // {name:'findMaximalCommonSubarraysAcrossColumnsSA', func:findMaximalCommonSubarraysAcrossColumnsSA} //NB: does not work. And ChatGPT informs me that it will be complex and require more bookkeeping to make it work.
    ];


    for (const method of methods){
     //   console.log("\n--------------------------------");
     //   console.log(`Method: ${method.name}`);
        for (const [i,t] of tests.entries()){
            const result = method.func(t.columns, t.minLen);
           // console.log("-------------")
          //  console.log(`${method.name} #${i}: `, JSON.stringify(result));//,null,2));
            expect(result.length).toEqual(t.output.length);
            expect(result).toEqual(t.output);
        }

    }
   
	expect(true).toBe(true);

});



//const result = findMaximalCommonSubarraysAcrossColumns(columns, minLen);
//console.log(JSON.stringify(result,null,2));

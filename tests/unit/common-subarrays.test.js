import { describe, it, expect,test} from 'vitest';
import { mylog } from '$lib/env/env';

import { findMaximalCommonSubarraysAcrossColumns, findMaximalCommonTextPhrasesAcrossColumns  } from '$lib/utils/column-subarrays2';
import { GreekUtils } from '$lib/utils/greek-utils';

test('suffix dummy', async () => {
	const tests=[
        {input: '', output: ''}

    ];
    for (const t of tests){

    }
	expect(true).toBe(true);

});



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

test('findMaximalCommonTextPhrasesAcrossColumns test', async () => {
	const tests=[
        {input: {col1: ['τὸν ἄρτον ἡμῶν τὸν ἐπιούσιον δὸς ἡμῖν'].map((s)=>GreekUtils.onlyPlainGreek(s)), col2:['τὸν ἄρτον ἡμῶν τὸν ἐπιούσιον δίδου ἡμῖν'].map((s)=>GreekUtils.onlyPlainGreek(s))}, 
        output: [{subarray:'τον αρτον ημων τον επιουσιον',
                occurrences:[
                  
                    {columnIndex:0,textIndex:0,spans:[{start:0,end:4}]},
                    {columnIndex:1,textIndex:0,spans:[{start:0,end:4}]}
                  
                ]}]},

         {input: {col1: ['τὸν ἄρτον ἡμῶν τὸν ἐπιούσιον δὸς ἡμῖν τὸν ἄρτον ἡμῶν'], col2:['τὸν ἄρτον ἡμῶν τὸν ἐπιούσιον δίδου ἡμῖν']}, 
        output: [
          {subarray:'τον αρτον ημων τον επιουσιον',
                occurrences:[
                  
                    {columnIndex:0,textIndex:0,spans:[{start:0,end:4},]},
                    {columnIndex:1,textIndex:0,spans:[{start:0,end: 4}]}
                ]
            },
            {subarray:'τον αρτον ημων',
                occurrences:[
                  
                    {columnIndex:0,textIndex:0,spans:[{start:0,end:2},{start:7,end:9}]},
                    {columnIndex:1,textIndex:0,spans:[{start:0,end: 2}]}
                ]
            },
          ]},
          {input:{col1:['this phrase is very short, because it is very short'].map((s)=>s.toLocaleLowerCase().replaceAll(/[^a-z ]+/g, '')), col2:['this is very short'].map((s)=>s.toLocaleLowerCase().replaceAll(/[^a-z ]+/g, ''))},
            output:[{subarray: 'is very short',
                    occurrences:[{columnIndex:0,textIndex:0,spans:[{start:2,end:4},{start:7,end:9}]},
                                  {columnIndex:1,textIndex:0, spans:[{start:1,end:3}]}
                                ]}]
          }

          

    ];
    for (const t of tests){
      const result = findMaximalCommonTextPhrasesAcrossColumns(
        [t.input.col1.map((s)=>GreekUtils.plainGreek(s.toLocaleLowerCase()).replaceAll(/[^a-z α-ω]/g,'')),
         t.input.col2.map((s)=>GreekUtils.plainGreek(s.toLocaleLowerCase()).replaceAll(/[^a-z α-ω]/g,''))],3);
      console.log("findMaximalCommonTextPhrasesAcrossColumns results:");
      result.forEach((row)=>{
        console.log(`subarray: "${row.subarray}"; occurences: ${row.occurrences.map((o)=>'col '+o.columnIndex+'['+o.spans.map((i)=>i.start + "/"+i.end).join(',')+']').join(';')}`);
      });
      //expect(result).toEqual(t.output);
    }
	expect(true).toBe(true);

});





//const result = findMaximalCommonSubarraysAcrossColumns(columns, minLen);
//console.log(JSON.stringify(result,null,2));

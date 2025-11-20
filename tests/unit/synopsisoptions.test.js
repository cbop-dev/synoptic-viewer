import { describe, it, expect,test} from 'vitest';
import { mylog } from '$lib/env/env';
import * as SynClasses from '$lib/components/content/SynopsisClasses.svelte.js'
test('test test!', async () => {
    const tests =[];

    for (const [index,t] of tests){
        expect(true).toBe(true);
    }
    
    
});

test('options get/reset props test!', async () => {
    const tests ={
        "similarPhrases": {category: 'view', type: 'boolean'}

    }

    for (const [propname,row] of Object.entries(SynClasses.SynopsisOptions3.SynopsisUrlParamsMap)){
        if (row.type=='boolean'){
            const opts= new SynClasses.SynopsisOptions3();
            if (row.category=='view'){
                console.log(`testing propname '${propname}'`)
                expect(opts.viewOptions[propname]).toEqual(row.default ? row.default : false);
                const propVal = opts.getPropVal(propname);
                console.log(`Got propval(${propname}): `,propVal)
                expect(propVal).toEqual(false);
                opts.viewOptions[propname]=true;
                expect(opts.getPropVal(propname)).toBe(true);
                opts.resetProp(propname);
                expect(opts.getPropVal(propname)).toBe(false);
                opts.viewOptions[propname]=true;
                expect(opts.getPropVal(propname)).toBe(true);
                opts.reset();
                expect(opts.getPropVal(propname)).toBe(false);
            }
            
            
        }
        /*
        else if (row.type=='int'){
            const opts= new SynClasses.SynopsisOptions3();
            if (row.category=='view'){
                expect(opts.viewOptions[propname]).toEqual(0);
                const propVal = opts.getPropVal(propname);
                console.log(`Got propval(${propname}): `,propVal)
                expect(propVal).toEqual(0);
                opts.viewOptions[propname]=1;
                expect(opts.getPropVal(propname)).toEqual(1);
                opts.resetProp(propname);
                expect(opts.getPropVal(propname)).toEqual(0);
                opts.viewOptions[propname]=1;
                expect(opts.getPropVal(propname)).toEqual(1);
                opts.reset();
                expect(opts.getPropVal(propname)).toEqual(0);
            }
        }*/

    }
});


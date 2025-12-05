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
                //console.log(`testing propname '${propname}'`)
                expect(opts.viewOptions[propname]).toEqual(row.default ? row.default : false);
                const propVal = opts.getPropVal(propname);
                //console.log(`Got propval(${propname}): `,propVal)
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
 

    }
});

test('GospelFilter test!', async () => {
    const tests =[
        {flag: 1, hidden:[0], notHidden:[1,2,3]},
        {flag: 8, hidden:[3], notHidden:[0,1,2]},
        {flag: 6, hidden:[1,2], notHidden:[0,3]},
    ];


    for (const t of tests){
        const filter = new SynClasses.GospelFilter();
        filter.filter=t.flag;
        t.hidden.forEach((i)=>{
            expect(filter.isHidden(i)).toBe(true);
        })

        t.notHidden.forEach((i)=>{
            expect(filter.isHidden(i)).toBe(false);
        })
        
        const [matt,mark,luke,john]=SynClasses.GospelFilter.gospels.map((g,index)=>t.hidden.includes(index));
        const filter2=new SynClasses.GospelFilter(matt,mark,luke,john);

         t.hidden.forEach((i)=>{
            expect(filter2.isHidden(i)).toBe(true);
        })

        t.notHidden.forEach((i)=>{
            expect(filter2.isHidden(i)).toBe(false);
        })
    }
    
    
});
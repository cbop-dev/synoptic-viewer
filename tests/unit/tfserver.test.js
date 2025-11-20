import { describe, it, expect,test} from 'vitest';
//import { TfServer } from '$lib/components/content/TfUtils';
//import { N1904Server } from '$lib/n1904/tfN1904';
import { SblGntServer } from '$lib/sblgnt/sblgnt';
import { Lexeme } from '$lib/components/datastructures/lexeme';
import { mylog } from '$lib/env/env';
import gospelParallels from '@cbop-dev/aland-gospel-synopsis';
const sblgntServer = new SblGntServer();

test('dummy', async () => {
	
	expect(true).toBe(true);
	//await expect(page.locator('h1')).toBeVisible();
});

test('getLex', async () => {
	//925:βασιλεία
    const tests=[
        {id:925,plain:'βασιλεια', total:162, bookCounts:{"Matt":55}, refs:["Matt 4:8","Matt 3:2"], verseCount: 154}
    ]

    for (const t of tests){
        const lex = await sblgntServer.fetchLexInfo(t.id);
        expect(lex.id).toEqual(t.id);
        expect(lex.plain).toEqual(t.plain);

        const lexInfo = await sblgntServer.fetchRefs(t.id);
        expect(lexInfo.total).toEqual(t.total);
        //expect(lexInfo.plain).toEqual(lex.plain);
        expect(Object.keys(lexInfo.bookCounts).length).toEqual(17);
        expect(Object.keys(lexInfo.bookCounts).length).toEqual(17);
        Object.entries(t.bookCounts).forEach(([b,count])=>{
            expect(count).toEqual(lexInfo.bookCounts[b]);
        })

       expect(lexInfo.references.length).toEqual(t.verseCount); //of course, this may not be right. this was just a sanity check too see if we're close.
        t.refs.forEach((r)=>{
            //mylog(`checking getLex(${t.id}) refs at '${r}'`, true)
            expect(lexInfo.references.includes(r)).toBe(true);
        })

       // console.log(`refs(${lex.id}): ['${lexInfo.references.join("','")}']`);
    }
	expect(true).toBe(true);
	//await expect(page.locator('h1')).toBeVisible();
});
import { describe, it, expect,test} from 'vitest';
import { tfServer, TfServer } from '$lib/n1904/tfN1904';
import { mylog } from '$lib/env/env';

test('dummy', async () => {
	
	expect(true).toBe(true);
	//await expect(page.locator('h1')).toBeVisible();
});

describe('sum test', () => {
	it('adds 1 + 2 to equal 3', () => {
		expect(1 + 2).toBe(3);
	});
});


test('tfGetTextFromRange', async () => {
	const testData =[
        {book:"Matthew", chapter:"1",start:"1", end:"3", 
            output:"Βίβλος γενέσεως Ἰησοῦ Χριστοῦ υἱοῦ Δαυεὶδ υἱοῦ Ἀβραάμ. Ἀβραὰμ ἐγέννησεν τὸν Ἰσαάκ, Ἰσαὰκ δὲ ἐγέννησεν τὸν Ἰακώβ, Ἰακὼβ δὲ ἐγέννησεν τὸν Ἰούδαν καὶ τοὺς ἀδελφοὺς αὐτοῦ,"}
    ]
    for (const d of testData){
        const resp = await tfServer.tfGetTextFromRange(d.book,d.chapter,d.start,d.end)
        expect(resp.text).toEqual(d.output);
    }
    //tfServer.tfGetNodeFromRange()
	expect(true).toBe(true);
	//await expect(page.locator('h1')).toBeVisible();
});

test('fetchVerseTextByRef', async () => {
	const test = [ 
        {book: "Matthew", c: 1, v:1, text: "Βίβλος γενέσεως Ἰησοῦ Χριστοῦ υἱοῦ Δαυεὶδ υἱοῦ Ἀβραάμ." }

    ]

    for (const t of test){
        const text = await tfServer.fetchVerseTextByRef(t.book,String(t.c),String(t.v))
        expect(text).toEqual(t.text);
    }

    
	expect(true).toBe(true);
	//await expect(page.locator('h1')).toBeVisible();
});

/*
start=382714
    end=382716
	*/

    //getBookNameBySyn
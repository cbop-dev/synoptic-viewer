import { describe, it, expect,test} from 'vitest';
import { tfServer } from '$lib/n1904/tfN1904';
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

/*
start=382714
    end=382716
	*/
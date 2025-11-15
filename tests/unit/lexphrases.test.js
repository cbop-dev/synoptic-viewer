import { describe, it, expect,test} from 'vitest';
import { mylog } from '$lib/env/env';
import { GospelPericopeGroup, LexicalPhrase } from '$lib/components/content/parallelTexts.svelte';
/*
test('dummy test!', async () => {
	//console.log("MODE: " + import.meta.env.MODE);
	expect(import.meta.env.MODE).toEqual("test");
	//await expect(page.locator('h1')).toBeVisible();
});

*/

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
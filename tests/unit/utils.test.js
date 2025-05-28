import { describe, it, expect,test} from 'vitest';
import { tfServer, TfServer } from '$lib/n1904/tfN1904';
import { mylog } from '$lib/env/env';
import * as mathUtils from '$lib/utils/math-utils.js';


test('dummy', async () => {
	
	expect(true).toBe(true);
	//await expect(page.locator('h1')).toBeVisible();
});

test('createNumArrayFromStringListRange', async () => {
	
    const tests=[
        {ref: "2-12", array:[2,3,4,5,6,7,8,9,10,11,12]}
    ]

    for (const t of tests){
        const getArray = mathUtils.createNumArrayFromStringListRange(t.ref);
        expect(getArray).toEqual(t.array);

    }

	expect(true).toBe(true);
	//await expect(page.locator('h1')).toBeVisible();
});

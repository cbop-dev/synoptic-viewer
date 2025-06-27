import { describe, it, expect,test} from 'vitest';
import { tfServer, TfServer } from '$lib/n1904/tfN1904';
import { mylog } from '$lib/env/env';
import gospelParallels from '@cbop-dev/aland-gospel-synopsis';

test('test test!', async () => {
	//console.log("MODE: " + import.meta.env.MODE);
	expect(import.meta.env.MODE).toEqual("test");
	//await expect(page.locator('h1')).toBeVisible();
});

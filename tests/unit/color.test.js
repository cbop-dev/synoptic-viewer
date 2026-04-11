import { describe, it, expect, test } from 'vitest';
import { TfServer } from '$lib/components/content/TfUtils';
//import { N1904Server } from '$lib/n1904/tfN1904';
import { mylog } from '$lib/env/env';
import gospelParallels from '@cbop-dev/aland-gospel-synopsis';
import { GreekUtils } from '$lib/utils/greek-utils';
import { ColorUtils } from '$lib/utils/color-utils';
//const tfServer = new N1904Server();
test('dummy', async () => {

    expect(true).toBe(true);
    //await expect(page.locator('h1')).toBeVisible();
});


test('colorPalette', async () => {
    const tests=[
        {cols:2,len:2}

    ]

    for (const t of tests){
        const pal = ColorUtils.myColorPalette(t.cols, 0, 1,7);
        expect(pal.length).toEqual(t.len);
        
    }
    expect(true).toBe(true);
//return ColorUtils.myColorPalette(numMatchTypes, 0, 1,7);
});


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


import chroma from 'chroma-js';

test('colorPalette', async () => {
    const testSizes = [2, 5, 10, 25];

    for (const size of testSizes) {
        const pal = ColorUtils.myColorPalette(size);
        expect(pal.length).toEqual(size);

        for (let i = 0; i < pal.length; i++) {
            const item = pal[i];
            expect(item.bg).toBeDefined();
            expect(item.font).toBeDefined();
            expect(item.border).toBeDefined();

            // Font contrast check
            const contrast = chroma.contrast(item.bg, item.font);
            expect(contrast).toBeGreaterThanOrEqual(3.0);

            // Neighbor perceptual distinction check
            if (i > 0) {
                const prevBg = pal[i - 1].bg;
                const deltaE = chroma.deltaE(item.bg, prevBg);
                // Delta E > 15 guarantees distinct visual difference to human eyes
                expect(deltaE).toBeGreaterThan(15);
            }
        }
    }
});



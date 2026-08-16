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
    const testSizes = [2, 5, 12];

    for (const size of testSizes) {
        const pal = ColorUtils.myColorPalette(size, 1, 1, 7);
        expect(pal.length).toEqual(size);

        for (let i = 0; i < pal.length; i++) {
            const item = pal[i];
            expect(item.bg).toBeDefined();
            expect(item.font).toBeDefined();
            expect(item.border).toBeDefined();

            // Font contrast check
            const contrast = chroma.contrast(item.bg, item.font);
            expect(contrast).toBeGreaterThanOrEqual(3.0);

            // Pairwise distinction checks against all other items in palette
            for (let j = 0; j < pal.length; j++) {
                if (i !== j) {
                    const deltaE = chroma.deltaE(item.bg, pal[j].bg);
                    // Every pair in palette (size <= 12) must have perceptual delta E >= 10
                    expect(deltaE).toBeGreaterThanOrEqual(10.0);
                }
            }

            // Neighbor perceptual distinction check
            if (i > 0) {
                const prevBg = pal[i - 1].bg;
                const deltaE = chroma.deltaE(item.bg, prevBg);
                expect(deltaE).toBeGreaterThan(15);
            }
        }
    }

    // Specific check for size 12
    const pal12 = ColorUtils.myColorPalette(12, 1, 1, 7);
    const deltaE68 = chroma.deltaE(pal12[6].bg, pal12[8].bg);
    expect(deltaE68).toBeGreaterThan(15);
    // Index 2 (#9d6fb8 - dark purple) must have white font
    expect(pal12[2].font).toEqual('white');
    // Index 0 (#e44667 - warm coral/red) preserves crisp black font
    expect(pal12[0].font).toEqual('black');
});




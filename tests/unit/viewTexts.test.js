import { describe, it, expect, test } from 'vitest';
import { SblGntServer } from '$lib/sblgnt/sblgnt.js';
import { N1904Server } from '$lib/n1904/tfN1904.js';

describe('ViewTexts reference lookup', () => {
    test('Look up text for Gospel reference (Matt 4:8)', async () => {
        const sbl = new SblGntServer();
        const bcvArray = sbl.getBCVarrayFromRefs(['Matt 4:8']);
        expect(bcvArray.length).toBe(1);
        expect(bcvArray[0].book).toBe('Matthew');
        expect(bcvArray[0].chapter).toBe(4);
        expect(bcvArray[0].verses).toEqual([8]);

        const response = await sbl.getTexts(bcvArray, false, false, sbl.showNotes);
        expect(response).toBeDefined();
        expect(response.texts.length).toBe(1);
        expect(response.texts[0].text.length).toBeGreaterThan(0);
        expect(response.texts[0].text).toContain('βασιλείας');
    });

    test('Look up text for non-Gospel reference (Acts 1:20)', async () => {
        const sbl = new SblGntServer();
        const bcvArray = sbl.getBCVarrayFromRefs(['Acts 1:20']);
        expect(bcvArray.length).toBe(1);
        expect(bcvArray[0].book).toBe('Acts');
        expect(bcvArray[0].chapter).toBe(1);
        expect(bcvArray[0].verses).toEqual([20]);

        const response = await sbl.getTexts(bcvArray, false, false, sbl.showNotes);
        expect(response).toBeDefined();
        expect(response.texts.length).toBe(1);
        expect(response.texts[0].text.length).toBeGreaterThan(0);
        expect(response.texts[0].text.toLowerCase()).toContain('βίβλῳ ψαλμῶν');
    });

    test('fetchText with reference string', async () => {
        const sbl = new SblGntServer();
        const resp = await sbl.fetchText('Acts 1:20');
        expect(resp).toBeDefined();
        expect(resp.text).toBeDefined();
        expect(resp.text.length).toBeGreaterThan(0);
        expect(resp.text.toLowerCase()).toContain('βίβλῳ ψαλμῶν');
    });
});

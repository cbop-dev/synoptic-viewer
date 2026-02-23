import { describe, it, expect, test } from 'vitest';
import { TfServer } from '$lib/components/content/TfUtils';
import { N1904Server } from '$lib/n1904/tfN1904';
import { mylog } from '$lib/env/env';
import gospelParallels from '@cbop-dev/aland-gospel-synopsis';
import { GreekUtils } from '$lib/utils/greek-utils';
const tfServer = new N1904Server();
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
    const testData = [
        {
            book: "Matthew", chapter: "1", start: "1", end: "3", showVerses: false,
            output: "Βίβλος γενέσεως Ἰησοῦ Χριστοῦ υἱοῦ Δαυεὶδ υἱοῦ Ἀβραάμ. Ἀβραὰμ ἐγέννησεν τὸν Ἰσαάκ, Ἰσαὰκ δὲ ἐγέννησεν τὸν Ἰακώβ, Ἰακὼβ δὲ ἐγέννησεν τὸν Ἰούδαν καὶ τοὺς ἀδελφοὺς αὐτοῦ, Ἰούδας δὲ ἐγέννησεν τὸν Φαρὲς καὶ τὸν Ζαρὰ ἐκ τῆς Θάμαρ, Φαρὲς δὲ ἐγέννησεν τὸν Ἐσρώμ, Ἐσρὼμ δὲ ἐγέννησεν τὸν Ἀράμ,"
        },
        {
            book: "Matthew", chapter: "1", start: "1", end: "3", showVerses: true,
            output: "(1) Βίβλος γενέσεως Ἰησοῦ Χριστοῦ υἱοῦ Δαυεὶδ υἱοῦ Ἀβραάμ. (2) Ἀβραὰμ ἐγέννησεν τὸν Ἰσαάκ, Ἰσαὰκ δὲ ἐγέννησεν τὸν Ἰακώβ, Ἰακὼβ δὲ ἐγέννησεν τὸν Ἰούδαν καὶ τοὺς ἀδελφοὺς αὐτοῦ, (3) Ἰούδας δὲ ἐγέννησεν τὸν Φαρὲς καὶ τὸν Ζαρὰ ἐκ τῆς Θάμαρ, Φαρὲς δὲ ἐγέννησεν τὸν Ἐσρώμ, Ἐσρὼμ δὲ ἐγέννησεν τὸν Ἀράμ,"
        }

    ]
    for (const d of testData) {
        const resp = await tfServer.tfGetTextFromRange(d.book, d.chapter, d.start, d.end, d.showVerses)
        expect(resp.text).toEqual(d.output);
    }
    //tfServer.tfGetNodeFromRange()
    expect(true).toBe(true);
    //await expect(page.locator('h1')).toBeVisible();
});

test('fetchVerseTextByRef', async () => {
    const test = [
        { book: "Matthew", c: 1, v: 1, text: "Βίβλος γενέσεως Ἰησοῦ Χριστοῦ υἱοῦ Δαυεὶδ υἱοῦ Ἀβραάμ." }

    ]

    for (const t of test) {
        const text = await tfServer.fetchVerseTextByRef(t.book, String(t.c), String(t.v))
        expect(GreekUtils.normalize(text)).toEqual(GreekUtils.normalize(t.text));
    }


    expect(true).toBe(true);
    //await expect(page.locator('h1')).toBeVisible();
});


test('getAlandSectionText', async () => {
    const test = [
        { per: 32, matt: "" }
    ]
    expect(true).toBe(true);
    //await expect(page.locator('h1')).toBeVisible();
});

test('sortAland ', async () => {
    const tests = [
        //   {ref: "Matt 28:17", sort=gPar.gospels.MATTHEWalands: [359,364]},
        //{ref: "Mt 28:17", alands: [359,364]},
        // {sec: 16, primary: gPar.gospels.LUKE, alands: [294, 287, 288, 289, 290, 291, 292, 293, 295]},
        {
            input: [287, 288, 289, 290, 291, 294, 292, 293, 295], output: [291, 294, 287, 288, 289, 290, 292, 293, 295],
            primary: gospelParallels.gospels.names.LUKE
        },
        {
            input: [20, 65, 51], output: [20, 51, 65],
            primary: gospelParallels.gospels.names.MATTHEW
        },
        {
            input: [13, 14, 15, 16, 17, 18, 19, 20], output: [13, 14, 15, 16, 18, 19, 20, 17,],
            primary: gospelParallels.gospels.names.MARK
        }

    ]

    for (const t of tests) {

        //const output = t.input.toSorted((a,b)=>gPar.sortByPrimaryFunc(a,b,t.primary));
        gospelParallels.sortAlandPericopes(t.input, t.primary)
        expect(t.input.length).toEqual(t.output.length);
        expect(t.input).toEqual(t.output);
    }
});
//todo: finish this test
test('getLex text', async () => {
    const tests = [
        { id: 32, lemma: "fred" }
    ]
    //todo: finish this!
    for (const t of tests) {
        // expect(TfServer.getLexeme(t.id)).toBe(t.lemma);
    }

    //await expect(page.locator('h1')).toBeVisible();
});



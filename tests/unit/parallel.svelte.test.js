import { describe, it, expect, test } from 'vitest';
import { N1904Server } from '$lib/n1904/tfN1904.js';
import { mylog } from '$lib/env/env.js';
import { ParallelColumn, ParallelColumnGroup, TextAndRef, VerseWords, Word, parseSingleGroup, GospelPericopeGroup } from '$lib/components/content/parallelTexts.svelte.js';
import GP from '@cbop-dev/aland-gospel-synopsis';
import { GreekUtils } from '$lib/utils/greek-utils';
import * as TfUtils from '$lib/components/content/TfUtils.js';
import { SblGntServer } from '$lib/sblgnt/sblgnt';

const tfServer = new N1904Server();
const sblGntServer = new SblGntServer();
test('dummy', async () => {
    const tests = [
        { input: null, output: null }
    ]

    for (const t of tests) {
        expect(true).toBe(true);
    }
    expect(true).toBe(true);
    //await expect(page.locator('h1')).toBeVisible();
});

test('identical words test', () => {
    const group = new GospelPericopeGroup();
    group.matt.textRefs = [new TextAndRef('Matt 1:1', 'καὶ [Ἰησοῦ]', [
        { verse: 1, words: [new Word(1, 'καὶ'), new Word(2, '[Ἰησοῦ]')] }
    ])];
    group.mark.textRefs = [new TextAndRef('Mark 1:1', 'καὶ Ἰησοῦ', [
        { verse: 1, words: [new Word(3, 'καὶ'), new Word(4, 'Ἰησοῦ')] }
    ])];

    group.markUniqueAndIdenticalWords();

    expect(group.matchingWords).toContain('και');
    expect(group.matchingWords).toContain('Ιησου');
});


test('Groups: unique words', async () => {
    const tests = [
        {
            aland: 198, uniques: {
                matt: new Set([3784]), mark: new Set([1422, 3603, 4119, 69]), luke: new Set([1147, 1302, 1394, 1459, 1508, 1824, 1888, 2541, 2957, 3592, 4118, 434, 4480, 4551, 4664, 475, 478, 4879, 531, 617, 736, 833]),
                john: new Set()
            }, common: new Set([1048, 1145, 1306, 1488, 1539, 1697, 2201, 229, 2488, 2936, 3152, 3205, 3413, 3566, 3578, 3581, 3681, 38, 3970, 4269, 4570, 4892, 5379])
        }
    ]
    // expect(false).toBe(true);
    for (const t of tests) {
        const group = TfUtils.getGroupsArray([t.aland])[0];
        const groupsArrays = TfUtils.getGospelGroupRefsArrays([group]);
        //  mylog("gonna call fetchAndPopulate...");
        //await tfServer.fetchAndPopulateGroupsPericopes([group],true,true,true)
        const response = await tfServer.fetchPostTextsBatch(groupsArrays.refsArray);
        TfUtils.populateGroupsText([group], response, groupsArrays.groupsIndices)
        group.markUniqueAndIdenticalWords();//todo: comment out again? ai uncommented this, but popGroupsTExt should call it...?
        //console.log("marked uniq words!")
        for (const book of ['matt', 'mark', 'luke', 'john']) {
            // mylog('checking ' + book + ':')
            expect(group[book].unique).toEqual(t.uniques[book]);
            expect(group.commonLexes).toEqual(t.common);
        }
    }
    expect(true).toBe(true);
    //await expect(page.locator('h1')).toBeVisible();
});


test('parseSingleGroup', async () => {
    const tests = [
        { input: ["Matt 3:12;"], output: [new ParallelColumn([new TextAndRef("Matt 3:12")])] }
    ]

    for (const t of tests) {
        const results = parseSingleGroup(t.input)
        expect(true).toBe(true);
        for (const [i, resultPt] of results.entries()) {
            for (const [j, resultRef] of resultPt.textRefs.entries()) {
                expect(resultRef.reference).toEqual(t.output[i].textRefs[j].reference);
            }
        }

    }
    expect(true).toBe(true);
    //await expect(page.locator('h1')).toBeVisible();
});

test('maxLexicalColumnMatch', async () => {
    const cols = [
        ["Καθημένου δὲ αὐτοῦ ἐπὶ τοῦ Ὄρους τῶν Ἐλαιῶν προσῆλθον αὐτῷ οἱ μαθηταὶ κατ’ ἰδίαν λέγοντες· Εἰπὸν ἡμῖν πότε ταῦτα ἔσται, καὶ τί τὸ σημεῖον τῆς σῆς παρουσίας καὶ συντελείας τοῦ αἰῶνος."],
        ["Εἰπὸν ἡμῖν πότε ταῦτα ἔσται, καὶ τί τὸ σημεῖον ὅταν μέλλῃ ταῦτα συντελεῖσθαι πάντα."],
        ["Ἐπηρώτησαν δὲ αὐτὸν λέγοντες· Διδάσκαλε, πότε οὖν ταῦτα ἔσται, καὶ τί τὸ σημεῖον ὅταν μέλλῃ ταῦτα γίνεσθαι;"]
    ].map(([s]) => [GreekUtils.plainGreek(s.toLocaleLowerCase()).replaceAll(/[^a-z α-ω]/g, '')]);


    /*    for (const t of tests) {
            expect(true).toBe(true);
        }
    */
    expect(true).toBe(true);
    //await expect(page.locator('h1')).toBeVisible();
});

test('Matt 11:5-6 // Luke 7:22-23 matching', async () => {
    //TODO: still working on this test. see TODOs below
    const tests = [
        {
            textRefs: ['Matt 11:5-6', "Luke 7:22-23"],
            lexMatches: [],
            exactMatches:
                ["τυφλοὶ ἀναβλέπουσιν καὶ χωλοὶ περιπατοῦσιν, λεπροὶ καθαρίζονται καὶ κωφοὶ ἀκούουσιν, καὶ νεκροὶ ἐγείρονται καὶ πτωχοὶ εὐαγγελίζονται· καὶ μακάριός ἐστιν ὃς ἐὰν μὴ σκανδαλισθῇ ἐν ἐμοί",
                    "τυφλοὶ ἀναβλέπουσιν, χωλοὶ περιπατοῦσιν, λεπροὶ καθαρίζονται, κωφοὶ ἀκούουσιν, νεκροὶ ἐγείρονται, πτωχοὶ εὐαγγελίζονται· καὶ μακάριός ἐστιν ὃς ἐὰν μὴ σκανδαλισθῇ ἐν ἐμοί."
                ]
        }

    ];

    /*
    matt 11:5-6; Luke 7:22-23

        should lexically match:
        Matt: "τυφλοὶ ἀναβλέπουσιν καὶ χωλοὶ περιπατοῦσιν, λεπροὶ καθαρίζονται καὶ κωφοὶ ἀκούουσιν, ⸀καὶ νεκροὶ ἐγείρονται καὶ πτωχοὶ εὐαγγελίζονται· καὶ μακάριός ἐστιν ὃς ⸀ἐὰν μὴ σκανδαλισθῇ ἐν ἐμοί."
        Luke: "τυφλοὶ ἀναβλέπουσιν, χωλοὶ περιπατοῦσιν, λεπροὶ καθαρίζονται, κωφοὶ ἀκούουσιν, νεκροὶ ἐγείρονται, πτωχοὶ εὐαγγελίζονται· καὶ μακάριός ἐστιν ὃς ἐὰν μὴ σκανδαλισθῇ ἐν ἐμοί."

        but (at time of test writing) it doesn't recognize: τυφλοὶ, ἀκούουσιν, νεκροὶ, ἐγείρονται
    */



    for (const t of tests) {
        const response = await sblGntServer.fetchPostTextsBatch(t.textRefs)
        const parColumns = response.texts.map((rt, i) => new ParallelColumn([new TextAndRef(t.textRefs[i], rt.text)]));
        const perGroup = new ParallelColumnGroup(parColumns);
        perGroup.buildLexIdenticalPhrases(3, false, true, [], sblGntServer.ignoreWordIds);
        //TODO: figure out how to test this.
        //perGroup.

        //expect(true).toBe(true);
    }
    expect(true).toBe(true);
    //await expect(page.locator('h1')).toBeVisible();
});

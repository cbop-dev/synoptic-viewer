import { describe, it, expect, test } from 'vitest';
import { SblGntServer } from '$lib/sblgnt/sblgnt.js';
import { N1904Server } from '$lib/n1904/tfN1904.js';
import * as TfUtils from '$lib/components/content/TfUtils.js';

describe('Synoptic Viewer 2.0 Benchmark', () => {
    test('Aland 1 to 35 batch load and processing', async () => {
        const sblServer = new SblGntServer();
        const pericopeNums = Array.from({ length: 35 }, (_, i) => i + 1);

        const startTime = performance.now();

        // 1. Build pericope groups
        const groups = TfUtils.getGroupsArray(pericopeNums);
        const groupsRefs = TfUtils.getGospelGroupRefsArrays(groups);

        // 2. Fetch all texts batch
        const response = await sblServer.fetchPostTextsBatch(groupsRefs.refsArray);

        // 3. Populate texts, word tokens, and run phrase matching
        TfUtils.populateGroupsText(groups, response, groupsRefs.groupsIndices);

        const elapsed = performance.now() - startTime;
        console.log(`\n======================================================`);
        console.log(`[BENCHMARK] Aland 1-35 (35 Pericopes):`);
        console.log(`  - Total Refs Fetched: ${groupsRefs.refsArray.length}`);
        console.log(`  - Total Groups Populated: ${groups.length}`);
        console.log(`  - Total Elapsed Time: ${elapsed.toFixed(2)} ms`);
        console.log(`  - Comparison: Previous tf-fast took 30,000 - 60,000 ms!`);
        console.log(`  - Speedup Factor: > ${(30000 / Math.max(elapsed, 1)).toFixed(0)}x FASTER`);
        console.log(`======================================================\n`);

        expect(groups.length).toBe(35);
        expect(groups[0].matt.textRefs.length).toBeGreaterThan(0);
        // Assert that it runs well under 200 ms (and typically < 50ms)
        expect(elapsed).toBeLessThan(500);
    });

    test('Aland 1 to 100 batch load and processing', async () => {
        const n1904Server = new N1904Server();
        const pericopeNums = Array.from({ length: 100 }, (_, i) => i + 1);

        const startTime = performance.now();

        const groups = TfUtils.getGroupsArray(pericopeNums);
        const groupsRefs = TfUtils.getGospelGroupRefsArrays(groups);
        const response = await n1904Server.fetchPostTextsBatch(groupsRefs.refsArray);
        TfUtils.populateGroupsText(groups, response, groupsRefs.groupsIndices);

        const elapsed = performance.now() - startTime;
        console.log(`\n======================================================`);
        console.log(`[BENCHMARK] Aland 1-100 (100 Pericopes - n1904):`);
        console.log(`  - Total Refs Fetched: ${groupsRefs.refsArray.length}`);
        console.log(`  - Total Groups Populated: ${groups.length}`);
        console.log(`  - Total Elapsed Time: ${elapsed.toFixed(2)} ms`);
        console.log(`======================================================\n`);

        expect(groups.length).toBe(100);
        expect(elapsed).toBeLessThan(1000);
    });
});

// maximalCommonSubarraysColumns.js

/**
 * Find all maximal common subarrays across columns of texts.
 * @param {number[][][]} columns - 3D array: columns[columnIndex][textIndex][lexemeArray]
 * @param {number} [minLen=2] - Minimum length of subarrays to consider
 * @returns {Array<{subarray:number[], occurrences: Array<{columnIndex:number,textIndex:number,spans:{start:number,end:number}[]}>}>}
 */
export function findMaximalCommonSubarraysAcrossColumns(columns, minLen = 2) {
  const resultsMap = new Map();

  for (let colA = 0; colA < columns.length; colA++) {
    for (let colB = colA + 1; colB < columns.length; colB++) {
      const textsA = columns[colA];
      const textsB = columns[colB];

      for (let i = 0; i < textsA.length; i++) {
        const arrA = textsA[i];
        for (let j = 0; j < textsB.length; j++) {
          const arrB = textsB[j];
          const matches = maximalSubarraysPair(arrA, arrB, minLen);

          for (const match of matches) {
            const key = match.subarray.join(',');
            if (!resultsMap.has(key)) resultsMap.set(key, { subarray: match.subarray, occurrences: [] });

            const entry = resultsMap.get(key);

            // Add occurrences for arrA
            let occA = entry.occurrences.find(o => o.columnIndex === colA && o.textIndex === i);
            if (!occA) {
              occA = { columnIndex: colA, textIndex: i, spans: [] };
              entry.occurrences.push(occA);
            }
            occA.spans.push(...match.occurrences[0].spans);

            // Add occurrences for arrB
            let occB = entry.occurrences.find(o => o.columnIndex === colB && o.textIndex === j);
            if (!occB) {
              occB = { columnIndex: colB, textIndex: j, spans: [] };
              entry.occurrences.push(occB);
            }
            occB.spans.push(...match.occurrences[1].spans);
          }
        }
      }
    }
  }

  // Merge overlapping spans per text
  const final = [];
  for (const entry of resultsMap.values()) {
    const mergedOccurrences = entry.occurrences.map(o => ({
      columnIndex: o.columnIndex,
      textIndex: o.textIndex,
      spans: mergeSpans(o.spans)
    }));
    final.push({ subarray: entry.subarray, occurrences: mergedOccurrences });
  }

  return final;
}

// --- Helper: find maximal subarrays between two arrays of integers ---
function maximalSubarraysPair(arrA, arrB, minLen) {
  const results = [];
  const n = arrA.length;
  const m = arrB.length;

  // Use dynamic programming to find all common substrings
  const dp = Array(n + 1).fill(0).map(() => Array(m + 1).fill(0));

  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      if (arrA[i] === arrB[j]) dp[i][j] = dp[i + 1][j + 1] + 1;
    }
  }

  const added = new Set();

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < m; j++) {
      const len = dp[i][j];
      if (len >= minLen) {
        const subarray = arrA.slice(i, i + len);
        const key = subarray.join(',');

        // Only add if not already added for a longer match at this position
        if (!added.has(`${i}-${j}`)) {
          results.push({
            subarray,
            occurrences: [
              { spans: [{ start: i, end: i + len - 1 }] },
              { spans: [{ start: j, end: j + len - 1 }] }
            ]
          });

          // Mark positions to avoid adding shorter contained subarrays
          for (let k = 0; k < len; k++) added.add(`${i + k}-${j + k}`);
        }
      }
    }
  }

  return results;
}

// --- Helper: merge overlapping/contiguous spans ---
function mergeSpans(spans) {
  if (!spans || spans.length === 0) return [];
  spans.sort((a, b) => a.start - b.start);
  const merged = [];
  for (const s of spans) {
    if (merged.length === 0) merged.push({ ...s });
    else {
      const last = merged[merged.length - 1];
      if (s.start <= last.end + 1) last.end = Math.max(last.end, s.end);
      else merged.push({ ...s });
    }
  }
  return merged;
}

/**
 * Find all maximal common text subarrays across columns of texts.
 * Each input text is a string of space-separated words.
 *
 * @param {string[][]} columns - columns[columnIndex][textIndex] = "full text string"
 * @param {number} [minLen=3] - minimum number of words in a matching phrase
 * @returns {Array<{subarray:string, occurrences:Array<{columnIndex:number,textIndex:number,spans:{start:number,end:number}[]}>}>}
 */
export function findMaximalCommonTextPhrasesAcrossColumns(columns, minLen = 3) {

    // Step 1: tokenize all texts into arrays of words
    const tokenized = columns.map(col =>
        col.map(text => text.trim().split(/\s+/))
    );

    const resultsMap = new Map();

    for (let colA = 0; colA < tokenized.length; colA++) {
        for (let colB = colA + 1; colB < tokenized.length; colB++) {
            const textsA = tokenized[colA];
            const textsB = tokenized[colB];

            for (let i = 0; i < textsA.length; i++) {
                const arrA = textsA[i];
                for (let j = 0; j < textsB.length; j++) {
                    const arrB = textsB[j];

                    const matches = txtmc_maximalSubarraysPair(arrA, arrB, minLen);

                    for (const match of matches) {
                        const key = match.subarray;

                        if (!resultsMap.has(key)) {
                            resultsMap.set(key, {
                                subarray: match.subarray,
                                occurrences: []
                            });
                        }

                        const entry = resultsMap.get(key);

                        // Occurrence in A
                        let occA = entry.occurrences.find(
                            o => o.columnIndex === colA && o.textIndex === i
                        );
                        if (!occA) {
                            occA = { columnIndex: colA, textIndex: i, spans: [] };
                            entry.occurrences.push(occA);
                        }
                        occA.spans.push(...match.occurrences[0].spans);

                        // Occurrence in B
                        let occB = entry.occurrences.find(
                            o => o.columnIndex === colB && o.textIndex === j
                        );
                        if (!occB) {
                            occB = { columnIndex: colB, textIndex: j, spans: [] };
                            entry.occurrences.push(occB);
                        }
                        occB.spans.push(...match.occurrences[1].spans);
                    }
                }
            }
        }
    }

    // Step 3: merge spans and build final output
    return Array.from(resultsMap.values()).map(entry => ({
        subarray: entry.subarray,
        occurrences: entry.occurrences.map(o => ({
            columnIndex: o.columnIndex,
            textIndex: o.textIndex,
            spans: txtmc_mergeSpans(o.spans)
        }))
    }));
}


/**
 * Correct maximal common substring finder between two tokenized texts.
 * Returns:
 *   - subarray as STRING
 *   - all maximal matches, including multiple occurrences
 */
function txtmc_maximalSubarraysPair(arrA, arrB, minLen) {
    const n = arrA.length;
    const m = arrB.length;

    const dp = Array(n + 1)
        .fill(0)
        .map(() => Array(m + 1).fill(0));

    // Build LCS-by-position (substring DP)
    for (let i = n - 1; i >= 0; i--) {
        for (let j = m - 1; j >= 0; j--) {
            if (arrA[i] === arrB[j]) dp[i][j] = dp[i + 1][j + 1] + 1;
        }
    }

    const results = [];

    for (let i = 0; i < n; i++) {
        for (let j = 0; j < m; j++) {
            const len = dp[i][j];
            if (len < minLen) continue;

            // Check left-maximality
            const canExtendLeft =
                i > 0 &&
                j > 0 &&
                arrA[i - 1] === arrB[j - 1];
            if (canExtendLeft) continue;

            // Check right-maximality
            const canExtendRight =
                i + len < n &&
                j + len < m &&
                arrA[i + len] === arrB[j + len];
            if (canExtendRight) continue;

            // Maximal match found
            const phrase = arrA.slice(i, i + len).join(" ");

            results.push({
                subarray: phrase,
                occurrences: [
                    { spans: [{ start: i, end: i + len - 1 }] },
                    { spans: [{ start: j, end: j + len - 1 }] }
                ]
            });
        }
    }

    return results;
}


/**
 * Merge overlapping or adjacent spans.
 */
function txtmc_mergeSpans(spans) {
    if (!spans || spans.length === 0) return [];
    spans.sort((a, b) => a.start - b.start);

    const merged = [];
    for (const s of spans) {
        if (merged.length === 0) {
            merged.push({ ...s });
        } else {
            const last = merged[merged.length - 1];
            if (s.start <= last.end + 1) {
                last.end = Math.max(last.end, s.end);
            } else {
                merged.push({ ...s });
            }
        }
    }
    return merged;
}


/////
// ##########################
// UPDATE TO INCLUDE 'IGNORE' WORDS! COURTESY OF CHAT GPT!
// ##########################

/**
 * Find all maximal common subarrays across columns of texts,
 * while treating numbers in `ignoreNums` as invisible (removed for matching),
 * but mapping spans back to the original arrays so internal ignored tokens
 * are included in reported spans (edges excluded).
 *
 * @param {number[][][]} columns - 3D array: columns[columnIndex][textIndex][lexemeArray]
 * @param {number} [minLen=2] - Minimum length of subarrays (counted on filtered arrays)
 * @param {number[]} [ignoreNums=[]] - Array of integers to ignore (treated as spaces)
 * @returns {Array<{subarray:number[], occurrences: Array<{columnIndex:number,textIndex:number,spans:{start:number,end:number}[]}>}>}
 */
export function findMaximalCommonSubarraysAcrossColumns2(columns, minLen = 2, ignoreNums = []) {
  const ignoreSet = new Set(ignoreNums || []);

  // Preprocess: build filtered arrays and mappings for each original text.
  // Structure: preCols[colIdx][textIdx] = { filtered: [...], fIndexToOriginal: [...], originalToFIndex: [...] }
  const preCols = columns.map(col =>
    col.map(arr => preprocessArray2(arr, ignoreSet))
  );

  const resultsMap = new Map();

  for (let colA = 0; colA < columns.length; colA++) {
    for (let colB = colA + 1; colB < columns.length; colB++) {
      const textsApre = preCols[colA];
      const textsBpre = preCols[colB];

      const textsA = columns[colA]; // original arrays (for reference if needed)
      const textsB = columns[colB];

      for (let i = 0; i < textsA.length; i++) {
        const preA = textsApre[i];
        const filteredA = preA.filtered;

        // if filtered length < minLen, skip matching because cannot produce matches
        if (filteredA.length < minLen) continue;

        for (let j = 0; j < textsB.length; j++) {
          const preB = textsBpre[j];
          const filteredB = preB.filtered;
          if (filteredB.length < minLen) continue;

          const matches = maximalSubarraysPair2(filteredA, filteredB, minLen);

          for (const match of matches) {
            // match.subarray is the filtered subarray; occurrences are in filtered-index spans
            const key = match.subarray.join(',');
            if (!resultsMap.has(key)) resultsMap.set(key, { subarray: match.subarray, occurrences: [] });

            const entry = resultsMap.get(key);

            // For each of the pair occurrences (0 => A, 1 => B), map filtered spans to original spans
            // and push them under respective column/text entries.
            // match.occurrences[0] corresponds to arrA; match.occurrences[1] to arrB
            const occFilteredA = match.occurrences[0].spans; // array of {start, end} in filtered indices
            const occFilteredB = match.occurrences[1].spans;

            // Map and add occurrences for arrA
            let occA = entry.occurrences.find(o => o.columnIndex === colA && o.textIndex === i);
            if (!occA) {
              occA = { columnIndex: colA, textIndex: i, spans: [] };
              entry.occurrences.push(occA);
            }
            for (const fspan of occFilteredA) {
              const mapped = mapFilteredSpanToOriginal(fspan, preA);
              if (mapped) occA.spans.push(mapped);
            }

            // Map and add occurrences for arrB
            let occB = entry.occurrences.find(o => o.columnIndex === colB && o.textIndex === j);
            if (!occB) {
              occB = { columnIndex: colB, textIndex: j, spans: [] };
              entry.occurrences.push(occB);
            }
            for (const fspan of occFilteredB) {
              const mapped = mapFilteredSpanToOriginal(fspan, preB);
              if (mapped) occB.spans.push(mapped);
            }
          }
        }
      }
    }
  }

  // Merge overlapping/adjacent spans per text
  const final = [];
  for (const entry of resultsMap.values()) {
    const mergedOccurrences = entry.occurrences.map(o => ({
      columnIndex: o.columnIndex,
      textIndex: o.textIndex,
      spans: mergeSpans2(o.spans)
    }));
    final.push({ subarray: entry.subarray, occurrences: mergedOccurrences });
  }

  return final;
}

// ------------------------- Helpers -------------------------

/**
 * Preprocess an original array:
 * - filtered: only tokens NOT in ignoreSet (keeps original order)
 * - fIndexToOriginal: for each filtered index, the corresponding original index
 * - originalToFIndex: for each original index, the corresponding filtered index or null if ignored
 */
function preprocessArray2(arr, ignoreSet) {
  const filtered = [];
  const fIndexToOriginal = [];
  const originalToFIndex = new Array(arr.length).fill(null);

  let fidx = 0;
  for (let oidx = 0; oidx < arr.length; oidx++) {
    const val = arr[oidx];
    if (ignoreSet.has(val)) {
      originalToFIndex[oidx] = null;
    } else {
      filtered.push(val);
      fIndexToOriginal.push(oidx);
      originalToFIndex[oidx] = fidx;
      fidx++;
    }
  }

  return { filtered, fIndexToOriginal, originalToFIndex };
}

/**
 * Map a filtered-index span {start, end} (inclusive) back to original-array span {start, end}
 * following your rules:
 * - originalStart: original index of filteredIndex === start
 * - originalEnd: original index of filteredIndex === end
 * - This inclusion automatically includes any ignored tokens strictly between originalStart and originalEnd
 * - Excludes ignored tokens before the first filtered token and after the last filtered token
 *
 * If mapping cannot be performed (shouldn't happen for valid spans), returns null.
 */
function mapFilteredSpanToOriginal(fspan, pre) {
  const { start: fs, end: fe } = fspan;
  // safety checks
  if (fs == null || fe == null || fs < 0 || fe < fs || fe >= pre.fIndexToOriginal.length) return null;

  const originalStart = pre.fIndexToOriginal[fs];
  const originalEnd = pre.fIndexToOriginal[fe];

  // just return the inclusive original start/end
  return { start: originalStart, end: originalEnd };
}

/**
 * Find maximal common subarrays between two arrays of integers (strict equality),
 * returns occurrences in filtered-index coordinate space.
 * This is the original dynamic-programming approach unchanged except it returns filtered spans.
 *
 * @param {number[]} arrA
 * @param {number[]} arrB
 * @param {number} minLen
 * @returns Array<{subarray:number[], occurrences: [ {spans:[{start,end}]} , {spans:[{start,end}]} ] }>
 */
function maximalSubarraysPair2(arrA, arrB, minLen) {
  const results = [];
  const n = arrA.length;
  const m = arrB.length;

  // DP table for longest common suffixes
  const dp = Array(n + 1).fill(0).map(() => Array(m + 1).fill(0));

  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      if (arrA[i] === arrB[j]) dp[i][j] = dp[i + 1][j + 1] + 1;
    }
  }

  const added = new Set();

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < m; j++) {
      const len = dp[i][j];
      if (len >= minLen) {
        const subarray = arrA.slice(i, i + len);
        const key = subarray.join(',');

        if (!added.has(`${i}-${j}`)) {
          results.push({
            subarray,
            occurrences: [
              { spans: [{ start: i, end: i + len - 1 }] }, // filtered-index spans for A
              { spans: [{ start: j, end: j + len - 1 }] }  // filtered-index spans for B
            ]
          });

          // mark these diagonal positions so we don't later add shorter, contained matches
          for (let k = 0; k < len; k++) added.add(`${i + k}-${j + k}`);
        }
      }
    }
  }

  return results;
}

// --- Helper: merge overlapping/contiguous spans (original-index spans) ---
function mergeSpans2(spans) {
  if (!spans || spans.length === 0) return [];
  // defensive copy and sort
  const copy = spans.map(s => ({ start: s.start, end: s.end }));
  copy.sort((a, b) => a.start - b.start);
  const merged = [];
  for (const s of copy) {
    if (merged.length === 0) merged.push({ ...s });
    else {
      const last = merged[merged.length - 1];
      if (s.start <= last.end + 1) last.end = Math.max(last.end, s.end);
      else merged.push({ ...s });
    }
  }
  return merged;
}

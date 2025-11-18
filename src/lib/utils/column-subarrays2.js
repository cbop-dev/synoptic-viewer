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

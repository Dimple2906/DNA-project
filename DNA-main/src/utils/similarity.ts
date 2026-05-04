import { normalizeSequence } from './dnaUtils';

export function calculateSimilarity(seq1: string, seq2: string): number {
  const s1 = normalizeSequence(seq1);
  const s2 = normalizeSequence(seq2);
  if (s1.length === 0 || s2.length === 0) return 0;

  const minLen = Math.min(s1.length, s2.length);
  const maxLen = Math.max(s1.length, s2.length);

  let matches = 0;
  for (let i = 0; i < minLen; i++) {
    if (s1[i] === s2[i]) matches++;
  }

  return matches / maxLen;
}

export function smithWatermanScore(seq1: string, seq2: string): number {
  const s1 = normalizeSequence(seq1).slice(0, 100);
  const s2 = normalizeSequence(seq2).slice(0, 100);

  const match = 2;
  const mismatch = -1;
  const gap = -1;

  const rows = s1.length + 1;
  const cols = s2.length + 1;
  const matrix: number[][] = Array.from({ length: rows }, () => Array(cols).fill(0));

  let maxScore = 0;

  for (let i = 1; i < rows; i++) {
    for (let j = 1; j < cols; j++) {
      const diag = matrix[i - 1][j - 1] + (s1[i - 1] === s2[j - 1] ? match : mismatch);
      const up = matrix[i - 1][j] + gap;
      const left = matrix[i][j - 1] + gap;
      matrix[i][j] = Math.max(0, diag, up, left);
      if (matrix[i][j] > maxScore) maxScore = matrix[i][j];
    }
  }

  const maxPossible = Math.min(s1.length, s2.length) * match;
  return maxPossible > 0 ? maxScore / maxPossible : 0;
}

export function kmerSimilarity(seq1: string, seq2: string, k = 4): number {
  const s1 = normalizeSequence(seq1);
  const s2 = normalizeSequence(seq2);

  const getKmers = (seq: string): Set<string> => {
    const kmers = new Set<string>();
    for (let i = 0; i <= seq.length - k; i++) {
      kmers.add(seq.slice(i, i + k));
    }
    return kmers;
  };

  const k1 = getKmers(s1);
  const k2 = getKmers(s2);

  if (k1.size === 0 || k2.size === 0) return 0;

  let intersection = 0;
  k1.forEach((kmer) => {
    if (k2.has(kmer)) intersection++;
  });

  return intersection / (k1.size + k2.size - intersection);
}

export function compositeCompatibilityScore(seq1: string, seq2: string): number {
  const positional = calculateSimilarity(seq1, seq2);
  const sw = smithWatermanScore(seq1, seq2);
  const kmer = kmerSimilarity(seq1, seq2);
  return positional * 0.4 + sw * 0.3 + kmer * 0.3;
}

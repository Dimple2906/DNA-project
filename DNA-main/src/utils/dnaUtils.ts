export type Base = 'A' | 'T' | 'G' | 'C';

export interface BaseCounts {
  A: number;
  T: number;
  G: number;
  C: number;
}

export function calculateGC(sequence: string): number {
  const clean = sequence.toUpperCase().replace(/[^ATGC]/g, '');
  if (clean.length === 0) return 0;
  const gc = (clean.match(/[GC]/g) || []).length;
  return (gc / clean.length) * 100;
}

export function getBaseCounts(sequence: string): BaseCounts {
  const clean = sequence.toUpperCase().replace(/[^ATGC]/g, '');
  return {
    A: (clean.match(/A/g) || []).length,
    T: (clean.match(/T/g) || []).length,
    G: (clean.match(/G/g) || []).length,
    C: (clean.match(/C/g) || []).length,
  };
}

export function complementBase(base: string): string {
  const map: Record<string, string> = { A: 'T', T: 'A', G: 'C', C: 'G' };
  return map[base.toUpperCase()] || base;
}

export function reverseComplement(sequence: string): string {
  return sequence
    .toUpperCase()
    .split('')
    .reverse()
    .map(complementBase)
    .join('');
}

export function isValidDNA(sequence: string): boolean {
  return /^[ATGCatgc]+$/.test(sequence);
}

export function normalizeSequence(sequence: string): string {
  return sequence.toUpperCase().replace(/[^ATGC]/g, '');
}

export function getRegionType(
  startFraction: number,
  gcContent: number
): 'promoter' | 'insertion' | 'optimal' | 'normal' {
  if (startFraction < 0.1) return 'promoter';
  if (gcContent > 65) return 'insertion';
  if (gcContent >= 40 && gcContent <= 60) return 'optimal';
  return 'normal';
}

export function getRegionColor(type: string, gcContent: number): string {
  if (type === 'promoter') return '#f59e0b';
  if (type === 'insertion') return '#ef4444';
  if (type === 'optimal') return '#10b981';
  if (gcContent < 30) return '#3b82f6';
  return '#6b7280';
}

export function getCompatibilityReasoning(
  type: string,
  gcContent: number,
  similarity: number
): string {
  const gcLabel = gcContent >= 40 && gcContent <= 60 ? 'optimal GC content' : gcContent > 60 ? 'high GC content' : 'low GC content';
  const simLabel = similarity >= 0.8 ? 'high sequence similarity' : similarity >= 0.5 ? 'moderate sequence similarity' : 'low sequence similarity';

  if (type === 'promoter') {
    return `Promoter region detected (first 10% of sequence). ${gcLabel} (${gcContent.toFixed(1)}%) with ${simLabel} (${(similarity * 100).toFixed(1)}%) suggests ${similarity >= 0.7 ? 'successful regulatory element transfer' : 'potential regulatory incompatibility'}.`;
  }
  if (type === 'insertion') {
    return `High GC insertion site (${gcContent.toFixed(1)}%). ${simLabel} (${(similarity * 100).toFixed(1)}%) — this region may resist integration due to chromatin compaction.`;
  }
  if (type === 'optimal') {
    return `Optimal GC window (${gcContent.toFixed(1)}%). ${simLabel} (${(similarity * 100).toFixed(1)}%) — ideal target zone for stable transgene insertion.`;
  }
  return `Standard coding region. ${gcLabel} (${gcContent.toFixed(1)}%) with ${simLabel} (${(similarity * 100).toFixed(1)}%). ${similarity >= 0.6 ? 'Compatible for transfer.' : 'Low compatibility — codon optimization recommended.'}`;
}

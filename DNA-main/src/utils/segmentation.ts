import { calculateGC, getRegionType, getRegionColor, getCompatibilityReasoning } from './dnaUtils';
import { compositeCompatibilityScore } from './similarity';

export interface DNASegment {
  id: number;
  start: number;
  end: number;
  sequence: string;
  gcContent: number;
  type: 'promoter' | 'insertion' | 'optimal' | 'normal';
  compatibilityScore: number;
  color: string;
  reasoning: string;
  length: number;
}

export function segmentDNA(
  sequence: string,
  chunkSize: number,
  referenceSequence?: string
): DNASegment[] {
  const clean = sequence.toUpperCase().replace(/[^ATGC]/g, '');
  const segments: DNASegment[] = [];
  const totalLength = clean.length;

  for (let i = 0; i < totalLength; i += chunkSize) {
    const end = Math.min(i + chunkSize, totalLength);
    const chunk = clean.slice(i, end);
    const gc = calculateGC(chunk);
    const startFraction = i / totalLength;
    const type = getRegionType(startFraction, gc);
    const refChunk = referenceSequence
      ? referenceSequence.slice(i, end)
      : chunk;
    const compatibility = compositeCompatibilityScore(chunk, refChunk);
    const color = getRegionColor(type, gc);
    const reasoning = getCompatibilityReasoning(type, gc, compatibility);

    segments.push({
      id: segments.length,
      start: i,
      end: end - 1,
      sequence: chunk,
      gcContent: gc,
      type,
      compatibilityScore: compatibility,
      color,
      reasoning,
      length: chunk.length,
    });
  }

  return segments;
}

export function getOptimalChunkSize(sequenceLength: number): number {
  if (sequenceLength <= 100) return 10;
  if (sequenceLength <= 300) return 20;
  if (sequenceLength <= 600) return 30;
  return 50;
}

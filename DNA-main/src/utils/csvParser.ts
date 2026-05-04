export interface DNARecord {
  id: number;
  name: string;
  sequence: string;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

export function parseCSV(text: string): DNARecord[] {
  const lines = text.split('\n').filter((l) => l.trim().length > 0);
  if (lines.length < 2) return [];

  const headers = parseCSVLine(lines[0]).map((h) => h.toLowerCase());
  const idIdx = headers.indexOf('id');
  const nameIdx = headers.indexOf('name');
  const seqIdx = headers.indexOf('sequence');

  if (seqIdx === -1) return [];

  return lines.slice(1).map((line, i) => {
    const cols = parseCSVLine(line);
    return {
      id: idIdx !== -1 ? Number(cols[idIdx]) || i + 1 : i + 1,
      name: nameIdx !== -1 ? cols[nameIdx] || `Sequence ${i + 1}` : `Sequence ${i + 1}`,
      sequence: seqIdx !== -1 ? (cols[seqIdx] || '').toUpperCase().replace(/[^ATGC]/g, '') : '',
    };
  }).filter((r) => r.sequence.length > 0);
}

export async function loadCSVFromPath(path: string): Promise<DNARecord[]> {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`Failed to load ${path}: ${response.statusText}`);
  const text = await response.text();
  return parseCSV(text);
}

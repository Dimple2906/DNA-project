import { Hash, Dna, AlignJustify, BarChart2 } from 'lucide-react';
import { BaseCounts } from '../utils/dnaUtils';

interface SidePanelProps {
  sequenceName: string;
  totalLength: number;
  gcContent: number;
  baseCounts: BaseCounts;
  sequence: string;
}

const BASE_COLORS: Record<string, string> = {
  A: 'text-green-400',
  T: 'text-blue-400',
  G: 'text-amber-400',
  C: 'text-red-400',
};

const BASE_BG: Record<string, string> = {
  A: 'bg-green-500',
  T: 'bg-blue-500',
  G: 'bg-amber-500',
  C: 'bg-red-500',
};

function BaseBar({ base, count, total }: { base: string; count: number; total: number }) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="flex items-center gap-2">
      <span className={`text-xs font-bold font-mono w-4 ${BASE_COLORS[base]}`}>{base}</span>
      <div className="flex-1 h-1.5 bg-slate-700/60 rounded-full overflow-hidden">
        <div
          className={`h-full ${BASE_BG[base]} rounded-full transition-all duration-700`}
          style={{ width: `${pct}%`, opacity: 0.85 }}
        />
      </div>
      <span className="text-xs font-mono text-slate-400 w-8 text-right">{pct.toFixed(1)}%</span>
      <span className="text-xs font-mono text-slate-500 w-8 text-right">{count}</span>
    </div>
  );
}

export default function SidePanel({
  sequenceName,
  totalLength,
  gcContent,
  baseCounts,
  sequence,
}: SidePanelProps) {
  const total = baseCounts.A + baseCounts.T + baseCounts.G + baseCounts.C;

  return (
    <div className="glass-card p-5 flex flex-col gap-5">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Dna size={14} className="text-emerald-400" />
          <span className="text-xs text-slate-400 uppercase tracking-wider">Sequence Info</span>
        </div>
        <p className="text-white font-semibold text-sm truncate">{sequenceName}</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="stat-tile">
          <div className="flex items-center gap-1.5 mb-1">
            <Hash size={12} className="text-slate-400" />
            <span className="text-xs text-slate-400">Total Length</span>
          </div>
          <p className="text-white font-bold text-lg font-mono">{totalLength.toLocaleString()}</p>
          <p className="text-slate-500 text-xs">base pairs</p>
        </div>
        <div className="stat-tile">
          <div className="flex items-center gap-1.5 mb-1">
            <BarChart2 size={12} className="text-slate-400" />
            <span className="text-xs text-slate-400">GC Content</span>
          </div>
          <p
            className={`font-bold text-lg font-mono ${
              gcContent >= 40 && gcContent <= 60
                ? 'text-emerald-400'
                : gcContent > 65
                ? 'text-red-400'
                : 'text-amber-400'
            }`}
          >
            {gcContent.toFixed(1)}%
          </p>
          <p className="text-slate-500 text-xs">
            {gcContent >= 40 && gcContent <= 60 ? 'Optimal' : gcContent > 65 ? 'High' : 'Low'}
          </p>
        </div>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-3">
          <BarChart2 size={13} className="text-slate-400" />
          <span className="text-xs text-slate-400 uppercase tracking-wider">Base Composition</span>
        </div>
        <div className="flex flex-col gap-2">
          {(['A', 'T', 'G', 'C'] as const).map((base) => (
            <BaseBar key={base} base={base} count={baseCounts[base]} total={total} />
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-2">
          <AlignJustify size={13} className="text-slate-400" />
          <span className="text-xs text-slate-400 uppercase tracking-wider">Sequence Preview</span>
        </div>
        <div className="bg-slate-900/60 rounded-lg p-3 border border-white/5 font-mono text-xs leading-relaxed max-h-32 overflow-y-auto scrollbar-thin">
          {sequence.split('').map((base, i) => (
            <span key={i} className={BASE_COLORS[base] || 'text-slate-300'}>
              {base}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

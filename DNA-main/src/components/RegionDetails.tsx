import { MapPin, Ruler, Percent, Star, FileText, Dna } from 'lucide-react';
import { DNASegment } from '../utils/segmentation';

interface RegionDetailsProps {
  segment: DNASegment | null;
}

const TYPE_STYLES: Record<string, { bg: string; text: string; border: string; label: string }> = {
  promoter: {
    bg: 'bg-amber-500/10',
    text: 'text-amber-300',
    border: 'border-amber-500/40',
    label: 'Promoter Region',
  },
  insertion: {
    bg: 'bg-red-500/10',
    text: 'text-red-300',
    border: 'border-red-500/40',
    label: 'Insertion Site',
  },
  optimal: {
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-300',
    border: 'border-emerald-500/40',
    label: 'Optimal Zone',
  },
  normal: {
    bg: 'bg-blue-500/10',
    text: 'text-blue-300',
    border: 'border-blue-500/40',
    label: 'Coding Region',
  },
};

function StatRow({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0">
      <div className="flex items-center gap-2.5 text-slate-400">
        <Icon size={13} className="shrink-0" />
        <span className="text-xs">{label}</span>
      </div>
      <span className={`text-sm font-semibold font-mono ${accent || 'text-white'}`}>{value}</span>
    </div>
  );
}

function CompatibilityBar({ score }: { score: number }) {
  const pct = Math.round(score * 100);
  const color =
    pct >= 70 ? 'from-emerald-500 to-emerald-400' :
    pct >= 40 ? 'from-amber-500 to-amber-400' :
    'from-red-500 to-red-400';

  return (
    <div className="mt-1">
      <div className="flex justify-between text-xs text-slate-400 mb-1.5">
        <span>Compatibility</span>
        <span className="font-mono font-semibold text-white">{pct}%</span>
      </div>
      <div className="h-2 bg-slate-700/60 rounded-full overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r ${color} rounded-full transition-all duration-700`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default function RegionDetails({ segment }: RegionDetailsProps) {
  if (!segment) {
    return (
      <div className="glass-card p-5 h-full flex flex-col items-center justify-center text-center">
        <div className="w-12 h-12 rounded-full bg-slate-700/50 flex items-center justify-center mb-3">
          <Dna size={22} className="text-slate-500" />
        </div>
        <p className="text-slate-500 text-sm">Click a region on the visualizer to inspect it</p>
      </div>
    );
  }

  const style = TYPE_STYLES[segment.type] || TYPE_STYLES.normal;

  return (
    <div className="glass-card p-5 h-full flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-white font-semibold text-sm">Region Details</h3>
        <span
          className={`text-xs font-medium px-2.5 py-1 rounded-full border ${style.bg} ${style.text} ${style.border}`}
        >
          {style.label}
        </span>
      </div>

      <div className="flex flex-col">
        <StatRow icon={MapPin} label="Start Position" value={`${segment.start} bp`} accent="text-slate-200" />
        <StatRow icon={MapPin} label="End Position" value={`${segment.end} bp`} accent="text-slate-200" />
        <StatRow icon={Ruler} label="Length" value={`${segment.length} bp`} accent="text-slate-200" />
        <StatRow
          icon={Percent}
          label="GC Content"
          value={`${segment.gcContent.toFixed(1)}%`}
          accent={
            segment.gcContent >= 40 && segment.gcContent <= 60
              ? 'text-emerald-400'
              : segment.gcContent > 65
              ? 'text-red-400'
              : 'text-amber-400'
          }
        />
        <StatRow
          icon={Star}
          label="Compat. Score"
          value={`${(segment.compatibilityScore * 100).toFixed(1)}%`}
          accent={
            segment.compatibilityScore >= 0.7
              ? 'text-emerald-400'
              : segment.compatibilityScore >= 0.4
              ? 'text-amber-400'
              : 'text-red-400'
          }
        />
      </div>

      <CompatibilityBar score={segment.compatibilityScore} />

      <div className={`rounded-lg p-3.5 ${style.bg} border ${style.border}`}>
        <div className="flex items-start gap-2">
          <FileText size={13} className={`shrink-0 mt-0.5 ${style.text}`} />
          <p className="text-xs text-slate-300 leading-relaxed">{segment.reasoning}</p>
        </div>
      </div>

      <div>
        <p className="text-xs text-slate-500 mb-1.5">Sequence Preview</p>
        <div className="bg-slate-900/60 rounded-lg p-2.5 border border-white/5 font-mono text-xs text-slate-300 break-all leading-relaxed max-h-20 overflow-y-auto">
          {segment.sequence}
        </div>
      </div>
    </div>
  );
}

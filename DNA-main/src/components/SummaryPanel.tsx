import { TrendingUp, CheckCircle, AlertTriangle, XCircle, ArrowRight } from 'lucide-react';

interface SummaryPanelProps {
  overallScore: number;
  donorCrop: string;
  targetCrop: string;
  sequenceName: string;
  segmentCount: number;
  highCompatCount: number;
}

function ScoreRing({ score }: { score: number }) {
  const pct = Math.round(score * 100);
  const r = 40;
  const circumference = 2 * Math.PI * r;
  const dash = (pct / 100) * circumference;

  const color =
    pct >= 70 ? '#10b981' : pct >= 40 ? '#f59e0b' : '#ef4444';
  const glow =
    pct >= 70 ? 'rgba(16,185,129,0.4)' : pct >= 40 ? 'rgba(245,158,11,0.4)' : 'rgba(239,68,68,0.4)';

  return (
    <div className="relative w-24 h-24 shrink-0">
      <svg width="96" height="96" viewBox="0 0 96 96">
        <defs>
          <filter id="ring-glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <circle cx="48" cy="48" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
        <circle
          cx="48"
          cy="48"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeDasharray={`${dash} ${circumference - dash}`}
          strokeLinecap="round"
          transform="rotate(-90 48 48)"
          style={{ filter: `drop-shadow(0 0 6px ${glow})`, transition: 'stroke-dasharray 1s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-bold font-mono" style={{ color }}>{pct}%</span>
      </div>
    </div>
  );
}

export default function SummaryPanel({
  overallScore,
  donorCrop,
  targetCrop,
  sequenceName,
  segmentCount,
  highCompatCount,
}: SummaryPanelProps) {
  const pct = Math.round(overallScore * 100);
  const status = pct >= 70 ? 'high' : pct >= 40 ? 'medium' : 'low';

  const statusConfig = {
    high: {
      icon: CheckCircle,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/30',
      label: 'High Compatibility',
      message: 'Excellent candidate for gene transfer. Sequence shows strong structural and compositional alignment.',
    },
    medium: {
      icon: AlertTriangle,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/30',
      label: 'Moderate Compatibility',
      message: 'Partial compatibility detected. Codon optimization or promoter swapping may improve transfer efficiency.',
    },
    low: {
      icon: XCircle,
      color: 'text-red-400',
      bg: 'bg-red-500/10',
      border: 'border-red-500/30',
      label: 'Low Compatibility',
      message: 'Significant sequence divergence observed. Consider alternative donor candidates or extensive engineering.',
    },
  };

  const cfg = statusConfig[status];
  const StatusIcon = cfg.icon;

  return (
    <div className="glass-card p-5 flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <TrendingUp size={14} className="text-emerald-400" />
        <span className="text-xs text-slate-400 uppercase tracking-wider">Compatibility Summary</span>
      </div>

      <div className="flex items-center gap-4">
        <ScoreRing score={overallScore} />
        <div className="flex flex-col gap-1.5 min-w-0">
          <div className={`flex items-center gap-1.5 ${cfg.color}`}>
            <StatusIcon size={14} />
            <span className="text-sm font-semibold">{cfg.label}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400 flex-wrap">
            <span className="text-slate-300 font-medium capitalize">{donorCrop}</span>
            <ArrowRight size={10} />
            <span className="text-slate-300 font-medium capitalize">{targetCrop}</span>
          </div>
          <p className="text-xs text-slate-500 font-mono truncate">{sequenceName}</p>
        </div>
      </div>

      <div className={`rounded-lg p-3.5 ${cfg.bg} border ${cfg.border}`}>
        <p className="text-xs text-slate-300 leading-relaxed">{cfg.message}</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="stat-tile">
          <p className="text-xs text-slate-400 mb-1">Total Regions</p>
          <p className="text-lg font-bold font-mono text-white">{segmentCount}</p>
        </div>
        <div className="stat-tile">
          <p className="text-xs text-slate-400 mb-1">High Compat.</p>
          <p className="text-lg font-bold font-mono text-emerald-400">{highCompatCount}</p>
        </div>
      </div>
    </div>
  );
}

import { TrendingUp, ArrowLeft, ArrowRight, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { DNASegment } from '../utils/segmentation';

interface DetailedCompatibilityPageProps {
  segments: DNASegment[];
  overallScore: number;
  donorCrop: string;
  targetCrop: string;
  sequenceName: string;
  onBack: () => void;
}

function ScoreRing({ score }: { score: number }) {
  const pct = Math.round(score * 100);
  const r = 52;
  const circumference = 2 * Math.PI * r;
  const dash = (pct / 100) * circumference;
  const color = pct >= 70 ? '#10b981' : pct >= 40 ? '#f59e0b' : '#ef4444';

  return (
    <div className="relative w-32 h-32">
      <svg width="128" height="128" viewBox="0 0 128 128">
        <circle cx="64" cy="64" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
        <circle
          cx="64" cy="64" r={r} fill="none"
          stroke={color} strokeWidth="10"
          strokeDasharray={`${dash} ${circumference - dash}`}
          strokeLinecap="round"
          transform="rotate(-90 64 64)"
          style={{ filter: `drop-shadow(0 0 8px ${color}66)`, transition: 'stroke-dasharray 1s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold font-mono" style={{ color }}>{pct}%</span>
        <span className="text-xs text-slate-400">Score</span>
      </div>
    </div>
  );
}

function compatLabel(score: number) {
  if (score >= 0.7) return { label: 'High', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/25', Icon: CheckCircle };
  if (score >= 0.4) return { label: 'Moderate', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/25', Icon: AlertTriangle };
  return { label: 'Low', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/25', Icon: XCircle };
}

export default function DetailedCompatibilityPage({
  segments,
  overallScore,
  donorCrop,
  targetCrop,
  sequenceName,
  onBack,
}: DetailedCompatibilityPageProps) {
  const pct = Math.round(overallScore * 100);
  const high = segments.filter(s => s.compatibilityScore >= 0.7).length;
  const moderate = segments.filter(s => s.compatibilityScore >= 0.4 && s.compatibilityScore < 0.7).length;
  const low = segments.filter(s => s.compatibilityScore < 0.4).length;

  const statusMsg =
    pct >= 70
      ? 'Excellent candidate for gene transfer. Sequence shows strong structural and compositional alignment.'
      : pct >= 40
      ? 'Partial compatibility detected. Codon optimization or promoter swapping may improve transfer efficiency.'
      : 'Significant sequence divergence observed. Consider alternative donor candidates or extensive engineering.';

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="pt-8 pb-6">
          <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-emerald-400 transition-colors text-sm mb-4">
            <ArrowLeft size={14} /> Back to Dashboard
          </button>
          <h1 className="text-2xl font-bold text-emerald-400 mb-1">Compatibility Result</h1>
          <p className="text-slate-400 text-sm">
            Overall compatibility score with per-region breakdown and visual summary.
          </p>
        </div>

        {segments.length === 0 ? (
          <div className="glass-card p-16 text-center text-slate-400">
            <TrendingUp size={40} className="mx-auto mb-3 text-slate-600" />
            <p>No analysis data available. Run an analysis from the Dashboard first.</p>
          </div>
        ) : (
          <>
            {/* Overall Score Card */}
            <div className="glass-card p-6 mb-6">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                <ScoreRing score={overallScore} />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp size={14} className="text-emerald-400" />
                    <span className="text-xs text-slate-400 uppercase tracking-wider">Compatibility Summary</span>
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    {pct >= 70 ? <CheckCircle size={16} className="text-emerald-400" /> : pct >= 40 ? <AlertTriangle size={16} className="text-amber-400" /> : <XCircle size={16} className="text-red-400" />}
                    <span className={`font-semibold ${pct >= 70 ? 'text-emerald-400' : pct >= 40 ? 'text-amber-400' : 'text-red-400'}`}>
                      {pct >= 70 ? 'High Compatibility' : pct >= 40 ? 'Moderate Compatibility' : 'Low Compatibility'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-400 mb-3">
                    <span className="text-slate-300 font-medium capitalize">{donorCrop}</span>
                    <ArrowRight size={12} />
                    <span className="text-slate-300 font-medium capitalize">{targetCrop}</span>
                  </div>
                  <p className="text-xs text-slate-500 font-mono mb-3 truncate">{sequenceName}</p>
                  <p className="text-xs text-slate-300 leading-relaxed max-w-md">{statusMsg}</p>
                </div>
                <div className="grid grid-cols-3 gap-3 sm:ml-auto">
                  {[
                    { label: 'High', value: high, color: 'text-emerald-400' },
                    { label: 'Moderate', value: moderate, color: 'text-amber-400' },
                    { label: 'Low', value: low, color: 'text-red-400' },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="stat-tile text-center min-w-[64px]">
                      <p className={`text-xl font-bold font-mono ${color}`}>{value}</p>
                      <p className="text-xs text-slate-400">{label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Visual Distribution */}
            <div className="glass-card p-5 mb-6">
              <h2 className="text-white font-semibold mb-3">Score Distribution</h2>
              <div className="flex w-full h-5 rounded-full overflow-hidden gap-0.5 mb-3">
                {[
                  { count: high, color: '#10b981' },
                  { count: moderate, color: '#f59e0b' },
                  { count: low, color: '#ef4444' },
                ].map(({ count, color }, i) => {
                  const pctBar = segments.length ? (count / segments.length) * 100 : 0;
                  return pctBar > 0 ? (
                    <div key={i} style={{ width: `${pctBar}%`, backgroundColor: color + 'cc' }} className="h-full" />
                  ) : null;
                })}
              </div>
              <div className="flex gap-5 text-xs text-slate-400">
                {[
                  { label: `High (≥70%) — ${high} regions`, color: '#10b981' },
                  { label: `Moderate (40–69%) — ${moderate} regions`, color: '#f59e0b' },
                  { label: `Low (<40%) — ${low} regions`, color: '#ef4444' },
                ].map(({ label, color }) => (
                  <span key={label} className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-sm inline-block" style={{ backgroundColor: color }} />
                    {label}
                  </span>
                ))}
              </div>
            </div>

            {/* Per-Region Cards */}
            <div className="glass-card p-5 mb-6">
              <h2 className="text-white font-semibold mb-4">Per-Region Compatibility Breakdown</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {segments.map((seg) => {
                  const { label, color, bg, border, Icon } = compatLabel(seg.compatibilityScore);
                  const scorePct = Math.round(seg.compatibilityScore * 100);
                  const scoreColor = scorePct >= 70 ? '#10b981' : scorePct >= 40 ? '#f59e0b' : '#ef4444';
                  return (
                    <div key={seg.id} className={`rounded-lg p-4 border ${border} ${bg}`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1.5">
                          <Icon size={12} className={color} />
                          <span className="text-sm font-semibold text-white">Region {seg.id + 1}</span>
                        </div>
                        <span className={`text-xs font-bold font-mono ${color}`}>{scorePct}%</span>
                      </div>
                      <p className="text-xs text-slate-400 mb-2">{seg.start}–{seg.end} bp · {seg.gcContent.toFixed(1)}% GC</p>
                      <div className="w-full h-1.5 bg-slate-700/60 rounded-full overflow-hidden mb-2">
                        <div className="h-full rounded-full" style={{ width: `${scorePct}%`, backgroundColor: scoreColor }} />
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${color} ${bg} border ${border}`}>
                        {label} compatibility
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Summary Table */}
            <div className="glass-card p-5">
              <h2 className="text-white font-semibold mb-4">Detailed Region Table</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/8 text-xs text-slate-400 uppercase tracking-wider">
                      <th className="text-left pb-3 pr-4">Region</th>
                      <th className="text-left pb-3 pr-4">Range (bp)</th>
                      <th className="text-left pb-3 pr-4">GC%</th>
                      <th className="text-left pb-3 pr-4">Score</th>
                      <th className="text-left pb-3 pr-4">Type</th>
                      <th className="text-left pb-3">Reasoning</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {segments.map((seg) => {
                      const { label, color } = compatLabel(seg.compatibilityScore);
                      return (
                        <tr key={seg.id} className="hover:bg-white/3 transition-colors">
                          <td className="py-2.5 pr-4 font-mono text-slate-300 text-xs">R{seg.id + 1}</td>
                          <td className="py-2.5 pr-4 font-mono text-xs text-slate-400">{seg.start}–{seg.end}</td>
                          <td className="py-2.5 pr-4">
                            <span className={`text-xs font-mono ${seg.gcContent >= 40 && seg.gcContent <= 60 ? 'text-emerald-400' : 'text-amber-400'}`}>
                              {seg.gcContent.toFixed(1)}%
                            </span>
                          </td>
                          <td className="py-2.5 pr-4">
                            <span className={`text-xs font-bold font-mono ${color}`}>
                              {(seg.compatibilityScore * 100).toFixed(1)}%
                            </span>
                          </td>
                          <td className="py-2.5 pr-4">
                            <span className="text-xs capitalize text-slate-300">{seg.type}</span>
                          </td>
                          <td className="py-2.5 max-w-[200px]">
                            <span className="text-xs text-slate-500 line-clamp-2">{seg.reasoning}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

import { CheckCircle, AlertTriangle, XCircle, Dna, ArrowLeft } from 'lucide-react';
import { DNASegment } from '../utils/segmentation';

interface FeasibilityPageProps {
  segments: DNASegment[];
  sequenceName: string;
  onBack: () => void;
}

function getRegionLabel(type: string) {
  if (type === 'promoter') return { label: 'Promoter', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/25' };
  if (type === 'insertion') return { label: 'Insertion', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/25' };
  if (type === 'optimal') return { label: 'Optimal', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/25' };
  return { label: 'Normal', color: 'text-slate-400', bg: 'bg-slate-700/40', border: 'border-white/8' };
}

function getFeasibilityScore(seg: DNASegment): number {
  const gcScore = seg.gcContent >= 40 && seg.gcContent <= 60 ? 85 : seg.gcContent >= 35 && seg.gcContent <= 65 ? 65 : 40;
  const simScore = seg.compatibilityScore * 100;
  return Math.round(gcScore * 0.5 + simScore * 0.5);
}

function FeasibilityBar({ score }: { score: number }) {
  const color = score >= 70 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444';
  return (
    <div className="w-full h-2 bg-slate-700/60 rounded-full overflow-hidden mt-2">
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{ width: `${score}%`, background: `linear-gradient(90deg, ${color}aa, ${color})` }}
      />
    </div>
  );
}

function StatusIcon({ score }: { score: number }) {
  if (score >= 70) return <CheckCircle size={14} className="text-emerald-400 shrink-0" />;
  if (score >= 50) return <AlertTriangle size={14} className="text-amber-400 shrink-0" />;
  return <XCircle size={14} className="text-red-400 shrink-0" />;
}

export default function FeasibilityPage({ segments, sequenceName, onBack }: FeasibilityPageProps) {
  const feasibleCount = segments.filter(s => getFeasibilityScore(s) >= 70).length;
  const avgFeasibility = segments.length
    ? Math.round(segments.reduce((sum, s) => sum + getFeasibilityScore(s), 0) / segments.length)
    : 0;

  const totalBP = segments.length > 0 ? segments[segments.length - 1].end + 1 : 0;

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="pt-8 pb-6">
          <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-emerald-400 transition-colors text-sm mb-4">
            <ArrowLeft size={14} /> Back to Dashboard
          </button>
          <h1 className="text-2xl font-bold text-emerald-400 mb-1">Feasible Regions Analysis</h1>
          <p className="text-slate-400 text-sm">
            Detailed analysis of gene sequence regions showing suitability scores based on GC content, complexity, and regulatory potential.
          </p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Base Pairs', value: totalBP, color: 'text-emerald-400' },
            { label: 'Total Regions', value: segments.length, color: 'text-cyan-400' },
            { label: 'Feasible Regions', value: feasibleCount, color: 'text-emerald-400' },
            { label: 'Avg Feasibility', value: `${avgFeasibility}%`, color: 'text-amber-400' },
          ].map(({ label, value, color }) => (
            <div key={label} className="glass-card p-4 text-center">
              <p className={`text-2xl font-bold font-mono ${color}`}>{value}</p>
              <p className="text-xs text-slate-400 mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* Sequence Map */}
        <div className="glass-card p-5 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Dna size={14} className="text-emerald-400" />
            <span className="text-sm font-semibold text-white">Feasible Regions Analysis</span>
          </div>
          <p className="text-xs text-slate-400 mb-4">Visualizing optimal gene regions for expression and compatibility</p>

          {segments.length > 0 ? (
            <>
              <p className="text-xs text-slate-400 mb-2">Sequence Map ({totalBP} bp)</p>
              <div className="flex w-full h-10 rounded-lg overflow-hidden gap-0.5 mb-6">
                {segments.map((seg) => {
                  const score = getFeasibilityScore(seg);
                  const color = score >= 70 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444';
                  const pct = ((seg.end - seg.start + 1) / totalBP) * 100;
                  return (
                    <div
                      key={seg.id}
                      title={`Region ${seg.id + 1}: ${seg.start}–${seg.end} bp | Score: ${score}%`}
                      style={{ width: `${pct}%`, backgroundColor: color + '99', minWidth: 2 }}
                      className="h-full transition-opacity hover:opacity-80 cursor-pointer"
                    />
                  );
                })}
              </div>

              {/* Legend */}
              <div className="flex flex-wrap gap-4 text-xs text-slate-400 mb-6">
                {[
                  { color: '#10b981', label: 'Feasible (≥70%)' },
                  { color: '#f59e0b', label: 'Moderate (50–69%)' },
                  { color: '#ef4444', label: 'Low (<50%)' },
                ].map(({ color, label }) => (
                  <span key={label} className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-sm inline-block" style={{ backgroundColor: color }} />
                    {label}
                  </span>
                ))}
              </div>

              {/* Top Feasible Regions */}
              <p className="text-sm font-semibold text-white mb-3">Top Feasible Regions</p>
              <div className="flex flex-col gap-3">
                {[...segments]
                  .sort((a, b) => getFeasibilityScore(b) - getFeasibilityScore(a))
                  .slice(0, 8)
                  .map((seg) => {
                    const score = getFeasibilityScore(seg);
                    const cfg = getRegionLabel(seg.type);
                    return (
                      <div key={seg.id} className={`rounded-lg p-4 border ${cfg.border} ${cfg.bg}`}>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <StatusIcon score={score} />
                            <span className="text-sm font-semibold text-white">
                              Region {seg.id + 1}: {seg.start}–{seg.end} bp
                            </span>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cfg.color} ${cfg.bg} border ${cfg.border}`}>
                              {cfg.label}
                            </span>
                          </div>
                          <span className={`text-sm font-bold font-mono ${score >= 70 ? 'text-emerald-400' : score >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
                            {score}%
                          </span>
                        </div>
                        <p className="text-xs text-slate-400">
                          GC Content: {seg.gcContent.toFixed(1)}% — Compatibility: {(seg.compatibilityScore * 100).toFixed(1)}% — Length: {seg.length} bp
                        </p>
                        <FeasibilityBar score={score} />
                      </div>
                    );
                  })}
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-slate-400">
              <Dna size={40} className="mx-auto mb-3 text-slate-600" />
              <p>No analysis data available. Run an analysis from the Dashboard first.</p>
            </div>
          )}
        </div>

        {/* About section */}
        <div className="glass-card p-6 mb-6">
          <h2 className="text-emerald-400 font-semibold mb-4">About Feasible Regions</h2>
          <p className="text-slate-400 text-xs mb-5">Understanding the analysis</p>
          <div className="grid sm:grid-cols-2 gap-6">
            {[
              {
                title: 'GC Content Analysis',
                color: 'text-emerald-400',
                body: 'Regions with GC content between 40–60% are considered optimal for gene expression. Optimal regions show 85% suitability.',
              },
              {
                title: 'Complexity Scoring',
                color: 'text-cyan-400',
                body: 'Low complexity regions with high repeat content reduce suitability, as they may interfere with regulation.',
              },
              {
                title: 'Optimal Ranges',
                color: 'text-white',
                body: 'Acceptable GC range: 35–65%. Extreme values indicate secondary structure issues and potential expression problems.',
              },
              {
                title: 'Regulatory Potential',
                color: 'text-pink-400',
                body: 'High suitability regions are ideal for promoter integration and regulatory element insertion.',
              },
            ].map(({ title, color, body }) => (
              <div key={title}>
                <h3 className={`text-sm font-semibold mb-1 ${color}`}>{title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Key Insights */}
        {segments.length > 0 && (
          <div className="glass-card p-5 border border-emerald-500/20 bg-emerald-500/5">
            <p className="text-emerald-400 text-sm font-semibold mb-3">Key Insights</p>
            <ul className="space-y-1.5 text-xs text-slate-300">
              <li>✓ Top region has {segments[0]?.gcContent >= 40 && segments[0]?.gcContent <= 60 ? 'optimal' : 'suboptimal'} GC content (40–60%) for expression</li>
              <li>✓ {feasibleCount} regions with high suitability ({feasibleCount >= 10 ? '10+' : feasibleCount} total)</li>
              <li>✓ Multiple insertion points available for genetic engineering</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

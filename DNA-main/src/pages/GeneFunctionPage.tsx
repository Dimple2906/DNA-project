import { Brain, ArrowLeft, Shield, Truck, FlaskConical, Box } from 'lucide-react';
import { DNASegment } from '../utils/segmentation';

interface GeneFunctionPageProps {
  segments: DNASegment[];
  sequenceName: string;
  onBack: () => void;
}

type GeneFunction = 'Defense' | 'Transport' | 'Enzyme' | 'Structural' | 'Unknown';

interface FunctionConfig {
  label: GeneFunction;
  icon: React.ElementType;
  color: string;
  bg: string;
  border: string;
  description: string;
}

const FUNCTION_CONFIGS: Record<GeneFunction, FunctionConfig> = {
  Defense: {
    label: 'Defense',
    icon: Shield,
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/25',
    description: 'Encodes proteins that enhance plant immunity and stress tolerance.',
  },
  Transport: {
    label: 'Transport',
    icon: Truck,
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/25',
    description: 'Membrane proteins facilitating nutrient and ion transport.',
  },
  Enzyme: {
    label: 'Enzyme',
    icon: FlaskConical,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/25',
    description: 'Catalytic proteins involved in metabolic pathways and detoxification.',
  },
  Structural: {
    label: 'Structural',
    icon: Box,
    color: 'text-pink-400',
    bg: 'bg-pink-500/10',
    border: 'border-pink-500/25',
    description: 'Genes encoding structural proteins for cell walls and cytoskeleton.',
  },
  Unknown: {
    label: 'Unknown',
    icon: Brain,
    color: 'text-slate-400',
    bg: 'bg-slate-700/40',
    border: 'border-white/8',
    description: 'Function could not be predicted with sufficient confidence.',
  },
};

function predictGeneFunction(seg: DNASegment): GeneFunction {
  const gc = seg.gcContent;
  const sim = seg.compatibilityScore;

  if (seg.type === 'promoter') return 'Enzyme';
  if (gc > 65) return 'Defense';
  if (sim >= 0.75) return 'Transport';
  if (gc >= 40 && gc <= 60 && sim >= 0.5) return 'Enzyme';
  if (gc < 35) return 'Structural';
  if (sim < 0.3) return 'Unknown';
  return 'Structural';
}

function getConfidence(seg: DNASegment): number {
  const gc = seg.gcContent;
  const sim = seg.compatibilityScore;
  const base = Math.round((gc >= 40 && gc <= 60 ? 0.8 : 0.55) * 50 + sim * 50);
  return Math.min(95, Math.max(35, base));
}

export default function GeneFunctionPage({ segments, sequenceName, onBack }: GeneFunctionPageProps) {
  const predictions = segments.map(seg => ({
    seg,
    fn: predictGeneFunction(seg),
    confidence: getConfidence(seg),
  }));

  const fnCounts = predictions.reduce<Record<GeneFunction, number>>((acc, { fn }) => {
    acc[fn] = (acc[fn] || 0) + 1;
    return acc;
  }, {} as Record<GeneFunction, number>);

  const topFn = Object.entries(fnCounts).sort((a, b) => b[1] - a[1])[0]?.[0] as GeneFunction | undefined;
  const avgConf = predictions.length
    ? Math.round(predictions.reduce((s, p) => s + p.confidence, 0) / predictions.length)
    : 0;

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="pt-8 pb-6">
          <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-emerald-400 transition-colors text-sm mb-4">
            <ArrowLeft size={14} /> Back to Dashboard
          </button>
          <h1 className="text-2xl font-bold text-emerald-400 mb-1">Predicted Gene Function</h1>
          <p className="text-slate-400 text-sm">
            Functional role analysis based on sequence characteristics using rule-based prediction.
          </p>
        </div>

        {segments.length === 0 ? (
          <div className="glass-card p-16 text-center text-slate-400">
            <Brain size={40} className="mx-auto mb-3 text-slate-600" />
            <p>No analysis data available. Run an analysis from the Dashboard first.</p>
          </div>
        ) : (
          <>
            {/* Predicted Role */}
            <div className="glass-card p-6 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <Brain size={18} className="text-emerald-400" />
                <span className="text-sm font-semibold text-white">Predicted Gene Function</span>
                <span className="text-xs text-slate-500">Functional role analysis based on sequence characteristics</span>
              </div>
              <div className="rounded-lg border border-slate-600/40 bg-slate-800/50 p-5 mb-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400 mb-1">Predicted Role</p>
                  <p className={`text-3xl font-bold ${topFn ? FUNCTION_CONFIGS[topFn].color : 'text-slate-400'}`}>
                    {topFn || 'Unknown'}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">{topFn ? FUNCTION_CONFIGS[topFn].description : ''}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400">Confidence</p>
                  <p className="text-3xl font-bold font-mono text-white">{avgConf}%</p>
                </div>
              </div>

              {/* Confidence bar */}
              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>Prediction Confidence</span>
                  <span>{avgConf}%</span>
                </div>
                <div className="w-full h-2 bg-slate-700/60 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${avgConf}%`,
                      background: avgConf >= 70 ? 'linear-gradient(90deg,#10b981,#34d399)' : 'linear-gradient(90deg,#6366f1,#818cf8)',
                    }}
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {avgConf >= 70 ? 'High confidence prediction' : 'Moderate confidence — consider additional analysis'}
                </p>
              </div>
            </div>

            {/* Function distribution */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {(Object.keys(FUNCTION_CONFIGS) as GeneFunction[]).filter(fn => fn !== 'Unknown').map(fn => {
                const cfg = FUNCTION_CONFIGS[fn];
                const Icon = cfg.icon;
                const count = fnCounts[fn] || 0;
                return (
                  <div key={fn} className={`glass-card p-4 border ${cfg.border} ${cfg.bg}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <Icon size={14} className={cfg.color} />
                      <span className={`text-sm font-semibold ${cfg.color}`}>{fn} Genes</span>
                    </div>
                    <p className="text-xs text-slate-400 mb-3">{cfg.description}</p>
                    <p className="text-2xl font-bold font-mono text-white">{count}</p>
                    <p className="text-xs text-slate-500">regions predicted</p>
                  </div>
                );
              })}
            </div>

            {/* Region-by-region table */}
            <div className="glass-card p-5 mb-6">
              <h2 className="text-white font-semibold mb-4">Region-by-Region Predictions</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/8 text-xs text-slate-400 uppercase tracking-wider">
                      <th className="text-left pb-3 pr-4">Region</th>
                      <th className="text-left pb-3 pr-4">Range</th>
                      <th className="text-left pb-3 pr-4">GC Content</th>
                      <th className="text-left pb-3 pr-4">Compatibility</th>
                      <th className="text-left pb-3 pr-4">Function</th>
                      <th className="text-left pb-3">Confidence</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {predictions.map(({ seg, fn, confidence }) => {
                      const cfg = FUNCTION_CONFIGS[fn];
                      const Icon = cfg.icon;
                      return (
                        <tr key={seg.id} className="hover:bg-white/3 transition-colors">
                          <td className="py-3 pr-4 font-mono text-slate-300">R{seg.id + 1}</td>
                          <td className="py-3 pr-4 font-mono text-xs text-slate-400">{seg.start}–{seg.end}</td>
                          <td className="py-3 pr-4">
                            <span className={`text-xs font-mono ${seg.gcContent >= 40 && seg.gcContent <= 60 ? 'text-emerald-400' : 'text-amber-400'}`}>
                              {seg.gcContent.toFixed(1)}%
                            </span>
                          </td>
                          <td className="py-3 pr-4">
                            <span className="text-xs font-mono text-slate-300">
                              {(seg.compatibilityScore * 100).toFixed(1)}%
                            </span>
                          </td>
                          <td className="py-3 pr-4">
                            <span className={`flex items-center gap-1.5 text-xs font-medium ${cfg.color}`}>
                              <Icon size={11} /> {fn}
                            </span>
                          </td>
                          <td className="py-3">
                            <span className={`text-xs font-mono ${confidence >= 70 ? 'text-emerald-400' : confidence >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
                              {confidence}%
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Metabolic Pathways */}
            <div className="glass-card p-6">
              <h2 className="text-emerald-400 font-semibold mb-2">Metabolic Pathways &amp; Processes</h2>
              <p className="text-xs text-slate-400 mb-5">Predicted biological functions</p>
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  { title: 'Primary Metabolism', color: 'text-emerald-400', border: 'border-emerald-500/20', desc: 'Photosynthesis, respiration, and nutrient assimilation pathways.' },
                  { title: 'Secondary Metabolism', color: 'text-cyan-400', border: 'border-cyan-500/20', desc: 'Synthesis of defense compounds and metabolic specialization.' },
                  { title: 'Stress Response', color: 'text-pink-400', border: 'border-pink-500/20', desc: 'Tolerance mechanisms for drought, heat, salt, and biotic stress.' },
                  { title: 'Development & Growth', color: 'text-amber-400', border: 'border-amber-500/20', desc: 'Morphogenesis, flowering, and reproductive processes.' },
                ].map(({ title, color, border, desc }) => (
                  <div key={title} className={`glass-card p-4 border ${border}`}>
                    <h3 className={`text-sm font-semibold mb-1.5 ${color}`}>{title}</h3>
                    <p className="text-xs text-slate-400">{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

import { Dna, Calculator, Layers, BookOpen, Code2, FlaskConical } from 'lucide-react';

const ALGORITHMS = [
  {
    title: 'GC Content Calculation',
    formula: 'GC% = (G + C) / total_length × 100',
    desc: 'Measures the ratio of guanine and cytosine bases to total sequence length. Optimal range (40–60%) indicates stable hybridization conditions.',
    icon: Calculator,
    color: 'text-emerald-400',
  },
  {
    title: 'Positional Similarity',
    formula: 'score = matched_positions / max_length',
    desc: 'Direct position-by-position base matching between aligned sequences, normalized to the longer sequence length.',
    icon: Layers,
    color: 'text-blue-400',
  },
  {
    title: 'Smith-Waterman Local Alignment',
    formula: 'SW = max(0, diag+match, up+gap, left+gap)',
    desc: 'Classic dynamic programming algorithm for local sequence alignment. Identifies the highest-scoring shared subsequence between two DNA strings.',
    icon: Code2,
    color: 'text-amber-400',
  },
  {
    title: 'K-mer Jaccard Similarity',
    formula: 'J = |A ∩ B| / |A ∪ B|  (k=4)',
    desc: 'Compares sets of 4-mer substrings from each sequence using the Jaccard index. Captures compositional similarity independent of position.',
    icon: FlaskConical,
    color: 'text-red-400',
  },
];

const RULES = [
  { label: 'First 10% of sequence', type: 'Promoter Region', color: 'text-amber-400', desc: 'Regulatory element region governing transcription initiation.' },
  { label: 'GC content > 65%', type: 'Insertion Site', color: 'text-red-400', desc: 'High-GC regions may resist integration due to chromatin compaction.' },
  { label: 'GC content 40–60%', type: 'Optimal Zone', color: 'text-emerald-400', desc: 'Ideal target for stable transgene insertion and expression.' },
  { label: 'All other regions', type: 'Coding Region', color: 'text-blue-400', desc: 'Standard exon/intron coding regions with variable compatibility.' },
];

export default function About() {
  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-12">
        {/* Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 mb-4">
            <Dna size={24} className="text-emerald-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-3">About DNACompat</h1>
          <p className="text-slate-400 leading-relaxed max-w-2xl mx-auto">
            A research-oriented dashboard for visualizing and quantifying DNA sequence compatibility
            between donor and target crop genomes. All computations are deterministic and based on
            established bioinformatics algorithms.
          </p>
        </div>

        {/* Algorithms */}
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <BookOpen size={16} className="text-emerald-400" />
            <h2 className="text-lg font-semibold text-white">Scoring Algorithms</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {ALGORITHMS.map(({ title, formula, desc, icon: Icon, color }) => (
              <div key={title} className="glass-card p-5">
                <div className={`flex items-center gap-2 mb-3 ${color}`}>
                  <Icon size={15} />
                  <span className="font-semibold text-sm">{title}</span>
                </div>
                <code className="block text-xs font-mono bg-slate-900/60 rounded px-3 py-2 text-slate-300 mb-3 border border-white/5">
                  {formula}
                </code>
                <p className="text-slate-400 text-xs leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
          <div className="glass-card p-4 mt-4 bg-emerald-500/5 border-emerald-500/20">
            <p className="text-xs text-slate-300 leading-relaxed">
              <span className="text-emerald-400 font-semibold">Composite Score: </span>
              The final compatibility score is a weighted combination: Positional (40%) + Smith-Waterman (30%) + K-mer (30%). This composite approach is more robust than any single metric.
            </p>
          </div>
        </section>

        {/* Region rules */}
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <Layers size={16} className="text-emerald-400" />
            <h2 className="text-lg font-semibold text-white">Region Classification Rules</h2>
          </div>
          <div className="glass-card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left px-5 py-3 text-slate-400 text-xs uppercase">Condition</th>
                  <th className="text-left px-5 py-3 text-slate-400 text-xs uppercase">Region Type</th>
                  <th className="text-left px-5 py-3 text-slate-400 text-xs uppercase hidden sm:table-cell">Description</th>
                </tr>
              </thead>
              <tbody>
                {RULES.map(({ label, type, color, desc }, i) => (
                  <tr key={i} className="border-b border-white/5 last:border-0 hover:bg-white/3 transition-colors">
                    <td className="px-5 py-3.5 font-mono text-xs text-slate-300">{label}</td>
                    <td className={`px-5 py-3.5 font-semibold text-xs ${color}`}>{type}</td>
                    <td className="px-5 py-3.5 text-xs text-slate-400 hidden sm:table-cell">{desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Data sources */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <FlaskConical size={16} className="text-emerald-400" />
            <h2 className="text-lg font-semibold text-white">Dataset</h2>
          </div>
          <div className="glass-card p-5">
            <p className="text-slate-400 text-sm leading-relaxed mb-4">
              The application ships with representative gene sequences for five major crop species.
              Each CSV contains curated genes including housekeeping genes (Actin), photosynthesis-related
              genes (RBCS), transcription factors (WRKY, NAC, MYB), and growth regulators (GA oxidases).
            </p>
            <div className="grid sm:grid-cols-5 gap-2">
              {['Rice', 'Wheat', 'Maize', 'Soybean', 'Barley'].map((crop) => (
                <div key={crop} className="bg-slate-800/50 rounded-lg px-3 py-2 text-center border border-white/5">
                  <p className="text-xs font-semibold text-white">{crop}</p>
                  <p className="text-xs text-slate-500 mt-0.5">5 genes</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

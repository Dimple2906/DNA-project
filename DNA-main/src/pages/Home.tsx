import { Dna, BarChart2, Zap, Database } from 'lucide-react';

interface HomeProps {
  onNavigate: (page: string) => void;
}

const FEATURES = [
  {
    icon: Dna,
    title: 'DNA Helix Visualization',
    desc: 'Animated SVG helix with color-coded, clickable segmented regions for deep sequence inspection.',
    color: 'text-emerald-400',
    glow: 'shadow-emerald-500/20',
  },
  {
    icon: BarChart2,
    title: 'Real Compatibility Scoring',
    desc: 'Composite algorithm combining positional alignment, Smith-Waterman scoring, and k-mer Jaccard similarity.',
    color: 'text-blue-400',
    glow: 'shadow-blue-500/20',
  },
  {
    icon: Zap,
    title: 'Rule-Based Region Analysis',
    desc: 'Automatic detection of promoter regions, optimal GC zones, and high-GC insertion sites — no randomness.',
    color: 'text-amber-400',
    glow: 'shadow-amber-500/20',
  },
  {
    icon: Database,
    title: 'Multi-Crop Dataset',
    desc: 'Dynamic CSV loading for Rice, Wheat, Maize, Soybean, and Barley gene sequences.',
    color: 'text-red-400',
    glow: 'shadow-red-500/20',
  },
];

const CROPS = ['Rice', 'Wheat', 'Maize', 'Soybean', 'Barley'];

export default function Home({ onNavigate }: HomeProps) {
  return (
    <div className="min-h-screen pt-20 pb-16">
      {/* Hero */}
      <section className="relative max-w-5xl mx-auto px-4 sm:px-6 pt-16 pb-20 text-center">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-8 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-3xl" />
        </div>

        <div className="relative">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full px-4 py-1.5 text-sm text-emerald-300 mb-6">
            <Dna size={14} />
            DNA Compatibility Dashboard
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
            Visualize Plant Gene
            <span className="block mt-1 bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
              Transfer Compatibility
            </span>
          </h1>

          <p className="text-slate-400 text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
            Analyze DNA sequences from donor and target crops. Explore region-level compatibility
            with animated visualizations, real computational scoring, and rule-based annotation.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => onNavigate('dashboard')}
              className="btn-primary text-base px-7 py-3"
            >
              Open Dashboard
            </button>
            <button
              onClick={() => onNavigate('about')}
              className="btn-ghost text-base px-7 py-3"
            >
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* Crop badges */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 pb-16">
        <div className="flex flex-wrap items-center justify-center gap-3">
          {CROPS.map((crop) => (
            <span
              key={crop}
              className="bg-slate-800/60 border border-white/10 rounded-full px-4 py-1.5 text-sm text-slate-300"
            >
              {crop}
            </span>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-16">
        <h2 className="text-center text-2xl font-semibold text-white mb-10">Key Capabilities</h2>
        <div className="grid sm:grid-cols-2 gap-5">
          {FEATURES.map(({ icon: Icon, title, desc, color, glow }) => (
            <div
              key={title}
              className={`glass-card p-6 flex gap-4 hover:shadow-lg ${glow} transition-shadow duration-300`}
            >
              <div className={`mt-0.5 shrink-0 ${color}`}>
                <Icon size={20} />
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1.5">{title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
        <div className="glass-card p-8 border-emerald-500/20">
          <Dna size={28} className="text-emerald-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Start Analyzing Now</h3>
          <p className="text-slate-400 text-sm mb-6">
            Select a donor and target crop, pick a gene sequence, and explore compatibility across every DNA region.
          </p>
          <button onClick={() => onNavigate('dashboard')} className="btn-primary px-8 py-2.5">
            Launch Dashboard
          </button>
        </div>
      </section>
    </div>
  );
}

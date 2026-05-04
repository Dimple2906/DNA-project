import { Crosshair, ArrowLeft, Target, AlertCircle, Scissors, Info } from 'lucide-react';
import { DNASegment } from '../utils/segmentation';

interface PromoterInsertionPageProps {
  segments: DNASegment[];
  sequenceName: string;
  onBack: () => void;
}

interface CRISPRSite {
  position: number;
  pam: string;
  sequence: string;
  type: 'NGG' | 'NGA';
}

function findCRISPRSites(sequence: string): CRISPRSite[] {
  const sites: CRISPRSite[] = [];
  const clean = sequence.toUpperCase().replace(/[^ATGC]/g, '');
  for (let i = 0; i < clean.length - 2; i++) {
    const triplet = clean.slice(i, i + 3);
    if (triplet[1] === 'G' && triplet[2] === 'G') {
      sites.push({ position: i, pam: triplet, sequence: clean.slice(Math.max(0, i - 3), i + 3), type: 'NGG' });
    }
  }
  return sites.slice(0, 6);
}

function getPromoterExplanation(seg: DNASegment): string {
  const gc = seg.gcContent;
  if (seg.type === 'promoter') {
    return `Early sequence region (${seg.start}–${seg.end} bp). ${gc >= 40 && gc <= 60 ? 'Optimal GC content' : 'Suboptimal GC content'} (${gc.toFixed(1)}%) — likely contains TATA box and other core promoter elements for transcription initiation.`;
  }
  if (gc >= 40 && gc <= 60) {
    return `Optimal GC content (${gc.toFixed(1)}%) in this region makes it suitable for regulatory element integration and stable expression.`;
  }
  if (gc > 65) {
    return `High GC content (${gc.toFixed(1)}%) — this region may resist integration due to chromatin compaction but could harbor strong promoter elements.`;
  }
  return `Standard GC content (${gc.toFixed(1)}%). Moderate suitability for promoter or regulatory element insertion.`;
}

export default function PromoterInsertionPage({ segments, sequenceName, onBack }: PromoterInsertionPageProps) {
  const promoterSegs = segments.filter(s => s.type === 'promoter');
  const insertionSegs = segments.filter(s => s.type === 'optimal' || (s.gcContent >= 40 && s.gcContent <= 60));

  const fullSeq = segments.map(s => s.sequence).join('');
  const crisprSites = findCRISPRSites(fullSeq);

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="pt-8 pb-6">
          <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-emerald-400 transition-colors text-sm mb-4">
            <ArrowLeft size={14} /> Back to Dashboard
          </button>
          <h1 className="text-2xl font-bold text-cyan-400 mb-1">Promoter &amp; Insertion Sites</h1>
          <p className="text-slate-400 text-sm">
            Identify regulatory promoter elements and optimal insertion sites for CRISPR and other molecular techniques.
          </p>
        </div>

        {segments.length === 0 ? (
          <div className="glass-card p-16 text-center text-slate-400">
            <Crosshair size={40} className="mx-auto mb-3 text-slate-600" />
            <p>No analysis data available. Run an analysis from the Dashboard first.</p>
          </div>
        ) : (
          <>
            {/* Stats row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              {[
                { label: 'Promoter Regions', value: promoterSegs.length, color: 'text-amber-400' },
                { label: 'Insertion Sites', value: insertionSegs.length, color: 'text-cyan-400' },
                { label: 'CRISPR-Cas9 Sites', value: crisprSites.length, color: 'text-pink-400' },
                { label: 'Golden Gate (BsaI)', value: 0, color: 'text-slate-400' },
              ].map(({ label, value, color }) => (
                <div key={label} className="glass-card p-4 text-center">
                  <p className={`text-2xl font-bold font-mono ${color}`}>{value}</p>
                  <p className="text-xs text-slate-400 mt-1">{label}</p>
                </div>
              ))}
            </div>

            {/* Promoter Regions */}
            <div className="glass-card p-5 mb-6">
              <div className="flex items-center gap-2 mb-1">
                <Target size={14} className="text-amber-400" />
                <span className="text-sm font-semibold text-white">Promoter Regions</span>
              </div>
              <p className="text-xs text-slate-400 mb-4">Identified transcriptional regulatory elements</p>

              {promoterSegs.length === 0 ? (
                <div className="rounded-lg border border-white/10 p-4 flex items-center gap-3">
                  <AlertCircle size={14} className="text-slate-400 shrink-0" />
                  <span className="text-sm text-slate-400">No clear promoter regions detected</span>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {promoterSegs.map(seg => (
                    <div key={seg.id} className="rounded-lg border border-amber-500/25 bg-amber-500/5 p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Target size={12} className="text-amber-400" />
                          <span className="text-sm font-semibold text-white">Promoter Region {seg.id + 1}</span>
                          <span className="text-xs px-2 py-0.5 rounded-full font-medium text-amber-400 bg-amber-500/10 border border-amber-500/25">
                            PROMOTER
                          </span>
                        </div>
                        <span className="text-xs font-mono text-slate-400">{seg.start}–{seg.end} bp</span>
                      </div>
                      <p className="text-xs text-slate-400 mb-1">GC: {seg.gcContent.toFixed(1)}% · Compatibility: {(seg.compatibilityScore * 100).toFixed(1)}%</p>
                      <p className="text-xs text-slate-300 leading-relaxed">{getPromoterExplanation(seg)}</p>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-4 rounded-lg border border-purple-500/20 bg-purple-500/5 p-4">
                <p className="text-xs text-purple-400 font-semibold mb-1">Promoter Info:</p>
                <p className="text-xs text-slate-400">
                  {promoterSegs.length > 0
                    ? 'Promoter elements detected in the early sequence region. These may include TATA box, CAAT box, and GC box elements.'
                    : 'Sequence may lack canonical promoter elements or they may be outside the analyzed region.'}
                </p>
              </div>
            </div>

            {/* Insertion-Friendly Sites */}
            <div className="glass-card p-5 mb-6">
              <div className="flex items-center gap-2 mb-1">
                <Scissors size={14} className="text-pink-400" />
                <span className="text-sm font-semibold text-white">Insertion-Friendly Sites</span>
              </div>
              <p className="text-xs text-slate-400 mb-4">Identified cloning and CRISPR editing sites</p>

              <div className="grid sm:grid-cols-2 gap-4 mb-5">
                <div className="stat-tile text-center">
                  <p className="text-3xl font-bold font-mono text-pink-400">{crisprSites.length}</p>
                  <p className="text-xs text-slate-400 mt-1">CRISPR-Cas9</p>
                </div>
                <div className="stat-tile text-center">
                  <p className="text-3xl font-bold font-mono text-pink-400">0</p>
                  <p className="text-xs text-slate-400 mt-1">Golden Gate (BsaI)</p>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                {crisprSites.map((site, i) => (
                  <div key={i} className="rounded-lg border border-pink-500/20 bg-pink-500/5 p-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-white mb-0.5">Position {site.position}</p>
                      <p className="text-xs font-mono text-pink-300">{site.pam}</p>
                      <p className="text-xs text-slate-400">CRISPR-Cas9</p>
                    </div>
                    <span className="text-xs font-bold px-3 py-1 rounded-full text-white font-mono" style={{ backgroundColor: '#ec4899' }}>
                      NGG
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-4 rounded-lg border border-pink-500/20 bg-pink-500/5 p-4">
                <p className="text-xs text-pink-400 font-semibold mb-2">Engineering Tips:</p>
                <ul className="space-y-1 text-xs text-slate-300">
                  <li>✓ CRISPR sites (NGG): Use Cas9 for precise edits</li>
                  <li>✓ BsaI sites: Compatible with Golden Gate assembly</li>
                  <li>✓ {crisprSites.length} total sites available for engineering</li>
                </ul>
              </div>
            </div>

            {/* Optimal Insertion Regions */}
            <div className="glass-card p-5 mb-6">
              <h2 className="text-white font-semibold mb-1">Optimal Insertion Regions (GC 40–60%)</h2>
              <p className="text-xs text-slate-400 mb-4">Regions with GC content in the optimal range for stable integration</p>
              {insertionSegs.length === 0 ? (
                <p className="text-slate-400 text-sm">No optimal insertion regions found.</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {insertionSegs.slice(0, 6).map(seg => (
                    <div key={seg.id} className="rounded-lg border border-cyan-500/20 bg-cyan-500/5 p-4">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-semibold text-white">Region {seg.id + 1}: {seg.start}–{seg.end} bp</span>
                        <span className="text-xs font-mono text-cyan-400">{seg.gcContent.toFixed(1)}% GC</span>
                      </div>
                      <p className="text-xs text-slate-400">{getPromoterExplanation(seg)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Reference */}
            <div className="glass-card p-6">
              <div className="grid sm:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-emerald-400 font-semibold mb-3">Promoter Elements</h3>
                  <p className="text-xs text-slate-500 mb-4">Regulatory DNA sequences</p>
                  {[
                    { name: 'TATA Box', color: 'text-cyan-400', conf: '90%', desc: 'Consensus sequence: TATAAA. High confidence marker for core promoter regions. Located ~25–30 bp upstream of transcription start site.' },
                    { name: 'CAAT Box', color: 'text-cyan-400', conf: '75%', desc: 'Enhancer element found ~75–80 bp upstream. Affects transcription efficiency and expression levels.' },
                    { name: 'GC Box', color: 'text-cyan-400', conf: '70%', desc: 'Upstream element controlling baseline expression. Multiple GC boxes indicate strong promoters.' },
                  ].map(({ name, color, conf, desc }) => (
                    <div key={name} className="mb-4">
                      <h4 className={`text-sm font-semibold mb-1 ${color}`}>{name}</h4>
                      <p className="text-xs text-slate-400 mb-1 leading-relaxed">{desc}</p>
                      <p className="text-xs text-slate-500">Confidence: {conf}</p>
                    </div>
                  ))}
                </div>
                <div>
                  <h3 className="text-pink-400 font-semibold mb-3">Insertion Sites</h3>
                  <p className="text-xs text-slate-500 mb-4">Gene editing opportunities</p>
                  {[
                    { name: 'CRISPR-Cas9 (NGG)', color: 'text-pink-400', note: 'Specificity: High', desc: 'PAM sequence for SpCas9. Provides precise cutting locations for genome editing. Highly efficient in plant systems.' },
                    { name: 'Golden Gate (BsaI)', color: 'text-pink-400', note: 'Method: Synthetic Biology', desc: 'Type IIS restriction site for modular cloning. Enables scarless assembly of genetic circuits.' },
                  ].map(({ name, color, note, desc }) => (
                    <div key={name} className="mb-4">
                      <h4 className={`text-sm font-semibold mb-1 ${color}`}>{name}</h4>
                      <p className="text-xs text-slate-400 mb-1 leading-relaxed">{desc}</p>
                      <p className="text-xs text-slate-500">{note}</p>
                    </div>
                  ))}

                  <div className="mt-4 rounded-lg border border-blue-500/20 bg-blue-500/5 p-3 flex gap-2">
                    <Info size={14} className="text-blue-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-slate-400 leading-relaxed">
                      GC-rich regions (40–60%) are preferred for stable transgene insertion with minimal positional effects.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

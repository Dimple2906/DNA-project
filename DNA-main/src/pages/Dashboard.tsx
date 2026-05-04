import { useState, useEffect, useCallback } from 'react';
import { RefreshCw, AlertCircle, ChevronDown, ChevronRight } from 'lucide-react';
import { AnalysisState } from '../App';
import { loadCSVFromPath, DNARecord } from '../utils/csvParser';
import { calculateGC, getBaseCounts } from '../utils/dnaUtils';
import { compositeCompatibilityScore } from '../utils/similarity';
import { segmentDNA, getOptimalChunkSize, DNASegment } from '../utils/segmentation';
import DNAVisualizer from '../components/DNAVisualizer';
import RegionDetails from '../components/RegionDetails';
import SidePanel from '../components/SidePanel';
import SummaryPanel from '../components/SummaryPanel';

const CROPS = [
  { id: 'rice', label: 'Rice (Oryza sativa)', file: '/data/rice.csv' },
  { id: 'wheat', label: 'Wheat (Triticum aestivum)', file: '/data/wheat.csv' },
  { id: 'maize', label: 'Maize (Zea mays)', file: '/data/maize.csv' },
  { id: 'soybean', label: 'Soybean (Glycine max)', file: '/data/soybean.csv' },
  { id: 'barley', label: 'Barley (Hordeum vulgare)', file: '/data/barley.csv' },
];

function SelectField({
  label,
  value,
  onChange,
  options,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs text-slate-400 uppercase tracking-wider">{label}</label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="w-full appearance-none bg-slate-800/60 border border-white/10 rounded-lg px-3.5 py-2.5 text-sm text-white pr-9 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/30 disabled:opacity-50 transition-colors"
        >
          <option value="">— Select —</option>
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
      </div>
    </div>
  );
}

export default function Dashboard({
  onAnalysisReady,
  onNavigate,
}: {
  onAnalysisReady?: (state: AnalysisState) => void;
  onNavigate?: (page: string) => void;
}) {
  const [donorCropId, setDonorCropId] = useState('rice');
  const [targetCropId, setTargetCropId] = useState('wheat');
  const [donorRecords, setDonorRecords] = useState<DNARecord[]>([]);
  const [targetRecords, setTargetRecords] = useState<DNARecord[]>([]);
  const [selectedDonorId, setSelectedDonorId] = useState('');
  const [selectedTargetId, setSelectedTargetId] = useState('');
  const [segments, setSegments] = useState<DNASegment[]>([]);
  const [selectedSegment, setSelectedSegment] = useState<DNASegment | null>(null);
  const [overallScore, setOverallScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const donorCrop = CROPS.find((c) => c.id === donorCropId)!;
  const targetCrop = CROPS.find((c) => c.id === targetCropId)!;

  const loadCropData = useCallback(async (cropId: string, which: 'donor' | 'target') => {
    const crop = CROPS.find((c) => c.id === cropId);
    if (!crop) return;
    try {
      const records = await loadCSVFromPath(crop.file);
      if (which === 'donor') {
        setDonorRecords(records);
        setSelectedDonorId(records[0]?.id.toString() || '');
      } else {
        setTargetRecords(records);
        setSelectedTargetId(records[0]?.id.toString() || '');
      }
    } catch (e) {
      setError(`Failed to load ${cropId} data: ${(e as Error).message}`);
    }
  }, []);

  useEffect(() => { loadCropData(donorCropId, 'donor'); }, [donorCropId, loadCropData]);
  useEffect(() => { loadCropData(targetCropId, 'target'); }, [targetCropId, loadCropData]);

  const donorRecord = donorRecords.find((r) => r.id.toString() === selectedDonorId);
  const targetRecord = targetRecords.find((r) => r.id.toString() === selectedTargetId);

  const analyze = useCallback(() => {
    if (!donorRecord || !targetRecord) return;
    setLoading(true);
    setError(null);
    setSelectedSegment(null);

    setTimeout(() => {
      try {
        const chunk = getOptimalChunkSize(donorRecord.sequence.length);
        const segs = segmentDNA(donorRecord.sequence, chunk, targetRecord.sequence);
        setSegments(segs);

        const score = compositeCompatibilityScore(donorRecord.sequence, targetRecord.sequence);
        setOverallScore(score);
        onAnalysisReady?.({
          segments: segs,
          overallScore: score,
          donorCrop: donorCropId,
          targetCrop: targetCropId,
          sequenceName: donorRecord.name,
        });
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setLoading(false);
      }
    }, 300);
  }, [donorRecord, targetRecord]);

  useEffect(() => {
    if (donorRecord && targetRecord) analyze();
  }, [donorRecord, targetRecord, analyze]);

  const donorSeq = donorRecord?.sequence || '';
  const gcContent = calculateGC(donorSeq);
  const baseCounts = getBaseCounts(donorSeq);
  const highCompatCount = segments.filter((s) => s.compatibilityScore >= 0.7).length;

  const donorOptions = donorRecords.map((r) => ({ value: r.id.toString(), label: r.name }));
  const targetOptions = targetRecords.map((r) => ({ value: r.id.toString(), label: r.name }));
  const cropOptions = CROPS.map((c) => ({ value: c.id, label: c.label }));

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="pt-8 pb-6">
          <h1 className="text-2xl font-bold text-white mb-1">DNA Compatibility Dashboard</h1>
          <p className="text-slate-400 text-sm">Select donor and target crops to analyze sequence compatibility.</p>
        </div>

        {/* Controls */}
        <div className="glass-card p-5 mb-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
            <SelectField
              label="Donor Crop"
              value={donorCropId}
              onChange={(v) => { setDonorCropId(v); setSegments([]); }}
              options={cropOptions}
            />
            <SelectField
              label="Donor Gene"
              value={selectedDonorId}
              onChange={setSelectedDonorId}
              options={donorOptions}
              disabled={donorOptions.length === 0}
            />
            <SelectField
              label="Target Crop"
              value={targetCropId}
              onChange={(v) => { setTargetCropId(v); setSegments([]); }}
              options={cropOptions}
            />
            <SelectField
              label="Target Gene"
              value={selectedTargetId}
              onChange={setSelectedTargetId}
              options={targetOptions}
              disabled={targetOptions.length === 0}
            />
            <button
              onClick={analyze}
              disabled={!donorRecord || !targetRecord || loading}
              className="btn-primary flex items-center justify-center gap-2 py-2.5 disabled:opacity-50"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              {loading ? 'Analyzing…' : 'Analyze'}
            </button>
          </div>
        </div>

        {error && (
          <div className="glass-card p-4 mb-6 border-red-500/30 bg-red-500/5 flex items-start gap-3">
            <AlertCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        {segments.length > 0 && (
          <>
            {/* Visualizer */}
            <div className="glass-card p-5 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-white font-semibold">DNA Sequence Map</h2>
                  <p className="text-slate-400 text-xs mt-0.5">
                    {donorRecord?.name} — {donorSeq.length} bp — {segments.length} regions
                  </p>
                </div>
                {selectedSegment && (
                  <span
                    className="text-xs text-slate-400 bg-slate-700/50 px-3 py-1 rounded-full border border-white/10"
                  >
                    Region {selectedSegment.id + 1} selected
                  </span>
                )}
              </div>
              <DNAVisualizer
                segments={segments}
                selectedSegment={selectedSegment}
                onSegmentClick={setSelectedSegment}
              />
            </div>

            {/* Bottom grid */}
            <div className="grid lg:grid-cols-3 gap-5">
              <div className="lg:col-span-1">
                <SidePanel
                  sequenceName={donorRecord?.name || ''}
                  totalLength={donorSeq.length}
                  gcContent={gcContent}
                  baseCounts={baseCounts}
                  sequence={donorSeq}
                />
              </div>
              <div className="lg:col-span-1">
                <RegionDetails segment={selectedSegment} />
              </div>
              <div className="lg:col-span-1">
                <SummaryPanel
                  overallScore={overallScore}
                  donorCrop={donorCrop.id}
                  targetCrop={targetCrop.id}
                  sequenceName={donorRecord?.name || ''}
                  segmentCount={segments.length}
                  highCompatCount={highCompatCount}
                />
              </div>
            </div>

            {/* Advanced Analysis Navigation */}
            {onNavigate && (
              <div className="mt-6">
                <h2 className="text-white font-semibold mb-1">Advanced Analysis</h2>
                <p className="text-slate-400 text-xs mb-4">Click a card to explore detailed analysis</p>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    {
                      page: 'feasibility',
                      title: 'Feasible Regions',
                      color: 'text-emerald-400',
                      border: 'border-emerald-500/20',
                      bg: 'bg-emerald-500/5',
                      desc: 'Suitability analysis of gene sequence regions',
                      detail: 'Visualize high-suitability regions based on GC content and regulatory potential.',
                      stat: `${segments.length} total regions analyzed`,
                    },
                    {
                      page: 'promoter-insertion',
                      title: 'Promoter & Insertion Sites',
                      color: 'text-cyan-400',
                      border: 'border-cyan-500/20',
                      bg: 'bg-cyan-500/5',
                      desc: 'Identify regulatory elements and editing sites',
                      detail: 'Find promoter motifs (TATA, CAAT, GC) and CRISPR/Golden Gate insertion sites.',
                      stat: `${segments.filter(s => s.type === 'promoter').length} promoter region(s) found`,
                    },
                    {
                      page: 'gene-function',
                      title: 'Gene Function Prediction',
                      color: 'text-purple-400',
                      border: 'border-purple-500/20',
                      bg: 'bg-purple-500/5',
                      desc: 'Predict biological role and metabolic pathways',
                      detail: 'Rule-based analysis to determine gene function: Defense, Transport, Enzyme, or Structural.',
                      stat: 'Ready for analysis',
                    },
                    {
                      page: 'detailed-compatibility',
                      title: 'Compatibility Breakdown',
                      color: 'text-amber-400',
                      border: 'border-amber-500/20',
                      bg: 'bg-amber-500/5',
                      desc: 'Per-region compatibility detail view',
                      detail: 'Overall score with region-level breakdown, distribution chart, and full data table.',
                      stat: `${Math.round(overallScore * 100)}% overall score`,
                    },
                  ].map(({ page: p, title, color, border, bg, desc, detail, stat }) => (
                    <button
                      key={p}
                      onClick={() => onNavigate(p)}
                      className={`glass-card p-5 border ${border} ${bg} text-left hover:opacity-90 transition-opacity group`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <h3 className={`text-sm font-semibold ${color}`}>{title}</h3>
                        <ChevronRight size={14} className={`${color} opacity-60 group-hover:opacity-100 transition-opacity`} />
                      </div>
                      <p className="text-xs text-slate-400 mb-2">{desc}</p>
                      <p className="text-xs text-slate-500 mb-3">{detail}</p>
                      <p className={`text-sm font-semibold font-mono ${color}`}>{stat}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {!segments.length && !loading && !error && (
          <div className="glass-card p-16 text-center">
            <div className="w-16 h-16 rounded-full bg-slate-700/50 flex items-center justify-center mx-auto mb-4">
              <RefreshCw size={24} className="text-slate-500" />
            </div>
            <p className="text-slate-400">Select crops and click Analyze to begin.</p>
          </div>
        )}
      </div>
    </div>
  );
}

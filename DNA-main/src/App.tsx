import { useState } from 'react';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import About from './pages/About';
import FeasibilityPage from './pages/FeasibilityPage';
import GeneFunctionPage from './pages/GeneFunctionPage';
import DetailedCompatibilityPage from './pages/DetailedCompatibilityPage';
import PromoterInsertionPage from './pages/PromoterInsertionPage';
import { DNASegment } from './utils/segmentation';

export type Page =
  | 'home'
  | 'dashboard'
  | 'about'
  | 'feasibility'
  | 'gene-function'
  | 'detailed-compatibility'
  | 'promoter-insertion';

export interface AnalysisState {
  segments: DNASegment[];
  overallScore: number;
  donorCrop: string;
  targetCrop: string;
  sequenceName: string;
}

export default function App() {
  const [page, setPage] = useState<Page>('home');
  const [analysis, setAnalysis] = useState<AnalysisState>({
    segments: [],
    overallScore: 0,
    donorCrop: '',
    targetCrop: '',
    sequenceName: '',
  });

  const navigate = (p: string) => setPage(p as Page);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar currentPage={page} onNavigate={navigate} />

      {page === 'home' && <Home onNavigate={navigate} />}

      {page === 'dashboard' && (
        <Dashboard onAnalysisReady={setAnalysis} onNavigate={navigate} />
      )}

      {page === 'about' && <About />}

      {page === 'feasibility' && (
        <FeasibilityPage
          segments={analysis.segments}
          sequenceName={analysis.sequenceName}
          onBack={() => navigate('dashboard')}
        />
      )}

      {page === 'gene-function' && (
        <GeneFunctionPage
          segments={analysis.segments}
          sequenceName={analysis.sequenceName}
          onBack={() => navigate('dashboard')}
        />
      )}

      {page === 'detailed-compatibility' && (
        <DetailedCompatibilityPage
          segments={analysis.segments}
          overallScore={analysis.overallScore}
          donorCrop={analysis.donorCrop}
          targetCrop={analysis.targetCrop}
          sequenceName={analysis.sequenceName}
          onBack={() => navigate('dashboard')}
        />
      )}

      {page === 'promoter-insertion' && (
        <PromoterInsertionPage
          segments={analysis.segments}
          sequenceName={analysis.sequenceName}
          onBack={() => navigate('dashboard')}
        />
      )}
    </div>
  );
}

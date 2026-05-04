import { useState } from 'react';
import { Dna, BarChart2, Home, Info, Menu, X } from 'lucide-react';

interface NavbarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export default function Navbar({ currentPage, onNavigate }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'dashboard', label: 'Dashboard', icon: BarChart2 },
    { id: 'about', label: 'About', icon: Info },
  ];

  const analysisLinks = [
    { id: 'feasibility', label: 'Feasibility' },
    { id: 'promoter-insertion', label: 'Promoters' },
    { id: 'gene-function', label: 'Gene Function' },
    { id: 'detailed-compatibility', label: 'Compatibility' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 navbar-glass border-b border-emerald-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2.5 group"
          >
            <div className="relative">
              <Dna
                size={28}
                className="text-emerald-400 group-hover:text-emerald-300 transition-colors"
              />
              <span className="absolute inset-0 blur-sm bg-emerald-400/30 rounded-full group-hover:bg-emerald-300/40 transition-colors" />
            </div>
            <span className="text-white font-bold text-lg tracking-tight">
              DNA<span className="text-emerald-400">Compat</span>
            </span>
          </button>

          <div className="hidden md:flex items-center gap-1">
            {links.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => onNavigate(id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  currentPage === id
                    ? 'bg-emerald-500/20 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon size={15} />
                {label}
              </button>
            ))}
            <div className="w-px h-5 bg-white/10 mx-1" />
            {analysisLinks.map(({ id, label }) => (
              <button
                key={id}
                onClick={() => onNavigate(id)}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                  currentPage === id
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <button
            className="md:hidden text-slate-400 hover:text-white"
            onClick={() => setMobileOpen((o) => !o)}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-white/10 bg-slate-900/95 backdrop-blur px-4 py-3 flex flex-col gap-1">
          {links.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => { onNavigate(id); setMobileOpen(false); }}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                currentPage === id
                  ? 'bg-emerald-500/20 text-emerald-300'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
          <div className="border-t border-white/8 my-1 pt-1">
            <p className="text-xs text-slate-500 px-4 py-1 uppercase tracking-wider">Analysis</p>
            {analysisLinks.map(({ id, label }) => (
              <button
                key={id}
                onClick={() => { onNavigate(id); setMobileOpen(false); }}
                className={`w-full text-left px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                  currentPage === id
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : 'text-slate-500 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}

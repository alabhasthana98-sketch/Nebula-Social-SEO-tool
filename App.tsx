
import React, { useState, useEffect, useRef } from 'react';
import StarField from './components/StarField';
import VideoProcessor from './components/VideoProcessor';
import FileUploader from './components/FileUploader';
import ResultDashboard from './components/ResultDashboard';
import { generateStrategy } from './services/geminiService';
import { 
  Platform, Mode, PrimaryGoal, HookStyle, AnalysisRequest, SocialStrategyResponse, MediaAsset 
} from './types';

// --- Icons ---
const SparkIcon = ({ className }: { className?: string }) => <svg className={className || "w-5 h-5"} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>;
const HistoryIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>;
const TrashIcon = () => <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>;
const SearchIcon = () => <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>;

// Social Icons
const InstaIcon = () => <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>;
const TikTokIcon = () => <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.65-1.62-1.12v8.76c-.52 4.03-3.35 7.42-7.41 7.41 5.6.35-8.4-5.37-5.91-9.94 1.43-2.68 4.41-4.04 7.42-3.39.02 1.05.02 2.1.02 3.15-2.4-.42-4.98.71-5.91 3.03-.79 2.22.42 5.09 2.72 5.51 2.87.5 5.25-1.39 5.37-4.18V.02z"/></svg>;
const YoutubeIcon = () => <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>;
const LinkedInIcon = () => <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>;
const TwitterIcon = () => <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>;
const FacebookIcon = () => <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/></svg>;

// Mode Icons
const CreatorIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>;
const EditorIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>;
const SpyIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>;
const TrendIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>;

interface BrandHistoryItem {
    id: string;
    text: string;
    timestamp: number;
}

export default function App() {
  // State
  const [platform, setPlatform] = useState<Platform>(Platform.Instagram);
  const [mode, setMode] = useState<Mode>(Mode.Creator);
  const [goal, setGoal] = useState<PrimaryGoal>(PrimaryGoal.Views);
  const [hookStyle, setHookStyle] = useState<HookStyle>(HookStyle.Curiosity);
  
  const [niche, setNiche] = useState('Tech & AI');
  const [contextInput, setContextInput] = useState('');
  
  // Brand DNA State
  const [brandDNA, setBrandDNA] = useState('');
  const [brandDNAHistory, setBrandDNAHistory] = useState<BrandHistoryItem[]>([]);
  const [showBrandHistory, setShowBrandHistory] = useState(false);
  const [historySearchTerm, setHistorySearchTerm] = useState('');
  const brandHistoryRef = useRef<HTMLDivElement>(null);
  
  // Advanced Targeting State
  const [targetAudience, setTargetAudience] = useState('');
  const [demographics, setDemographics] = useState('');
  const [geoFocus, setGeoFocus] = useState('');
  
  // Advanced Features State (Smart Defaults Enabled)
  const [useThinking] = useState(true);
  const [useLiveTrends] = useState(true);
  const [useMaps, setUseMaps] = useState(false); // Only enable if user grants location
  
  // Media State
  const [videoFrames, setVideoFrames] = useState<string[]>([]);
  const [mediaAssets, setMediaAssets] = useState<MediaAsset[]>([]);
  const [location, setLocation] = useState<{lat: number, lng: number} | undefined>(undefined);
  
  // Response State
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SocialStrategyResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [analysisStage, setAnalysisStage] = useState<'initial' | 'refine'>('initial');

  // Load Brand DNA from local storage
  useEffect(() => {
    const savedDNA = localStorage.getItem('nebula_brand_dna');
    if (savedDNA) setBrandDNA(savedDNA);

    const savedHistory = localStorage.getItem('nebula_brand_dna_history');
    if (savedHistory) {
        try {
            const parsed = JSON.parse(savedHistory);
            // Migrate old string-only history to new object format if needed
            if (Array.isArray(parsed) && parsed.length > 0) {
                if (typeof parsed[0] === 'string') {
                    const migrated = parsed.map((item: string) => ({
                        id: Date.now().toString() + Math.random(),
                        text: item,
                        timestamp: Date.now()
                    }));
                    setBrandDNAHistory(migrated);
                } else {
                    setBrandDNAHistory(parsed);
                }
            }
        } catch (e) {
            console.error("Failed to parse brand history", e);
        }
    }
  }, []);

  const saveBrandDNA = (dna: string) => {
    setBrandDNA(dna);
    localStorage.setItem('nebula_brand_dna', dna);
  };

  const addToBrandHistory = (dna: string) => {
      const trimmed = dna.trim();
      if (!trimmed) return;
      
      const newItem: BrandHistoryItem = {
          id: Date.now().toString(),
          text: trimmed,
          timestamp: Date.now()
      };
      
      // Prevent duplicates by checking text content, remove old instance if exists
      const filtered = brandDNAHistory.filter(item => item.text !== trimmed);
      
      const newHistory = [newItem, ...filtered].slice(0, 20); // Keep last 20
      setBrandDNAHistory(newHistory);
      localStorage.setItem('nebula_brand_dna_history', JSON.stringify(newHistory));
  };

  const deleteFromHistory = (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      const newHistory = brandDNAHistory.filter((item) => item.id !== id);
      setBrandDNAHistory(newHistory);
      localStorage.setItem('nebula_brand_dna_history', JSON.stringify(newHistory));
  }

  // Close history dropdown when clicking outside
  useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
          if (brandHistoryRef.current && !brandHistoryRef.current.contains(event.target as Node)) {
              setShowBrandHistory(false);
          }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatDate = (timestamp: number) => {
      return new Date(timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const filteredHistory = brandDNAHistory.filter(item => 
      item.text.toLowerCase().includes(historySearchTerm.toLowerCase())
  );

  const handleSubmit = async (action: 'audit' | 'generate' = 'generate') => {
    setLoading(true);
    setError(null);
    setResult(null);
    setAnalysisStage(action === 'audit' ? 'initial' : 'refine');

    // Auto-save brand DNA to history on submit
    if (brandDNA) {
        addToBrandHistory(brandDNA);
    }

    try {
      const request: AnalysisRequest = {
        platform,
        mode,
        goal,
        hookStyle,
        niche,
        contextInput,
        brandDNA,
        mediaAssets,
        videoFrames,
        useThinking,
        useLiveTrends,
        useMaps,
        location,
        targetAudience,
        demographics,
        geoFocus,
        action
      };

      const response = await generateStrategy(request);
      setResult(response);
    } catch (err: any) {
      setError(err.message || "An error occurred during generation.");
    } finally {
      setLoading(false);
    }
  };

  const handleInitialSubmit = () => {
    // Only use Audit mode if specifically in Editor mode.
    // Creator mode should ALWAYS generate new ideas/hooks regardless of input length.
    if (mode === Mode.Editor && contextInput.trim().length > 10) {
        handleSubmit('audit');
    } else {
        handleSubmit('generate');
    }
  };

  const handleRefine = () => {
      handleSubmit('generate');
  };

  // Helper for placeholders
  const getContextPlaceholder = () => {
    switch (mode) {
      case Mode.CompetitorSpy: return "Paste a competitor's URL, Bio, Caption, or describe their visual style here. UPLOAD screenshots or videos below for best results.";
      case Mode.Editor: return "Paste your draft caption, current hashtags, or script here. I will critique it and then refine it for maximum Social SEO.";
      case Mode.TrendHunter: return "Enter keywords separated by comma (e.g. 'vegan recipes, summer fashion, tech gadgets'). I will find viral trends for your niche and these keywords.";
      default: return "Describe your content idea, key value proposition, or rough script. I will generate a full viral strategy.";
    }
  };

  const getMediaLabel = () => {
     switch (mode) {
      case Mode.CompetitorSpy: return "Upload Competitor Assets (Screenshots / Videos)";
      case Mode.Editor: return "Upload Your Draft Assets (Images / PDF)";
      default: return "Your Assets (Visual Context)";
    }
  }

  const getButtonText = () => {
      if (loading) return "Analyzing Neural Pathways...";
      switch (mode) {
          case Mode.CompetitorSpy: return "Analyze Competitor Strategy";
          case Mode.TrendHunter: return "Hunt Viral Trends";
          case Mode.Editor: return "Audit & Refine Draft";
          default: return "Generate Strategy";
      }
  }

  return (
    <div className="min-h-screen text-slate-200 font-sans selection:bg-nebula-cyan selection:text-space-950">
      <StarField />
      
      <main className="relative z-10 container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <header className="mb-10 text-center">
          <div className="inline-block p-1 rounded-full bg-gradient-to-r from-nebula-cyan to-nebula-purple mb-4">
             <div className="bg-space-950 rounded-full px-4 py-1 text-xs font-mono font-bold tracking-wider uppercase">
               v.Andromeda // Beta
             </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white via-nebula-cyan to-nebula-purple">
            NEBULA
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Omni-Channel AI Strategist
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN: Mission Control (Interactive Configuration) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* 1. Platform & Mode Selector (Universal) */}
            <div className="glass-panel rounded-2xl p-6 space-y-6">
              
              {/* Platforms */}
              <div>
                <label className="block text-xs uppercase tracking-wider text-slate-500 mb-3 font-bold">1. Select Platform</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: Platform.Instagram, icon: <InstaIcon />, label: 'Insta' },
                    { id: Platform.TikTok, icon: <TikTokIcon />, label: 'TikTok' },
                    { id: Platform.YouTube, icon: <YoutubeIcon />, label: 'YouTube' },
                    { id: Platform.LinkedIn, icon: <LinkedInIcon />, label: 'LinkedIn' },
                    { id: Platform.TwitterX, icon: <TwitterIcon />, label: 'X / Twitter' },
                    { id: Platform.Facebook, icon: <FacebookIcon />, label: 'Facebook' },
                  ].map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setPlatform(p.id)}
                      className={`
                        flex flex-col items-center justify-center p-3 rounded-xl transition-all duration-200 border
                        ${platform === p.id 
                          ? 'bg-nebula-cyan/20 border-nebula-cyan text-white shadow-[0_0_15px_rgba(6,182,212,0.3)] transform scale-105' 
                          : 'bg-space-900/40 border-slate-800 text-slate-500 hover:bg-space-800 hover:text-slate-300'
                        }
                      `}
                    >
                      {p.icon}
                      <span className="text-xs mt-2 font-medium">{p.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Modes */}
              <div>
                <label className="block text-xs uppercase tracking-wider text-slate-500 mb-3 font-bold">2. Select Mode</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: Mode.Creator, icon: <CreatorIcon />, label: 'Creator', desc: 'Generate new ideas' },
                    { id: Mode.Editor, icon: <EditorIcon />, label: 'Editor', desc: 'Refine drafts' },
                    { id: Mode.CompetitorSpy, icon: <SpyIcon />, label: 'Spy', desc: 'Analyze rivals' },
                    { id: Mode.TrendHunter, icon: <TrendIcon />, label: 'Trends', desc: 'Find viral topics' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setMode(m.id)}
                      className={`
                        flex items-start p-3 rounded-xl transition-all duration-200 border text-left
                        ${mode === m.id 
                          ? 'bg-nebula-purple/20 border-nebula-purple text-white shadow-[0_0_15px_rgba(124,58,237,0.3)]' 
                          : 'bg-space-900/40 border-slate-800 text-slate-500 hover:bg-space-800'
                        }
                      `}
                    >
                      <div className={`mt-0.5 ${mode === m.id ? 'text-nebula-purple' : 'text-slate-500'}`}>{m.icon}</div>
                      <div className="ml-3">
                        <div className={`text-sm font-bold ${mode === m.id ? 'text-white' : 'text-slate-400'}`}>{m.label}</div>
                        <div className="text-[10px] text-slate-500 leading-tight mt-0.5">{m.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* DASHBOARD: CREATOR MODE SPECIFIC */}
            {mode === Mode.Creator && (
              <>
                {/* Goals */}
                <div className="glass-panel rounded-2xl p-6">
                  <label className="block text-xs uppercase tracking-wider text-slate-500 mb-3 font-bold">3. Primary Goal</label>
                  <div className="flex flex-wrap gap-2">
                    {Object.values(PrimaryGoal).map((g) => (
                      <button
                        key={g}
                        onClick={() => setGoal(g)}
                        className={`
                          px-3 py-1.5 rounded-lg text-xs font-medium border transition-all
                          ${goal === g 
                            ? 'bg-white text-space-950 border-white font-bold' 
                            : 'bg-space-900/40 border-slate-800 text-slate-400 hover:border-slate-600'
                          }
                        `}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Strategy Context (Full) */}
                <div className="glass-panel rounded-2xl p-6 relative">
                    <div className="flex justify-between items-center mb-4">
                        <label className="block text-xs uppercase tracking-wider text-slate-500 font-bold">4. Context & Targeting</label>
                    </div>
                    
                    <div className="space-y-4">
                        <div ref={brandHistoryRef} className="relative">
                            <div className="flex justify-between items-center mb-1">
                                 <label className="text-xs text-slate-500">Brand DNA</label>
                                 <div className="flex gap-2">
                                    <button
                                        onClick={() => setShowBrandHistory(!showBrandHistory)}
                                        className={`text-xs flex items-center gap-1 transition-colors ${showBrandHistory ? 'text-nebula-cyan' : 'text-slate-500 hover:text-white'}`}
                                        title="Brand History"
                                    >
                                        <HistoryIcon /> History
                                    </button>
                                 </div>
                            </div>
                            
                            {/* History Dropdown */}
                            {showBrandHistory && (
                                <div className="absolute top-8 right-0 w-full z-50 bg-space-900 border border-slate-700 rounded-lg shadow-2xl overflow-hidden animate-fadeIn flex flex-col max-h-72">
                                    <div className="p-2 bg-space-950/50 border-b border-slate-800 flex flex-col gap-2">
                                        <div className="text-xs font-bold text-slate-400">
                                            Saved Profiles ({brandDNAHistory.length})
                                        </div>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-2 flex items-center pointer-events-none text-slate-500">
                                                <SearchIcon />
                                            </div>
                                            <input 
                                                type="text"
                                                placeholder="Search history..."
                                                value={historySearchTerm}
                                                onChange={(e) => setHistorySearchTerm(e.target.value)}
                                                className="w-full bg-space-950 border border-slate-700 rounded px-8 py-1 text-xs text-slate-300 focus:border-nebula-cyan outline-none"
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className="overflow-y-auto flex-1">
                                        {filteredHistory.length === 0 ? (
                                            <div className="p-4 text-xs text-slate-500 text-center italic">
                                                {brandDNAHistory.length === 0 ? "No saved history yet." : "No matches found."}
                                            </div>
                                        ) : (
                                            <div>
                                                {filteredHistory.map((item) => (
                                                    <div 
                                                        key={item.id} 
                                                        className="group flex items-start justify-between p-3 hover:bg-space-800 border-b border-slate-800/50 last:border-0 cursor-pointer transition-colors"
                                                        onClick={() => {
                                                            saveBrandDNA(item.text);
                                                            setShowBrandHistory(false);
                                                        }}
                                                    >
                                                        <div className="flex-1 min-w-0 pr-2">
                                                            <div className="text-xs text-slate-300 truncate opacity-90 group-hover:opacity-100 font-medium">
                                                                {item.text}
                                                            </div>
                                                            <div className="text-[10px] text-slate-600 mt-1">
                                                                {formatDate(item.timestamp)}
                                                            </div>
                                                        </div>
                                                        <button 
                                                            onClick={(e) => deleteFromHistory(item.id, e)}
                                                            className="p-1 text-slate-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                                                            title="Remove from history"
                                                        >
                                                            <TrashIcon />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            <textarea 
                                value={brandDNA}
                                onChange={(e) => saveBrandDNA(e.target.value)}
                                placeholder="Brand voice, guidelines, bans..."
                                className="w-full bg-space-900/50 border border-slate-700 rounded-lg p-3 text-sm focus:border-nebula-purple outline-none h-16 resize-none mt-1"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                             <div>
                                <label className="text-xs text-slate-500">Niche</label>
                                <input 
                                    type="text" value={niche} onChange={(e) => setNiche(e.target.value)}
                                    className="w-full bg-space-900/50 border border-slate-700 rounded-lg p-2 text-sm mt-1 focus:border-nebula-cyan outline-none"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-slate-500">Audience</label>
                                <input 
                                    type="text" value={targetAudience} onChange={(e) => setTargetAudience(e.target.value)}
                                    placeholder="e.g. Busy Moms"
                                    className="w-full bg-space-900/50 border border-slate-700 rounded-lg p-2 text-sm mt-1 focus:border-nebula-cyan outline-none"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                             <div>
                                <label className="text-xs text-slate-500">Demographics</label>
                                <input 
                                    type="text" value={demographics} onChange={(e) => setDemographics(e.target.value)} placeholder="Age: 25-35"
                                    className="w-full bg-space-900/50 border border-slate-700 rounded-lg p-2 text-sm mt-1 focus:border-nebula-cyan outline-none"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-slate-500">Geo Focus</label>
                                <input 
                                    type="text" value={geoFocus} onChange={(e) => setGeoFocus(e.target.value)} placeholder="US, UK"
                                    className="w-full bg-space-900/50 border border-slate-700 rounded-lg p-2 text-sm mt-1 focus:border-nebula-cyan outline-none"
                                />
                            </div>
                        </div>
                    </div>
                </div>
              </>
            )}

            {/* DASHBOARD: EDITOR MODE SPECIFIC */}
            {mode === Mode.Editor && (
              <>
                 {/* Creative Direction */}
                <div className="glass-panel rounded-2xl p-6">
                    <label className="block text-xs uppercase tracking-wider text-slate-500 mb-3 font-bold">3. Creative Direction</label>
                     <div className="space-y-3">
                       <div>
                          <label className="text-xs text-slate-500 mb-1 block">Hook Style</label>
                          <div className="grid grid-cols-2 gap-2">
                            {[
                              { id: HookStyle.Curiosity, icon: "🤔", label: "Curiosity", hint: "You won't believe..." },
                              { id: HookStyle.ProblemSolution, icon: "🛠️", label: "Problem/Sol", hint: "Struggling with X? Fix it." },
                              { id: HookStyle.HowToEducational, icon: "📚", label: "How-To", hint: "3 simple steps to master..." },
                              { id: HookStyle.BoldControversial, icon: "🔥", label: "Controversial", hint: "Stop doing this! Why..." },
                              { id: HookStyle.RelatableEmotional, icon: "🥹", label: "Relatable", hint: "POV: You trying to..." },
                              { id: HookStyle.UrgencyFOMO, icon: "⏳", label: "FOMO", hint: "Don't scroll past this!" },
                              { id: HookStyle.Storytelling, icon: "📖", label: "Storytelling", hint: "Here's the story of how..." },
                              { id: HookStyle.List, icon: "📝", label: "Listicle", hint: "5 Tips to boost your..." },
                            ].map((style) => (
                               <button
                                key={style.id}
                                onClick={() => setHookStyle(style.id)}
                                className={`
                                  flex items-start p-2 rounded-lg text-xs text-left border transition-all
                                  ${hookStyle === style.id 
                                    ? 'bg-nebula-cyan/10 border-nebula-cyan text-white shadow-[0_0_10px_rgba(6,182,212,0.2)]' 
                                    : 'bg-space-900/30 border-slate-800 text-slate-400 hover:bg-space-800'
                                  }
                                `}
                               >
                                  <span className="text-lg mr-2">{style.icon}</span>
                                  <div>
                                    <div className="font-bold">{style.label}</div>
                                    <div className="text-[10px] opacity-70 truncate max-w-[100px]">{style.hint}</div>
                                  </div>
                               </button>
                            ))}
                          </div>
                       </div>
                     </div>
                </div>

                {/* Strategy Context (Brand Only) */}
                <div className="glass-panel rounded-2xl p-6 relative">
                     <label className="block text-xs uppercase tracking-wider text-slate-500 mb-3 font-bold">4. Context</label>
                     <div ref={brandHistoryRef} className="relative">
                            <div className="flex justify-between items-center mb-1">
                                 <label className="text-xs text-slate-500">Brand DNA</label>
                                 <div className="flex gap-2">
                                    <button
                                        onClick={() => setShowBrandHistory(!showBrandHistory)}
                                        className={`text-xs flex items-center gap-1 transition-colors ${showBrandHistory ? 'text-nebula-cyan' : 'text-slate-500 hover:text-white'}`}
                                        title="Brand History"
                                    >
                                        <HistoryIcon /> History
                                    </button>
                                 </div>
                            </div>
                            
                            {/* History Dropdown */}
                            {showBrandHistory && (
                                <div className="absolute top-8 right-0 w-full z-50 bg-space-900 border border-slate-700 rounded-lg shadow-2xl overflow-hidden animate-fadeIn flex flex-col max-h-72">
                                    <div className="p-2 bg-space-950/50 border-b border-slate-800 flex flex-col gap-2">
                                        <div className="text-xs font-bold text-slate-400">
                                            Saved Profiles ({brandDNAHistory.length})
                                        </div>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-2 flex items-center pointer-events-none text-slate-500">
                                                <SearchIcon />
                                            </div>
                                            <input 
                                                type="text"
                                                placeholder="Search history..."
                                                value={historySearchTerm}
                                                onChange={(e) => setHistorySearchTerm(e.target.value)}
                                                className="w-full bg-space-950 border border-slate-700 rounded px-8 py-1 text-xs text-slate-300 focus:border-nebula-cyan outline-none"
                                            />
                                        </div>
                                    </div>

                                    <div className="overflow-y-auto flex-1">
                                        {filteredHistory.length === 0 ? (
                                            <div className="p-4 text-xs text-slate-500 text-center italic">
                                                {brandDNAHistory.length === 0 ? "No saved history yet." : "No matches found."}
                                            </div>
                                        ) : (
                                            <div>
                                                {filteredHistory.map((item) => (
                                                    <div 
                                                        key={item.id} 
                                                        className="group flex items-start justify-between p-3 hover:bg-space-800 border-b border-slate-800/50 last:border-0 cursor-pointer transition-colors"
                                                        onClick={() => {
                                                            saveBrandDNA(item.text);
                                                            setShowBrandHistory(false);
                                                        }}
                                                    >
                                                        <div className="flex-1 min-w-0 pr-2">
                                                            <div className="text-xs text-slate-300 truncate opacity-90 group-hover:opacity-100 font-medium">
                                                                {item.text}
                                                            </div>
                                                            <div className="text-[10px] text-slate-600 mt-1">
                                                                {formatDate(item.timestamp)}
                                                            </div>
                                                        </div>
                                                        <button 
                                                            onClick={(e) => deleteFromHistory(item.id, e)}
                                                            className="p-1 text-slate-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                                                            title="Remove from history"
                                                        >
                                                            <TrashIcon />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            <textarea 
                                value={brandDNA}
                                onChange={(e) => saveBrandDNA(e.target.value)}
                                placeholder="Brand voice, guidelines, bans..."
                                className="w-full bg-space-900/50 border border-slate-700 rounded-lg p-3 text-sm focus:border-nebula-purple outline-none h-16 resize-none mt-1"
                            />
                        </div>
                </div>
              </>
            )}

            {/* DASHBOARD: TREND HUNTER MODE SPECIFIC */}
            {mode === Mode.TrendHunter && (
                 <div className="glass-panel rounded-2xl p-6">
                     <label className="block text-xs uppercase tracking-wider text-slate-500 mb-3 font-bold">3. Trend Settings</label>
                     <div className="space-y-3">
                        <div>
                            <label className="text-xs text-slate-500">Target Niche (Required)</label>
                            <input 
                                type="text" value={niche} onChange={(e) => setNiche(e.target.value)}
                                className="w-full bg-space-900/50 border border-slate-700 rounded-lg p-3 text-sm mt-1 focus:border-nebula-cyan outline-none"
                                placeholder="e.g. Sustainable Fashion, SaaS Marketing"
                            />
                        </div>
                        
                        {/* Exposed Targeting for Trend Hunter */}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-xs text-slate-500">Audience</label>
                                <input 
                                    type="text" value={targetAudience} onChange={(e) => setTargetAudience(e.target.value)}
                                    placeholder="e.g. Gen Z"
                                    className="w-full bg-space-900/50 border border-slate-700 rounded-lg p-2 text-sm mt-1 focus:border-nebula-cyan outline-none"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-slate-500">Geo Focus</label>
                                <input 
                                    type="text" value={geoFocus} onChange={(e) => setGeoFocus(e.target.value)} placeholder="US, UK"
                                    className="w-full bg-space-900/50 border border-slate-700 rounded-lg p-2 text-sm mt-1 focus:border-nebula-cyan outline-none"
                                />
                            </div>
                        </div>
                         <div>
                            <label className="text-xs text-slate-500">Demographics</label>
                            <input 
                                type="text" value={demographics} onChange={(e) => setDemographics(e.target.value)} placeholder="Age: 25-35, Interests"
                                className="w-full bg-space-900/50 border border-slate-700 rounded-lg p-2 text-sm mt-1 focus:border-nebula-cyan outline-none"
                            />
                        </div>

                         <p className="text-[10px] text-slate-500 mt-2">
                             I will use Google Search to find real-time viral topics matching these criteria.
                         </p>
                    </div>
                 </div>
            )}
            
            {/* DASHBOARD: SPY MODE SPECIFIC - Minimal Config */}
            {mode === Mode.CompetitorSpy && (
                 <div className="glass-panel rounded-2xl p-6 border border-amber-500/20">
                     <div className="flex items-center gap-3 text-amber-500">
                         <SpyIcon />
                         <span className="text-sm font-bold">Spy Mode Active</span>
                     </div>
                     <p className="text-xs text-slate-400 mt-2">
                         Configuration minimized. Please provide competitor assets or text context on the right to begin analysis.
                     </p>
                 </div>
            )}

          </div>

          {/* RIGHT COLUMN: Execution & Results */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Input Area */}
            <div className="glass-panel rounded-2xl p-1 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-nebula-cyan via-purple-500 to-nebula-cyan opacity-50"></div>
              
              <div className="p-4">
                  <label className="block text-xs uppercase tracking-wider text-nebula-cyan mb-2 font-bold flex items-center justify-between">
                     <span>Input Context</span>
                     <span className="text-slate-500 font-normal normal-case opacity-70">
                        {mode === Mode.CompetitorSpy ? "Spy Mode: Analyze Patterns" : mode === Mode.TrendHunter ? "Trend Mode: Search Niches" : mode === Mode.Editor ? "Editor Mode: Refine Drafts" : "Creator Mode: New Ideas"}
                     </span>
                  </label>
                  <textarea 
                    value={contextInput}
                    onChange={(e) => setContextInput(e.target.value)}
                    placeholder={getContextPlaceholder()}
                    className="w-full h-40 bg-space-900/30 border border-slate-800/50 rounded-xl p-4 text-base text-slate-200 placeholder-slate-600 focus:border-nebula-cyan/50 focus:ring-1 focus:ring-nebula-cyan/50 resize-none outline-none transition-all"
                  />
              </div>
              
              <div className="px-4 pb-4">
                 <label className="block text-xs uppercase tracking-wider text-slate-500 mb-2 font-bold">{getMediaLabel()}</label>
                 <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="flex-1 h-28">
                        <VideoProcessor 
                           isProcessing={loading} 
                           onFramesExtracted={(frames) => setVideoFrames(frames)}
                        />
                         {videoFrames.length > 0 && (
                          <div className="mt-1 text-xs text-nebula-cyan flex items-center justify-center animate-pulse">
                            <SparkIcon className="w-3 h-3" />
                            <span className="ml-1">{videoFrames.length} Frames Ready</span>
                          </div>
                        )}
                    </div>
                    <div className="flex-1 h-28">
                        <FileUploader 
                           disabled={loading}
                           onFilesSelected={setMediaAssets}
                        />
                    </div>
                 </div>

                 {/* Submit Button */}
                 <div className="flex justify-end">
                    <button 
                      onClick={() => handleInitialSubmit()}
                      disabled={loading}
                      className={`
                        w-full md:w-auto px-10 py-4 rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center border border-white/10
                        ${loading ? 'bg-slate-800 cursor-wait' : 'bg-gradient-to-r from-nebula-cyan to-nebula-purple hover:scale-105 hover:shadow-[0_0_30px_rgba(124,58,237,0.4)]'}
                      `}
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          {getButtonText()}
                        </>
                      ) : (
                        <>
                          <SparkIcon className="w-5 h-5" />
                          <span className="ml-2">
                            {getButtonText()}
                          </span>
                        </>
                      )}
                    </button>
                 </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-200 p-4 rounded-xl flex items-center animate-pulse">
                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <span>{error}</span>
              </div>
            )}

            {/* Result Dashboard */}
            {result && (
                <ResultDashboard 
                    data={result} 
                    isAudit={analysisStage === 'initial' && result.virality_score !== undefined && !result.hook && mode === Mode.Editor}
                    onRefine={handleRefine}
                />
            )}
            
          </div>
        </div>
      </main>
    </div>
  );
}

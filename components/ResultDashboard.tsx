
import React, { useState, useEffect } from 'react';
import { SocialStrategyResponse, Mode } from '../types';

interface ResultDashboardProps {
  data: SocialStrategyResponse;
  isAudit?: boolean;
  onRefine?: () => void;
}

const CopyIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path></svg>;
const CheckIcon = () => <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>;
const AccessibilityIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>;

// New Trend Graph Component
const TrendGraph = () => (
  <div className="flex flex-col items-end opacity-90">
    <svg className="w-28 h-10 text-emerald-400 drop-shadow-[0_0_5px_rgba(52,211,153,0.5)]" viewBox="0 0 120 40" fill="none" stroke="currentColor" strokeWidth="2">
        <defs>
        <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.3" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
        </defs>
        <path d="M0 35 Q 30 35, 40 20 T 70 25 T 100 10 T 120 2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M0 35 Q 30 35, 40 20 T 70 25 T 100 10 T 120 2 V 40 H 0 Z" fill="url(#trendGradient)" stroke="none" />
    </svg>
    <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest mt-1 flex items-center gap-1 animate-pulse">
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
        High Momentum
    </span>
  </div>
);

const ResultDashboard: React.FC<ResultDashboardProps> = ({ data, isAudit, onRefine }) => {
  const [activeTab, setActiveTab] = useState<'creative' | 'strategy' | 'intel'>('creative');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Set default tab based on mode
  useEffect(() => {
    if (data.mode === Mode.TrendHunter) setActiveTab('intel');
    else if (data.mode === Mode.CompetitorSpy) setActiveTab('intel');
    else setActiveTab('creative');
  }, [data.mode]);

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Virality Score Color Calculation
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-nebula-cyan drop-shadow-[0_0_10px_rgba(6,182,212,0.8)]';
    if (score >= 70) return 'text-nebula-purple drop-shadow-[0_0_10px_rgba(124,58,237,0.8)]';
    if (score > 0) return 'text-amber-400';
    return 'text-slate-600'; // 0 score color
  };

  const score = data.virality_score ?? 0;

  // --- TREND HUNTER MODE VIEW (Dedicated List) ---
  if (data.mode === Mode.TrendHunter) {
    return (
      <div className="w-full max-w-4xl mx-auto space-y-8 animate-fadeIn">
        
        {/* Trend Context Header */}
        <div className="glass-panel rounded-2xl p-8 border-l-4 border-nebula-cyan shadow-lg relative overflow-hidden">
           <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
              <svg className="w-32 h-32 text-nebula-cyan" fill="currentColor" viewBox="0 0 24 24"><path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"></path></svg>
           </div>
           
           <div className="relative z-10">
              <div className="flex items-center gap-3 mb-2">
                 <h2 className="text-3xl font-bold text-white tracking-tight">
                    {data.trend_metadata?.trend_name || "Trend Analysis Complete"}
                 </h2>
                 {data.trend_metadata?.trend_detected && (
                    <span className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider animate-pulse border border-emerald-500/30">
                       Live Trend Detected
                    </span>
                 )}
              </div>
              <p className="text-slate-300 text-lg max-w-2xl leading-relaxed">
                 {data.trend_metadata?.how_to_apply_trend || "We've identified the following viral opportunities based on your niche and keywords."}
              </p>
              <div className="mt-4 flex items-center gap-4 text-xs text-slate-500 font-mono uppercase tracking-widest">
                  <span>Source: {data.trend_metadata?.trend_source || "Global Search"}</span>
                  <span>•</span>
                  <span>Target: {data.seo_keywords?.[0] || "Niche Audience"}</span>
              </div>
           </div>
        </div>

        {/* The "List of Humanise Ideas" */}
        <div className="space-y-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <span className="text-nebula-cyan">●</span> Top Viral Opportunities
            </h3>
            
            {(!data.trend_hunter_ideas || data.trend_hunter_ideas.length === 0) ? (
                 <div className="p-8 text-center text-slate-500 border border-dashed border-slate-800 rounded-xl">
                    No specific trend ideas generated. Try broadening your keywords.
                 </div>
            ) : (
                data.trend_hunter_ideas.map((idea, index) => (
                    <div key={index} className="glass-panel rounded-2xl p-6 border border-white/5 hover:border-nebula-cyan/30 transition-all group">
                        <div className="flex flex-col md:flex-row gap-6">
                            {/* Number */}
                            <div className="hidden md:flex flex-col items-center justify-start pt-1">
                                <div className="w-10 h-10 rounded-full bg-space-900 border border-slate-700 flex items-center justify-center text-nebula-cyan font-bold text-lg group-hover:bg-nebula-cyan group-hover:text-space-950 transition-colors">
                                    {index + 1}
                                </div>
                            </div>
                            
                            {/* Content */}
                            <div className="flex-1 space-y-3">
                                <div className="flex justify-between items-start">
                                    <h4 className="text-xl font-bold text-white group-hover:text-nebula-cyan transition-colors">
                                        {idea.idea_title}
                                    </h4>
                                    <div className="flex gap-2">
                                        {idea.suggested_platforms?.map((p, i) => (
                                            <span key={i} className="text-[10px] uppercase font-bold text-slate-500 bg-space-950 px-2 py-1 rounded border border-slate-800">
                                                {p}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                
                                <p className="text-slate-300 leading-relaxed">
                                    {idea.idea_description}
                                </p>
                                
                                <div className="bg-space-900/50 rounded-xl p-4 mt-4 border border-white/5">
                                    <div className="text-xs text-slate-500 uppercase tracking-widest font-bold mb-1 flex items-center gap-2">
                                        <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                                        Psychology & Why it works
                                    </div>
                                    <p className="text-sm text-slate-400 italic">
                                        "{idea.why_it_works}"
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                ))
            )}
        </div>
      </div>
    );
  }

  // --- COMPETITOR SPY MODE VIEW (Tabular Dossier) ---
  if (data.mode === Mode.CompetitorSpy) {
    return (
        <div className="w-full max-w-5xl mx-auto space-y-8 animate-fadeIn">
            
            {/* Spy Header & Score */}
            <div className="glass-panel rounded-2xl p-8 border border-amber-500/20 shadow-[0_0_20px_rgba(245,158,11,0.1)] flex flex-col md:flex-row justify-between items-center gap-6">
                 <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <span className="bg-amber-500/10 text-amber-500 p-2 rounded-lg">
                           <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                        </span>
                        Competitor Dossier
                    </h2>
                    <p className="text-slate-400 mt-2 max-w-xl">
                        Analysis complete. We've deconstructed the competitor's strategy, detecting hidden patterns, keywords, and creative structures.
                    </p>
                 </div>
                 <div className="flex flex-col items-center">
                    <span className="text-xs text-amber-500 font-mono uppercase tracking-widest mb-1">Threat / Virality Level</span>
                    <div className="text-5xl font-black text-amber-500 font-mono drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]">
                        {score}/100
                    </div>
                 </div>
            </div>

            {/* Analysis Table */}
            <div className="glass-panel rounded-2xl overflow-hidden border border-white/5">
                <div className="p-4 bg-space-950/50 border-b border-slate-800 flex justify-between items-center">
                    <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Tactical Breakdown</h3>
                    <button 
                        onClick={() => handleCopy(JSON.stringify(data.competitor_insights, null, 2), 'full_dossier')}
                        className="text-xs text-slate-500 hover:text-white transition-colors flex items-center gap-1"
                    >
                        {copiedField === 'full_dossier' ? <CheckIcon /> : <CopyIcon />} Copy Report
                    </button>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-space-900/30 text-xs uppercase tracking-widest text-slate-500">
                                <th className="p-6 w-1/4 border-b border-slate-800">Analysis Point</th>
                                <th className="p-6 border-b border-slate-800">Competitor Strategy / Insight</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                            {/* Keywords */}
                            <tr className="group hover:bg-white/5 transition-colors">
                                <td className="p-6 text-sm font-bold text-nebula-cyan align-top">
                                    Target Keywords
                                </td>
                                <td className="p-6 align-top">
                                    <div className="flex flex-wrap gap-2">
                                        {data.competitor_insights?.keywords_detected?.map((kw, i) => (
                                            <span key={i} className="px-2 py-1 bg-space-900 border border-slate-700 rounded text-xs text-slate-300">
                                                {kw}
                                            </span>
                                        )) || <span className="text-slate-500 italic">No specific keywords detected.</span>}
                                    </div>
                                </td>
                            </tr>

                            {/* Hooks */}
                            <tr className="group hover:bg-white/5 transition-colors">
                                <td className="p-6 text-sm font-bold text-nebula-purple align-top">
                                    Hook Patterns
                                </td>
                                <td className="p-6 align-top">
                                    <ul className="space-y-2">
                                        {data.competitor_insights?.hook_patterns?.map((hook, i) => (
                                            <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                                                <span className="text-nebula-purple mt-1">▹</span> {hook}
                                            </li>
                                        )) || <span className="text-slate-500 italic">No distinct hook patterns found.</span>}
                                    </ul>
                                </td>
                            </tr>

                            {/* Video Style */}
                            <tr className="group hover:bg-white/5 transition-colors">
                                <td className="p-6 text-sm font-bold text-white align-top">
                                    Reel / Video Style
                                </td>
                                <td className="p-6 text-sm text-slate-300 leading-relaxed align-top">
                                    {data.competitor_insights?.video_style || data.competitor_insights?.visual_theme || "Analysis pending..."}
                                </td>
                            </tr>

                            {/* Caption Style */}
                            <tr className="group hover:bg-white/5 transition-colors">
                                <td className="p-6 text-sm font-bold text-white align-top">
                                    Caption Structure
                                </td>
                                <td className="p-6 text-sm text-slate-300 leading-relaxed align-top">
                                    {data.competitor_insights?.caption_structure || "Analysis pending..."}
                                </td>
                            </tr>

                            {/* Hashtags */}
                            <tr className="group hover:bg-white/5 transition-colors">
                                <td className="p-6 text-sm font-bold text-emerald-400 align-top">
                                    Ranking Hashtags
                                </td>
                                <td className="p-6 align-top">
                                    <div className="flex flex-wrap gap-2 text-sm text-emerald-400/80 font-mono">
                                        {data.competitor_insights?.competitor_hashtags?.map((tag, i) => (
                                            <span key={i}>{tag}</span>
                                        )) || <span className="text-slate-500 italic">No hashtags detected.</span>}
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* General Notes */}
            {data.spy_mode_notes && (
                 <div className="bg-space-950/30 p-6 rounded-xl border border-white/5 border-l-4 border-l-amber-500/50">
                    <div className="text-amber-500 text-xs uppercase tracking-widest mb-2 font-bold">
                       Strategic Observation
                    </div>
                    <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">
                      {data.spy_mode_notes}
                    </p>
                 </div>
            )}
        </div>
    );
  }

  // --- EDITOR / AUDIT MODE VIEW ---
  if (isAudit) {
    return (
      <div className="w-full max-w-5xl mx-auto space-y-6">
         <div className="glass-panel rounded-2xl p-8 flex flex-col md:flex-row gap-8 items-center border border-amber-500/30 shadow-[0_0_30px_rgba(245,158,11,0.1)]">
            
            {/* Score */}
            <div className="flex flex-col items-center justify-center min-w-[200px]">
               <h3 className="text-slate-400 text-xs font-mono uppercase tracking-widest mb-2">Draft Score</h3>
               <div className={`text-7xl font-black ${getScoreColor(score)} font-mono`}>
                  {score > 0 ? score : "--"}
               </div>
               <div className="text-sm text-slate-500 mt-2">/ 100</div>
            </div>

            {/* Critique Content */}
            <div className="flex-1 space-y-4">
                <div className="flex items-center gap-2 text-amber-500 font-bold uppercase tracking-wider text-sm">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
                    Social SEO Critique
                </div>
                <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                   {data.critique || "Analysis pending..."}
                </p>
            </div>
         </div>

         {/* CTA to Refine */}
         <div className="flex justify-center animate-pulse-slow">
             <button 
                onClick={onRefine}
                className="group relative px-8 py-4 bg-gradient-to-r from-nebula-cyan to-nebula-purple rounded-xl font-bold text-white shadow-[0_0_20px_rgba(124,58,237,0.5)] hover:scale-105 transition-all overflow-hidden"
             >
                <span className="relative z-10 flex items-center gap-2">
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                   Fix & Optimize Now
                </span>
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
             </button>
         </div>
      </div>
    );
  }

  // --- MAIN DASHBOARD VIEW (Creator/Strategy/Intel Tabs) ---
  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      
      {/* Dynamic Hero Cards based on Mode */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1: Score / Spy Status */}
        <div className="glass-panel rounded-2xl p-6 flex items-center justify-between relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-nebula-cyan/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div>
            <h3 className="text-slate-400 text-xs font-mono uppercase tracking-widest mb-1 flex items-center gap-1">
                Social SEO Score
                <span className="cursor-help text-slate-600" title="Calculated based on algorithm fit.">ⓘ</span>
            </h3>
            <div className={`text-6xl font-black ${getScoreColor(score)} font-mono`}>
              {score > 0 ? score : "--"}<span className="text-2xl opacity-50">/100</span>
            </div>
          </div>
          <div className="text-right">
             <div className="text-sm text-slate-400 mb-1">Sentiment</div>
             <div className="inline-block bg-space-900 border border-slate-700 rounded-full px-4 py-1 text-sm font-bold text-white shadow-lg">
                {data.sentiment_analysis?.vibe_badge || "Analysis Pending"}
             </div>
          </div>
        </div>

        {/* Card 2: Timing */}
        <div className="glass-panel rounded-2xl p-6 flex flex-col justify-center border-l-4 border-nebula-cyan relative overflow-hidden">
             <>
               <span className="text-slate-400 text-xs uppercase tracking-wider z-10 mb-1">Optimal Timing</span>
               <div className="text-xl font-bold text-white z-10 leading-tight mb-1" title={data.posting_strategy?.recommended_posting_time_local}>
                 {data.posting_strategy?.recommended_posting_time_local || "N/A"}
               </div>
               <span className="text-nebula-cyan text-xs font-bold z-10 uppercase tracking-wide">
                 {data.posting_strategy?.suggested_frequency_per_week || 0}x / week
               </span>
             </>
        </div>
        
        {/* Card 3: Format */}
        <div className="glass-panel rounded-2xl p-6 flex flex-col justify-center border-l-4 border-nebula-purple">
           <span className="text-slate-400 text-xs uppercase tracking-wider mb-1">
              Recommended Format
           </span>
           <span className="text-xl font-bold text-white capitalize truncate">
             {data.recommended_post_format?.replace(/_/g, ' ') || 'Standard'}
           </span>
           <span className="text-nebula-purple text-xs mt-1 font-medium">
             {data.recommended_length?.video_seconds ? `${data.recommended_length.video_seconds}s ideal length` : 'Check Caption'}
           </span>
        </div>
      </div>

      {/* Tabbed Interface */}
      <div className="glass-panel rounded-2xl overflow-hidden min-h-[500px] flex flex-col md:flex-row">
        
        {/* Sidebar Navigation */}
        <div className="w-full md:w-64 bg-space-950/50 border-r border-slate-800 p-4 flex flex-row md:flex-col gap-2 overflow-x-auto">
          <button 
            onClick={() => setActiveTab('creative')}
            className={`flex-1 md:flex-none text-left px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'creative' ? 'bg-nebula-cyan/20 text-nebula-cyan border border-nebula-cyan/50' : 'text-slate-400 hover:bg-white/5'}`}
          >
            {data.mode === Mode.Editor ? "REFINED CREATIVE" : "CREATIVE"}
          </button>
          
          <button 
            onClick={() => setActiveTab('strategy')}
            className={`flex-1 md:flex-none text-left px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'strategy' ? 'bg-nebula-purple/20 text-nebula-purple border border-nebula-purple/50' : 'text-slate-400 hover:bg-white/5'}`}
          >
            STRATEGY
          </button>
          
          <button 
            onClick={() => setActiveTab('intel')}
            className={`flex-1 md:flex-none text-left px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'intel' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50' : 'text-slate-400 hover:bg-white/5'}`}
          >
            INTEL & DATA
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-8 bg-gradient-to-br from-space-900/50 to-transparent">
          
          {/* TAB: CREATIVE (Creator/Editor Mode) */}
          {activeTab === 'creative' && (
            <div className="space-y-8 animate-fadeIn">
              
              {/* Hook Section */}
              <div className="group relative">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-nebula-cyan font-mono text-xs uppercase tracking-widest">
                     {data.mode === Mode.Editor ? "Optimized Hook" : "The Hook"}
                  </span>
                  <button 
                    onClick={() => handleCopy(data.hook, 'hook')}
                    className="text-xs flex items-center gap-1 text-slate-500 hover:text-white transition-colors"
                  >
                    {copiedField === 'hook' ? <CheckIcon /> : <CopyIcon />} {copiedField === 'hook' ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <div className="text-3xl md:text-4xl font-bold text-white leading-tight bg-space-950/30 p-6 rounded-2xl border border-white/5 hover:border-nebula-cyan/30 transition-all">
                  {data.hook}
                </div>
              </div>

              {/* Caption Section */}
              <div>
                <div className="flex justify-between items-end mb-2">
                   <span className="text-slate-500 font-mono text-xs uppercase tracking-widest">
                        {data.mode === Mode.Editor ? "Refined Caption" : "Caption Body"}
                   </span>
                   <button 
                    onClick={() => handleCopy(data.caption, 'caption')}
                    className="text-xs flex items-center gap-1 text-slate-500 hover:text-white transition-colors"
                  >
                    {copiedField === 'caption' ? <CheckIcon /> : <CopyIcon />} {copiedField === 'caption' ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <div className="bg-space-950/30 p-6 rounded-2xl border border-white/5 text-lg text-slate-300 whitespace-pre-wrap leading-relaxed">
                  {data.caption}
                </div>
              </div>

              {/* Detailed Description Section */}
              {data.description && (
                <div>
                   <div className="flex justify-between items-end mb-2">
                      <span className="text-slate-500 font-mono text-xs uppercase tracking-widest">Detailed Description</span>
                      <button 
                       onClick={() => handleCopy(data.description || '', 'description')}
                       className="text-xs flex items-center gap-1 text-slate-500 hover:text-white transition-colors"
                      >
                       {copiedField === 'description' ? <CheckIcon /> : <CopyIcon />} {copiedField === 'description' ? 'Copied' : 'Copy'}
                      </button>
                   </div>
                   <div className="bg-space-950/30 p-6 rounded-2xl border border-white/5 text-base text-slate-300 whitespace-pre-wrap leading-relaxed">
                     {data.description}
                   </div>
                </div>
              )}
              
              {/* Alt Text SEO Section */}
              {data.alt_text && (
                 <div>
                    <div className="flex justify-between items-end mb-2">
                       <span className="text-emerald-400 font-mono text-xs uppercase tracking-widest flex items-center gap-2">
                          <AccessibilityIcon /> Alt Text / SEO Description
                       </span>
                       <button 
                        onClick={() => handleCopy(data.alt_text || '', 'alt_text')}
                        className="text-xs flex items-center gap-1 text-slate-500 hover:text-white transition-colors"
                       >
                        {copiedField === 'alt_text' ? <CheckIcon /> : <CopyIcon />} {copiedField === 'alt_text' ? 'Copied' : 'Copy'}
                       </button>
                    </div>
                    <div className="bg-space-900/50 p-4 rounded-xl border border-white/5 text-sm text-slate-400 italic">
                       "{data.alt_text}"
                    </div>
                 </div>
              )}

              {/* Hashtags Cloud */}
              <div>
                 <div className="flex justify-between items-end mb-2">
                   <span className="text-slate-500 font-mono text-xs uppercase tracking-widest flex items-center gap-2">
                     <span className="text-nebula-purple">#</span> Strategic Hashtags
                   </span>
                   <button 
                    onClick={() => handleCopy(data.hashtags?.join(' ') || '', 'hashtags')}
                    className="text-xs flex items-center gap-1 text-slate-500 hover:text-white transition-colors"
                   >
                    {copiedField === 'hashtags' ? <CheckIcon /> : <CopyIcon />} {copiedField === 'hashtags' ? 'Copied All' : 'Copy All'}
                   </button>
                 </div>
                 
                 <div className="bg-space-950/30 p-6 rounded-2xl border border-white/5 relative group">
                    <div className="flex flex-wrap gap-2">
                      {data.hashtags?.map((tag, i) => (
                        <button 
                          key={i} 
                          onClick={() => handleCopy(tag, `tag-${i}`)}
                          className={`
                            px-3 py-1.5 rounded-md text-sm transition-all border
                            ${copiedField === `tag-${i}` 
                              ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                              : 'bg-space-900 border-slate-700 text-slate-300 hover:border-nebula-purple hover:text-nebula-purple hover:bg-nebula-purple/5'
                            }
                          `}
                          title="Click to copy"
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                    {data.hashtags && data.hashtags.length === 0 && (
                        <div className="text-slate-500 text-sm italic">No hashtags generated.</div>
                    )}
                 </div>
              </div>
            </div>
          )}

          {/* TAB: STRATEGY */}
          {activeTab === 'strategy' && (
            <div className="space-y-6 animate-fadeIn">
              <h3 className="text-2xl font-bold text-white mb-6">Posting Strategy</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-space-950/30 p-6 rounded-xl border border-white/5">
                  <div className="text-slate-500 text-xs uppercase tracking-widest mb-2">Best Time</div>
                  <div className="text-3xl text-nebula-cyan font-bold leading-tight">{data.posting_strategy?.recommended_posting_time_local || "N/A"}</div>
                  <div className="text-sm text-slate-400 mt-2">Calculated for your niche audience</div>
                </div>

                <div className="bg-space-950/30 p-6 rounded-xl border border-white/5">
                  <div className="text-slate-500 text-xs uppercase tracking-widest mb-2">Frequency</div>
                  <div className="text-3xl text-white font-bold">{data.posting_strategy?.suggested_frequency_per_week || 0}x <span className="text-lg text-slate-500 font-normal">/ week</span></div>
                  <div className="text-sm text-slate-400 mt-2">To maintain algorithm momentum</div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-nebula-purple/10 to-transparent p-6 rounded-xl border-l-4 border-nebula-purple">
                <div className="text-nebula-purple font-bold mb-2">Cross-Platform Tip</div>
                <p className="text-slate-300 italic">"{data.posting_strategy?.cross_posting_tips || "Be consistent."}"</p>
              </div>

              {/* SEO Keywords Section */}
              <div className="mt-8">
                <div className="flex justify-between items-end mb-3">
                   <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs uppercase tracking-widest">
                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                       Search Query / SEO Keywords
                   </div>
                   <button 
                    onClick={() => handleCopy(data.seo_keywords?.join(', ') || '', 'seo_keywords')}
                    className="text-xs flex items-center gap-1 text-slate-500 hover:text-white transition-colors"
                   >
                    {copiedField === 'seo_keywords' ? <CheckIcon /> : <CopyIcon />} {copiedField === 'seo_keywords' ? 'Copied All' : 'Copy All'}
                   </button>
                </div>
                <div className="bg-space-950/30 p-6 rounded-xl border border-white/5">
                    <div className="flex flex-wrap gap-2">
                      {data.seo_keywords && data.seo_keywords.length > 0 ? (
                        data.seo_keywords.map((kw, i) => (
                           <span key={i} className="px-3 py-1 bg-space-800 border border-slate-700 rounded-full text-sm text-slate-300">
                             {kw}
                           </span>
                        ))
                      ) : (
                        <span className="text-slate-500 text-sm italic">No specific SEO keywords generated.</span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-3">
                        Use these semantic terms in your profile bio, caption body, and on-screen text to improve search discoverability.
                    </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB: INTEL */}
          {activeTab === 'intel' && (
            <div className="space-y-6 animate-fadeIn">
               <h3 className="text-2xl font-bold text-white mb-6">
                   Data Intelligence
               </h3>

               {/* Brand Safety */}
               <div className="bg-space-950/30 p-6 rounded-xl border border-white/5">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-slate-400 text-xs uppercase tracking-widest">Brand Safety Guard</span>
                    <span className={`px-2 py-1 rounded text-xs font-bold ${data.brand_guard?.brand_safe ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                      {data.brand_guard?.brand_safe ? 'PASS' : 'FLAGGED'}
                    </span>
                  </div>
                  <p className="text-sm text-slate-300">{data.brand_guard?.notes}</p>
               </div>
                
                {/* Trend Widget */}
                <div className="bg-space-950/30 p-6 rounded-xl border border-white/5 relative overflow-hidden">
                    <div className="flex justify-between items-start z-10 relative">
                        <div>
                            <span className="text-slate-400 text-xs uppercase tracking-widest mb-2 block">Live Trend Pulse</span>
                            <div className="flex items-center gap-3">
                                {data.trend_metadata?.trend_detected ? (
                                    <>
                                        <span className="text-3xl text-white font-bold tracking-tight">
                                            {data.trend_metadata.trend_name}
                                        </span>
                                        <span className="bg-red-500/20 text-red-400 px-2 py-1 rounded text-[10px] font-bold uppercase animate-pulse border border-red-500/30">
                                            Trending Now
                                        </span>
                                    </>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <span className="text-xl text-slate-500 font-medium">No Viral Trend Detected</span>
                                        <span className="text-xs text-slate-600 border border-slate-700 px-2 py-1 rounded">Standard Optimization</span>
                                    </div>
                                )}
                            </div>
                            <div className="text-sm text-slate-400 mt-2 max-w-lg">
                                {data.trend_metadata?.how_to_apply_trend || "Standard algorithmic optimization applied."}
                            </div>
                        </div>

                        {/* Trend Graph Visualization */}
                        {data.trend_metadata?.trend_detected && <TrendGraph />}
                    </div>
                </div>

               {/* Competitor Visual Theme */}
               <div className="bg-space-950/30 p-6 rounded-xl border border-white/5">
                  <div className="text-slate-400 text-xs uppercase tracking-widest mb-2">Competitor Visual Theme</div>
                  <p className="text-sm text-slate-300 leading-relaxed">{data.competitor_insights?.visual_theme || "Analysis pending..."}</p>
               </div>

               {/* Competitor CTA Strategy */}
               <div className="bg-space-950/30 p-6 rounded-xl border border-white/5">
                  <div className="text-slate-400 text-xs uppercase tracking-widest mb-2">Competitor CTA Strategy</div>
                  <p className="text-sm text-slate-300 leading-relaxed">{data.competitor_insights?.cta_strategy || "Analysis pending..."}</p>
               </div>
               
               {/* Competitor Spy Notes (Conditional) */}
               {data.spy_mode_notes && (
                 <div className="bg-space-950/30 p-6 rounded-xl border border-white/5 border-l-4 border-l-amber-500">
                    <div className="text-amber-500 text-xs uppercase tracking-widest mb-2 flex items-center gap-2">
                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                       Spy Mode Observations
                    </div>
                    <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">
                      {data.spy_mode_notes}
                    </p>
                 </div>
               )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default ResultDashboard;

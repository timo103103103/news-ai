// PowerAmplificationMap.tsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, Globe, Landmark, Radio, DollarSign, 
  Megaphone, Shield, TrendingUp, Info, AlertCircle, FileText
} from 'lucide-react';

interface PowerActor {
  name: string;
  category: 'Capital' | 'Platform' | 'State' | 'Media';
  incentiveAlignment: number; // 0-100
  distributionPower: number; // 0-100
  source?: 'Explicit' | 'Inferred'; // NEW: From analyze.js v2.1
  evidence?: string[]; // NEW: From analyze.js v2.1
  isInferred?: boolean; // NEW: From analyze.js v2.1
  channels?: string[]; // NEW: Power channels tags (1-3)
  influenceScope?: string; // NEW: Geographic/systemic scope
  stance?: 'Supportive' | 'Confrontational' | 'Defensive' | 'Neutral'; // NEW: Narrative stance
  actionVector?: string[]; // NEW: Action levers (1-3 bullets)
  evidenceBasis?: 'Explicit' | 'Inferred' | string; // NEW: Per-card evidence basis
}

interface PowerAmplificationMapProps {
  actors: PowerActor[];
  className?: string;
}

// Category configurations
const CATEGORY_CONFIG: any = {
  Capital: { color: '#10B981', icon: DollarSign, label: 'Capital Power' },
  Platform: { color: '#3B82F6', icon: Globe, label: 'Platform Power' },
  State: { color: '#EF4444', icon: Landmark, label: 'State Power' },
  Media: { color: '#F59E0B', icon: Radio, label: 'Media Power' }
};

// Get company logo or icon (Helper function)
const getActorIcon = (name: string, category: string) => {
  const normalized = name.toLowerCase();
  if (normalized.includes('google') || normalized.includes('alphabet')) return '🔍';
  if (normalized.includes('meta') || normalized.includes('facebook')) return '👥';
  if (normalized.includes('amazon')) return '📦';
  if (normalized.includes('apple')) return '🍎';
  if (normalized.includes('microsoft')) return '⊞';
  if (normalized.includes('tesla')) return '⚡';
  if (normalized.includes('nvidia')) return '🎮';
  if (normalized.includes('berkshire')) return '💰';
  if (normalized.includes('twitter') || normalized.includes('x corp')) return '🐦';
  
  if (normalized.includes('cnn') || normalized.includes('news')) return '📺';
  if (normalized.includes('times') || normalized.includes('post')) return '📰';
  if (normalized.includes('bloomberg')) return '📊';
  if (normalized.includes('reuters')) return '📡';
  
  if (normalized.includes('federal') || normalized.includes('government')) return '🏛️';
  if (normalized.includes('congress') || normalized.includes('senate')) return '⚖️';
  if (normalized.includes('treasury')) return '💵';
  if (normalized.includes('fed') || normalized.includes('reserve')) return '🏦';
  
  if (category === 'Capital') return '💼';
  if (category === 'Platform') return '🌐';
  if (category === 'State') return '🏛️';
  if (category === 'Media') return '📢';
  
  return '🔷';
};

const PowerAmplificationMap = ({ actors, className = '' }: PowerAmplificationMapProps) => {
  const [selectedActor, setSelectedActor] = useState<PowerActor | null>(null);
  const [hoveredActor, setHoveredActor] = useState<string | null>(null);

  const getDefaultChannels = (category: PowerActor['category']) => {
    switch (category) {
      case 'State': return ['Executive Authority', 'Diplomatic Pressure', 'Legal Leverage'];
      case 'Platform': return ['Platform Reach', 'Moderation Leverage', 'Algorithmic Prioritization'];
      case 'Capital': return ['Capital Allocation', 'Investment Signalling', 'Credit Access'];
      case 'Media': return ['Agenda Setting', 'Editorial Framing', 'Network Amplification'];
      default: return [];
    }
  };

  const getDefaultScope = (category: PowerActor['category']) => {
    switch (category) {
      case 'State': return 'Global (State-level)';
      case 'Platform': return 'Global (Platform-level)';
      case 'Capital': return 'Markets (Capital-level)';
      case 'Media': return 'Media Ecosystem';
      default: return 'General';
    }
  };

  const getDefaultActions = (category: PowerActor['category']) => {
    switch (category) {
      case 'State': return ['Executive statements', 'Diplomatic escalation'];
      case 'Platform': return ['Algorithmic boosts', 'Content moderation'];
      case 'Capital': return ['Funding allocation', 'Policy lobbying'];
      case 'Media': return ['Narrative promotion', 'Investigative framing'];
      default: return [];
    }
  };

  const stanceColor = (stance?: PowerActor['stance']) => {
    switch (stance) {
      case 'Supportive': return 'text-emerald-700 dark:text-emerald-300';
      case 'Confrontational': return 'text-rose-700 dark:text-rose-300';
      case 'Defensive': return 'text-amber-700 dark:text-amber-300';
      default: return 'text-slate-700 dark:text-slate-300';
    }
  };

  if (!actors || actors.length === 0) {
    return (
      <div className="bg-slate-100 dark:bg-slate-900/40 rounded-xl p-10 text-center border border-slate-200 dark:border-slate-800">
        <Building2 className="w-12 h-12 text-slate-400 mx-auto mb-4" />

        <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
          No Amplification Detected
        </h4>

        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
          Our analysis did not identify any dominant actors actively amplifying or
          shaping this narrative beyond baseline information flow.
          <br /><br />
          This typically indicates a low coordination environment, organic discourse,
          or early-stage narrative formation.
        </p>
      </div>
    );
  }

  // Sort: High power explicit actors first, then inferred
  const sortedActors = [...actors].sort((a, b) => {
    // Prioritize explicit over inferred
    if (a.isInferred && !b.isInferred) return 1;
    if (!a.isInferred && b.isInferred) return -1;
    // Then by total power
    return (b.incentiveAlignment + b.distributionPower) - (a.incentiveAlignment + a.distributionPower);
  });
  
  const displayActors = sortedActors.slice(0, 6); // Show top 6

  const getRelatedActors = (mainActor: PowerActor) => {
    return actors
      .filter(a => a.category === mainActor.category && a.name !== mainActor.name)
      .slice(0, 4);
  };

  return (
    <div className={`${className}`}>
      {/* Grid of actor circles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {displayActors.map((actor, index) => {
          const categoryConfig = CATEGORY_CONFIG[actor.category] || CATEGORY_CONFIG.Capital;
          const relatedActors = getRelatedActors(actor);
          const isHovered = hoveredActor === actor.name;
          const isSelected = selectedActor?.name === actor.name;
          const totalPower = (actor.incentiveAlignment + actor.distributionPower) / 2;
          
          // Visual distinction for Inferred actors
          const strokeStyle = actor.isInferred ? "4, 4" : "0";
          const opacity = actor.isInferred ? 0.6 : 1;

          return (
            <motion.div
              key={actor.name}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="relative"
            >
              <motion.div
                className={`relative bg-white dark:bg-slate-900/80 rounded-2xl p-6 border-2 transition-all cursor-pointer ${
                  isSelected || isHovered
                    ? 'border-blue-500 shadow-2xl shadow-blue-500/20'
                    : actor.isInferred 
                      ? 'border-slate-200 dark:border-slate-700 border-dashed hover:border-slate-300 dark:hover:border-slate-600' // Dashed border for inferred
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                }`}
                onClick={() => setSelectedActor(isSelected ? null : actor)}
                onMouseEnter={() => setHoveredActor(actor.name)}
                onMouseLeave={() => setHoveredActor(null)}
                whileHover={{ scale: 1.02 }}
              >
                {/* SVG Circle Visualization */}
                <div className="relative w-full aspect-square mb-4">
                  <svg viewBox="0 0 200 200" className="w-full h-full">
                    {/* Background circle */}
                    <circle cx="100" cy="100" r="85" fill="rgba(148,163,184,0.15)" stroke="rgba(148,163,184,0.35)" strokeWidth="1" className="dark:fill-[rgba(30,41,59,0.6)] dark:stroke-[rgba(71,85,105,0.3)]" />

                    {/* Main power ring */}
                    <circle
                      cx="100" cy="100" r="85" fill="none"
                      stroke={categoryConfig.color}
                      strokeWidth="20"
                      strokeDasharray={`${(totalPower / 100) * 534} 534`}
                      strokeDashoffset="0"
                      transform="rotate(-90 100 100)"
                      opacity={opacity} // Lower opacity for inferred
                    />
                    
                    {/* Inferred overlay ring (dashed) if needed */}
                    {actor.isInferred && (
                       <circle cx="100" cy="100" r="85" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1" strokeDasharray="4 4" />
                    )}

                    {/* Inner circle for alignment */}
                    <circle cx="100" cy="100" r="60" fill="rgba(148,163,184,0.25)" stroke={categoryConfig.color} strokeWidth="2" opacity="0.6" className="dark:fill-[rgba(30,41,59,0.8)]" />

                    {/* Center actor icon */}
                    <text x="100" y="110" fontSize="48" textAnchor="middle" dominantBaseline="middle">
                      {getActorIcon(actor.name, actor.category)}
                    </text>

                    {/* Related actors around the circle */}
                    {relatedActors.map((related, i) => {
                      const angle = (i / Math.max(relatedActors.length, 4)) * 2 * Math.PI;
                      const x = 100 + Math.cos(angle) * 95;
                      const y = 100 + Math.sin(angle) * 95;
                      return (
                        <g key={related.name}> 
                        </g>
                      );
                    })}
                  </svg>

                  {/* Power indicator overlay */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <motion.div className="text-center" initial={{ opacity: 0 }} animate={{ opacity: isHovered || isSelected ? 1 : 0 }}>
                      <div className="bg-white/85 dark:bg-slate-950/90 rounded-lg px-3 py-1 backdrop-blur-sm">
                        <div className="text-2xl font-bold text-slate-900 dark:text-white">{Math.round(totalPower)}</div>
                        <div className="text-xs text-slate-600 dark:text-slate-400">Power</div>
                      </div>
                    </motion.div>
                  </div>
                </div>

                {/* Actor Details */}
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm line-clamp-2 flex-1">{actor.name}</h4>
                    {actor.isInferred && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-300 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-600">
                        AI INFERRED
                      </span>
                    )}
                  </div>

                  {/* Influence Scope */}
                  <div className="text-[11px] text-slate-600 dark:text-slate-400">
                    Primary Influence: {actor.influenceScope || getDefaultScope(actor.category)}
                  </div>

                  {/* Power Channel Tags */}
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {(actor.channels && actor.channels.length > 0 ? actor.channels : getDefaultChannels(actor.category))
                      .slice(0, 3)
                      .map((ch, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700"
                        >
                          {ch}
                        </span>
                      ))
                    }
                  </div>

                  {/* Narrative Stance */}
                  {actor.stance && (
                    <div className={`text-[11px] mt-1 font-semibold ${stanceColor(actor.stance)}`}>
                      Narrative Stance: {actor.stance}
                    </div>
                  )}

                  {/* Metrics */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-white border border-slate-200 rounded p-2 dark:bg-slate-800/50 dark:border-slate-700">
                      <div className="text-slate-500 dark:text-slate-400 mb-1">Incentive</div>
                      <div className="font-semibold text-slate-900 dark:text-white">{actor.incentiveAlignment}%</div>
                    </div>
                    <div className="bg-white border border-slate-200 rounded p-2 dark:bg-slate-800/50 dark:border-slate-700">
                      <div className="text-slate-500 dark:text-slate-400 mb-1">Distribution</div>
                      <div className="font-semibold text-slate-900 dark:text-white">{actor.distributionPower}%</div>
                    </div>
                  </div>

                  {/* Evidence Basis */}
                  <div className="text-[11px] text-slate-600 dark:text-slate-400">
                    Evidence Basis: {actor.evidenceBasis || (actor.isInferred ? 'Inferred' : (actor.source || 'Explicit'))}
                  </div>

                  {/* Action Vector */}
                  <div className="mt-1">
                    <div className="text-[11px] text-slate-600 dark:text-slate-400 font-semibold">Likely Actions:</div>
                    <ul className="mt-0.5 space-y-0.5">
                      {(actor.actionVector && actor.actionVector.length > 0 ? actor.actionVector : getDefaultActions(actor.category))
                        .slice(0, 3)
                        .map((av, i) => (
                          <li key={i} className="text-[11px] text-slate-700 dark:text-slate-300">• {av}</li>
                        ))
                      }
                    </ul>
                  </div>
                </div>

                {/* Category Icon Badge removed to avoid duplication */}
              </motion.div>
            </motion.div>
          );
        })}
      </div>

      {/* Selected Actor Details Panel */}
      <AnimatePresence>
        {selectedActor && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-6 overflow-hidden"
          >
            <div className="bg-white dark:bg-gradient-to-br dark:from-slate-900 dark:to-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">{selectedActor.name}</h3>
                  <div className="flex items-center gap-2">
                    <span
                      className="px-2 py-1 rounded text-xs font-semibold"
                      style={{
                        backgroundColor: `${CATEGORY_CONFIG[selectedActor.category].color}20`,
                        color: CATEGORY_CONFIG[selectedActor.category].color
                      }}
                    >
                      {CATEGORY_CONFIG[selectedActor.category].label}
                    </span>
                    {selectedActor.isInferred && (
                      <span className="px-2 py-1 rounded text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-300 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600">
                        Synthesized by AI
                      </span>
                    )}
                  </div>
                </div>
                <button onClick={() => setSelectedActor(null)} className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors">✕</button>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                {/* Metric Cards (Same as before) */}
                <div className="bg-white border border-slate-200 rounded-lg p-4 dark:bg-slate-800/50 dark:border-slate-700">
                   {/* ... content same as previous ... */}
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-300">Incentive Alignment</h4>
                  </div>
                  <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">{selectedActor.incentiveAlignment}%</div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                    <div className="h-2 rounded-full transition-all" style={{ width: `${selectedActor.incentiveAlignment}%`, backgroundColor: CATEGORY_CONFIG[selectedActor.category].color }} />
                  </div>
                </div>
                
                 <div className="bg-white border border-slate-200 rounded-lg p-4 dark:bg-slate-800/50 dark:border-slate-700">
                  <div className="flex items-center gap-2 mb-2">
                    <Megaphone className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-300">Distribution Power</h4>
                  </div>
                  <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">{selectedActor.distributionPower}%</div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                    <div className="h-2 rounded-full transition-all" style={{ width: `${selectedActor.distributionPower}%`, backgroundColor: CATEGORY_CONFIG[selectedActor.category].color }} />
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-lg p-4 dark:bg-slate-800/50 dark:border-slate-700">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-300">Total Influence</h4>
                  </div>
                  <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">{Math.round((selectedActor.incentiveAlignment + selectedActor.distributionPower) / 2)}%</div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                    <div className="h-2 rounded-full transition-all" style={{ width: `${(selectedActor.incentiveAlignment + selectedActor.distributionPower) / 2}%`, backgroundColor: CATEGORY_CONFIG[selectedActor.category].color }} />
                  </div>
                </div>
              </div>

              {/* NEW: Evidence Section for Inferred Actors */}
              {selectedActor.evidence && selectedActor.evidence.length > 0 && (
                <div className="mt-4 p-4 bg-white border border-slate-200 rounded-lg dark:bg-slate-950/50 dark:border-slate-700">
                  <div className="flex items-start gap-2">
                     <FileText className="w-4 h-4 text-slate-500 dark:text-slate-400 mt-1" />
                     <div>
                       <h5 className="text-sm font-semibold text-slate-900 dark:text-slate-300 mb-2">Evidence for Inclusion</h5>
                       <ul className="list-disc list-inside text-xs text-slate-600 dark:text-slate-400 space-y-1">
                         {selectedActor.evidence.map((ev, i) => (
                           <li key={i}>{ev}</li>
                         ))}
                       </ul>
                     </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-6 flex flex-wrap justify-between items-center bg-white dark:bg-slate-900/50 rounded-xl p-4 border border-slate-200 dark:border-slate-800">
        <div className="flex gap-4">
           {Object.entries(CATEGORY_CONFIG).map(([key, config]: [string, any]) => (
            <div key={key} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: config.color }} />
              <span className="text-xs text-slate-600 dark:text-slate-400">{config.label}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 mt-2 sm:mt-0">
          <span className="flex items-center gap-1 text-[10px] text-slate-600 dark:text-slate-500 uppercase font-bold tracking-wider">
            <span className="w-2 h-2 border border-slate-400 dark:border-slate-500 rounded-full"></span> Explicit
          </span>
          <span className="flex items-center gap-1 text-[10px] text-slate-600 dark:text-slate-500 uppercase font-bold tracking-wider">
            <span className="w-2 h-2 border border-slate-400 dark:border-slate-500 border-dashed rounded-full"></span> AI Inferred
          </span>
        </div>
      </div>
    </div>
  );
};

export default PowerAmplificationMap;
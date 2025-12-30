import { useState, useMemo } from 'react';
import { Lock, Zap, Crown, Shield, User, ThumbsUp, ThumbsDown } from 'lucide-react';

// ✅ UPDATED: Accept real data from parent component
interface WinnerLoserTeaserProps {
  partyImpact?: {
    stakeholders: Array<{
      name: string;
      power: number;
      interest: number;
      sentiment?: 'positive' | 'negative' | 'neutral' | 'mixed';
      role?: string;
    }>;
    majorWinners?: string[];
    majorLosers?: string[];
  };
}

export default function WinnerLoserTeaser({ partyImpact }: WinnerLoserTeaserProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Track premium feature view
  const handleMouseEnter = () => {
    setIsHovered(true);
    if (typeof (window as any).trackPremiumView === 'function') {
      (window as any).trackPremiumView('Winner/Loser Analysis');
    }
  };

  // --- LOGIC & DATA PREPARATION ---

  const coreEntity = { name: "Core Strategy" };

  // ✅ FIXED: Use real data from props or show placeholder
  const hasData = partyImpact && 
    (partyImpact.majorWinners || partyImpact.majorLosers || partyImpact.stakeholders?.length > 0);

  // Extract winners and losers from real data
  const realWinners = useMemo(() => {
    if (!partyImpact) return [];
    
    // Prioritize majorWinners if available
    if (partyImpact.majorWinners && partyImpact.majorWinners.length > 0) {
      return partyImpact.majorWinners.slice(0, 3).map(name => ({
        name,
        trend: 'up' as const
      }));
    }
    
    // Otherwise, use stakeholders with positive sentiment and high power
    const positiveStakeholders = partyImpact.stakeholders
      ?.filter(s => s.sentiment === 'positive' && s.power > 60)
      ?.sort((a, b) => b.power - a.power)
      ?.slice(0, 3)
      ?.map(s => ({
        name: s.name,
        trend: 'up' as const
      })) || [];
    
    return positiveStakeholders;
  }, [partyImpact]);

  const realLosers = useMemo(() => {
    if (!partyImpact) return [];
    
    // Prioritize majorLosers if available
    if (partyImpact.majorLosers && partyImpact.majorLosers.length > 0) {
      return partyImpact.majorLosers.slice(0, 3).map(name => ({
        name,
        trend: 'down' as const
      }));
    }
    
    // Otherwise, use stakeholders with negative sentiment and high power
    const negativeStakeholders = partyImpact.stakeholders
      ?.filter(s => s.sentiment === 'negative' && s.power > 60)
      ?.sort((a, b) => b.power - a.power)
      ?.slice(0, 3)
      ?.map(s => ({
        name: s.name,
        trend: 'down' as const
      })) || [];
    
    return negativeStakeholders;
  }, [partyImpact]);

  // ✅ Show placeholder if no data available
  if (!hasData || (realWinners.length === 0 && realLosers.length === 0)) {
    return null;
  }

  // Helper to calculate position on a circle
  const getPosition = (index: number, total: number, radius: number, offsetAngle: number = 0) => {
    const angle = (index / total) * 2 * Math.PI - (Math.PI / 2) + offsetAngle;
    const x = 50 + radius * Math.cos(angle);
    const y = 50 + radius * Math.sin(angle);
    return { x, y };
  };

  const graphData = useMemo(() => {
    // Logic: 
    // Winners: Closer (Radius 22%), Larger Size (64px) -> Indicates high influence and strong relationship
    // Losers: Further (Radius 42%), Smaller Size (40px) -> Indicates low influence and distant relationship
    
    const winnerNodes = realWinners.map((item, i) => ({
      ...item,
      type: 'winner',
      sizePx: 64, 
      ...getPosition(i, realWinners.length, 22, 0)
    }));

    const loserNodes = realLosers.map((item, i) => ({
      ...item,
      type: 'loser',
      sizePx: 40, 
      ...getPosition(i, realLosers.length, 42, Math.PI)
    }));

    return [...winnerNodes, ...loserNodes];
  }, [realWinners, realLosers]);

  return (
    <div 
      className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl shadow-2xl overflow-hidden max-w-lg mx-auto border border-slate-700"
      style={{ minHeight: '520px' }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* --- PREMIUM UI LAYER --- */}
      
      {/* Premium Badge */}
      <div className="absolute top-4 right-4 z-30">
        <div className="bg-gradient-to-r from-amber-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center space-x-1 shadow-lg border border-white/20">
          <Crown className="w-3 h-3" />
          <span>RELATIONSHIP MAP</span>
        </div>
      </div>

      {/* Header Info */}
      <div className="absolute top-4 left-4 z-20 pointer-events-none">
        <h3 className="text-lg font-bold text-gray-100 flex items-center gap-2">
          <Shield className="w-4 h-4 text-amber-400" />
          Alliance Network
        </h3>
        <p className="text-xs text-gray-400">Proximity indicates relationship strength</p>
      </div>

      {/* Lock Overlay */}
      <div className={`absolute inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center transition-all duration-500 z-40 ${
        isHovered ? 'opacity-0 pointer-events-none scale-110' : 'opacity-100 scale-100'
      }`}>
        <div className="text-center p-8 rounded-2xl bg-slate-900/90 border border-slate-700 shadow-2xl max-w-xs mx-4">
          <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-500/20">
            <Lock className="w-7 h-7 text-white" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Unlock Network</h3>
          <p className="text-slate-400 mb-6 text-sm">Reveal the hidden alliances and conflicts surrounding the core entity.</p>
          <button className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white px-4 py-2.5 rounded-lg font-bold text-sm hover:from-amber-400 hover:to-orange-500 transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg">
            <Zap className="w-4 h-4" />
            <span>Reveal Connections</span>
          </button>
        </div>
      </div>

      {/* --- GRAPH VISUALIZATION LAYER --- */}
      <div className={`w-full h-full absolute inset-0 transition-all duration-700 ease-in-out ${isHovered ? 'blur-none scale-100' : 'blur-sm scale-95'}`}>
        
        {/* Background Orbits (Visual Guides) */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
             {/* Inner Orbit (Winners) */}
            <div className="w-[44%] h-[44%] rounded-full border border-emerald-500/10 absolute animate-[spin_60s_linear_infinite]" />
             {/* Outer Orbit (Losers) */}
            <div className="w-[84%] h-[84%] rounded-full border border-dashed border-slate-600/30 absolute" />
            {/* Ambient Glow */}
            <div className="w-[30%] h-[30%] bg-amber-500/10 blur-3xl absolute rounded-full" />
        </div>

        {/* SVG Connecting Lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
            <defs>
                <linearGradient id="gradWinner" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.6" /> {/* Emerald */}
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.1" />
                </linearGradient>
                <linearGradient id="gradLoser" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#94a3b8" stopOpacity="0.1" /> {/* Slate */}
                    <stop offset="100%" stopColor="#64748b" stopOpacity="0.3" />
                </linearGradient>
            </defs>
            {graphData.map((node, i) => (
                <line
                    key={`line-${i}`}
                    x1="50%"
                    y1="50%"
                    x2={`${node.x}%`}
                    y2={`${node.y}%`}
                    stroke={node.type === 'winner' ? "url(#gradWinner)" : "url(#gradLoser)"}
                    strokeWidth={node.type === 'winner' ? "3" : "1"}
                    strokeDasharray={node.type === 'loser' ? "4 4" : "0"}
                    className="transition-all duration-1000"
                />
            ))}
        </svg>

        {/* 1. CENTRAL NODE (CORE) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 text-center">
            <div className="relative group cursor-default">
                {/* Core Glow */}
                <div className="absolute inset-0 bg-amber-500 blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
                
                <div className="w-24 h-24 bg-gradient-to-b from-slate-800 to-black rounded-full border-4 border-amber-500 flex items-center justify-center shadow-2xl relative z-10">
                    <Crown className="w-10 h-10 text-amber-500" />
                </div>
            </div>
            <div className="mt-3 bg-amber-500/10 border border-amber-500/20 text-amber-500 font-bold text-xs px-3 py-1 rounded-full inline-block backdrop-blur-sm">
                CORE ENTITY
            </div>
        </div>

        {/* 2. SATELLITE NODES */}
        {graphData.map((node, i) => (
            <div
                key={node.name}
                className="absolute z-10 flex flex-col items-center group cursor-pointer"
                style={{
                    top: `${node.y}%`,
                    left: `${node.x}%`,
                    transform: 'translate(-50%, -50%)'
                }}
            >
                {/* Node Circle */}
                <div 
                    className={`relative transition-all duration-300 group-hover:scale-110 shadow-lg rounded-full flex items-center justify-center border-2
                    ${node.type === 'winner' 
                        ? 'bg-slate-800 border-emerald-500 shadow-emerald-500/20' 
                        : 'bg-slate-900 border-slate-600 shadow-black/40 grayscale opacity-80'}`}
                    style={{
                        width: `${node.sizePx}px`,
                        height: `${node.sizePx}px`
                    }}
                >
                    {/* Inner Icon */}
                    <User className={`${node.type === 'winner' ? 'w-8 h-8 text-emerald-400' : 'w-5 h-5 text-slate-400'}`} />
                    
                    {/* Status Indicator Bubble */}
                    <div className={`absolute -bottom-1 -right-1 rounded-full p-1 border-2 border-slate-900 
                        ${node.type === 'winner' ? 'bg-emerald-500 text-white' : 'bg-slate-600 text-gray-300'}`}>
                         {node.type === 'winner' ? <ThumbsUp className="w-3 h-3" /> : <ThumbsDown className="w-3 h-3" />}
                    </div>
                </div>

                {/* Name Label */}
                <div className={`mt-2 text-xs font-semibold px-3 py-1 rounded-full border backdrop-blur-sm transition-colors duration-300 whitespace-nowrap
                    ${node.type === 'winner' 
                        ? 'text-emerald-100 border-emerald-500/30 bg-emerald-950/60 shadow-lg' 
                        : 'text-slate-400 border-slate-600/30 bg-slate-900/60'}`}>
                    {node.name}
                </div>
            </div>
        ))}
      </div>

      {/* Simplified Footer Legend */}
      <div className={`absolute bottom-4 left-0 right-0 flex justify-center gap-8 z-20 transition-opacity duration-500 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/40 border border-emerald-500/20 backdrop-blur-sm">
            <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
            <span className="text-xs text-emerald-100 font-medium">Close Relationship</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/40 border border-slate-600/20 backdrop-blur-sm">
            <div className="w-2 h-2 rounded-full bg-slate-500"></div>
            <span className="text-xs text-slate-400 font-medium">Distant Relationship</span>
        </div>
      </div>
    </div>
  );
}

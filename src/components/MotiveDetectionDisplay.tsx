// -------------------------------------------
// MotiveDetectionDisplay.tsx - DARK MODE FIXED
// -------------------------------------------

import { motion } from "framer-motion";
import {
  Aperture,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Zap,
  TrendingUp,
  Microscope,
  Scale,
} from "lucide-react";


export interface MotiveData {
  name: string;
  score: number;
  type: string;
}

interface MotiveDetectionDisplayProps {
  motiveData: MotiveData[];
}

// ✅ NEW: Archetype definitions and logic
const ARCHETYPES = {
  'The Expansionist': {
    name: 'The Expansionist',
    description: 'Driven primarily by strategic goals of influence and power expansion.',
    behavior: 'Systematic, calculated messaging designed to shift public opinion toward specific policy outcomes.',
    risk: 'May obscure true costs or risks in favor of narrative momentum.',
    trigger: (motives: MotiveData[]) => {
      const strategic = motives.find(m => m.type.toLowerCase().includes('strategic'));
      return strategic && strategic.score > 60;
    }
  },
  'The Mercenary': {
    name: 'The Mercenary',
    description: 'Motivated by financial gain and economic interests.',
    behavior: 'Content focused on market opportunities, investments, or profit-driven angles.',
    risk: 'May downplay ethical concerns or long-term societal impacts for short-term gains.',
    trigger: (motives: MotiveData[]) => {
      const financial = motives.find(m => m.type.toLowerCase().includes('financial'));
      return financial && financial.score > 60;
    }
  },
  'The Evangelist': {
    name: 'The Evangelist',
    description: 'Pushing ideological beliefs and values above all else.',
    behavior: 'Emotionally charged language, appeals to identity, and in-group/out-group dynamics.',
    risk: 'Can create echo chambers and resist contradictory evidence.',
    trigger: (motives: MotiveData[]) => {
      const ideological = motives.find(m => m.type.toLowerCase().includes('ideological'));
      return ideological && ideological.score > 60;
    }
  },
  'The Guardian': {
    name: 'The Guardian',
    description: 'Focused on protection, security, and defending against threats.',
    behavior: 'Uses fear appeals, threat framing, and protective language.',
    risk: 'May amplify dangers beyond realistic proportions to justify actions.',
    trigger: (motives: MotiveData[]) => {
      const security = motives.find(m => m.type.toLowerCase().includes('security'));
      return security && security.score > 60;
    }
  },
  'The Influencer': {
    name: 'The Influencer',
    description: 'Seeks social validation, consensus-building, and popularity.',
    behavior: 'Appeals to trends, social proof, and majority opinions.',
    risk: 'May prioritize virality over accuracy or depth.',
    trigger: (motives: MotiveData[]) => {
      const social = motives.find(m => m.type.toLowerCase().includes('social'));
      return social && social.score > 60;
    }
  },
  'The Pragmatist': {
    name: 'The Pragmatist',
    description: 'Appears to be driven by a mix of motives with no single clear driver.',
    behavior: 'Opportunistic, adapting messaging to the situation.',
    risk: 'Can be unpredictable and hard to analyze long-term goals.',
    trigger: (motives: MotiveData[]) => true // Default fallback
  }
};

// ✅ NEW: Derive archetype from real motive data
const deriveArchetype = (motives: MotiveData[]) => {
  // Try each archetype's trigger condition
  for (const [key, archetype] of Object.entries(ARCHETYPES)) {
    if (key !== 'The Pragmatist' && archetype.trigger(motives)) {
      return archetype;
    }
  }
  // Default to Pragmatist if no clear dominant motive
  return ARCHETYPES['The Pragmatist'];
};

// ✅ NEW: Calculate average intensity from motives
const calculateAverageIntensity = (motives: MotiveData[]) => {
  if (motives.length === 0) return 0;
  const sum = motives.reduce((acc, m) => acc + m.score, 0);
  return Math.round(sum / motives.length);
};

// ✅ NEW: Generate strategic implications from primary motive
const generateImplications = (primaryMotive: MotiveData) => {
  const type = primaryMotive.type.toLowerCase();
  
  if (type.includes('financial')) {
    return [
      `${primaryMotive.name} driving financial decision-making`,
      'High sensitivity to cost-benefit analysis'
    ];
  } else if (type.includes('ideological')) {
    return [
      `${primaryMotive.name} aligned with group identity`,
      'Resistance to factual correction if it contradicts belief'
    ];
  } else if (type.includes('strategic')) {
    return [
      `${primaryMotive.name} indicates calculated positioning`,
      'Long-term planning evident in actions'
    ];
  } else if (type.includes('security')) {
    return [
      `${primaryMotive.name} centered on threat protection`,
      'Defensive posture with risk-averse behavior'
    ];
  } else if (type.includes('social')) {
    return [
      `${primaryMotive.name} seeking consensus and validation`,
      'Strong influence from peer dynamics'
    ];
  }
  
  // Generic fallback
  return [
    `${primaryMotive.name} showing mixed strategic signals`,
    'Opportunistic behavior pattern'
  ];
};

const MotiveDetectionDisplay = ({ motiveData }: MotiveDetectionDisplayProps) => {
  // ✅ FIXED: Validate data before rendering
  if (!motiveData || motiveData.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-8 text-center">
        <Microscope className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Motive Detection</h3>
        <p className="text-gray-600 dark:text-gray-400">No motive data available for this article.</p>
      </div>
    );
  }

  // ✅ FIXED: Derive all data from real motiveData
  const primaryMotive = motiveData[0];
  const secondaryMotives = motiveData.slice(1);
  
  // Derive archetype from actual data
  const dominantArchetype = deriveArchetype(motiveData);
  const avgIntensity = calculateAverageIntensity(motiveData);
  const strategicImplications = generateImplications(primaryMotive);

  // Practical Reaction Guide (can be static as it's general advice)
  const reactionGuide = [
    {
      icon: Aperture,
      title: "Find the core message",
      tip: "Try to identify the single action the news wants you to take.",
    },
    {
      icon: AlertCircle,
      title: "Proceed with caution",
      tip: "Be skeptical of messages that try to appeal to many different motives at once.",
    },
    {
      icon: CheckCircle2,
      title: "Verify claims",
      tip: "Cross-reference claims with independent sources that don't share the same motive.",
    },
    {
      icon: Zap,
      title: "Understand bias",
      tip: 'Ask yourself: "Who benefits if I believe this?" and "What am I being asked to feel?"',
    },
  ];

  return (
    <div className="p-8">
      {/* ------------------------------------------- */}
      {/* 1. DOMINANT ARCHETYPE ANALYSIS */}
      {/* ------------------------------------------- */}

      <div className="pb-6 border-b border-slate-100 dark:border-slate-700 mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase">
              DOMINANT ARCHETYPE
            </h3>

            <div className="flex items-center gap-3 mt-2">
              <Zap className="w-8 h-8 text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 p-1.5 rounded-lg" />
              <p className="text-3xl font-extrabold text-slate-900 dark:text-white">
                {dominantArchetype.name}
              </p>
            </div>
          </div>

          <div className="text-right">
            <p className="text-xs text-slate-500 dark:text-slate-400">Avg. Intensity</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {avgIntensity}%
            </p>
          </div>
        </div>

        <p className="text-base text-slate-700 dark:text-slate-300 italic mb-4 border-l-4 border-purple-300 dark:border-purple-600 pl-3">
          {dominantArchetype.description}
        </p>

        {/* Archetype Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Typical Behavior */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
            <h5 className="font-bold text-orange-600 dark:text-orange-400 mb-2 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" /> Typical Behavior
            </h5>
            <p className="text-sm text-slate-700 dark:text-slate-300">{dominantArchetype.behavior}</p>
          </div>

          {/* Potential Risk */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
            <h5 className="font-bold text-red-600 dark:text-red-400 mb-2 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" /> Potential Risk
            </h5>
            <p className="text-sm text-slate-700 dark:text-slate-300">{dominantArchetype.risk}</p>
          </div>
        </div>
      </div>

      {/* ------------------------------------------- */}
      {/* 2. PRIMARY MOTIVE + SECONDARY MOTIVES */}
      {/* ------------------------------------------- */}

      <h4 className="font-extrabold text-2xl text-slate-900 dark:text-white mb-4 flex items-center gap-2">
        <Microscope className="w-6 h-6 text-blue-600 dark:text-blue-400" /> Detected Motive Summary
      </h4>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Primary motive card */}
        <motion.div
          className="lg:col-span-1 p-6 bg-blue-600 dark:bg-blue-700 text-white rounded-xl shadow-xl transform hover:scale-[1.01] transition-all"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="flex justify-between items-start mb-4">
            <div className="text-sm font-bold uppercase opacity-80">
              Primary Motive
            </div>
            <span className="text-3xl font-extrabold">
              {primaryMotive.score}%
            </span>
          </div>

          <h4 className="text-3xl font-extrabold mb-1">
            {primaryMotive.name}
          </h4>

          <p className="text-sm opacity-70 mb-4">
            {primaryMotive.type.toUpperCase()}
          </p>

          <div
            className="h-1 bg-yellow-400 dark:bg-yellow-300 rounded-full"
            style={{ width: `${primaryMotive.score}%` }}
          />
        </motion.div>

        {/* Secondary motives */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          <h5 className="text-lg font-bold text-slate-900 dark:text-white">Secondary Drivers:</h5>

          {secondaryMotives.length > 0 ? (
            secondaryMotives.map((m, index) => (
              <div
                key={index}
                className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm"
              >
                <div className="flex justify-between items-center">
                  <span className="text-base font-semibold text-slate-800 dark:text-slate-200">
                    {m.name}
                  </span>
                  <span className="text-xl font-bold text-orange-600 dark:text-orange-400">
                    {m.score}%
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">{m.type.toUpperCase()}</p>
              </div>
            ))
          ) : (
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm text-center">
              <p className="text-sm text-slate-500 dark:text-slate-400">No secondary motives detected</p>
            </div>
          )}
        </div>

        {/* Strategic Implications (derived from real data) */}
        <div className="lg:col-span-1 p-4 bg-blue-50/50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg shadow-sm">
          <h5 className="font-bold text-blue-700 dark:text-blue-400 mb-2 flex items-center gap-2">
            Strategic Implications
          </h5>
          <ul className="text-sm text-slate-700 dark:text-slate-300 list-disc list-inside space-y-1">
            {strategicImplications.map((implication, idx) => (
              <li key={idx}>{implication}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* ------------------------------------------- */}
      {/* 3. PRACTICAL REACTION GUIDE */}
      {/* ------------------------------------------- */}

      <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-700">
        <h4 className="font-extrabold text-2xl text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Scale className="w-6 h-6 text-green-600 dark:text-green-400" /> Practical Reaction Guide
        </h4>

        <p className="text-slate-600 dark:text-slate-400 mb-6">
          Based on the primary motive of{" "}
          <strong className="text-slate-900 dark:text-white">{primaryMotive.name}</strong>, here are some practical
          actions:
        </p>

        <div className="grid md:grid-cols-2 gap-4">
          {reactionGuide.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="p-5 bg-white dark:bg-slate-800/50 border-2 border-slate-100 dark:border-slate-700 rounded-xl shadow-md hover:shadow-lg transition-shadow"
              >
                <h5 className="font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                  <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" /> {item.title}
                </h5>

                <p className="text-sm text-slate-600 dark:text-slate-400">
                  <strong className="text-slate-900 dark:text-white">You can:</strong> {item.tip}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MotiveDetectionDisplay;
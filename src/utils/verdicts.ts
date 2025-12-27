// src/utils/verdicts.ts

export type SignalIntensity = { label?: string; score?: number };

// 允許 pestle 結構：{ political:{score:..}, economic:{score:..} ... }
export type PestleLike = Record<string, { score?: number } | any>;

// 允許 hiddenMotives.incentiveStack 結構：
// 1) { economic: 60, socialPositioning: 20 ... }
// 2) { economic: {score:60}, socialPositioning:{score:20} ... }
export type HiddenMotivesLike = {
  incentiveStack?: Record<string, number | { score?: number } | any>;
};

export const mkBriefVerdict = (signalIntensity?: SignalIntensity) => {
  const score = signalIntensity?.score;
  if (score == null) return "Signal strength cannot be assessed from available information.";

  if (score >= 8) return "High-signal development. Treat as actionable and time-sensitive.";
  if (score >= 6) return "Meaningful signal. Direction is forming, but not fully confirmed.";
  if (score >= 4) return "Low-to-moderate signal. Monitor, but avoid over-committing.";
  return "Weak signal. Treat this as noise until corroborated.";
};

export const mkCredVerdict = (credibilityScore?: number, manipulationScore?: number) => {
  if (credibilityScore == null || manipulationScore == null) {
    return "Credibility cannot be assessed due to insufficient data.";
  }

  if (credibilityScore >= 80 && manipulationScore < 30) {
    return "Fact-led reporting with minimal narrative pressure.";
  }

  if (credibilityScore >= 60) {
    return "Broadly factual, but framing signals are present. Use with caution.";
  }

  return "High framing risk. Do not treat this as objective reporting.";
};

export const mkPestleVerdict = (pestle?: PestleLike) => {
  if (!pestle) return "Macro drivers (external forces like politics or economy) cannot be assessed from available information.";

  const entries = Object.entries(pestle)
    .map(([k, v]: any) => ({ key: k, score: Number(v?.score ?? 0) }))
    .filter((e) => Number.isFinite(e.score))
    .sort((a, b) => b.score - a.score);

  if (!entries.length) return "No dominant macro pressure (external influences) detected.";

  const primary = entries[0];
  const secondary = entries[1];

  const labelMap: Record<string, string> = {
    political: "political/regulatory (government rules)",
    economic: "economic (money and markets)",
    social: "social (people and culture)",
    technological: "technology (innovation)",
    legal: "legal (laws)",
    environmental: "environmental (nature and sustainability)",
  };

  const pLabel = labelMap[primary.key] ?? primary.key;

  if (secondary && secondary.score >= 40) {
    const sLabel = labelMap[secondary.key] ?? secondary.key;
    return `Primary driver: ${pLabel}. Secondary spillover: ${sLabel}. These are key external forces affecting the story.`;
  }

  return `Primary driver: ${pLabel}. This is the main external force at play.`;
};

export const mkIntentVerdict = (hiddenMotives?: HiddenMotivesLike | any) => {
  const stack = hiddenMotives?.incentiveStack;
  if (!stack) return "Narrative intent cannot be determined from available information.";

  const entries = Object.entries(stack)
    .map(([k, v]: any) => {
      const score =
        typeof v === "number" ? v :
        typeof v?.score === "number" ? v.score :
        Number(v ?? 0);
      return { key: k, score: Number(score) };
    })
    .filter((e) => Number.isFinite(e.score))
    .sort((a, b) => b.score - a.score);

  const primary = entries[0];
  const secondary = entries[1];

  if (!primary || primary.score < 40) return "No clear narrative intent signal detected.";

  const labelMap: Record<string, string> = {
    economic: "economic positioning",
    politicalSignaling: "political signaling",
    socialPositioning: "social positioning",
    ideologicalControl: "belief shaping",
  };

  const pLabel = labelMap[primary.key] ?? primary.key;

  if (secondary && secondary.score >= 40) {
    const sLabel = labelMap[secondary.key] ?? secondary.key;
    return `Primary intent: ${pLabel}. Secondary: ${sLabel}.`;
  }

  return `Primary intent: ${pLabel}.`;
};

export const mkPowerVerdict = (partyImpact?: any) => {
  if (!partyImpact) return "Stakeholder power cannot be assessed from available information.";
  return "Power is concentrated. Focus on high-influence actors and their constraints.";
};

export const mkMarketVerdict = (overall?: string) => {
  if (!overall) return "Market read-through cannot be assessed from available information.";

  const s = String(overall).toLowerCase();
  if (s.includes("bull")) return "Market read-through skews positive. Watch beneficiaries and positioning.";
  if (s.includes("bear")) return "Market read-through skews negative. Prioritize risk controls and downside paths.";
  if (s.includes("neutral")) return "Market read-through is mixed. Timing matters more than direction.";
  return "Market read-through is unclear. Validate with price action and confirmed tickers.";
};

export const mkNextVerdict = (...components: any[]) => {
  const count = components.filter(Boolean).length;
  const messages = [
    "Forward trajectory cannot be assessed from available information.",
    "Partial forward signal only. Treat as scenario-building, not a forecast.",
    "Direction is forming, but uncertainty remains. Monitor next catalysts.",
    "Base case: gradual progression with feedback risk. Track updates and second-order effects.",
  ];
  return messages[count] || messages[0];
};

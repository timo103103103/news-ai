// ==============================
// PESTLE Advice Engine
// ==============================

export type PestleAdviceResult = {
  classification:
    | 'ATTACK'
    | 'DEFEND'
    | 'MIXED'
    | 'TACTICAL'
    | 'MONITOR'
    | 'IGNORE'
    | 'OPTIONALITY'
    | 'ASYMMETRIC_RISK';

  viewpoint: string;
  primaryAdvice: string;
  tactics: string[];
  riskNote: string;
  confidenceLevel: 'High' | 'Medium' | 'Low';
};

export function mkPestleAdvice(params: {
  factor: string;      // Political / Economic / ...
  impact: number;      // I: 0–100
  agency: number;      // C: 0–1
  actionable?: number; // A = I*C
  vulnerability?: number; // V = I*(1-C)
}): PestleAdviceResult {

  const { factor, impact: I, agency: C } = params;
  const A = params.actionable ?? Math.round(I * C);
  const V = params.vulnerability ?? Math.round(I * (1 - C));

  // ------------------------------
  // Thresholds
  // ------------------------------
  const HIGH_I = I >= 70;
  const MID_I = I >= 40 && I < 70;
  const LOW_I = I < 40;

  const HIGH_C = C >= 0.6;
  const MID_C = C >= 0.35 && C < 0.6;
  const LOW_C = C < 0.35;

  const ATTACK_DOMINANT = A >= V + 10;
  const DEFEND_DOMINANT = V >= A + 10;
  const BALANCED = Math.abs(A - V) < 10;

  // ------------------------------
  // 1️⃣ HIGH IMPACT ZONES
  // ------------------------------

  // 🟥 High Impact + Low Agency → DEFEND
  if (HIGH_I && LOW_C) {
    return {
      classification: 'DEFEND',
      viewpoint:
        'External pressure is structurally strong while controllability is limited. ' +
        'Outcome distribution is downside-skewed and largely exogenous.',
      primaryAdvice:
        'Adopt a defensive posture. Focus on exposure reduction rather than optimization.',
      tactics: [
        'Reduce dependency on affected channels or geographies',
        'Implement hedge, insurance, or contractual protections where possible',
        'Predefine trigger-based contingency plans (policy, sanctions, disruptions)',
        'Increase monitoring frequency of early warning indicators',
        'Avoid irreversible commitments until controllability improves'
      ],
      riskNote:
        'Misjudging controllability in this regime can result in rapid downside amplification.',
      confidenceLevel: 'High'
    };
  }

  // 🟩 High Impact + High Agency → ATTACK
  if (HIGH_I && HIGH_C && ATTACK_DOMINANT) {
    return {
      classification: 'ATTACK',
      viewpoint:
        'The force is both material and largely actionable. ' +
        'Execution quality can meaningfully shape outcomes.',
      primaryAdvice:
        'Adopt a proactive strategy. Convert external pressure into strategic leverage.',
      tactics: [
        'Reallocate capital and resources toward exposed opportunities',
        'Accelerate execution timelines to front-run competitors',
        'Use pricing, sourcing, or positioning to amplify advantage',
        'Engage regulators, partners, or standard-setting bodies if applicable',
        'Lock in advantages before the force becomes consensus-priced'
      ],
      riskNote:
        'Overconfidence or delayed execution may erode first-mover advantage.',
      confidenceLevel: 'High'
    };
  }

  // 🟧 High Impact + Medium Agency → MIXED
  if (HIGH_I && MID_C) {
    return {
      classification: 'MIXED',
      viewpoint:
        'Impact is material but controllability is uneven across channels. ' +
        'Both upside capture and downside protection are relevant.',
      primaryAdvice:
        'Pursue a dual-track strategy balancing defense and selective offense.',
      tactics: [
        'Defend core exposure while selectively investing in controllable sub-areas',
        'Preserve optionality by avoiding binary commitments',
        'Stage investments with clear stop-loss and review points',
        'Maintain flexibility to pivot as agency evolves',
        'Segment decisions by controllability rather than by headline impact'
      ],
      riskNote:
        'Over-committing to either defense or offense increases execution risk.',
      confidenceLevel: 'Medium'
    };
  }

  // ------------------------------
  // 2️⃣ MEDIUM IMPACT ZONES
  // ------------------------------

  // 🟦 Medium Impact + High Agency → TACTICAL
  if (MID_I && HIGH_C) {
    return {
      classification: 'TACTICAL',
      viewpoint:
        'Impact is manageable and controllability is strong. ' +
        'Outcome improvements are achievable through operational adjustments.',
      primaryAdvice:
        'Apply tactical optimization rather than strategic repositioning.',
      tactics: [
        'Fine-tune pricing, sourcing, or cost structures',
        'Adjust operational processes to absorb or exploit the force',
        'Use this factor as a margin or efficiency lever',
        'Test small-scale initiatives before scaling',
        'Exploit competitor inertia where applicable'
      ],
      riskNote:
        'Excessive strategic focus may misallocate attention from higher-impact forces.',
      confidenceLevel: 'Medium'
    };
  }

  // 🟨 Medium Impact + Low Agency → MONITOR
  if (MID_I && LOW_C) {
    return {
      classification: 'MONITOR',
      viewpoint:
        'Impact is present but not yet decision-dominant, and controllability is limited.',
      primaryAdvice:
        'Maintain a watchful posture and prepare for escalation.',
      tactics: [
        'Set alert thresholds for impact or agency changes',
        'Avoid capital-intensive or long-duration commitments',
        'Develop contingency options without immediate deployment',
        'Track policy, supply, or sentiment inflection points',
        'Reassess positioning if impact increases'
      ],
      riskNote:
        'Ignoring escalation signals may force reactive decisions later.',
      confidenceLevel: 'Medium'
    };
  }

  // ------------------------------
  // 3️⃣ LOW IMPACT ZONES
  // ------------------------------

  // 🟪 Low Impact + Any Agency → IGNORE
  if (LOW_I) {
    return {
      classification: 'IGNORE',
      viewpoint:
        'Current impact levels are statistically insufficient to influence decisions.',
      primaryAdvice:
        'Treat as background context. No active response required.',
      tactics: [
        'Do not allocate decision bandwidth',
        'Avoid premature optimization',
        'Revisit only if impact metrics change materially'
      ],
      riskNote:
        'Overreacting to low-impact signals can dilute strategic focus.',
      confidenceLevel: 'High'
    };
  }

  // ------------------------------
  // 4️⃣ SPECIAL EDGE CASES
  // ------------------------------

  // ⚠️ Asymmetric Risk: Low A, Moderate V, High Uncertainty
  if (I >= 60 && C < 0.3 && V >= 40) {
    return {
      classification: 'ASYMMETRIC_RISK',
      viewpoint:
        'Risk profile is asymmetric with limited upside and meaningful tail risk.',
      primaryAdvice:
        'Prioritize tail-risk containment over expected value optimization.',
      tactics: [
        'Cap downside exposure explicitly',
        'Use options or structural hedges if available',
        'Avoid leverage or concentration',
        'Scenario-test worst-case outcomes'
      ],
      riskNote:
        'Fat-tail events dominate outcomes in this regime.',
      confidenceLevel: 'Low'
    };
  }

  // 🟫 Optionality Zone: Medium everything
  if (MID_I && MID_C && BALANCED) {
    return {
      classification: 'OPTIONALITY',
      viewpoint:
        'Neither impact nor controllability is decisive. ' +
        'Value lies in preserving flexibility.',
      primaryAdvice:
        'Maintain optionality and delay irreversible commitments.',
      tactics: [
        'Structure decisions to keep exit options open',
        'Use pilot programs or phased investments',
        'Collect additional data before committing',
        'Reassess as clarity improves'
      ],
      riskNote:
        'Premature commitment may lock in suboptimal paths.',
      confidenceLevel: 'Low'
    };
  }

  // ------------------------------
  // Fallback (should rarely hit)
  // ------------------------------
  return {
    classification: 'MONITOR',
    viewpoint:
      'Insufficient signal clarity for a definitive strategic stance.',
    primaryAdvice:
      'Monitor conditions and reassess as data quality improves.',
    tactics: ['Increase data collection', 'Review assumptions'],
    riskNote:
      'Decision confidence is limited by data quality.',
    confidenceLevel: 'Low'
  };
}

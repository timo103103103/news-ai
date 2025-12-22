import { useEffect, useMemo, useState } from "react";

export type ExportSection =
  | { title: string; content: string; meta?: Record<string, any> }
  | { title: string; content: Record<string, any>; meta?: Record<string, any> }
  | { title: string; content: Array<Record<string, any> | string>; meta?: Record<string, any> };

export interface ExportReport {
  situationBrief: ExportSection;
  sourceBiasCheck: ExportSection;
  bigPictureForces: ExportSection;
  hiddenMotives: ExportSection;
  powerMap: ExportSection;
  marketImpact: ExportSection;
  whatHappensNext: ExportSection;
  title: string;
  date: string;
  entropyScore?: number;
}

function safeString(x: any) {
  if (x === null || x === undefined) return "";
  if (typeof x === "string") return x;
  try {
    return JSON.stringify(x);
  } catch {
    return String(x);
  }
}

function missingSection(title: string): ExportSection {
  return { title, content: "No sufficient data detected for this section." };
}

export function useExportReport(): ExportReport {
  const [raw, setRaw] = useState<any>(null);

  useEffect(() => {
    try {
      const a = sessionStorage.getItem("analysisResult");
      const b = sessionStorage.getItem("currentAnalysis");
      const parsedA = a ? JSON.parse(a) : null;
      const parsedB = b ? JSON.parse(b) : null;
      const source = parsedA ?? parsedB ?? null;
      setRaw(source);
    } catch {
      setRaw(null);
    }
  }, []);

  const report: ExportReport = useMemo(() => {
    const normalized =
      raw && raw.full
        ? { ...raw.full, mode: "full", wasAutoUpgraded: true }
        : raw && raw.data
        ? { ...raw.data, mode: raw.mode || "lite" }
        : raw
        ? { ...raw, ...(raw.rawAnalysis || {}) }
        : {};

    const title = normalized?.summary?.title || "NexVeris Intelligence Report";
    const date = new Date().toISOString().slice(0, 10);
    const entropyScore =
      normalized?.entropy?.signalToNoise ?? normalized?.summary?.accuracy ?? undefined;

    const situationBrief =
      normalized?.summary
        ? {
            title: "Situation Brief",
            content: {
              title: safeString(normalized.summary.title),
              executiveSummary: safeString(
                normalized.summary.executiveSummary ||
                  normalized.summary.oneLineSummary ||
                  ""
              ),
              timeframe: safeString(normalized.summary.timeframe || ""),
              accuracy: normalized.summary.accuracy ?? null,
              keyPoints: normalized.summary.keyPoints ?? [],
              relatedEntities: normalized.summary.relatedEntities ?? [],
            },
          }
        : missingSection("Situation Brief");

    const sourceBiasCheck =
      normalized?.credibility
        ? {
            title: "Source & Bias Check",
            content: {
              credibilityScore: normalized.credibility.credibilityScore ?? 0,
              manipulationScore: normalized.credibility.manipulationScore ?? 0,
              biasIndicators: normalized.credibility.biasIndicators ?? [],
              factors: normalized.credibility.factors ?? [],
              analystNote: normalized.credibility.analystNote ?? null,
            },
          }
        : missingSection("Source & Bias Check");

    const bigPictureForces =
      normalized?.pestle
        ? {
            title: "Big Picture Forces (PESTLE)",
            content: normalized.pestle,
          }
        : missingSection("Big Picture Forces (PESTLE)");

    const hm =
      normalized?.rawAnalysis?.hiddenMotives ??
      normalized?.hiddenMotives ??
      null;

    const hiddenMotivesSection =
      hm
        ? {
            title: "Hidden Motives",
            content: {
              dominantDriver: hm?.dominantDriver ?? null,
              incentiveStack: hm?.incentiveStack ?? null,
              behavioralPattern: hm?.behavioralPattern ?? null,
              powerAmplification: hm?.powerAmplification ?? null,
              strategicConsequence: hm?.strategicConsequence ?? null,
            },
          }
        : missingSection("Hidden Motives");

    const powerMapSection =
      normalized?.partyImpact || hm?.powerAmplification
        ? {
            title: "Who Really Has Power",
            content: {
              partyImpact: normalized?.partyImpact ?? null,
              actors: hm?.powerAmplification?.actors ?? [],
            },
          }
        : missingSection("Who Really Has Power");

    const marketImpactSection =
      normalized?.marketImpact
        ? {
            title: "Market Impact",
            content: normalized.marketImpact,
          }
        : missingSection("Market Impact");

    const whatNextSection = {
      title: "What Happens Next",
      content:
        normalized?.chronos || normalized?.entropy || normalized?.ouroboros
          ? {
              chronos: normalized?.chronos ?? null,
              entropy: normalized?.entropy ?? null,
              ouroboros: normalized?.ouroboros ?? null,
            }
          : "No sufficient data detected for this section.",
    };

    return {
      situationBrief,
      sourceBiasCheck,
      bigPictureForces: bigPictureForces,
      hiddenMotives: hiddenMotivesSection,
      powerMap: powerMapSection,
      marketImpact: marketImpactSection,
      whatHappensNext: whatNextSection,
      title,
      date,
      entropyScore,
    };
  }, [raw]);

  return report;
}

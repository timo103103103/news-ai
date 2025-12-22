import type { ExportReport } from "@/hooks/useExportReport";
import { BRAND_NAME } from "./brand";

export function generateMarkdown(report: ExportReport) {
  const h = (t: string) => `# ${t}`;
  const s = (t: string) => `## ${t}`;
  const toText = (c: any) => (typeof c === "string" ? c : "```json\n" + JSON.stringify(c, null, 2) + "\n```");
  const tags = "\n\n#NexVeris\n#MarketIntelligence\n#Geopolitics\n";
  const md =
    `${h(BRAND_NAME)}\n\n` +
    `${s(report.title)}\n\n` +
    `Date: ${report.date}\n\n` +
    `${s("Situation Brief")}\n\n${toText(report.situationBrief.content)}\n\n` +
    `${s("Source & Bias Check")}\n\n${toText(report.sourceBiasCheck.content)}\n\n` +
    `${s("Big Picture Forces (PESTLE)")}\n\n${toText(report.bigPictureForces.content)}\n\n` +
    `${s("Hidden Motives")}\n\n${toText(report.hiddenMotives.content)}\n\n` +
    `${s("Who Really Has Power")}\n\n${toText(report.powerMap.content)}\n\n` +
    `${s("Market Impact")}\n\n${toText(report.marketImpact.content)}\n\n` +
    `${s("What Happens Next")}\n\n${toText(report.whatHappensNext.content)}\n` +
    tags;
  const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `NexVeris_Report_${report.date}.md`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

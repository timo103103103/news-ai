import type { ExportReport } from "@/hooks/useExportReport";
import { BRAND_NAME, CONFIDENTIAL_FOOTER } from "./brand";

export async function generatePptx(report: ExportReport) {
  try {
    const pptxModule: any = await import("pptxgenjs");
    const pptx = new pptxModule.default();

    const addSlide = (title: string, bullets: string[]) => {
      const slide = pptx.addSlide();
      slide.addText(title, { x: 0.5, y: 0.4, fontSize: 24, bold: true });
      slide.addText(bullets.map((b) => `• ${b}`), { x: 0.5, y: 1.2, fontSize: 16, lineSpacing: 20 });
      slide.addText(CONFIDENTIAL_FOOTER, { x: 0.5, y: 6.8, fontSize: 10 });
    };

    const briefBullets =
      typeof report.situationBrief.content === "string"
        ? [report.situationBrief.content]
        : Object.entries(report.situationBrief.content as any)
            .slice(0, 6)
            .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : String(v)}`);

    const sbc =
      typeof report.sourceBiasCheck.content === "string"
        ? [report.sourceBiasCheck.content]
        : Object.entries(report.sourceBiasCheck.content as any)
            .slice(0, 6)
            .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : String(v)}`);

    const pestleBullets =
      typeof report.bigPictureForces.content === "string"
        ? [report.bigPictureForces.content]
        : Object.entries(report.bigPictureForces.content as any)
            .slice(0, 6)
            .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : String(v)}`);

    const motivesBullets =
      typeof report.hiddenMotives.content === "string"
        ? [report.hiddenMotives.content]
        : Object.entries(report.hiddenMotives.content as any)
            .slice(0, 6)
            .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : String(v)}`);

    const powerBullets =
      typeof report.powerMap.content === "string"
        ? [report.powerMap.content]
        : Object.entries(report.powerMap.content as any)
            .slice(0, 6)
            .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : String(v)}`);

    const marketBullets =
      typeof report.marketImpact.content === "string"
        ? [report.marketImpact.content]
        : Object.entries(report.marketImpact.content as any)
            .slice(0, 6)
            .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : String(v)}`);

    const nextBullets =
      typeof report.whatHappensNext.content === "string"
        ? [report.whatHappensNext.content]
        : Object.entries(report.whatHappensNext.content as any)
            .slice(0, 6)
            .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : String(v)}`);

    const cover = pptx.addSlide();
    cover.addText(BRAND_NAME, { x: 0.5, y: 0.6, fontSize: 30, bold: true });
    cover.addText(report.title, { x: 0.5, y: 1.2, fontSize: 22 });
    cover.addText(`Date: ${report.date}`, { x: 0.5, y: 1.8, fontSize: 16 });
    cover.addText(CONFIDENTIAL_FOOTER, { x: 0.5, y: 6.8, fontSize: 10 });

    addSlide("Situation Brief", briefBullets);
    addSlide("Source & Bias Check", sbc);
    addSlide("PESTLE", pestleBullets);
    addSlide("Hidden Motives", motivesBullets);
    addSlide("Power Map", powerBullets);
    addSlide("Market Impact", marketBullets);
    addSlide("What Happens Next", nextBullets);

    const filename = `NexVeris_Report_${report.date}.pptx`;
    await pptx.writeFile({ fileName: filename });
  } catch {
    const text = `${report.title}\n${report.date}\n${CONFIDENTIAL_FOOTER}`;
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `NexVeris_Report_${report.date}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

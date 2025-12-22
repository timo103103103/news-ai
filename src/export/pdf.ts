import { BRAND_NAME, BRAND_SUBTITLE, CONFIDENTIAL_FOOTER } from "./brand";
import type { ExportReport } from "@/hooks/useExportReport";

function addFooter(doc: any, pageWidth: number, pageHeight: number) {
  doc.setFontSize(8);
  doc.text(CONFIDENTIAL_FOOTER, pageWidth / 2, pageHeight - 10, { align: "center" });
}

function addCover(doc: any, report: ExportReport) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, pageWidth, pageHeight, "F");
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(22);
  doc.text(BRAND_NAME, pageWidth / 2, 40, { align: "center" });
  doc.setFontSize(12);
  doc.text(BRAND_SUBTITLE, pageWidth / 2, 55, { align: "center" });
  doc.setFontSize(18);
  doc.text(report.title, pageWidth / 2, 85, { align: "center" });
  doc.setFontSize(11);
  doc.text(`Date: ${report.date}`, pageWidth / 2, 100, { align: "center" });
  if (typeof report.entropyScore === "number") {
    doc.text(`Entropy Score: ${report.entropyScore}`, pageWidth / 2, 115, { align: "center" });
  }
  doc.setFontSize(10);
  doc.text("Confidential", pageWidth / 2, 135, { align: "center" });
  addFooter(doc, pageWidth, pageHeight);
}

function sectionPage(doc: any, title: string, content: any) {
  doc.addPage("a4");
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  doc.setFontSize(16);
  doc.text(title, 20, 30);
  doc.setFontSize(11);
  const yStart = 45;
  const text = typeof content === "string" ? content : JSON.stringify(content, null, 2);
  const lines = doc.splitTextToSize(text, pageWidth - 40);
  doc.text(lines, 20, yStart);
  addFooter(doc, pageWidth, pageHeight);
}

export async function generatePDF(report: ExportReport) {
  try {
    const jsPDFModule: any = await import("jspdf");
    const doc = new jsPDFModule.jsPDF({ format: "a4", unit: "pt" });
    addCover(doc, report);
    sectionPage(doc, report.situationBrief.title, report.situationBrief.content);
    sectionPage(doc, report.sourceBiasCheck.title, report.sourceBiasCheck.content);
    sectionPage(doc, report.bigPictureForces.title, report.bigPictureForces.content);
    sectionPage(doc, report.hiddenMotives.title, report.hiddenMotives.content);
    sectionPage(doc, report.powerMap.title, report.powerMap.content);
    sectionPage(doc, report.marketImpact.title, report.marketImpact.content);
    sectionPage(doc, report.whatHappensNext.title, report.whatHappensNext.content);
    const filename = `NexVeris_Report_${report.date}.pdf`;
    doc.save(filename);
  } catch {
    const text =
      `${BRAND_NAME}\n${BRAND_SUBTITLE}\n${report.title}\nDate: ${report.date}\n\n` +
      `${report.situationBrief.title}\n${typeof report.situationBrief.content === "string" ? report.situationBrief.content : JSON.stringify(report.situationBrief.content)}\n\n` +
      `${report.sourceBiasCheck.title}\n${typeof report.sourceBiasCheck.content === "string" ? report.sourceBiasCheck.content : JSON.stringify(report.sourceBiasCheck.content)}\n\n` +
      `${report.bigPictureForces.title}\n${typeof report.bigPictureForces.content === "string" ? report.bigPictureForces.content : JSON.stringify(report.bigPictureForces.content)}\n\n` +
      `${report.hiddenMotives.title}\n${typeof report.hiddenMotives.content === "string" ? report.hiddenMotives.content : JSON.stringify(report.hiddenMotives.content)}\n\n` +
      `${report.powerMap.title}\n${typeof report.powerMap.content === "string" ? report.powerMap.content : JSON.stringify(report.powerMap.content)}\n\n` +
      `${report.marketImpact.title}\n${typeof report.marketImpact.content === "string" ? report.marketImpact.content : JSON.stringify(report.marketImpact.content)}\n\n` +
      `${report.whatHappensNext.title}\n${typeof report.whatHappensNext.content === "string" ? report.whatHappensNext.content : JSON.stringify(report.whatHappensNext.content)}\n\n` +
      `${CONFIDENTIAL_FOOTER}`;
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

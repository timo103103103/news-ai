import { BRAND_NAME, BRAND_SUBTITLE, CONFIDENTIAL_FOOTER } from "./brand";
import type { ExportReport } from "@/hooks/useExportReport";

export async function generateDocx(report: ExportReport) {
  try {
    const docxModule: any = await import("docx");
    const { Document, Packer, Paragraph, HeadingLevel, TextRun, AlignmentType, Footer, PageBreak } =
      docxModule;

    const paragraphs: any[] = [];

    paragraphs.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: BRAND_NAME, size: 48, bold: true })],
      })
    );
    paragraphs.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: BRAND_SUBTITLE, size: 24 })],
      })
    );
    paragraphs.push(
      new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: report.title, size: 32 })] })
    );
    paragraphs.push(
      new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `Date: ${report.date}`, size: 22 })] })
    );
    if (typeof report.entropyScore === "number") {
      paragraphs.push(
        new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `Entropy Score: ${report.entropyScore}`, size: 22 })] })
      );
    }
    paragraphs.push(new PageBreak());

    const addSection = (title: string, content: any) => {
      paragraphs.push(new Paragraph({ text: title, heading: HeadingLevel.HEADING_1 }));
      const text = typeof content === "string" ? content : JSON.stringify(content, null, 2);
      paragraphs.push(new Paragraph({ text }));
      paragraphs.push(new PageBreak());
    };

    addSection(report.situationBrief.title, report.situationBrief.content);
    addSection(report.sourceBiasCheck.title, report.sourceBiasCheck.content);
    addSection(report.bigPictureForces.title, report.bigPictureForces.content);
    addSection(report.hiddenMotives.title, report.hiddenMotives.content);
    addSection(report.powerMap.title, report.powerMap.content);
    addSection(report.marketImpact.title, report.marketImpact.content);
    addSection(report.whatHappensNext.title, report.whatHappensNext.content);

    const doc = new Document({
      sections: [
        {
          properties: {},
          children: paragraphs,
          footers: {
            default: new Footer({
              children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun(CONFIDENTIAL_FOOTER)] })],
            }),
          },
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `NexVeris_Report_${report.date}.docx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch {
    const text =
      `${BRAND_NAME}\n${BRAND_SUBTITLE}\n${report.title}\nDate: ${report.date}\n\n` +
      `Fallback: ${CONFIDENTIAL_FOOTER}`;
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

import type { ExportReport } from "@/hooks/useExportReport";

export async function generateExcel(report: ExportReport) {
  try {
    const xlsxModule: any = await import("xlsx");
    const wb = xlsxModule.utils.book_new();

    const marketRows: any[] = [];
    const mi = report.marketImpact.content as any;
    const allTickers: any[] =
      mi?.tickers?.direct ?? mi?.tickers?.indirect ?? mi?.tickers?.speculative ?? mi?.tickers ?? [];
    (allTickers || []).forEach((t: any) => {
      marketRows.push({
        Ticker: t?.ticker || t?.symbol || "",
        Company: t?.company || "",
        ImpactDirection: t?.impact || t?.direction || "",
        Confidence: t?.confidence ?? "",
        Sector: t?.sector || "",
      });
    });
    const wsMarket = xlsxModule.utils.json_to_sheet(marketRows);
    xlsxModule.utils.book_append_sheet(wb, wsMarket, "Market Impact");

    const powerRows: any[] = [];
    const actors = (report.powerMap.content as any)?.actors ?? [];
    (actors || []).forEach((a: any) => {
      powerRows.push({
        Stakeholder: a?.name || "",
        Role: a?.category || "",
        PowerScore: a?.distributionPower ?? "",
        InterestScore: a?.incentiveAlignment ?? "",
        Sentiment: a?.sentiment || "",
        Quadrant: a?.quadrant || "",
      });
    });
    const wsPower = xlsxModule.utils.json_to_sheet(powerRows);
    xlsxModule.utils.book_append_sheet(wb, wsPower, "Stakeholder Power");

    const scenarioRows: any[] = [];
    const what = report.whatHappensNext.content as any;
    const scenarios = what?.scenarios ?? [];
    (scenarios || []).forEach((s: any) => {
      scenarioRows.push({
        Scenario: s?.name || "",
        Probability: s?.probability ?? "",
        TimeHorizon: s?.horizon || "",
        Triggers: (s?.triggers || []).join("|"),
      });
    });
    const wsScenarios = xlsxModule.utils.json_to_sheet(scenarioRows);
    xlsxModule.utils.book_append_sheet(wb, wsScenarios, "Scenarios");

    const filename = `NexVeris_Data_${report.date}.xlsx`;
    xlsxModule.writeFile(wb, filename);
  } catch {
    const csv = "Ticker,Company,ImpactDirection,Confidence,Sector\n";
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `NexVeris_Data_${report.date}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

// Local minimal type definitions to decouple from non-existent module
type PESTLECategory = { name: string; impact: number; color: string };
type Motive = { category: string; intensity: number; description: string; riskLevel: 'low' | 'medium' | 'high' };
type StockImpact = { symbol: string; name: string; sentimentScore: number; timeline: string; confidence: number };
type CredibilityFactor = { name: string; score: number };
type AnalysisData = {
  title: string;
  executiveSummary: string;
  strategicVerdict: string;
  recommendation: string;
  credibilityScore: number;
  pestleAnalysis: PESTLECategory[];
  motiveAnalysis: Motive[];
  marketImpact: StockImpact[];
  credibilityFactors: CredibilityFactor[];
};

export function sessionToAnalysisData(sessionJson: any): AnalysisData {
  const title = sessionJson?.summary?.title || 'Intelligence Report'
  const executiveSummary = typeof sessionJson?.rawAnalysis === 'string' ? sessionJson.rawAnalysis : 'No summary available'
  const strategicVerdict: AnalysisData['strategicVerdict'] = 'Hold/Neutral'
  const recommendation = 'Review analysis details and verify before execution.'

  const credibilityScore = typeof sessionJson?.manipulation?.score === 'number'
    ? Math.max(0, Math.min(100, Math.round(sessionJson.manipulation.score)))
    : 50

  const credibilityFactors: CredibilityFactor[] = Array.isArray(sessionJson?.manipulation?.factors)
    ? sessionJson.manipulation.factors.map((f: any) => ({
        name: f?.name ?? 'Factor',
        score: typeof f?.score === 'number' ? f.score : 50,
      }))
    : [
        { name: 'Factual Accuracy', score: 85 },
        { name: 'Source Diversity', score: 50 },
        { name: 'Emotional Tone', score: 30 },
        { name: 'Temporal Coherence', score: 15 },
      ]

  const pestleAnalysis: PESTLECategory[] = sessionJson?.pestle && typeof sessionJson.pestle === 'object' && !('factors' in sessionJson.pestle)
    ? Object.entries(sessionJson.pestle).map(([key, val]: [string, any]) => ({
        name: key.charAt(0).toUpperCase() + key.slice(1),
        impact: typeof val?.score === 'number' ? Math.max(-100, Math.min(100, Math.round((val.score - 50) * 2))) : 0,
        color: '#3B82F6',
      }))
    : [
        { name: 'Political', impact: -20, color: '#3B82F6' },
        { name: 'Economic', impact: -10, color: '#10B981' },
        { name: 'Social', impact: 10, color: '#F59E0B' },
        { name: 'Technological', impact: 25, color: '#8B5CF6' },
        { name: 'Legal', impact: -30, color: '#EF4444' },
        { name: 'Environmental', impact: 5, color: '#06B6D4' },
      ]

  const motiveAnalysis: Motive[] = Array.isArray(sessionJson?.motives)
    ? sessionJson.motives.map((m: any) => ({
        category: m?.category ?? 'Communication',
        intensity: typeof m?.intensity === 'number' ? m.intensity : 60,
        description: `${m?.name ?? 'Motive'} detected with ${typeof m?.intensity === 'number' ? m.intensity : 60}% intensity`,
        riskLevel: (m?.impact as Motive['riskLevel']) ?? (m?.intensity >= 75 ? 'high' : m?.intensity >= 50 ? 'medium' : 'low'),
      }))
    : [
        { category: 'Communication', intensity: 75, description: 'Drive to share information with public', riskLevel: 'high' },
        { category: 'Financial', intensity: 68, description: 'Intent to influence market perception', riskLevel: 'medium' },
        { category: 'Social', intensity: 62, description: 'Goal to raise public awareness', riskLevel: 'medium' },
      ]

  const marketImpact: StockImpact[] = sessionJson?.stock
    ? [{
        symbol: sessionJson.stock.symbol ?? 'MARKET',
        name: 'Market Aggregate',
        sentimentScore: typeof sessionJson.stock.impactScore === 'number' ? (sessionJson.stock.impactScore - 5) : 0,
        timeline: 'Short-Term (1 Week)',
        confidence: 80,
      }]
    : [
        { symbol: 'MARKET', name: 'Market Aggregate', sentimentScore: -1.2, timeline: 'Short-Term (1 Week)', confidence: 80 },
        { symbol: 'INDEX', name: 'Index Basket', sentimentScore: 0.6, timeline: 'Medium-Term (1 Month)', confidence: 60 },
      ]

  return {
    title,
    executiveSummary,
    strategicVerdict,
    recommendation,
    credibilityScore,
    pestleAnalysis,
    motiveAnalysis,
    marketImpact,
    credibilityFactors,
  }
}

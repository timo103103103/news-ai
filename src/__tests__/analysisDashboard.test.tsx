import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import NewsIntelligenceDashboard, { AnalysisData } from '@/components/AnalysisComponents'

const sample: AnalysisData = {
  title: 'Test Report',
  executiveSummary: 'Summary text',
  strategicVerdict: 'Hold/Neutral',
  recommendation: 'Recommendation text',
  credibilityScore: 55,
  pestleAnalysis: [
    { name: 'Political', impact: -10, color: '#3B82F6' },
    { name: 'Economic', impact: 15, color: '#10B981' },
    { name: 'Social', impact: 5, color: '#F59E0B' },
    { name: 'Technological', impact: 20, color: '#8B5CF6' },
    { name: 'Legal', impact: -25, color: '#EF4444' },
    { name: 'Environmental', impact: 0, color: '#06B6D4' },
  ],
  motiveAnalysis: [
    { category: 'Financial', intensity: 70, description: 'Financial motive', riskLevel: 'medium' },
  ],
  marketImpact: [
    { symbol: 'MARKET', name: 'Market Aggregate', sentimentScore: 0.5, timeline: 'Short-Term (1 Week)', confidence: 80 },
  ],
  credibilityFactors: [
    { name: 'Factual Accuracy', score: 80 },
    { name: 'Source Diversity', score: 40 },
  ],
}

describe('NewsIntelligenceDashboard', () => {
  it('renders title and key sections', () => {
    render(<NewsIntelligenceDashboard data={sample} />)
    expect(screen.getByText('Test Report')).toBeTruthy()
    expect(screen.getByText('Executive Verdict')).toBeTruthy()
    expect(screen.getByText('Market Sentiment Indicator')).toBeTruthy()
    expect(screen.getByText('PESTLE Impact Assessment')).toBeTruthy()
    expect(screen.getByText('Credibility Risk Score')).toBeTruthy()
  })
})
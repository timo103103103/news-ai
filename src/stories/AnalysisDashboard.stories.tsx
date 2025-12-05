import type { Meta, StoryObj } from '@storybook/react'
import NewsIntelligenceDashboard, { AnalysisData } from '@/components/AnalysisComponents'

const meta: Meta<typeof NewsIntelligenceDashboard> = {
  title: 'Analysis/NewsIntelligenceDashboard',
  component: NewsIntelligenceDashboard,
}

export default meta

type Story = StoryObj<typeof NewsIntelligenceDashboard>

const sample: AnalysisData = {
  title: 'Sample Intelligence Report',
  executiveSummary: 'Executive summary goes here.',
  strategicVerdict: 'Hold/Neutral',
  recommendation: 'Recommendation block text.',
  credibilityScore: 62,
  pestleAnalysis: [
    { name: 'Political', impact: -15, color: '#3B82F6' },
    { name: 'Economic', impact: 20, color: '#10B981' },
    { name: 'Social', impact: 5, color: '#F59E0B' },
    { name: 'Technological', impact: 30, color: '#8B5CF6' },
    { name: 'Legal', impact: -35, color: '#EF4444' },
    { name: 'Environmental', impact: 10, color: '#06B6D4' },
  ],
  motiveAnalysis: [
    { category: 'Financial', intensity: 70, description: 'Financial motive', riskLevel: 'medium' },
    { category: 'Political', intensity: 55, description: 'Political agenda', riskLevel: 'medium' },
  ],
  marketImpact: [
    { symbol: 'MARKET', name: 'Aggregate', sentimentScore: -0.8, timeline: 'Short-Term (1 Week)', confidence: 80 },
    { symbol: 'INDEX', name: 'Index Basket', sentimentScore: 0.4, timeline: 'Medium-Term (1 Month)', confidence: 60 },
  ],
  credibilityFactors: [
    { name: 'Factual Accuracy', score: 80 },
    { name: 'Source Diversity', score: 40 },
    { name: 'Emotional Tone', score: 30 },
  ],
}

export const Default: Story = {
  args: {
    data: sample,
  },
}
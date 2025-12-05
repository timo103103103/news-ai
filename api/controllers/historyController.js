const mockAnalysisHistory = [
  {
    id: '1',
    title: 'Market Analysis Q4 2024',
    date: '2024-11-15T10:30:00Z',
    summary: 'Comprehensive analysis of market trends and consumer behavior patterns',
    type: 'market-impact',
    metrics: { score: 85, confidence: 92 },
    content: 'Detailed market analysis showing strong growth potential in Q4 2024. Consumer confidence remains high despite economic uncertainties. Key trends include increased digital adoption and sustainability focus.',
    rawData: {
      market_sentiment: 'Bullish',
      key_drivers: ['Technology Innovation', 'Regulatory Changes', 'Consumer Behavior'],
      risk_factors: ['Economic Uncertainty', 'Supply Chain Disruptions'],
      opportunities: ['Digital Transformation', 'Sustainability Focus']
    }
  },
  {
    id: '2',
    title: 'Political Impact Assessment',
    date: '2024-11-14T14:20:00Z',
    summary: 'Evaluation of recent policy changes on business operations',
    type: 'party-impact',
    metrics: { score: 78, confidence: 88 },
    content: 'Political landscape analysis indicates moderate impact on business operations. Recent policy changes show mixed implications for different sectors.',
    rawData: {
      policy_impact: 'Moderate',
      regulatory_changes: ['Tax Reform', 'Environmental Regulations', 'Trade Policies'],
      political_stability: 'Stable',
      business_impact: 'Mixed'
    }
  },
  {
    id: '3',
    title: 'PESTLE Analysis Report',
    date: '2024-11-13T09:15:00Z',
    summary: 'Environmental scanning across political, economic, social, technological, legal, and environmental factors',
    type: 'pestle',
    metrics: { score: 91, confidence: 95 },
    content: 'Comprehensive PESTLE analysis reveals strong market positioning with favorable external factors across all dimensions.',
    rawData: {
      political: 'Stable',
      economic: 'Growing',
      social: 'Positive',
      technological: 'Advanced',
      legal: 'Supportive',
      environmental: 'Improving'
    }
  },
  {
    id: '4',
    title: 'Content Manipulation Detection',
    date: '2024-11-12T16:45:00Z',
    summary: 'Analysis of news article for potential bias and manipulation techniques',
    type: 'manipulation-score',
    metrics: { score: 73, confidence: 82 },
    content: 'Content analysis reveals moderate manipulation indicators. Several persuasive techniques identified requiring careful consideration.',
    rawData: {
      manipulation_score: 73,
      techniques_detected: ['Emotional Language', 'Selective Statistics', 'Authority Appeals'],
      credibility_assessment: 'Medium',
      recommendation: 'Proceed with caution'
    }
  },
  {
    id: '5',
    title: 'Motive Analysis Study',
    date: '2024-11-11T11:30:00Z',
    summary: 'Deep dive into underlying motivations and driving factors',
    type: 'motive',
    metrics: { score: 88, confidence: 90 },
    content: 'Motive analysis reveals strong underlying drivers with clear strategic alignment and stakeholder buy-in.',
    rawData: {
      primary_motives: ['Growth', 'Innovation', 'Market Leadership'],
      secondary_motives: ['Risk Mitigation', 'Competitive Advantage'],
      alignment_score: 88,
      stakeholder_consensus: 'Strong'
    }
  }
];

const historyController = {
  async getHistory(req, res) {
    try {
      const { page = 1, limit = 10, search = '', sortBy = 'date', sortOrder = 'desc' } = req.query;
      
      let filteredData = mockAnalysisHistory;
      
      // Apply search filter
      if (search) {
        filteredData = mockAnalysisHistory.filter(analysis =>
          analysis.title.toLowerCase().includes(search.toLowerCase()) ||
          analysis.summary.toLowerCase().includes(search.toLowerCase())
        );
      }
      
      // Apply sorting
      filteredData.sort((a, b) => {
        let aValue, bValue;
        if (sortBy === 'date') {
          aValue = new Date(a.date).getTime();
          bValue = new Date(b.date).getTime();
        } else {
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
        }
        
        if (sortOrder === 'asc') {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });
      
      // Apply pagination
      const startIndex = (page - 1) * limit;
      const paginatedData = filteredData.slice(startIndex, startIndex + parseInt(limit));
      
      res.json({
        success: true,
        analyses: paginatedData,
        total: filteredData.length,
        page: parseInt(page),
        totalPages: Math.ceil(filteredData.length / limit)
      });
    } catch (error) {
      console.error('Error in getHistory:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch analysis history'
      });
    }
  },

  async getAnalysisDetail(req, res) {
    try {
      const { id } = req.params;
      const analysis = mockAnalysisHistory.find(item => item.id === id);
      
      if (!analysis) {
        return res.status(404).json({
          success: false,
          error: 'Analysis not found'
        });
      }
      
      res.json({
        success: true,
        ...analysis
      });
    } catch (error) {
      console.error('Error in getAnalysisDetail:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch analysis details'
      });
    }
  },

  async refreshHistory(req, res) {
    try {
      // In a real implementation, this would refresh from the actual data source
      // For now, we'll just return the same data
      res.json({
        success: true,
        analyses: mockAnalysisHistory,
        total: mockAnalysisHistory.length,
        page: 1,
        totalPages: 1
      });
    } catch (error) {
      console.error('Error in refreshHistory:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to refresh history'
      });
    }
  }
};

export default historyController;
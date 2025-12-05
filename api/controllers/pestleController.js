const analyzePestle = (req, res) => {
  try {
    const { text, industry, region } = req.body;
    
    if (!text) {
      return res.status(400).json({ 
        error: 'Text is required for PESTLE analysis' 
      });
    }

    const pestle = {
      political: {
        factors: [
          {
            factor: "Regulatory changes",
            impact: "medium",
            description: "Potential impact from new regulations",
            probability: 0.6
          },
          {
            factor: "Government stability",
            impact: "low",
            description: "Stable political environment",
            probability: 0.8
          }
        ],
        overall_risk: "medium"
      },
      economic: {
        factors: [
          {
            factor: "Market growth",
            impact: "high",
            description: "Strong economic indicators",
            probability: 0.7
          },
          {
            factor: "Inflation rates",
            impact: "medium",
            description: "Moderate inflation expectations",
            probability: 0.5
          }
        ],
        overall_risk: "medium"
      },
      social: {
        factors: [
          {
            factor: "Demographic shifts",
            impact: "high",
            description: "Changing population patterns",
            probability: 0.8
          },
          {
            factor: "Cultural trends",
            impact: "medium",
            description: "Evolving social preferences",
            probability: 0.6
          }
        ],
        overall_risk: "medium"
      },
      technological: {
        factors: [
          {
            factor: "Innovation rate",
            impact: "high",
            description: "Rapid technological advancement",
            probability: 0.9
          },
          {
            factor: "Digital disruption",
            impact: "high",
            description: "Potential for industry transformation",
            probability: 0.7
          }
        ],
        overall_risk: "high"
      },
      legal: {
        factors: [
          {
            factor: "Compliance requirements",
            impact: "medium",
            description: "Regulatory compliance needs",
            probability: 0.8
          },
          {
            factor: "Intellectual property",
            impact: "medium",
            description: "IP protection considerations",
            probability: 0.6
          }
        ],
        overall_risk: "medium"
      },
      environmental: {
        factors: [
          {
            factor: "Climate change",
            impact: "high",
            description: "Environmental sustainability concerns",
            probability: 0.8
          },
          {
            factor: "Resource scarcity",
            impact: "medium",
            description: "Limited natural resources",
            probability: 0.5
          }
        ],
        overall_risk: "high"
      },
      overall_assessment: {
        total_risk_score: 6.8,
        risk_level: "medium-high",
        key_opportunities: [
          "Market expansion opportunities",
          "Technology adoption potential",
          "Sustainability initiatives"
        ],
        key_threats: [
          "Regulatory changes",
          "Technological disruption",
          "Environmental challenges"
        ],
        strategic_recommendations: [
          "Monitor regulatory developments",
          "Invest in technology innovation",
          "Develop sustainability strategy"
        ]
      },
      industry_context: industry || "general",
      region_context: region || "global",
      processed_at: new Date().toISOString()
    };

    res.json({
      success: true,
      data: pestle,
      metadata: {
        input_length: text.length,
        industry: industry || "not specified",
        region: region || "not specified",
        analysis_version: "1.0.0"
      }
    });

  } catch (error) {
    console.error('PESTLE analysis error:', error);
    res.status(500).json({ 
      error: 'Failed to analyze PESTLE factors',
      message: error.message 
    });
  }
};

export default {
  analyzePestle
};
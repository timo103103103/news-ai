import { openaiChat } from '../services/openaiClient.js'

const analyzeFull = async (req, res) => {
  try {
    const { text } = req.body
    if (!text) {
      res.status(400).json({ error: 'Text is required for full analysis' })
      return
    }

    const system = 'You are a deep multi-layer news intelligence engine. Respond ONLY with valid JSON.'
    const user = [
      'Text:',
      text,
      'Provide:',
      '- macro summary',
      '- political / emotional tone',
      '- PESTLE analysis scores (0–10 each)',
      '- manipulation score (0–1)',
      '- motive inference map (label→probability)',
      '- radicalization risk (0–1)',
      '- stock/market impact indicator (direction + score 0–1)',
      'Output JSON with keys:',
      '{"macro_summary":"...","tone":{"political":"...","emotional":"..."},"pestle":{"Political":0,"Economic":0,"Social":0,"Technological":0,"Legal":0,"Environmental":0},"manipulation_score":0,"motive_map":{"financial":0,"political":0,"ideological":0,"other":0},"radicalization_risk":0,"market_impact":{"direction":"up|down|neutral","score":0}}'
    ].join(' ')

    const ai = await openaiChat([
      { role: 'system', content: system },
      { role: 'user', content: user },
    ], { model: 'gpt-5.1' })

    const raw = ai?.choices?.[0]?.message?.content || ''
    let data
    try {
      data = JSON.parse(raw)
    } catch {
      data = {
        macro_summary: '',
        tone: { political: 'neutral', emotional: 'neutral' },
        pestle: { Political: 5, Economic: 5, Social: 5, Technological: 5, Legal: 5, Environmental: 5 },
        manipulation_score: 0.3,
        motive_map: { financial: 0.3, political: 0.3, ideological: 0.2, other: 0.2 },
        radicalization_risk: 0.2,
        market_impact: { direction: 'neutral', score: 0.5 },
      }
    }

    res.json({ success: true, data, metadata: { model: ai?.model, created: ai?.created } })
  } catch (error) {
    res.status(500).json({ error: 'Failed to perform full analysis', message: error.message })
  }
}

export default { analyzeFull }
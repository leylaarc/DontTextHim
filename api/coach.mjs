/**
 * Optional coach API for Don't Text Him.
 * Deploy to Vercel (or adapt for Cloudflare Workers) and set EXPO_PUBLIC_COACH_API_URL to the deployed URL.
 *
 * Env: OPENAI_API_KEY (required), optional OPENAI_MODEL (default gpt-4o-mini)
 */

const SYSTEM_PROMPT = `You are a warm, direct coach helping someone resist sending an impulsive message to an ex or someone they are trying to detach from.

The user pasted the EXACT draft they almost sent. Your job is to explain why they should NOT send THIS specific message — not generic breakup advice.

Requirements:
- Reference at least 2 distinct phrases or sentences from their draft, each in short quotation marks (under 15 words per quote).
- For each quoted part, explain what sending those exact words likely does (to the dynamic, their dignity, or their healing) and what they are secretly hoping the reply will be.
- Tie your reasoning to their actual wording — if your response could apply unchanged to a different draft, rewrite it.
- 2–4 short paragraphs. Warm, direct, not clinical. Never tell them to send it or to edit and send.
- End with one grounding sentence they can sit with (do not quote their draft in the last sentence).`;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    res.status(503).json({ error: 'Coach API is not configured' });
    return;
  }

  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      res.status(400).json({ error: 'Invalid JSON' });
      return;
    }
  }

  const text = typeof body?.text === 'string' ? body.text.trim() : '';
  if (!text || text.length > 4000) {
    res.status(400).json({ error: 'text is required (max 4000 characters)' });
    return;
  }

  const situationLabel =
    typeof body?.situationLabel === 'string' && body.situationLabel.trim()
      ? body.situationLabel.trim()
      : null;

  const userContent = situationLabel
    ? `Situation context: ${situationLabel}\n\nDraft they almost sent:\n${text}`
    : `Draft they almost sent:\n${text}`;

  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';

  const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      temperature: 0.7,
      max_tokens: 500,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userContent },
      ],
    }),
  });

  if (!openaiRes.ok) {
    const errText = await openaiRes.text();
    console.error('OpenAI error', openaiRes.status, errText);
    res.status(502).json({ error: 'Upstream model error' });
    return;
  }

  const data = await openaiRes.json();
  const advice = data?.choices?.[0]?.message?.content?.trim();
  if (!advice) {
    res.status(502).json({ error: 'Empty model response' });
    return;
  }

  res.status(200).json({ advice });
}

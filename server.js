import express from 'express';
import cors from 'cors';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

const app = express();
const PORT = 3001;

app.use(cors({ origin: /^http:\/\/localhost:\d+$/ }));
app.use(express.json({ limit: '2mb' }));

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function withRetry(fn, retries = 3, delayMs = 1500) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err) {
      const is503 = err.message?.includes('503') || err.message?.includes('UNAVAILABLE') || err.message?.includes('high demand');
      if (is503 && i < retries - 1) {
        await new Promise(r => setTimeout(r, delayMs * (i + 1)));
      } else {
        throw err;
      }
    }
  }
}

function toGeminiContents(history) {
  return history.map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));
}

// POST /api/interview — stream Gemini as a market player
app.post('/api/interview', async (req, res) => {
  const { player, business, dynamics, history } = req.body;

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  if (!process.env.GEMINI_API_KEY) {
    res.write(`data: ${JSON.stringify({ error: 'GEMINI_API_KEY not set in .env' })}\n\n`);
    res.end();
    return;
  }

  try {
    const stream = await ai.models.generateContentStream({
      model: 'gemini-2.5-flash',
      contents: toGeminiContents(history),
      config: { systemInstruction: buildPlayerPrompt(player, business, dynamics) },
    });

    for await (const chunk of stream) {
      if (chunk.text) res.write(`data: ${JSON.stringify({ text: chunk.text })}\n\n`);
    }
    res.write('data: [DONE]\n\n');
    res.end();
  } catch (err) {
    res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
    res.end();
  }
});

// POST /api/strategy — generate structured strategy JSON
app.post('/api/strategy', async (req, res) => {
  const { business, players, dynamics, interviewHistory } = req.body;

  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ error: 'GEMINI_API_KEY not set in .env' });
  }

  try {
    const response = await withRetry(() => ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: buildStrategyPrompt(business, players, dynamics, interviewHistory),
    }));

    const text = response.text;
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return res.status(500).json({ error: 'Failed to parse strategy JSON' });

    res.json({ strategy: JSON.parse(jsonMatch[0]) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/suggest-players — generate contextual player suggestions
app.post('/api/suggest-players', async (req, res) => {
  const { business } = req.body;

  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ error: 'GEMINI_API_KEY not set' });
  }

  try {
    const response = await withRetry(() => ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Given this business idea, suggest 5 distinct player types that would participate in this ecosystem.
Return ONLY a JSON array — no explanation, no markdown.

Business: ${business.description}
Industry: ${business.industry}
Scope: ${business.geographicScope}

JSON format (exactly):
[
  {
    "name": "short player name",
    "role": "their role in 3-5 words",
    "supply": "what they contribute (1 sentence)",
    "demand": "what they need (1 sentence)",
    "goal": "PROFIT" | "GROWTH" | "CONVENIENCE" | "ACCESS" | "OTHER",
    "dependency": number from 1-10
  }
]

Make the suggestions specific and realistic for THIS business. Avoid generic labels.`,
    }));

    const text = response.text;
    const match = text.match(/\[[\s\S]*\]/);
    if (!match) return res.status(500).json({ error: 'Parse failed' });
    res.json({ players: JSON.parse(match[0]) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

function buildPlayerPrompt(player, business, dynamics) {
  return `You are simulating a real participant in a market ecosystem. You are NOT an assistant. You ARE this specific player. Respond entirely in character — first person, realistic, slightly skeptical.

PLAYER:
Name: ${player.name}
Role: ${player.role}
You supply: ${player.supply}
You want: ${player.demand}
Your goal: ${player.goal}
Dependency on others: ${player.dependency}/10

BUSINESS CONTEXT:
${business.description}
Industry: ${business.industry}
Geographic scope: ${business.geographicScope}

MARKET CONDITIONS (1–10):
- Cross-side network effects: ${dynamics.crossSideNetworkEffects} (how much you benefit from the other side growing)
- Same-side effects: ${dynamics.sameSideEffects} (other users like you help vs compete)
- Cost of multi-homing: ${dynamics.multiHomingCost} (high = hard to use competing platforms simultaneously)
- Switching costs: ${dynamics.switchingCosts} (high = hard to leave once in)
- Necessity of intermediation: ${dynamics.intermediationNeed} (high = hard to transact without this platform)
- Standardization preference: ${dynamics.standardizationPref} (high = all users want same core function)
- Dispersion of user power: ${dynamics.userPowerDispersion} (high = no single user can force changes)
- Market maturity: ${dynamics.marketMaturity}

REASONING (apply silently — never explain theory):
- If multi-homing cost is low (<4), you're easily using competing platforms simultaneously
- If switching costs are low (<4), you'd leave at the first sign of trouble
- If intermediation need is low (<4), you'd prefer to transact directly, bypassing the platform
- If cross-side effects are weak (<4), you don't see much value from the other side growing
- If standardization preference is low, you have specialized needs a single platform may not meet
- If market is early (maturity <4), you're hesitant about cold-start risk and uncertain demand
- Price-sensitivity increases when your goal is CONVENIENCE or you have low dependency

RESPONSE RULES:
- First person only
- 3–6 sentences max
- Include at least one condition or concern
- Reference network effects, multi-homing, switching, adoption risk, or pricing — at least one
- Never explain theory. Never give strategic advice. Never fully agree with everything.`;
}

function buildStrategyPrompt(business, players, dynamics, interviewHistory) {
  const playerList = players.map(p =>
    `- ${p.name} (${p.role}): supplies "${p.supply}", wants "${p.demand}", goal: ${p.goal}, dependency: ${p.dependency}/10`
  ).join('\n');

  const interviews = Object.entries(interviewHistory)
    .map(([pid, hist]) => {
      const p = players.find(x => x.id === pid);
      if (!p || !hist.length) return '';
      return `\n[${p.name}]\n${hist.slice(-6).map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n')}`;
    })
    .filter(Boolean)
    .join('\n');

  return `Analyze this platform business and return ONLY valid JSON — no explanation, no markdown, no extra text.

JSON structure (use EXACTLY these keys):
{
  "recommendation": "STRONG_PLATFORM" | "CONDITIONAL" | "NOT_SUITABLE",
  "rationale": "2-3 sentence explanation",
  "keyInsights": ["string", "string", "string", "string"],
  "monetization": {
    "charge": { "side": "player type", "reason": "why" },
    "subsidize": { "side": "player type", "reason": "why" }
  },
  "marketStructure": {
    "type": "WINNER_TAKE_ALL" | "WINNER_TAKE_MOST" | "WINNER_TAKE_SOME" | "NO_WINNER",
    "strategicImplication": "COMPETE" | "COLLABORATE",
    "explanation": "2-3 sentences"
  },
  "coldStart": ["string", "string", "string"],
  "risks": ["string", "string", "string"]
}

BUSINESS:
${business.description}
Industry: ${business.industry} | Scope: ${business.geographicScope}

PLAYERS:
${playerList}

WTA CONDITIONS (1–10, HIGH = Winner-Take-All favorable):
- Cost of Multi-homing: ${dynamics.multiHomingCost} (high = users stick to one platform)
- Preference for Standardization: ${dynamics.standardizationPref} (high = no need for specialized alternatives)
- Necessity of Intermediation: ${dynamics.intermediationNeed} (high = users need platform post-match)
- Dispersion of User Power: ${dynamics.userPowerDispersion} (high = no user can force platform changes)

NETWORK EFFECTS (1–10):
- Cross-side network effects: ${dynamics.crossSideNetworkEffects}
- Same-side effects: ${dynamics.sameSideEffects}
- Switching costs: ${dynamics.switchingCosts}
- Market maturity: ${dynamics.marketMaturity}

INTERVIEW EXCERPTS:
${interviews || 'None conducted.'}

REASONING FRAMEWORK:
Use the 4 WTA conditions to determine market structure:
- WINNER_TAKE_ALL: all 4 conditions HIGH (≥7) → COMPETE strategy
- WINNER_TAKE_MOST: multi-homing HIGH + 2-3 other conditions HIGH → COMPETE strategy
- WINNER_TAKE_SOME: mixed conditions (some HIGH, some MEDIUM) → COLLABORATE strategy
- NO_WINNER: most conditions LOW (≤4) → COLLABORATE strategy

Platform recommendation:
- STRONG_PLATFORM: cross-side effects >6 AND multi-homing cost >6 AND intermediation need >6
- CONDITIONAL: mixed signals — some platform characteristics but not all
- NOT_SUITABLE: weak cross-side effects (<4) AND low intermediation need (<4)

Monetization:
- Charge: side with lowest price sensitivity and highest dependency on the platform
- Subsidize: side that creates value for the other side and is hardest to attract first (supply side)

Strategic implication:
- COMPETE if marketStructure is WINNER_TAKE_ALL or WINNER_TAKE_MOST
- COLLABORATE if marketStructure is WINNER_TAKE_SOME or NO_WINNER`;
}

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(join(__dirname, 'dist')));
  app.get('*', (_, res) => res.sendFile(join(__dirname, 'dist', 'index.html')));
}

app.listen(PORT, () => {
  console.log(`✅ API server → http://localhost:${PORT}`);
});

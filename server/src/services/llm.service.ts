import { generateAssistantReply, type AssistantContext } from '@earnwise/shared';
import { env } from '../env.js';

/**
 * AI Copilot — grounded in the user's real financial state.
 * Default: GroqCloud (free tier, OpenAI-compatible). No key → rule-based fallback.
 */
export async function answerAssistantQuestion(query: string, ctx: AssistantContext): Promise<string> {
  if (!env.groqApiKey) {
    return generateAssistantReply(query, ctx);
  }

  try {
    const systemPrompt = `You are EarnWise, a financial copilot for gig workers with irregular income.
Answer using ONLY the live user data provided below. Do not invent numbers. Keep answers short, warm, human and in plain English with ₹ formatting.

LIVE USER FINANCIAL DATA (real, current):
${JSON.stringify(ctx, null, 2)}

Rules:
- If the question is about spending, savings, taxes, or investments, ground the answer strictly in the numbers above.
- If the data does not contain enough to answer, say so honestly and suggest the relevant app section.
- Never give legal/tax/investment advice; remind the user these are simulated money rails for a prototype.
- Use Indian Rupee (₹) formatting with Indian digit grouping (e.g. ₹12,450).
`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12_000);

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.groqApiKey}`
      },
      body: JSON.stringify({
        model: env.groqModel,
        temperature: 0.3,
        max_tokens: 400,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: query }
        ]
      }),
      signal: controller.signal
    });
    clearTimeout(timeout);

    if (!response.ok) {
      console.error(`[llm] Groq error ${response.status}: ${await response.text()}`);
      return generateAssistantReply(query, ctx);
    }

    const data = (await response.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const text = data.choices?.[0]?.message?.content?.trim();
    return text || generateAssistantReply(query, ctx);
  } catch (err) {
    console.error('LLM request failed, falling back to rules:', err);
    return generateAssistantReply(query, ctx);
  }
}
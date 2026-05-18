import { COACH_API_URL } from '../config/coach';
import { coachUnsentTextOffline } from './textCoachOffline';
import type { CoachSource } from './unsentTextsStorage';

export type CoachResult = {
  advice: string;
  source: CoachSource;
};

type CoachRequest = {
  draft: string;
  situationLabel?: string;
};

const REQUEST_TIMEOUT_MS = 45_000;

export async function coachUnsentText(input: CoachRequest): Promise<CoachResult> {
  const draft = input.draft.trim();
  if (!draft) {
    throw new Error('Paste or type the message you almost sent.');
  }

  if (COACH_API_URL) {
    return coachViaApi({ draft, situationLabel: input.situationLabel });
  }

  return {
    advice: coachUnsentTextOffline({ draft, situationLabel: input.situationLabel }),
    source: 'offline',
  };
}

async function coachViaApi(input: CoachRequest): Promise<CoachResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const res = await fetch(COACH_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        text: input.draft,
        situationLabel: input.situationLabel ?? null,
      }),
      signal: controller.signal,
    });

    let data: { advice?: string; error?: string } = {};
    try {
      data = (await res.json()) as { advice?: string; error?: string };
    } catch {
      /* non-JSON body */
    }

    if (res.status === 503) {
      throw new Error(
        'AI coach is not set up on the server yet. In Vercel, add OPENAI_API_KEY under Environment Variables, then redeploy.',
      );
    }

    if (res.status === 502) {
      throw new Error(
        'OpenAI rejected the request. In Vercel, check OPENAI_API_KEY is correct and billing is active on platform.openai.com, then redeploy.',
      );
    }

    if (!res.ok) {
      throw new Error('Could not reach the AI coach. Check your internet connection and try again.');
    }

    const advice = typeof data.advice === 'string' ? data.advice.trim() : '';
    if (!advice) {
      throw new Error('The AI coach returned an empty response. Try again in a moment.');
    }

    return { advice, source: 'llm' };
  } catch (e) {
    if (e instanceof Error && e.name === 'AbortError') {
      throw new Error('The AI coach took too long. Check your connection and try again.');
    }
    if (e instanceof Error) throw e;
    throw new Error('Could not reach the AI coach. Check your connection and try again.');
  } finally {
    clearTimeout(timer);
  }
}

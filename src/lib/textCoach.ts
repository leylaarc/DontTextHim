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
    const llm = await coachViaApi({ draft, situationLabel: input.situationLabel });
    if (llm) return llm;
    throw new Error('Could not reach the AI coach. Check your connection and try again.');
  }

  return {
    advice: coachUnsentTextOffline({ draft, situationLabel: input.situationLabel }),
    source: 'offline',
  };
}

async function coachViaApi(input: CoachRequest): Promise<CoachResult | null> {
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

    if (!res.ok) return null;

    const data = (await res.json()) as { advice?: string };
    const advice = typeof data.advice === 'string' ? data.advice.trim() : '';
    if (!advice) return null;

    return { advice, source: 'llm' };
  } finally {
    clearTimeout(timer);
  }
}

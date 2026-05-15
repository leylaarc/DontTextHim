type OfflineCoachInput = {
  draft: string;
  situationLabel?: string;
};

type PatternHit = {
  pattern: RegExp;
  label: string;
  whyNot: string;
};

const PATTERNS: PatternHit[] = [
  {
    pattern: /\b(sorry|apologize|my fault)\b/i,
    label: 'apology',
    whyNot:
      'an apology often hopes they will soften — but if they have not shown steady care, “sorry” can put you back in the position of earning warmth instead of receiving it',
  },
  {
    pattern: /\b(miss you|miss u|thinking about you|thinking of you)\b/i,
    label: 'longing',
    whyNot:
      'saying you miss them reopens intimacy on your side while they may still be guarded on theirs — you feel the gap widen when the reply is flat or slow',
  },
  {
    pattern: /\b(why did you|why won't you|why wont you|how could you)\b/i,
    label: 'demand for explanation',
    whyNot:
      'those questions ask them to justify themselves; even a long answer rarely quiets the hurt, and silence after can feel worse than before',
  },
  {
    pattern: /\b(please|come back|give me another chance|can we try)\b/i,
    label: 'plea',
    whyNot:
      'pleading hands them leverage — you are offering closeness before you know if they will meet you with the same steadiness',
  },
  {
    pattern: /\b(you always|you never|you made me)\b/i,
    label: 'accusation',
    whyNot:
      '“always/never” language invites defensiveness, not repair — the conversation becomes about your tone instead of what you actually needed',
  },
  {
    pattern: /\b(i hate you|you're trash|youre trash|fuck you|worst)\b/i,
    label: 'heat',
    whyNot:
      'heat can feel righteous in the moment, but it gives them a reason to focus on how you spoke instead of what hurt you',
  },
  {
    pattern: /\b(are you awake|u up|wyd|what are you doing)\b/i,
    label: 'late ping',
    whyNot:
      'a casual “you up?” ping is often loneliness dressed as small talk — if they answer, you may read too much into it; if they do not, the spiral gets louder',
  },
];

function ellipsis(s: string, max: number): string {
  const t = s.trim().replace(/\s+/g, ' ');
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
}

/** Short quoted slice from the draft for callouts. */
function quoteFromDraft(draft: string, pattern?: RegExp): string {
  const normalized = draft.trim();
  if (!pattern) {
    return ellipsis(normalized, 80);
  }
  const m = normalized.match(pattern);
  if (!m || m.index === undefined) {
    return ellipsis(normalized, 80);
  }
  const start = Math.max(0, m.index - 20);
  const end = Math.min(normalized.length, m.index + m[0].length + 40);
  let slice = normalized.slice(start, end).trim();
  if (start > 0) slice = `…${slice}`;
  if (end < normalized.length) slice = `${slice}…`;
  return ellipsis(slice, 100);
}

function splitSentences(draft: string): string[] {
  return draft
    .split(/(?<=[.!?])\s+|\n+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

function opening(situationLabel: string | undefined, draftQuote: string): string {
  const about = `About this exact draft — “${draftQuote}”`;
  if (situationLabel) {
    return `${about}: you are in the “${situationLabel}” headspace, which usually means you want relief tonight more than a real back-and-forth. Sending this specific message is unlikely to give you that relief for long.`;
  }
  return `${about}: the words are already written, which makes send feel inevitable — but this message is about easing the feeling in your body right now, not about getting the reply you deserve.`;
}

function analyzeExactDraft(draft: string, hits: PatternHit[]): string[] {
  const paragraphs: string[] = [];
  const sentences = splitSentences(draft);

  if (hits.length > 0) {
    for (const hit of hits.slice(0, 2)) {
      const quote = quoteFromDraft(draft, hit.pattern);
      paragraphs.push(
        `You wrote “${quote}” — that is ${hit.label} energy. Sending it means ${hit.whyNot}.`,
      );
    }
  } else if (sentences.length >= 2) {
    paragraphs.push(
      `Your first line — “${ellipsis(sentences[0]!, 70)}” — sets the tone before they have agreed to a real conversation. Your last line — “${ellipsis(sentences[sentences.length - 1]!, 70)}” — is probably what you most want answered; if you send the whole thing, you are handing them multiple hooks and only controlling the one they choose to pull.`,
    );
  } else {
    paragraphs.push(
      `Every word in “${ellipsis(draft, 90)}” is doing work: it tells them how much space you still have for them. If they are not actively building trust with you, that work lands on you twice — once when you send, again while you wait.`,
    );
  }

  const questionCount = (draft.match(/\?/g) ?? []).length;
  if (questionCount >= 2) {
    paragraphs.push(
      `There are ${questionCount} questions in this draft. Multiple questions let them answer the easiest one and dodge what you actually need — one clear boundary or statement usually protects you more than a quiz they can fail.`,
    );
  }

  if (draft === draft.toUpperCase() && draft.length > 12) {
    paragraphs.push(
      `The all-caps tone in what you wrote will read as flooded before it reads as honest — they may reply to the volume, not the hurt underneath.`,
    );
  }

  if (draft.length > 280) {
    paragraphs.push(
      `At ${draft.length} characters, this is a lot to drop on someone in one go. Long drafts often get skimmed, argued with, or left on read — and then you are stuck re-reading your own vulnerability without a reply that matches it.`,
    );
  }

  return paragraphs;
}

function closing(draft: string): string {
  const lastBit = ellipsis(draft.split(/\n/).pop() ?? draft, 50);
  return `Let “${lastBit}” stay on this screen tonight — your feeling is valid without their validation.`;
}

export function coachUnsentTextOffline({ draft, situationLabel }: OfflineCoachInput): string {
  const trimmed = draft.trim();
  const hits = PATTERNS.filter((p) => p.pattern.test(trimmed));
  const mainQuote = quoteFromDraft(trimmed);

  return [opening(situationLabel, mainQuote), ...analyzeExactDraft(trimmed, hits), closing(trimmed)].join(
    '\n\n',
  );
}

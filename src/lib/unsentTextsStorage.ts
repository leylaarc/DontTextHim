import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@dth/unsent_texts';
const MAX_ENTRIES = 40;

export type CoachSource = 'llm' | 'offline';

export type UnsentTextEntry = {
  id: string;
  draft: string;
  coachAdvice: string | null;
  coachSource: CoachSource | null;
  createdAt: number;
  resistedAt: number | null;
};

function newId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

async function readAll(): Promise<UnsentTextEntry[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (e): e is UnsentTextEntry =>
        typeof e === 'object' &&
        e !== null &&
        typeof (e as UnsentTextEntry).id === 'string' &&
        typeof (e as UnsentTextEntry).draft === 'string',
    );
  } catch {
    return [];
  }
}

async function writeAll(entries: UnsentTextEntry[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(0, MAX_ENTRIES)));
}

export async function listUnsentTexts(): Promise<UnsentTextEntry[]> {
  const entries = await readAll();
  return entries.sort((a, b) => b.createdAt - a.createdAt);
}

export async function getUnsentText(id: string): Promise<UnsentTextEntry | null> {
  const entries = await readAll();
  return entries.find((e) => e.id === id) ?? null;
}

export async function saveUnsentText(
  draft: string,
  coach?: { advice: string; source: CoachSource },
): Promise<UnsentTextEntry> {
  const trimmed = draft.trim();
  const entry: UnsentTextEntry = {
    id: newId(),
    draft: trimmed,
    coachAdvice: coach?.advice ?? null,
    coachSource: coach?.source ?? null,
    createdAt: Date.now(),
    resistedAt: null,
  };
  const entries = await readAll();
  entries.unshift(entry);
  await writeAll(entries);
  return entry;
}

export async function updateUnsentTextCoach(
  id: string,
  coach: { advice: string; source: CoachSource },
): Promise<UnsentTextEntry | null> {
  const entries = await readAll();
  const idx = entries.findIndex((e) => e.id === id);
  if (idx < 0) return null;
  entries[idx] = {
    ...entries[idx]!,
    coachAdvice: coach.advice,
    coachSource: coach.source,
  };
  await writeAll(entries);
  return entries[idx]!;
}

export async function markUnsentTextResisted(id: string): Promise<void> {
  const entries = await readAll();
  const idx = entries.findIndex((e) => e.id === id);
  if (idx < 0) return;
  entries[idx] = { ...entries[idx]!, resistedAt: Date.now() };
  await writeAll(entries);
}

export async function deleteUnsentText(id: string): Promise<void> {
  const entries = await readAll();
  await writeAll(entries.filter((e) => e.id !== id));
}

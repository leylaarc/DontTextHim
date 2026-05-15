/** Optional HTTPS endpoint (e.g. Vercel `api/coach`) — see `api/coach.mjs` in the repo root. */
export const COACH_API_URL = (process.env.EXPO_PUBLIC_COACH_API_URL ?? '').trim();

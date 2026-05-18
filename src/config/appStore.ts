/** Home Screen / App Store display name (matches `expo.name` in app.json). */
export const APP_DISPLAY_NAME = "don't text them";

/** Shown in Settings; use the same address in App Store Connect and Play Console. */
export const SUPPORT_EMAIL = 'support@donottextthem.com';

/**
 * Public support page (App Store Connect “Support URL”). Must open in a normal browser.
 * Host via GitHub Pages (`docs/support.html`) or your own domain.
 */
export const SUPPORT_URL = 'https://leylaarc.github.io/DontTextHim/support.html';

/**
 * Public privacy policy URL (App Store Connect, etc.). Must open in a normal browser.
 *
 * Override at build time if your GitHub username/repo differs from the default:
 *   EXPO_PUBLIC_PRIVACY_POLICY_URL=https://YOURUSER.github.io/YOUR-REPO/privacy.html
 *
 * GitHub Pages checklist (otherwise this URL 404s):
 * 1. Repo exists on GitHub and `docs/privacy.html` is on the default branch (e.g. `main`).
 *    Policy text lives in `src/content/privacy-policy.json`; run `npm run privacy:html` after edits to refresh `docs/privacy.html`.
 * 2. Repo → Settings → Pages → Build: Deploy from branch → branch `main`, folder `/docs` → Save.
 * 3. For free hosting the repo is usually **public** (private + Pages may need a paid plan).
 * 4. Wait 1–5 minutes, then open the URL in an incognito window.
 */
const DEFAULT_PRIVACY_POLICY_URL = 'https://leylaarc.github.io/DontTextHim/privacy.html';

const fromEnv = process.env.EXPO_PUBLIC_PRIVACY_POLICY_URL?.trim();
export const PRIVACY_POLICY_URL = fromEnv || DEFAULT_PRIVACY_POLICY_URL;

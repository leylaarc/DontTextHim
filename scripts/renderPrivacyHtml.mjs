import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

function readSupportEmail() {
  const appStorePath = join(root, 'src/config/appStore.ts');
  const src = readFileSync(appStorePath, 'utf8');
  const m = src.match(/export const SUPPORT_EMAIL = '([^']+)'/);
  return m?.[1] ?? 'support@donttexthim.app';
}

function escHtml(s) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const supportEmail = readSupportEmail();
const data = JSON.parse(readFileSync(join(root, 'src/content/privacy-policy.json'), 'utf8'));

const subject = encodeURIComponent("Don\u0027t Text Him \u2014 privacy");
const mailHref = `mailto:${supportEmail}?subject=${subject}`;

let sectionsHtml = '';
for (const sec of data.sections) {
  sectionsHtml += `      <h2>${escHtml(sec.heading)}</h2>\n`;
  for (const raw of sec.paragraphs) {
    if (raw.includes('{{supportEmail}}')) {
      const [before, after] = raw.split('{{supportEmail}}');
      const link = `<a href="${escHtml(mailHref)}">${escHtml(supportEmail)}</a>`;
      sectionsHtml += `      <p>${escHtml(before)}${link}${escHtml(after ?? '')}</p>\n`;
    } else {
      sectionsHtml += `      <p>${escHtml(raw)}</p>\n`;
    }
  }
}

const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Privacy policy — Don&#39;t Text Him</title>
    <style>
      :root {
        --bg: #fdf7f8;
        --text: #2a1f24;
        --muted: #6b5560;
        --accent: #b84d6f;
        --max: 40rem;
      }
      * {
        box-sizing: border-box;
      }
      body {
        margin: 0;
        font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif;
        background: var(--bg);
        color: var(--text);
        line-height: 1.55;
        padding: 1.5rem 1.25rem 3rem;
      }
      main {
        max-width: var(--max);
        margin: 0 auto;
      }
      h1 {
        font-size: 1.75rem;
        font-weight: 700;
        margin: 0 0 0.25rem;
        letter-spacing: -0.02em;
      }
      .updated {
        color: var(--muted);
        font-size: 0.95rem;
        margin-bottom: 1.75rem;
      }
      h2 {
        font-size: 1.05rem;
        font-weight: 700;
        margin: 1.5rem 0 0.5rem;
      }
      p {
        color: var(--muted);
        font-size: 0.95rem;
        margin: 0 0 0.75rem;
      }
      a {
        color: var(--accent);
        text-decoration: none;
      }
      a:hover {
        text-decoration: underline;
      }
      footer {
        margin-top: 2rem;
        padding-top: 1.25rem;
        border-top: 1px solid rgba(107, 85, 96, 0.2);
        font-size: 0.9rem;
        color: var(--muted);
      }
    </style>
  </head>
  <body>
    <main>
      <h1>Privacy policy</h1>
      <p class="updated">Last updated: ${escHtml(data.lastUpdated)}</p>

${sectionsHtml}
      <footer>
        Don&#39;t Text Him &middot; Same policy as in the app.
      </footer>
    </main>
  </body>
</html>
`;

writeFileSync(join(root, 'docs/privacy.html'), html, 'utf8');
console.log('Wrote docs/privacy.html from src/content/privacy-policy.json');

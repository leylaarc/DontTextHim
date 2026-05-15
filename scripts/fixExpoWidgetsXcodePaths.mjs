/**
 * Fixes machine-specific iOS paths that break EAS / other builders.
 *
 * Run after `expo prebuild` and `pod install` (e.g. via eas-build-post-install).
 */
import { readFileSync, readdirSync, statSync, unlinkSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const iosDir = join(root, 'ios');
const pbxprojPath = join(iosDir, 'DontTextHim.xcodeproj/project.pbxproj');
const podsConfigDir = join(iosDir, 'Pods/Target Support Files');
const xcodeEnvLocalPath = join(iosDir, '.xcode.env.local');

const HERMES_CLI_PATH_PORTABLE =
  '$(PODS_ROOT)/../../node_modules/hermes-compiler/hermesc/osx-bin/hermesc';

function walkXcconfigs(dir) {
  const files = [];
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return files;
  }
  for (const name of entries) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) {
      files.push(...walkXcconfigs(path));
    } else if (name.endsWith('.xcconfig')) {
      files.push(path);
    }
  }
  return files;
}

function fixWidgetPaths() {
  let src;
  try {
    src = readFileSync(pbxprojPath, 'utf8');
  } catch {
    console.warn('fixIosEasPaths: no project.pbxproj — skip widget paths');
    return;
  }

  let next = src;
  next = next.replace(
    /path = [^;]*\/ExpoWidgetsTarget\/([^;/]+);/g,
    'path = $1;',
  );
  next = next.replace(/path = ExpoWidgetsTarget\/([^;/]+);/g, 'path = $1;');

  if (next !== src) {
    writeFileSync(pbxprojPath, next, 'utf8');
    console.log('fixIosEasPaths: fixed ExpoWidgetsTarget paths in project.pbxproj');
  }
}

function fixHermesCliPath() {
  const configs = walkXcconfigs(podsConfigDir);
  if (configs.length === 0) {
    console.warn('fixIosEasPaths: no Pods xcconfig files — skip HERMES_CLI_PATH');
    return;
  }

  const pattern = /^HERMES_CLI_PATH = .+$/m;
  let updated = 0;
  for (const file of configs) {
    const src = readFileSync(file, 'utf8');
    if (!pattern.test(src)) continue;
    const next = src.replace(
      pattern,
      `HERMES_CLI_PATH = ${HERMES_CLI_PATH_PORTABLE}`,
    );
    if (next !== src) {
      writeFileSync(file, next, 'utf8');
      updated += 1;
    }
  }

  if (updated > 0) {
    console.log(`fixIosEasPaths: fixed HERMES_CLI_PATH in ${updated} xcconfig file(s)`);
  }
}

function fixXcodeEnvLocal() {
  try {
    const src = readFileSync(xcodeEnvLocalPath, 'utf8');
    if (!src.includes('NODE_BINARY=')) return;
    // Prebuild can write a machine-specific node path; portable builds use .xcode.env instead.
    unlinkSync(xcodeEnvLocalPath);
    console.log('fixIosEasPaths: removed ios/.xcode.env.local (machine-specific NODE_BINARY)');
  } catch {
    // missing is fine
  }
}

fixWidgetPaths();
fixHermesCliPath();
fixXcodeEnvLocal();

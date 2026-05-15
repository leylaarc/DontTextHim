/**
 * expo-widgets prebuild stores absolute paths for widget files in project.pbxproj.
 * EAS (and other machines) cannot resolve those paths. Rewrite them as project-relative.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const pbxprojPath = join(root, 'ios/DontTextHim.xcodeproj/project.pbxproj');

let src;
try {
  src = readFileSync(pbxprojPath, 'utf8');
} catch {
  console.warn('fixExpoWidgetsXcodePaths: no ios/DontTextHim.xcodeproj/project.pbxproj — skip');
  process.exit(0);
}

const next = src.replace(
  /path = [^;]*\/(ExpoWidgetsTarget\/[^;]+);/g,
  'path = $1;',
);

if (next === src) {
  console.log('fixExpoWidgetsXcodePaths: no absolute ExpoWidgetsTarget paths to fix');
} else {
  writeFileSync(pbxprojPath, next, 'utf8');
  console.log('fixExpoWidgetsXcodePaths: updated', pbxprojPath);
}

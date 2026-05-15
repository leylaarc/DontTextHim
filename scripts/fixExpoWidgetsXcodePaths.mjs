/**
 * expo-widgets prebuild stores absolute paths for widget files in project.pbxproj.
 * EAS (and other machines) cannot resolve those paths.
 *
 * Widget sources live in the PBXGroup with `path = ExpoWidgetsTarget`, so file refs
 * must use filenames only (e.g. `index.swift`). Using `ExpoWidgetsTarget/index.swift`
 * makes Xcode look under ios/ExpoWidgetsTarget/ExpoWidgetsTarget/ and the build fails.
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

let next = src;

// Machine-specific absolute paths from prebuild → filename inside ExpoWidgetsTarget group.
next = next.replace(
  /path = [^;]*\/ExpoWidgetsTarget\/([^;/]+);/g,
  'path = $1;',
);

// Undo older fix that prefixed ExpoWidgetsTarget/ (doubled directory on EAS).
next = next.replace(
  /path = ExpoWidgetsTarget\/([^;/]+);/g,
  'path = $1;',
);

if (next === src) {
  console.log('fixExpoWidgetsXcodePaths: no ExpoWidgetsTarget file paths to fix');
} else {
  writeFileSync(pbxprojPath, next, 'utf8');
  console.log('fixExpoWidgetsXcodePaths: updated', pbxprojPath);
}

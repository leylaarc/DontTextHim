import { requireNativeModule } from 'expo';
import { NativeModules, Platform } from 'react-native';

/**
 * Home Screen widgets need a dev/production build — not Expo Go.
 * Under the New Architecture, Turbo Modules often omit `NativeModules.ExpoWidgets` even when the native module exists,
 * so we probe with the same `requireNativeModule('ExpoWidgets')` path expo-widgets uses.
 */
export function isExpoWidgetsAvailable(): boolean {
  if (Platform.OS !== 'ios') return false;
  try {
    requireNativeModule('ExpoWidgets');
    return true;
  } catch {
    return !!(NativeModules as { ExpoWidgets?: unknown }).ExpoWidgets;
  }
}

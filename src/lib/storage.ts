import AsyncStorage from '@react-native-async-storage/async-storage';
import { clearAllQuoteDecks } from './quoteDeck';

const UNSENT_TEXTS_KEY = '@dth/unsent_texts';

const ONBOARDING_KEY = '@dth/onboarding_done';
const CATEGORY_KEY = '@dth/selected_category';

export async function getSelectedCategoryId(): Promise<string | null> {
  return AsyncStorage.getItem(CATEGORY_KEY);
}

export async function setSelectedCategoryId(id: string): Promise<void> {
  await AsyncStorage.setItem(CATEGORY_KEY, id);
}

export async function clearSelectedCategory(): Promise<void> {
  await AsyncStorage.removeItem(CATEGORY_KEY);
}

export async function isOnboardingComplete(): Promise<boolean> {
  const v = await AsyncStorage.getItem(ONBOARDING_KEY);
  return v === '1';
}

export async function setOnboardingComplete(): Promise<void> {
  await AsyncStorage.setItem(ONBOARDING_KEY, '1');
}

export async function resetOnboarding(): Promise<void> {
  await AsyncStorage.removeItem(ONBOARDING_KEY);
  await AsyncStorage.removeItem(CATEGORY_KEY);
  await AsyncStorage.removeItem(UNSENT_TEXTS_KEY);
  await clearAllQuoteDecks();
}

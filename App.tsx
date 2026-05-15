import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { registerWidgetInteractionPersistence } from './src/lib/registerWidgetInteractionPersistence';
import { clearSelectedCategory, isOnboardingComplete, setOnboardingComplete } from './src/lib/storage';
import { OnboardingScreen } from './src/screens/OnboardingScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { PrivacyPolicyScreen } from './src/screens/PrivacyPolicyScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { UnsentTextScreen } from './src/screens/UnsentTextScreen';
import { colors } from './src/theme';

type MainScreen = 'home' | 'settings' | 'privacy' | 'unsent';

function AppContent() {
  const [categoryKey, setCategoryKey] = useState(0);
  const [ready, setReady] = useState(false);
  const [onboarded, setOnboarded] = useState(false);
  const [main, setMain] = useState<MainScreen>('home');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const done = await isOnboardingComplete();
      if (!cancelled) {
        setOnboarded(done);
        setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const finishOnboarding = useCallback(async () => {
    await setOnboardingComplete();
    setOnboarded(true);
  }, []);

  if (!ready) {
    return (
      <View style={styles.boot}>
        <ActivityIndicator size="large" color={colors.accent} />
        <StatusBar style="dark" />
      </View>
    );
  }

  if (!onboarded) {
    return (
      <>
        <OnboardingScreen onDone={finishOnboarding} />
        <StatusBar style="dark" />
      </>
    );
  }

  if (main === 'settings') {
    return (
      <>
        <SettingsScreen
          onBack={() => setMain('home')}
          onOpenPrivacy={() => setMain('privacy')}
          onChangeSituation={async () => {
            await clearSelectedCategory();
            setCategoryKey((k) => k + 1);
            setMain('home');
          }}
        />
        <StatusBar style="dark" />
      </>
    );
  }

  if (main === 'privacy') {
    return (
      <>
        <PrivacyPolicyScreen onBack={() => setMain('settings')} />
        <StatusBar style="dark" />
      </>
    );
  }

  if (main === 'unsent') {
    return (
      <>
        <UnsentTextScreen onBack={() => setMain('home')} />
        <StatusBar style="dark" />
      </>
    );
  }

  return (
    <>
      <HomeScreen
        categoryKey={categoryKey}
        onOpenSettings={() => setMain('settings')}
        onOpenUnsentText={() => setMain('unsent')}
      />
      <StatusBar style="dark" />
    </>
  );
}

export default function App() {
  useEffect(() => {
    return registerWidgetInteractionPersistence();
  }, []);

  return (
    <SafeAreaProvider>
      <AppContent />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  boot: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

import '../global.css';
import { useColorScheme } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { Slot, useRouter, useSegments, DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import { Session } from '@supabase/supabase-js';
import { useSystemStore } from '../store/useSystemStore';
import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { SystemIntro } from '../components/SystemIntro';
import { registerForPushNotificationsAsync, scheduleMidnightWarningNotification, cancelMidnightWarningNotification } from '../services/notifications';

import { useFonts, Rajdhani_300Light, Rajdhani_400Regular, Rajdhani_500Medium, Rajdhani_600SemiBold, Rajdhani_700Bold } from '@expo-google-fonts/rajdhani';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Rajdhani_300Light, Rajdhani_400Regular, Rajdhani_500Medium, Rajdhani_600SemiBold, Rajdhani_700Bold
  });
  
  useEffect(() => {
    if (fontsLoaded || fontError) {
      // Ocultar splash screen ou tomar ação se necessário
    }
  }, [fontsLoaded, fontError]);
  const colorScheme = useColorScheme();
  const [session, setSession] = useState<Session | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  
  const loadFromCloud = useSystemStore(s => s.loadFromCloud);
  const fetchStaticData = useSystemStore(s => s.fetchStaticData);
  const hasCompletedOnboarding = useSystemStore(s => s.hasCompletedOnboarding);
  const isCompleted = useSystemStore(s => s.quest.isCompleted);
  const notificationsEnabled = useSystemStore(s => s.config.notificationsEnabled);
  
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    registerForPushNotificationsAsync();
    
    fetchStaticData();
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setInitialized(true);
      if (session) loadFromCloud();
    });
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) loadFromCloud();
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (initialized && hasCompletedOnboarding) {
      if (isCompleted || !notificationsEnabled) {
        cancelMidnightWarningNotification();
      } else {
        scheduleMidnightWarningNotification();
      }
    }
  }, [isCompleted, initialized, hasCompletedOnboarding, notificationsEnabled]);

  useEffect(() => {
    if (!initialized || !fontsLoaded) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!session) {
      if (!inAuthGroup) router.replace('/(auth)/login');
    } else if (!hasCompletedOnboarding) {
      const isOnboarding = segments[0] === '(auth)' && segments[1] === 'onboarding';
      if (!isOnboarding) router.replace('/(auth)/onboarding');
    } else {
      if (inAuthGroup) {
        router.replace('/(app)'); 
      }
    }
  }, [session, initialized, hasCompletedOnboarding, segments]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <ThemeProvider value={{ ...DarkTheme, colors: { ...DarkTheme.colors, background: '#00000f' } }}>
      {showIntro ? (
        <SystemIntro onFinish={() => setShowIntro(false)} />
      ) : (
        <>
          <AnimatedSplashOverlay />
          <Slot />
        </>
      )}
    </ThemeProvider>
  );
}

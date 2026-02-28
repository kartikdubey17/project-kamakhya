import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import { AuthScreen } from './screens/AuthScreen';
import { MainCanvas } from './screens/MainCanvas';
import { OnboardingFlow } from './screens/OnboardingFlow';
import { getUserProfile } from './lib/memory';

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [hasProfile, setHasProfile] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Handle Auth State
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) checkProfile();
      else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) checkProfile();
      else {
        setHasProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // 2. Check if user is "New" or "Returning"
  async function checkProfile() {
    const profile = await getUserProfile();
    setHasProfile(!!profile); // true if profile exists, false if new user
    setLoading(false);
  }

  if (loading) return <div className="min-h-screen bg-purple-950 flex items-center justify-center text-white">🌙 Loading Kamakhya...</div>;

  // 3. Routing Logic
  if (!session) {
    return <AuthScreen onLoginSuccess={() => {}} />;
  }

  if (hasProfile === false) {
    return <OnboardingFlow onComplete={() => setHasProfile(true)} />;
  }

  return <MainCanvas />;
}
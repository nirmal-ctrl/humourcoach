import type { Session, User } from '@supabase/supabase-js';
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { isSupabaseConfigured, supabase } from '@/lib/supabase';

type AuthResult = { error: string | null; needsEmailConfirmation?: boolean };
type AuthStateValue = {
  configured: boolean;
  loading: boolean;
  session: Session | null;
  user: User | null;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signUp: (email: string, password: string, displayName: string) => Promise<AuthResult>;
  signOut: () => Promise<AuthResult>;
};

const AuthStateContext = createContext<AuthStateValue | null>(null);

export function AuthStateProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(isSupabaseConfigured);

  useEffect(() => {
    if (!supabase) return;
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (active) {
        setSession(data.session);
        setLoading(false);
      }
    });
    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setLoading(false);
    });
    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthStateValue>(() => ({
    configured: isSupabaseConfigured,
    loading,
    session,
    user: session?.user ?? null,
    signIn: async (email, password) => {
      if (!supabase) return { error: 'Supabase is not configured yet.' };
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      return { error: error?.message ?? null };
    },
    signUp: async (email, password, displayName) => {
      if (!supabase) return { error: 'Supabase is not configured yet.' };
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(), password, options: { data: { display_name: displayName.trim() } },
      });
      return { error: error?.message ?? null, needsEmailConfirmation: !error && !data.session };
    },
    signOut: async () => {
      if (!supabase) return { error: 'Supabase is not configured yet.' };
      const { error } = await supabase.auth.signOut();
      return { error: error?.message ?? null };
    },
  }), [loading, session]);

  return <AuthStateContext.Provider value={value}>{children}</AuthStateContext.Provider>;
}

export function useAuthState() {
  const value = useContext(AuthStateContext);
  if (!value) throw new Error('useAuthState must be used inside AuthStateProvider');
  return value;
}

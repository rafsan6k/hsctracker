'use client';

import { useEffect, useState } from 'react';
import { getSupabase } from '@/lib/supabase';
import type { Session, User } from '@supabase/supabase-js';

export default function Page() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase?.auth) {
      setLoading(false);
      return;
    }

    const getSession = async () => {
      const result = await supabase.auth.getSession();
      const session: Session | null = result.data.session;
      setUser(session?.user ?? null);
      setLoading(false);
    };

    getSession();

    const { data } = supabase.auth.onAuthStateChange((_event: any, session: Session | null) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      data?.subscription?.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div style={{ padding: 20 }}>
        Loading...
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ padding: 20 }}>
        Not logged in
      </div>
    );
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Welcome</h1>
      <p>{user.email}</p>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Session, User } from '@supabase/supabase-js';

export default function Page() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      const result = await supabase.auth.getSession();

      const session: Session | null = result.data.session;

<<<<<<< HEAD
      setUser(session?.user ?? null);
      setLoading(false);
    };
=======
  const save = async () => {
    if (!fName.trim()) return;
    if (editId) {
      await updateSubject(editId, { name: fName.trim(), color: fColor, icon: fIcon, examDate: fDate || null });
      setEditId(null);
    } else {
      const s = await addSubject(fName.trim(), fColor, fIcon, fDate || null);
      if (s) setExpanded(s.id);
    }
    reset(); setShowModal(false);
  };
>>>>>>> 6dd33cb (Updated multiple components and config)

    getSession();

<<<<<<< HEAD
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      data.subscription.unsubscribe();
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
=======
  const addCh = async (sid: string) => {
    if (!newChName.trim()) return;
    await addChapter(sid, newChName.trim());
    setNewChName('');
  };
>>>>>>> 6dd33cb (Updated multiple components and config)

  return (
    <div style={{ padding: 20 }}>
      <h1>Welcome</h1>
      <p>{user.email}</p>
    </div>
  );
}

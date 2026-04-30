import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    // Return a dummy client or throw a more descriptive error that won't crash the build if not used
    // However, createBrowserClient REQUIRES these. 
    // During build, we can return null if we handle it in getSupabase.
    return null;
  }

  return createBrowserClient(url, key);
}

// Singleton for client components
let client: ReturnType<typeof createBrowserClient> | null = null;

export function getSupabase() {
  if (!client) {
    const created = createClient();
    if (created) {
      client = created;
    } else {
      // During build time on Vercel, keys might be missing if not configured yet.
      // We return a proxy or null to avoid crashing the build.
      // The app will still need these keys to function at runtime.
      return {} as any; 
    }
  }
  return client;
}

import { createBrowserClient } from '@supabase/ssr'
import { isOfflineMode } from '@/lib/offline'

export function createClient() {
  if (isOfflineMode()) {
    return new Proxy(
      {},
      {
        get() {
          throw new Error(
            'Supabase is disabled (offline mode). Remove NEXT_PUBLIC_OFFLINE/NO_NETWORK to enable it.',
          )
        },
      },
    ) as any
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    return new Proxy(
      {},
      {
        get() {
          throw new Error(
            'Supabase env vars missing. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY (or enable offline mode).',
          )
        },
      },
    ) as any
  }

  return createBrowserClient(
    url,
    anonKey,
  )
}

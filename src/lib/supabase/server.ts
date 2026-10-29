import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { isOfflineMode } from '@/lib/offline'

/**
 * Especially important if using Fluid compute: Don't put this client in a
 * global variable. Always create a new client within each function when using
 * it.
 */
export async function createClient() {
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

  const cookieStore = await cookies()

  return createServerClient(
    url,
    anonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet: any[]) {
          try {
            cookiesToSet.forEach((c: any) => cookieStore.set(c.name, c.value, c.options))
          } catch {
            // The "setAll" method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    },
  )
}

import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const PUBLIC_PATH_PREFIXES = [
  '/login',
  '/l/',
  '/api',
  '/onboarding',
  '/privacidad',
  '/auth',
  '/recuperar',
  '/actualizar-contrasena',
]
const BILLING_PATH_PREFIX = '/ajustes'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isPublicPath = PUBLIC_PATH_PREFIXES.some((prefix) =>
    request.nextUrl.pathname.startsWith(prefix)
  )

  if (!user && !isPublicPath) {
    const url = request.nextUrl.clone()
    url.pathname = '/onboarding'
    return NextResponse.redirect(url)
  }

  const isBillingPath = request.nextUrl.pathname.startsWith(BILLING_PATH_PREFIX)

  if (user && !isPublicPath && !isBillingPath) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_status, trial_ends_at')
      .eq('id', user.id)
      .single()

    const isActive = profile?.subscription_status === 'active'
    const isTrialing =
      profile?.subscription_status === 'trialing' &&
      !!profile.trial_ends_at &&
      new Date(profile.trial_ends_at) > new Date()

    if (!isActive && !isTrialing) {
      const url = request.nextUrl.clone()
      url.pathname = '/ajustes/facturacion'
      url.searchParams.set('trial_expired', '1')
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}

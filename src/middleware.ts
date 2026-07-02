import { NextResponse, type NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Prefetch zahtev ne obravnavamo (sicer bi nonce iz predpomnjenega prefetcha vodil v neujemanje).
  if (request.headers.get('next-router-prefetch') || request.headers.get('purpose') === 'prefetch') {
    return NextResponse.next()
  }

  const nonce = btoa(crypto.randomUUID())
  const jeAdmin = request.nextUrl.pathname.startsWith('/admin')

  const skupno = [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    "style-src 'self' 'unsafe-inline'",
    "connect-src 'self' https://*.umami.is https://plausible.io",
    "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com https://player.vimeo.com",
    "worker-src 'self' blob:",
    "manifest-src 'self'",
    "frame-ancestors 'self'",
    "form-action 'self'",
  ]
  const scriptSrc = jeAdmin
    ? "script-src 'self' 'unsafe-inline' https://*.umami.is https://plausible.io"
    : `script-src 'self' 'nonce-${nonce}' https://*.umami.is https://plausible.io`
  const csp = [...skupno, scriptSrc].join('; ')

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-nonce', nonce)
  requestHeaders.set('content-security-policy', csp)

  const response = NextResponse.next({ request: { headers: requestHeaders } })
  response.headers.set('content-security-policy', csp)
  return response
}

export const config = {
  matcher: '/((?!api|_next/static|_next/image|favicon.ico).*)',
}

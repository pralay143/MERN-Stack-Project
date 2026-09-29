/**
 * Where to go after logging in, from the ?next= parameter. Only paths on this
 * site are allowed, so a crafted link can't send people to another website.
 */
export function safeNextPath(next: string | null | undefined, fallback = '/'): string {
  if (!next || !next.startsWith('/') || next.startsWith('//') || next.startsWith('/\\')) return fallback
  return next
}

/** /login?next=<current path>, to come back here after logging in. */
export function loginPathFor(path: string): string {
  return `/login?next=${encodeURIComponent(path)}`
}

const BASE = 'https://internal.invalid'

/**
 * Returns `value` only if it is a path on THIS site, otherwise null.
 *
 * Every redirect target that arrives in a URL (`redirectTo`) passes through
 * here. A plain "starts with / and not //" check lets `/\evil.example` through:
 * browsers read a backslash as a slash, so after a successful sign-in the user
 * would be sent to another site. Rather than list the tricks, resolve the value
 * the way a browser would and accept it only if it is still on our origin.
 *
 * Same helper the clw-wizards admin uses.
 */
export function safeInternalPath(value: string | null | undefined): string | null {
  if (!value || !value.startsWith('/') || value.startsWith('//') || value.includes('\\')) return null
  try {
    const url = new URL(value, BASE)
    return url.origin === BASE ? `${url.pathname}${url.search}${url.hash}` : null
  } catch {
    return null
  }
}

import { createHash, timingSafeEqual } from 'node:crypto'

/**
 * The admin sign-up code lives ONLY in the ADMIN_SIGNUP_CODE environment
 * variable, the same bootstrap secret clw-wizards uses. Unset (or shorter than
 * MIN_LENGTH) means sign-up is CLOSED, so removing the variable and redeploying
 * is how you shut the door once the accounts you need exist. Nothing in the
 * source can open it.
 */
const MIN_LENGTH = 16

export function configuredSignupCode(): string | null {
  const code = process.env.ADMIN_SIGNUP_CODE
  return code && code.length >= MIN_LENGTH ? code : null
}

export function isAdminSignupOpen(): boolean {
  return configuredSignupCode() !== null
}

/** Constant-time comparison. Hashing first equalizes the lengths. */
export function signupCodeMatches(candidate: string): boolean {
  const code = configuredSignupCode()
  if (!code) return false
  const a = createHash('sha256').update(candidate).digest()
  const b = createHash('sha256').update(code).digest()
  return timingSafeEqual(a, b)
}

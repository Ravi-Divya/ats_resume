// Lightweight client-side auth backed by localStorage.
// No server or network required — accounts are stored per-browser.

export interface AuthUser {
  email: string
  fullName: string
}

interface StoredUser extends AuthUser {
  passwordHash: string
  createdAt: string
}

const USERS_KEY = 'ats_users'
const SESSION_KEY = 'ats_session'

async function hashPassword(password: string): Promise<string> {
  const data = new TextEncoder().encode(password)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

function readUsers(): Record<string, StoredUser> {
  if (typeof window === 'undefined') return {}
  try {
    return JSON.parse(window.localStorage.getItem(USERS_KEY) || '{}')
  } catch {
    return {}
  }
}

function writeUsers(users: Record<string, StoredUser>) {
  window.localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

export async function signUp(
  email: string,
  password: string,
  fullName: string,
): Promise<{ user: AuthUser | null; error: string | null }> {
  const normalized = email.trim().toLowerCase()
  if (!normalized || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
    return { user: null, error: 'Please enter a valid email address' }
  }
  if (password.length < 6) {
    return { user: null, error: 'Password must be at least 6 characters' }
  }

  const users = readUsers()
  if (users[normalized]) {
    return { user: null, error: 'An account with this email already exists. Please sign in.' }
  }

  const user: StoredUser = {
    email: normalized,
    fullName: fullName.trim(),
    passwordHash: await hashPassword(password),
    createdAt: new Date().toISOString(),
  }
  users[normalized] = user
  writeUsers(users)

  const session: AuthUser = { email: user.email, fullName: user.fullName }
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  return { user: session, error: null }
}

export async function signIn(
  email: string,
  password: string,
): Promise<{ user: AuthUser | null; error: string | null }> {
  const normalized = email.trim().toLowerCase()
  const user = readUsers()[normalized]
  if (!user) {
    return { user: null, error: 'No account found with this email. Please sign up first.' }
  }

  const hash = await hashPassword(password)
  if (hash !== user.passwordHash) {
    return { user: null, error: 'Incorrect email or password' }
  }

  const session: AuthUser = { email: user.email, fullName: user.fullName }
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  return { user: session, error: null }
}

export function signOut() {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(SESSION_KEY)
  }
}

export function getUser(): AuthUser | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(SESSION_KEY)
    if (!raw) return null
    const session = JSON.parse(raw) as AuthUser
    return session && session.email ? session : null
  } catch {
    return null
  }
}

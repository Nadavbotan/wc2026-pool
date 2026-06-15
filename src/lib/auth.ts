const SITE_PASSWORD = 'wc2026'
const KEY_AUTHED = 'wc_authed'
const KEY_USER = 'wc_user'

export function isSiteAuthed(): boolean {
  return sessionStorage.getItem(KEY_AUTHED) === '1'
}

export function siteLogin(password: string): boolean {
  if (password === SITE_PASSWORD) {
    sessionStorage.setItem(KEY_AUTHED, '1')
    return true
  }
  return false
}

export function getCurrentUser(): string | null {
  return localStorage.getItem(KEY_USER)
}

export function setCurrentUser(id: string) {
  localStorage.setItem(KEY_USER, id)
}

export function logout() {
  sessionStorage.removeItem(KEY_AUTHED)
  localStorage.removeItem(KEY_USER)
}

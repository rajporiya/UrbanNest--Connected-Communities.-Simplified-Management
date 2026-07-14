function isBrowser() {
  return typeof window !== "undefined" && Boolean(window.localStorage)
}

export const storageService = {
  get<T>(key: string, fallback: T): T {
    if (!isBrowser()) return fallback
    try {
      const value = window.localStorage.getItem(key)
      return value === null ? fallback : (JSON.parse(value) as T)
    } catch {
      return fallback
    }
  },
  set<T>(key: string, value: T) {
    if (!isBrowser()) return false
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
      return true
    } catch {
      return false
    }
  },
  remove(key: string) {
    if (!isBrowser()) return false
    try {
      window.localStorage.removeItem(key)
      return true
    } catch {
      return false
    }
  },
}

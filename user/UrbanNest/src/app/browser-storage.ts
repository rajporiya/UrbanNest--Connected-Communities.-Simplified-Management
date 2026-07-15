/**
 * Promise-based adapter required by redux-persist.
 *
 * Keeping this adapter local avoids CommonJS default-export interop issues with
 * `redux-persist/lib/storage` in the Vite development bundle.
 */
export const browserStorage = {
  getItem(key: string) {
    return Promise.resolve(window.localStorage.getItem(key))
  },
  setItem(key: string, value: string) {
    window.localStorage.setItem(key, value)
    return Promise.resolve()
  },
  removeItem(key: string) {
    window.localStorage.removeItem(key)
    return Promise.resolve()
  },
}

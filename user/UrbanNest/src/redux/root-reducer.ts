export type RootState = Record<string, never>

export const initialRootState: RootState = {}

export function rootReducer(state: RootState = initialRootState) {
  return state
}
export type ThemePreference = "light" | "dark" | "system"
export type Nullable<T> = T | null
export type SelectOption<T extends string = string> = { label: string; value: T }

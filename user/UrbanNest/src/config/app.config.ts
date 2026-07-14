const env = import.meta.env

export const appConfig = {
  name: env.VITE_APP_NAME || "UrbanNest",
  tagline: "Connected Communities. Simplified Management.",
  description: "A secure, modern workspace for residents, committees, and society operations.",
  environment: env.VITE_APP_ENV || "development",
  apiBaseUrl: env.VITE_API_BASE_URL || "http://localhost:5000/api",
} as const

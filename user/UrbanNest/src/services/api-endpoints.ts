export const API_ENDPOINTS = {
  auth: { login: "/auth/login", refresh: "/auth/refresh-token", logout: "/auth/logout" },
  profile: "/users/profile",
  residents: "/residents",
  towers: "/towers",
  flats: "/flats",
} as const

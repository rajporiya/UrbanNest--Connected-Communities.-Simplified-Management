export const API_ENDPOINTS = {
  auth: { register: "/auth/register", login: "/auth/login", refresh: "/auth/refresh-token", logout: "/auth/logout" },
  profile: "/users/profile",
  residents: "/residents",
  towers: "/towers",
  flats: "/flats",
} as const

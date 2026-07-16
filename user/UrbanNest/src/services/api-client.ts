import axios, { type AxiosError, type AxiosRequestConfig } from "axios"
import { toast } from "sonner"
import { appConfig } from "@/config/app.config"
import type { ApiErrorResponse, ApiResponse } from "@/types/api.types"

const recentlyShown = new Map<string, number>()

function showErrorOnce(message: string) {
  const now = Date.now()
  if (now - (recentlyShown.get(message) || 0) < 1500) return
  recentlyShown.set(message, now)
  toast.error(message)
}

function errorMessage(error: AxiosError<ApiErrorResponse>) {
  const status = error.response?.status
  const serverMessage = error.response?.data?.message
  if (serverMessage) return serverMessage
  if (status === 401) return "Your session has expired. Please sign in again."
  if (status === 403) return "You do not have permission to perform this action."
  if (status === 404) return "The requested resource could not be found."
  if (status === 422) return "Some information is invalid. Please review and try again."
  if (status && status >= 500) return "The server encountered a problem. Please try again shortly."
  return error.message || "Something went wrong. Please try again."
}

export const apiClient = axios.create({
  baseURL: appConfig.apiBaseUrl,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
})

apiClient.interceptors.request.use(async (config) => {
  // Loading the store only when a request is made avoids a module cycle:
  // store -> auth reducer -> auth service -> api client -> store.
  const { store } = await import("@/app/store")
  const accessToken = store.getState().auth.accessToken
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorResponse>) => {
    const status = error.response?.status
    if (status === 401) {
      try {
        const { store } = await import("@/app/store")
        const { clearSession } = await import("@/features/auth/store/auth.slice")
        const authState = store.getState().auth
        if (authState.isAuthenticated || authState.user) {
          store.dispatch(clearSession())
        }
      } catch (e) {
        // ignore dynamic import errors
      }
    }
    showErrorOnce(errorMessage(error))
    return Promise.reject(error)
  }
)

export const api = {
  async get<T>(url: string, config?: AxiosRequestConfig) {
    return (await apiClient.get<ApiResponse<T>>(url, config)).data
  },
  async post<T, B = unknown>(url: string, body?: B, config?: AxiosRequestConfig<B>) {
    return (await apiClient.post<ApiResponse<T>>(url, body, config)).data
  },
  async put<T, B = unknown>(url: string, body?: B, config?: AxiosRequestConfig<B>) {
    return (await apiClient.put<ApiResponse<T>>(url, body, config)).data
  },
  async patch<T, B = unknown>(url: string, body?: B, config?: AxiosRequestConfig<B>) {
    return (await apiClient.patch<ApiResponse<T>>(url, body, config)).data
  },
  async delete<T>(url: string, config?: AxiosRequestConfig) {
    return (await apiClient.delete<ApiResponse<T>>(url, config)).data
  },
}

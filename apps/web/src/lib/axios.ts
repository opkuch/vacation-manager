import axios, { type AxiosInstance } from 'axios'

declare module 'axios' {
  export interface AxiosRequestConfig {
    /** When true, a 401 will not trigger the global logout redirect. */
    skipAuthRedirect?: boolean
  }
}

// Same-origin `/api` by default (proxied to the API in dev and docker); an
// explicit VITE_API_URL overrides it for direct cross-origin setups.
export const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
})

let onUnauthorized: (() => void) | null = null
export function setUnauthorizedHandler(handler: () => void): void {
  onUnauthorized = handler
}

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      axios.isAxiosError(error) &&
      error.response?.status === 401 &&
      !error.config?.skipAuthRedirect
    ) {
      onUnauthorized?.()
    }
    return Promise.reject(error)
  },
)

import axios, { AxiosError } from 'axios'
import { sessionStore } from '../auth/session-storage'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 20_000,
})

api.interceptors.request.use((config) => {
  const session = sessionStore.read()
  if (session) {
    config.headers.Authorization = `Bearer ${session.token}`
  }
  return config
})

type UnauthorizedHandler = () => void
let onUnauthorized: UnauthorizedHandler | null = null

/** The auth provider registers itself here so a 401 anywhere ends the session. */
export function setUnauthorizedHandler(handler: UnauthorizedHandler | null) {
  onUnauthorized = handler
}

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    const apiError = ApiError.from(error)
    const isLoginCall = error instanceof AxiosError && error.config?.url?.includes('/auth/login')
    if (apiError.status === 401 && !isLoginCall) {
      onUnauthorized?.()
    }
    return Promise.reject(apiError)
  },
)

/** Mirrors the backend's `{ statusCode, message, error }` error body. */
export class ApiError extends Error {
  readonly status: number
  readonly messages: string[]

  constructor(status: number, messages: string[]) {
    super(messages[0] ?? 'Something went wrong')
    this.name = 'ApiError'
    this.status = status
    this.messages = messages
  }

  static from(error: unknown): ApiError {
    if (error instanceof ApiError) return error
    if (error instanceof AxiosError) {
      if (!error.response) {
        return new ApiError(0, ['Cannot reach the server. Check your connection and try again.'])
      }
      const body = error.response.data as { message?: string | string[] } | undefined
      const message = body?.message
      const messages = Array.isArray(message) ? message : message ? [message] : [error.message]
      return new ApiError(error.response.status, messages)
    }
    return new ApiError(0, [error instanceof Error ? error.message : 'Something went wrong'])
  }
}

import type { LoginResponse, UserProfile } from '../types/api'
import { api } from './client'

export async function login(email: string, password: string): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>('/auth/login', { email, password })
  return data
}

export async function fetchProfile(): Promise<UserProfile> {
  const { data } = await api.get<UserProfile>('/auth/me')
  return data
}

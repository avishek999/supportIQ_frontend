import { api } from "./axios"
import { API_ROUTES } from "@/lib/config"
import type { RegisterInput, LoginInput } from "@/lib/dto/auth.dto"

export interface User {
  id: string
  name: string
  email: string
}

export interface AuthResponse {
  message?: string
  user?: User
}

export async function registerApi(data: RegisterInput): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>(API_ROUTES.AUTH.REGISTER, data)
  return response.data
}

export async function loginApi(data: LoginInput): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>(API_ROUTES.AUTH.LOGIN, data)
  return response.data
}

export async function logoutApi(): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>(API_ROUTES.AUTH.LOGOUT)
  return response.data
}

export async function getMeApi(): Promise<User | null> {
  try {
    const response = await api.get<{ user?: User; data?: User }>(API_ROUTES.AUTH.ME)
    return response.data.user || response.data.data || (response.data as unknown as User)
  } catch {
    return null
  }
}

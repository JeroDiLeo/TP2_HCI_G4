import { apiRequest } from '@/services/api/client'

type ApiResponse = any

type EmailPayload = {
  email: string
}

type LoginPayload = EmailPayload & {
  password: string
}

type RegisterPayload = LoginPayload & {
  metadata?: Record<string, unknown>
  name: string
}

type ResetPasswordPayload = {
  code: string
  password: string
}

type ChangePasswordPayload = {
  newPassword: string
  oldPassword: string
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

function errorStatus(error: unknown): unknown {
  return error && typeof error === 'object'
    ? (error as { status?: unknown }).status
    : undefined
}

export async function sendVerification(email: string): Promise<ApiResponse> {
  return apiRequest('/users/send-verification', {
    auth: false,
    method: 'POST',
    body: { email },
    responseMode: 'json',
  })
}

export async function verifyAccount(code: string): Promise<ApiResponse> {
  return apiRequest('/users/verify-account', {
    auth: false,
    method: 'POST',
    body: { code },
    responseMode: 'json',
  })
}

export async function forgotPassword(email: string): Promise<ApiResponse> {
  return apiRequest('/users/forgot-password', {
    auth: false,
    method: 'POST',
    body: { email },
    responseMode: 'optionalJson',
  })
}

export async function resetPassword({
  code,
  password,
}: ResetPasswordPayload): Promise<ApiResponse> {
  return apiRequest('/users/reset-password', {
    auth: false,
    method: 'POST',
    body: { code, password },
    responseMode: 'optionalJson',
  })
}

export async function logoutUser(): Promise<void> {
  try {
    await apiRequest('/users/logout', {
      method: 'POST',
      logErrors: false,
      responseMode: 'none',
    })
  } catch (error: unknown) {
    const status = errorStatus(error)
    if (status) {
      console.log(`Logout API returned ${status}`)
    } else {
      console.log(`Logout error (ignored): ${errorMessage(error)}`)
    }
  }
}

export async function loginUser({ email, password }: LoginPayload): Promise<ApiResponse> {
  return apiRequest('/users/login', {
    auth: false,
    method: 'POST',
    body: { email, password },
    responseMode: 'json',
  })
}

export async function registerUser({
  email,
  password,
  name,
  metadata = {},
}: RegisterPayload): Promise<ApiResponse> {
  return apiRequest('/users/register', {
    auth: false,
    method: 'POST',
    body: { email, password, name, metadata },
    responseMode: 'json',
  })
}

export async function updateUserProfile({ name }: { name: string }): Promise<ApiResponse> {
  return apiRequest('/users/profile', {
    method: 'PUT',
    body: { name, metadata: {} },
    responseMode: 'json',
  })
}

export async function changePassword({
  oldPassword,
  newPassword,
}: ChangePasswordPayload): Promise<ApiResponse> {
  return apiRequest('/users/change-password', {
    method: 'POST',
    body: { oldPassword, newPassword },
    responseMode: 'json',
  })
}

export async function deleteAccount({ password }: { password: string }): Promise<ApiResponse> {
  return apiRequest('/users/delete-account', {
    method: 'DELETE',
    body: { password },
    responseMode: 'json',
  })
}

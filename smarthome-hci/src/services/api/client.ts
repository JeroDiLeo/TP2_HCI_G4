const BASE_URL = import.meta.env.VITE_API_BASE_URL

type ResponseMode = 'json' | 'optionalJson' | 'textOrJson' | 'none'

type ApiRequestOptions = Omit<RequestInit, 'body' | 'headers'> & {
  auth?: boolean
  body?: unknown
  headers?: Record<string, string>
  logErrors?: boolean
  responseMode?: ResponseMode
}

export type ApiError = Error & {
  code?: unknown
  status: number
}

export function getAuthHeaders(
  extraHeaders: Record<string, string> = {},
  includeAuth = true,
): Record<string, string> {
  const token = localStorage.getItem('token')

  return {
    'Content-Type': 'application/json; charset=utf-8',
    'X-API-KEY': import.meta.env.VITE_API_KEY,
    ...(includeAuth && token ? { Authorization: `Bearer ${token}` } : {}),
    ...extraHeaders,
  }
}

export function createApiError(data: unknown, status: number): ApiError {
  const payload = data as { error?: { code?: unknown; description?: string } } | null
  const description = payload?.error?.description ?? 'Error desconocido'
  const error = new Error(description) as ApiError

  error.code = payload?.error?.code
  error.status = status

  return error
}

async function parseErrorBody(response: Response): Promise<unknown> {
  try {
    return await response.json()
  } catch {
    return {}
  }
}

async function parseApiResponse<T>(
  response: Response,
  responseMode: ResponseMode,
): Promise<T> {
  if (responseMode === 'none') {
    return undefined as T
  }

  if (responseMode === 'json') {
    return await response.json() as T
  }

  const text = await response.text()
  if (!text) return null as T

  if (responseMode === 'textOrJson') {
    try {
      return JSON.parse(text) as T
    } catch {
      return text as T
    }
  }

  return JSON.parse(text) as T
}

function serializeBody(body: unknown): BodyInit | undefined {
  if (body === undefined) return undefined
  if (typeof body === 'string') return body
  return JSON.stringify(body)
}

function buildUrl(path: string): string {
  const normalizedBase = String(BASE_URL).replace(/\/$/, '')
  const normalizedPath = path.startsWith('/') ? path : `/${path}`

  return `${normalizedBase}${normalizedPath}`
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

export async function apiRequest<T = any>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const {
    auth = true,
    body,
    headers,
    logErrors = true,
    responseMode = 'optionalJson',
    ...requestOptions
  } = options

  try {
    const response = await fetch(buildUrl(path), {
      ...requestOptions,
      headers: getAuthHeaders(headers, auth),
      body: serializeBody(body),
    })

    if (!response.ok) {
      throw createApiError(await parseErrorBody(response), response.status)
    }

    return await parseApiResponse<T>(response, responseMode)
  } catch (error) {
    if (logErrors) {
      console.log(`Unexpected error: ${getErrorMessage(error)}`)
    }
    throw error
  }
}

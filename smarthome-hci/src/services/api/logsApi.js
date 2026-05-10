const BASE_URL = import.meta.env.VITE_API_BASE_URL

function getHeaders() {
  const token = localStorage.getItem('token')
  return {
    'Content-Type': 'application/json; charset=utf-8',
    'X-API-KEY': import.meta.env.VITE_API_KEY,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

async function parseErrorBody(response) {
  const text = await response.text()
  if (!text) return {}
  try { return JSON.parse(text) } catch { return {} }
}

async function parseResponseBody(response) {
  const text = await response.text()
  if (!text) return null
  try { return JSON.parse(text) } catch { return text }
}

function handleError(data, status) {
  const description = data?.error?.description ?? 'Error desconocido'
  const err = new Error(description)
  err.code = data?.error?.code
  err.status = status
  return err
}

function safeInt(value, fallback = 0) {
  const n = Math.trunc(Number(value))
  return Number.isFinite(n) && n >= 0 ? n : fallback
}

/**
 * Returns RawApiLog[].
 * NOTE: API wraps response in { result: [...] } — confirm shape with testing.
 */
export async function getAllLogs(limit, offset) {
  const l = safeInt(limit, 20)
  const o = safeInt(offset, 0)
  const res = await fetch(
    `${BASE_URL}/devices/logs/limit/${l}/offset/${o}`,
    { method: 'GET', headers: getHeaders() },
  )
  if (!res.ok) {
    const body = await parseErrorBody(res)
    throw handleError(body, res.status)
  }
  const data = await parseResponseBody(res)
  return Array.isArray(data) ? data : (data?.result ?? [])
}

/**
 * Returns RawApiLog[] for a specific device.
 * NOTE: API wraps response in { result: [...] } — confirm shape with testing.
 */
export async function getDeviceLogs(deviceId, limit, offset) {
  const l = safeInt(limit, 20)
  const o = safeInt(offset, 0)
  const res = await fetch(
    `${BASE_URL}/devices/${encodeURIComponent(String(deviceId))}/logs/limit/${l}/offset/${o}`,
    { method: 'GET', headers: getHeaders() },
  )
  if (!res.ok) {
    const body = await parseErrorBody(res)
    throw handleError(body, res.status)
  }
  const data = await parseResponseBody(res)
  return Array.isArray(data) ? data : (data?.result ?? [])
}

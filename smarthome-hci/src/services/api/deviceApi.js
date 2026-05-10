const BASE_URL = import.meta.env.VITE_API_BASE_URL

function getHeaders() {
  const token = localStorage.getItem('token')
  return {
    'Content-Type': 'application/json; charset=utf-8',
    'X-API-KEY': import.meta.env.VITE_API_KEY,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

function handleError(data, status) {
  const description = data?.error?.description ?? 'Error desconocido'
  const err = new Error(description)
  err.code = data?.error?.code
  err.status = status
  return err
}

async function parseErrorBody(response) {
  try { return await response.json() } catch { return {} }
}

async function parseResponseBody(response) {
  const text = await response.text()
  if (!text) return null

  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

// ── List / Get ──────────────────────────────────────────────────────

export async function getAllDevices() {
  const init = { method: 'GET', headers: getHeaders() }

  try {
    const response = await fetch(`${BASE_URL}/devices`, init)

    if (!response.ok) {
      throw handleError(await parseErrorBody(response), response.status)
    }

    return await parseResponseBody(response)
  } catch (error) {
    console.log(`Unexpected error: ${error.message}`)
    throw error
  }
}

export async function getDevice(deviceId) {
  const init = { method: 'GET', headers: getHeaders() }

  try {
    const response = await fetch(`${BASE_URL}/devices/${deviceId}`, init)

    if (!response.ok) {
      throw handleError(await parseErrorBody(response), response.status)
    }

    return await parseResponseBody(response)
  } catch (error) {
    console.log(`Unexpected error: ${error.message}`)
    throw error
  }
}

export async function getDevicesByRoom(roomId) {
  const init = { method: 'GET', headers: getHeaders() }

  try {
    const response = await fetch(`${BASE_URL}/rooms/${roomId}/devices`, init)

    if (!response.ok) {
      throw handleError(await parseErrorBody(response), response.status)
    }

    return await parseResponseBody(response)
  } catch (error) {
    console.log(`Unexpected error: ${error.message}`)
    throw error
  }
}

// ── Create / Update / Delete ────────────────────────────────────────

export async function addDevice({ name, type, room, metadata = {} }) {
  const body = { name, type, metadata }
  if (room) body.room = room

  const init = {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(body),
  }

  try {
    const response = await fetch(`${BASE_URL}/devices`, init)

    if (!response.ok) {
      throw handleError(await parseErrorBody(response), response.status)
    }

    return await parseResponseBody(response)
  } catch (error) {
    console.log(`Unexpected error: ${error.message}`)
    throw error
  }
}

export async function updateDevice(deviceId, { name, metadata }) {
  const body = {}
  if (name !== undefined) body.name = name
  if (metadata !== undefined) body.metadata = metadata

  const init = {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(body),
  }

  try {
    const response = await fetch(`${BASE_URL}/devices/${deviceId}`, init)

    if (!response.ok) {
      throw handleError(await parseErrorBody(response), response.status)
    }

    return await parseResponseBody(response)
  } catch (error) {
    console.log(`Unexpected error: ${error.message}`)
    throw error
  }
}

export async function deleteDevice(deviceId) {
  const init = { method: 'DELETE', headers: getHeaders() }

  try {
    const response = await fetch(`${BASE_URL}/devices/${deviceId}`, init)

    if (!response.ok) {
      throw handleError(await parseErrorBody(response), response.status)
    }

  } catch (error) {
    console.log(`Unexpected error: ${error.message}`)
    throw error
  }
}

// ── State & Actions ─────────────────────────────────────────────────

function normalizeActionParams(params = []) {
  if (Array.isArray(params)) return params
  if (params && typeof params === 'object') return Object.values(params)
  return []
}

function normalizeActionResult(response) {
  if (response && typeof response === 'object' && 'result' in response) {
    return response.result
  }
  return response
}

export async function getDeviceState(deviceId) {
  const init = { method: 'GET', headers: getHeaders() }

  try {
    const response = await fetch(`${BASE_URL}/devices/${deviceId}/state`, init)

    if (!response.ok) {
      throw handleError(await parseErrorBody(response), response.status)
    }

    return await parseResponseBody(response)
  } catch (error) {
    console.log(`Unexpected error: ${error.message}`)
    throw error
  }
}

export async function executeAction(deviceId, actionName, params = []) {
  const init = {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify(normalizeActionParams(params)),
  }

  try {
    const response = await fetch(`${BASE_URL}/devices/${deviceId}/${actionName}`, init)

    if (!response.ok) {
      throw handleError(await parseErrorBody(response), response.status)
    }

    return normalizeActionResult(await parseResponseBody(response))
  } catch (error) {
    console.log(`Unexpected error: ${error.message}`)
    throw error
  }
}

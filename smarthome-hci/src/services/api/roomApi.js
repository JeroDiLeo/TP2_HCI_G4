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

export async function createRoom(body) {
  const init = {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(body),
  }

  try {
    const response = await fetch(`${BASE_URL}/rooms`, init)

    if (!response.ok) {
      throw handleError(await parseErrorBody(response), response.status)
    }

    return await response.json()
  } catch (error) {
    console.log(`Unexpected error: ${error.message}`)
    throw error
  }
}

export async function updateRoom(roomId, body) {
  const init = {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(body),
  }

  try {
    const response = await fetch(`${BASE_URL}/rooms/${roomId}`, init)

    if (!response.ok) {
      throw handleError(await parseErrorBody(response), response.status)
    }

    const text = await response.text()
    return text ? JSON.parse(text) : null
  } catch (error) {
    console.log(`Unexpected error: ${error.message}`)
    throw error
  }
}

export async function deleteRoom(roomId) {
  const init = { method: 'DELETE', headers: getHeaders() }

  try {
    const response = await fetch(`${BASE_URL}/rooms/${roomId}`, init)

    if (!response.ok) {
      throw handleError(await parseErrorBody(response), response.status)
    }

    const text = await response.text()
    return text ? JSON.parse(text) : null
  } catch (error) {
    console.log(`Unexpected error: ${error.message}`)
    throw error
  }
}

export async function getRoomsByHome(homeId) {
  const init = { method: 'GET', headers: getHeaders() }

  try {
    const response = await fetch(`${BASE_URL}/homes/${homeId}/rooms`, init)

    if (!response.ok) {
      throw handleError(await parseErrorBody(response), response.status)
    }

    return await response.json()
  } catch (error) {
    console.log(`Unexpected error: ${error.message}`)
    throw error
  }
}

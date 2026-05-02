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
  const description = data.error?.description ?? 'Error desconocido'
  const err = new Error(description)
  err.code = data.error?.code
  err.status = status
  return err
}

export async function getAllHomes() {
  const init = { method: 'GET', headers: getHeaders() }

  try {
    const response = await fetch(`${BASE_URL}/homes`, init)

    if (!response.ok) {
      const data = await response.json()
      throw handleError(data, response.status)
    }

    return await response.json()
  } catch (error) {
    console.log(`Unexpected error: ${error.message}`)
    throw error
  }
}

export async function addHome({ name, metadata = {} }) {
  const init = {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ name, metadata }),
  }

  try {
    const response = await fetch(`${BASE_URL}/homes`, init)

    if (!response.ok) {
      const data = await response.json()
      throw handleError(data, response.status)
    }

    return await response.json()
  } catch (error) {
    console.log(`Unexpected error: ${error.message}`)
    throw error
  }
}

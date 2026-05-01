const BASE_URL = import.meta.env.VITE_API_BASE_URL

const headers = {
  'Content-Type': 'application/json',
  'X-API-KEY': import.meta.env.VITE_API_KEY,
}

function handleError(data, status) {
  const description = data.error?.description ?? 'Error desconocido'
  const err = new Error(description)
  err.code = data.error?.code
  err.status = status
  return err
}

export async function getMailerConfig() {
  const init = { method: 'GET', headers }

  try {
    const response = await fetch(`${BASE_URL}/mailerconfig`, init)

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

export async function createMailerConfig({ host, port, secure, user, password }) {
  const init = {
    method: 'POST',
    headers,
    body: JSON.stringify({ host, port, secure, user, password }),
  }

  try {
    const response = await fetch(`${BASE_URL}/mailerconfig`, init)

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

export async function updateMailerConfig({ host, port, secure, user, password }) {
  const init = {
    method: 'PUT',
    headers,
    body: JSON.stringify({ host, port, secure, user, password }),
  }

  try {
    const response = await fetch(`${BASE_URL}/mailerconfig`, init)

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

export async function deleteMailerConfig() {
  const init = { method: 'DELETE', headers }

  try {
    const response = await fetch(`${BASE_URL}/mailerconfig`, init)

    if (!response.ok) {
      const data = await response.json()
      throw handleError(data, response.status)
    }

    return true
  } catch (error) {
    console.log(`Unexpected error: ${error.message}`)
    throw error
  }
}

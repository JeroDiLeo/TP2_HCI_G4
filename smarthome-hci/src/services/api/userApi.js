const BASE_URL = import.meta.env.VITE_API_BASE_URL

export async function sendVerification(email) {
  const init = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-KEY': import.meta.env.VITE_API_KEY,
    },
    body: JSON.stringify({ email }),
  }

  try {
    const response = await fetch(`${BASE_URL}/users/send-verification`, init)

    if (!response.ok) {
      const data = await response.json()
      const err = new Error(data.error?.description ?? 'Error desconocido')
      err.code = data.error?.code
      err.status = response.status
      throw err
    }

    return await response.json()
  } catch (error) {
    console.log(`Unexpected error: ${error.message}`)
    throw error
  }
}

export async function verifyAccount(code) {
  const init = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-KEY': import.meta.env.VITE_API_KEY,
    },
    body: JSON.stringify({ code }),
  }

  try {
    const response = await fetch(`${BASE_URL}/users/verify-account`, init)

    if (!response.ok) {
      const data = await response.json()
      const err = new Error(data.error?.description ?? 'Error desconocido')
      err.code = data.error?.code
      err.status = response.status
      throw err
    }

    return await response.json()
  } catch (error) {
    console.log(`Unexpected error: ${error.message}`)
    throw error
  }
}

export async function registerUser({ email, password, name, metadata = {} }) {
  const init = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-KEY': import.meta.env.VITE_API_KEY,
    },
    body: JSON.stringify({ email, password, name, metadata }),
  }

  try {
    const response = await fetch(`${BASE_URL}/users/register`, init)

    if (!response.ok) {
      const data = await response.json()
      const err = new Error(data.error?.description ?? 'Error desconocido')
      err.code = data.error?.code
      err.status = response.status
      throw err
    }

    return await response.json()
  } catch (error) {
    console.log(`Unexpected error: ${error.message}`)
    throw error
  }
}

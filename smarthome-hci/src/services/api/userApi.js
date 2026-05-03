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

export async function forgotPassword(email) {
  const init = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-KEY': import.meta.env.VITE_API_KEY,
    },
    body: JSON.stringify({ email }),
  }

  try {
    const response = await fetch(`${BASE_URL}/users/forgot-password`, init)

    if (!response.ok) {
      const text = await response.text()
      let data = null
      try { data = text ? JSON.parse(text) : null } catch { data = null }
      const err = new Error(data?.error?.description ?? 'Error desconocido')
      err.code = data?.error?.code
      err.status = response.status
      throw err
    }

    const text = await response.text()
    return text ? JSON.parse(text) : null
  } catch (error) {
    console.log(`Unexpected error: ${error.message}`)
    throw error
  }
}

export async function resetPassword({ code, password }) {
  const init = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-KEY': import.meta.env.VITE_API_KEY,
    },
    body: JSON.stringify({ code, password }),
  }

  try {
    const response = await fetch(`${BASE_URL}/users/reset-password`, init)

    if (!response.ok) {
      const text = await response.text()
      let data = null
      try { data = text ? JSON.parse(text) : null } catch { data = null }
      const err = new Error(data?.error?.description ?? 'Error desconocido')
      err.code = data?.error?.code
      err.status = response.status
      throw err
    }

    const text = await response.text()
    return text ? JSON.parse(text) : null
  } catch (error) {
    console.log(`Unexpected error: ${error.message}`)
    throw error
  }
}

export async function logoutUser() {
  const token = localStorage.getItem('token')
  const init = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-KEY': import.meta.env.VITE_API_KEY,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  }

  try {
    const response = await fetch(`${BASE_URL}/users/logout`, init)
    // Fire-and-forget: even if the server returns an error, we still log out locally
    if (!response.ok) console.log(`Logout API returned ${response.status}`)
  } catch (error) {
    console.log(`Logout error (ignored): ${error.message}`)
  }
}

export async function loginUser({ email, password }) {
  const init = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-KEY': import.meta.env.VITE_API_KEY,
    },
    body: JSON.stringify({ email, password }),
  }

  try {
    const response = await fetch(`${BASE_URL}/users/login`, init)

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

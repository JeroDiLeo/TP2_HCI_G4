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
  try { return await response.json() } catch (_) { return {} }
}

export async function getAllHomes() {
  const init = { method: 'GET', headers: getHeaders() }

  try {
    const response = await fetch(`${BASE_URL}/homes`, init)

    if (!response.ok) {
      throw handleError(await parseErrorBody(response), response.status)
    }

    return await response.json()
  } catch (error) {
    console.log(`Unexpected error: ${error.message}`)
    throw error
  }
}

export async function getHome(homeId) {
  const init = { method: 'GET', headers: getHeaders() }

  try {
    const response = await fetch(`${BASE_URL}/homes/${homeId}`, init)

    if (!response.ok) {
      throw handleError(await parseErrorBody(response), response.status)
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
      throw handleError(await parseErrorBody(response), response.status)
    }

    return await response.json()
  } catch (error) {
    console.log(`Unexpected error: ${error.message}`)
    throw error
  }
}

export async function updateHome(homeId, { name, metadata = {} }) {
  const init = {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify({ name, metadata }),
  }

  try {
    const response = await fetch(`${BASE_URL}/homes/${homeId}`, init)

    if (!response.ok) {
      throw handleError(await parseErrorBody(response), response.status)
    }

    return await response.json()
  } catch (error) {
    console.log(`Unexpected error: ${error.message}`)
    throw error
  }
}

export async function deleteHome(homeId) {
  const init = { method: 'DELETE', headers: getHeaders() }

  try {
    const response = await fetch(`${BASE_URL}/homes/${homeId}`, init)

    if (!response.ok) {
      throw handleError(await parseErrorBody(response), response.status)
    }

    // Success — server returns 200 with `true` or empty body; return value unused
  } catch (error) {
    console.log(`Unexpected error: ${error.message}`)
    throw error
  }
}

export async function getSharedUsers(homeId) {
  const { users } = await getHomeShareInfo(homeId)
  return users
}

export async function getHomeShareInfo(homeId) {
  const init = { method: 'GET', headers: getHeaders() }

  try {
    const response = await fetch(`${BASE_URL}/homes/${homeId}/share`, init)

    if (!response.ok) {
      throw handleError(await parseErrorBody(response), response.status)
    }

    return normalizeShareInfo(await response.json())
  } catch (error) {
    console.log(`Unexpected error: ${error.message}`)
    throw error
  }
}

function normalizeShareInfo(data) {
  if (Array.isArray(data)) {
    return { users: data, owner: null, sharedBy: null }
  }

  const users =
    data?.users ??
    data?.sharedUsers ??
    data?.sharedWith ??
    data?.members ??
    data?.data ??
    []

  return {
    users: Array.isArray(users) ? users : [],
    owner:
      data?.owner ??
      data?.createdBy ??
      data?.creator ??
      (data?.ownerName || data?.ownerEmail ? { name: data.ownerName, email: data.ownerEmail } : null),
    sharedBy:
      data?.sharedBy ??
      data?.sharedByUser ??
      (data?.sharedByName || data?.sharedByEmail ? { name: data.sharedByName, email: data.sharedByEmail } : null),
  }
}

export async function shareHome(homeId, emails) {
  const emailList = Array.isArray(emails) ? emails : [emails]
  const init = {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ emails: emailList }),
  }

  try {
    const response = await fetch(`${BASE_URL}/homes/${homeId}/share`, init)

    if (!response.ok) {
      throw handleError(await parseErrorBody(response), response.status)
    }

    return await response.json()
  } catch (error) {
    console.log(`Unexpected error: ${error.message}`)
    throw error
  }
}

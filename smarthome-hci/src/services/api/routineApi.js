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

export async function getAllRoutines() {
  const init = { method: 'GET', headers: getHeaders() }

  try {
    const response = await fetch(`${BASE_URL}/routines`, init)

    if (!response.ok) {
      throw handleError(await parseErrorBody(response), response.status)
    }

    return await response.json()
  } catch (error) {
    console.log(`Unexpected error: ${error.message}`)
    throw error
  }
}

export async function getRoutine(routineId) {
  const init = { method: 'GET', headers: getHeaders() }

  try {
    const response = await fetch(`${BASE_URL}/routines/${routineId}`, init)

    if (!response.ok) {
      throw handleError(await parseErrorBody(response), response.status)
    }

    return await response.json()
  } catch (error) {
    console.log(`Unexpected error: ${error.message}`)
    throw error
  }
}

export async function addRoutine({ name, actions = [], metadata = {} }) {
  const init = {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ name, actions, metadata }),
  }

  try {
    const response = await fetch(`${BASE_URL}/routines`, init)

    if (!response.ok) {
      throw handleError(await parseErrorBody(response), response.status)
    }

    return await response.json()
  } catch (error) {
    console.log(`Unexpected error: ${error.message}`)
    throw error
  }
}

export async function updateRoutine(routineId, { name, actions = [], metadata = {} }) {
  const init = {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify({ name, actions, metadata }),
  }

  try {
    const response = await fetch(`${BASE_URL}/routines/${routineId}`, init)

    if (!response.ok) {
      throw handleError(await parseErrorBody(response), response.status)
    }

    return await response.json()
  } catch (error) {
    console.log(`Unexpected error: ${error.message}`)
    throw error
  }
}

export async function deleteRoutine(routineId) {
  const init = { method: 'DELETE', headers: getHeaders() }

  try {
    const response = await fetch(`${BASE_URL}/routines/${routineId}`, init)

    if (!response.ok) {
      throw handleError(await parseErrorBody(response), response.status)
    }

  } catch (error) {
    console.log(`Unexpected error: ${error.message}`)
    throw error
  }
}

export async function executeRoutine(routineId) {
  const init = {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify({}),
  }

  try {
    const response = await fetch(`${BASE_URL}/routines/${routineId}/execute`, init)

    if (!response.ok) {
      throw handleError(await parseErrorBody(response), response.status)
    }

    return await response.json()
  } catch (error) {
    console.log(`Unexpected error: ${error.message}`)
    throw error
  }
}

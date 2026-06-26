const BASE_URL = import.meta.env.VITE_API_BASE_URL

export async function fetchPublic() {
  const res = await fetch(`${BASE_URL}/api/public/ping`)
  if (!res.ok) throw new Error(`Error ${res.status}`)
  return res.json()
}

export async function fetchPrivateHello(token) {
  const res = await fetch(`${BASE_URL}/api/private/hello`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error(`Error ${res.status}`)
  return res.json()
}

export async function fetchPrivateItems(token) {
  const res = await fetch(`${BASE_URL}/api/private/items`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error(`Error ${res.status}`)
  return res.json()
}

export async function fetchBehaviors(token) {
  const res = await fetch(`${BASE_URL}/api/private/behaviors`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error(`Error ${res.status}`)
  return res.json()
}

// Journal Activities api services

export async function fetchActivities(token, date) {
  const res = await fetch(`${BASE_URL}/api/private/activities?date=${date}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error(`Error ${res.status}`)
  return res.json()
}

export async function createActivity(token, activity) {
  const res = await fetch(`${BASE_URL}/api/private/activities`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(activity),
  })
  if (!res.ok) throw new Error(`Error ${res.status}`)
  return res.json()
}

export async function updateActivity(token, id, activity) {
  const res = await fetch(`${BASE_URL}/api/private/activities/${id}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(activity),
  })
  if (!res.ok) throw new Error(`Error ${res.status}`)
  return res.json()
}

export async function deleteActivity(token, id) {
  const res = await fetch(`${BASE_URL}/api/private/activities/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error(`Error ${res.status}`)
}
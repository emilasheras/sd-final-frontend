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

import { useEffect, useState } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { fetchPrivateHello, fetchPrivateItems } from '../services/api.js'

export default function PrivatePage() {
  const { getAccessTokenSilently } = useAuth0()

  const [hello, setHello] = useState(null)
  const [items, setItems] = useState([])
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const token = await getAccessTokenSilently()
        const [helloData, itemsData] = await Promise.all([
          fetchPrivateHello(token),
          fetchPrivateItems(token),
        ])
        setHello(helloData)
        setItems(itemsData)
      } catch (e) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [getAccessTokenSilently])

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Pagina Privada</h1>

      {loading && <p className="text-gray-400">Cargando datos protegidos...</p>}

      {error && (
        <div className="bg-red-50 border border-red-200 p-4 rounded mb-4">
          <p className="text-red-600 text-sm">Error: {error}</p>
        </div>
      )}

      {hello && (
        <div className="bg-white rounded-lg shadow p-6 border mb-4">
          <p className="text-xs text-gray-400 mb-2">GET /api/private/hello</p>
          <pre className="bg-gray-50 p-3 rounded text-sm text-green-700 overflow-auto">
            {JSON.stringify(hello, null, 2)}
          </pre>
        </div>
      )}

      {items.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6 border">
          <p className="text-xs text-gray-400 mb-3">GET /api/private/items - datos de H2 DB</p>
          <ul className="space-y-2">
            {items.map((item) => (
              <li key={item.id} className="border rounded p-3 text-sm flex gap-2">
                <span className="font-medium text-gray-700">{item.name}</span>
                <span className="text-gray-400">-</span>
                <span className="text-gray-500">{item.description}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

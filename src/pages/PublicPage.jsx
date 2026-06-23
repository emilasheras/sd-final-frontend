import { useEffect, useState } from 'react'
import { fetchPublic } from '../services/api.js'

export default function PublicPage() {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPublic()
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Pagina Publica</h1>
      <div className="bg-white rounded-lg shadow p-6 border">
        <p className="text-sm text-gray-400 mb-4">
          <code>GET /api/public/ping</code> - sin token de autenticacion
        </p>
        {loading && <p className="text-gray-400">Llamando al backend...</p>}
        {error && <p className="text-red-500">Error: {error}</p>}
        {data && (
          <pre className="bg-gray-50 p-4 rounded text-sm text-green-700 overflow-auto">
            {JSON.stringify(data, null, 2)}
          </pre>
        )}
      </div>
    </div>
  )
}

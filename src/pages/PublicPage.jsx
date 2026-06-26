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
      <h1 className="text-2xl font-bold text-zinc-100 mb-6">Endpoint público</h1>
      <div className="bg-zinc-800 rounded-lg border border-zinc-700 p-6">
        <p className="text-sm text-zinc-500 mb-4 font-mono">
          GET /api/public/ping — sin token de autenticación
        </p>
        {loading && <p className="text-zinc-500">Llamando al backend...</p>}
        {error && <p className="text-red-400">Error: {error}</p>}
        {data && (
          <pre className="bg-zinc-900 p-4 rounded text-sm text-emerald-400 overflow-auto">
            {JSON.stringify(data, null, 2)}
          </pre>
        )}
      </div>
    </div>
  )
}

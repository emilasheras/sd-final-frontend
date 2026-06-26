import { useEffect, useState, useCallback } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { fetchActivities, createActivity, deleteActivity } from '../services/api.js'

const HOURS = Array.from({ length: 24 }, (_, i) => i)

function localToday() {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function shiftDate(dateStr, days) {
  const [y, m, d] = dateStr.split('-').map(Number)
  const dt = new Date(y, m - 1, d)
  dt.setDate(dt.getDate() + days)
  const ny = dt.getFullYear()
  const nm = String(dt.getMonth() + 1).padStart(2, '0')
  const nd = String(dt.getDate()).padStart(2, '0')
  return `${ny}-${nm}-${nd}`
}

function formatHour(slot) {
  const s = String(slot).padStart(2, '0')
  const e = String(slot + 1).padStart(2, '0')
  return `${s}:00 – ${e}:00`
}

const EMPTY_FORM = { hourSlot: 8, description: '', enjoyment: 5, importance: 5 }

export default function PrivatePage() {
  const { getAccessTokenSilently } = useAuth0()

  const [date, setDate] = useState(localToday)
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  const loadActivities = useCallback(async (d) => {
    setLoading(true)
    setError(null)
    try {
      const token = await getAccessTokenSilently()
      const data = await fetchActivities(token, d)
      setActivities(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [getAccessTokenSilently])

  useEffect(() => {
    loadActivities(date)
  }, [date, loadActivities])

  async function handleCreate(e) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const token = await getAccessTokenSilently()
      await createActivity(token, { ...form, date })
      setForm(EMPTY_FORM)
      await loadActivities(date)
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    setError(null)
    try {
      const token = await getAccessTokenSilently()
      await deleteActivity(token, id)
      setActivities(prev => prev.filter(a => a.id !== id))
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Diario de Actividades</h1>

      {/* Date navigation */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => setDate(d => shiftDate(d, -1))}
          className="px-3 py-1 rounded border text-gray-600 hover:bg-gray-100 text-lg leading-none"
        >
          ‹
        </button>
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          className="border rounded px-3 py-1 text-gray-700 text-sm"
        />
        <button
          onClick={() => setDate(d => shiftDate(d, 1))}
          className="px-3 py-1 rounded border text-gray-600 hover:bg-gray-100 text-lg leading-none"
        >
          ›
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 p-3 rounded mb-4">
          <p className="text-red-600 text-sm">Error: {error}</p>
        </div>
      )}

      {/* Activity list */}
      <div className="bg-white rounded-lg shadow border mb-6">
        <div className="px-5 py-3 border-b flex items-center justify-between">
          <p className="text-xs text-gray-400 font-mono">
            GET /api/private/activities?date={date}
          </p>
          <span className="text-xs text-gray-400">{activities.length} actividades</span>
        </div>

        {loading ? (
          <p className="text-gray-400 text-sm px-5 py-6">Cargando...</p>
        ) : activities.length === 0 ? (
          <p className="text-gray-400 text-sm px-5 py-6">Sin actividades para este día.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {activities.map(a => (
              <li key={a.id} className="px-5 py-4 flex items-start justify-between gap-4">
                <div className="flex gap-4 items-start">
                  <span className="text-xs font-mono text-gray-400 mt-0.5 whitespace-nowrap">
                    {formatHour(a.hourSlot)}
                  </span>
                  <div>
                    <p className="text-sm text-gray-800 font-medium">{a.description}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Disfrute: {a.enjoyment}/10 · Importancia: {a.importance}/10
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(a.id)}
                  className="text-xs text-red-400 hover:text-red-600 shrink-0 mt-0.5"
                >
                  eliminar
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Add form */}
      <div className="bg-white rounded-lg shadow border">
        <div className="px-5 py-3 border-b">
          <p className="text-xs text-gray-400 font-mono">POST /api/private/activities</p>
        </div>
        <form onSubmit={handleCreate} className="px-5 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-500 block mb-1">Hora</label>
              <select
                value={form.hourSlot}
                onChange={e => setForm(f => ({ ...f, hourSlot: Number(e.target.value) }))}
                className="w-full border rounded px-2 py-1.5 text-sm text-gray-700"
              >
                {HOURS.map(h => (
                  <option key={h} value={h}>{String(h).padStart(2, '0')}:00</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Descripción</label>
              <input
                type="text"
                required
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="¿Qué hiciste?"
                className="w-full border rounded px-2 py-1.5 text-sm text-gray-700"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Disfrute (0–10)</label>
              <input
                type="number" min="0" max="10"
                value={form.enjoyment}
                onChange={e => setForm(f => ({ ...f, enjoyment: Number(e.target.value) }))}
                className="w-full border rounded px-2 py-1.5 text-sm text-gray-700"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Importancia (0–10)</label>
              <input
                type="number" min="0" max="10"
                value={form.importance}
                onChange={e => setForm(f => ({ ...f, importance: Number(e.target.value) }))}
                className="w-full border rounded px-2 py-1.5 text-sm text-gray-700"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="bg-blue-600 text-white px-5 py-2 rounded text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'Guardando...' : 'Agregar actividad'}
          </button>
        </form>
      </div>
    </div>
  )
}
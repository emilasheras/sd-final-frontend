import { useEffect, useState, useCallback, useRef } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { fetchActivities, fetchBehaviors, createActivity, deleteActivity } from '../services/api.js'

const GRID_START = 7   // 07:00
const GRID_END   = 23  // inclusive, so 23:00–23:59

const GRID_HOURS = Array.from(
  { length: GRID_END - GRID_START + 1 },
  (_, i) => i + GRID_START
)

const SLEEP_KEYWORDS = ['dormir', 'durmiendo', 'sleep', 'siesta', 'sueño', 'descanso']

function isSleep(description) {
  const lower = description.toLowerCase()
  return SLEEP_KEYWORDS.some(kw => lower.includes(kw))
}

function localToday() {
  const d = new Date()
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, '0'),
    String(d.getDate()).padStart(2, '0'),
  ].join('-')
}

function shiftDate(dateStr, days) {
  const [y, m, d] = dateStr.split('-').map(Number)
  const dt = new Date(y, m - 1, d)
  dt.setDate(dt.getDate() + days)
  return [
    dt.getFullYear(),
    String(dt.getMonth() + 1).padStart(2, '0'),
    String(dt.getDate()).padStart(2, '0'),
  ].join('-')
}

function pad(n) { return String(n).padStart(2, '0') }

const EMPTY_FORM = { description: '', enjoyment: 5, importance: 5 }

export default function PrivatePage() {
  const { getAccessTokenSilently } = useAuth0()

  const [date, setDate] = useState(localToday)
  const [activities, setActivities] = useState([])
  const [behaviors, setBehaviors] = useState([])
  const [checked, setChecked] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // inline form state
  const [activeHour, setActiveHour] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const descInputRef = useRef(null)

  useEffect(() => {
    async function loadBehaviors() {
      try {
        const token = await getAccessTokenSilently()
        setBehaviors(await fetchBehaviors(token))
      } catch { /* non-fatal */ }
    }
    loadBehaviors()
  }, [getAccessTokenSilently])

  useEffect(() => { setChecked({}) }, [date])

  const loadActivities = useCallback(async (d) => {
    setLoading(true)
    setError(null)
    try {
      const token = await getAccessTokenSilently()
      setActivities(await fetchActivities(token, d))
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [getAccessTokenSilently])

  useEffect(() => { loadActivities(date) }, [date, loadActivities])

  function openInline(hour) {
    setActiveHour(hour)
    setForm(EMPTY_FORM)
    // focus after render
    setTimeout(() => descInputRef.current?.focus(), 0)
  }

  function closeInline() {
    setActiveHour(null)
    setForm(EMPTY_FORM)
  }

  async function handleCreate(e) {
    e.preventDefault()
    if (!form.description.trim()) return
    setSaving(true)
    setError(null)
    try {
      const token = await getAccessTokenSilently()
      await createActivity(token, { ...form, date, hourSlot: activeHour })
      closeInline()
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

  function handleKeyDown(e) {
    if (e.key === 'Escape') closeInline()
  }

  const activityByHour = Object.fromEntries(activities.map(a => [a.hourSlot, a]))
  const completedCount = Object.values(checked).filter(Boolean).length

  return (
    <div className="max-w-2xl mx-auto space-y-8">

      {/* Date navigation */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setDate(d => shiftDate(d, -1))}
          className="px-3 py-1 rounded border border-zinc-700 text-zinc-400 hover:text-zinc-100 hover:border-zinc-500 text-lg leading-none"
        >
          ‹
        </button>
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          className="bg-zinc-800 border border-zinc-700 rounded px-3 py-1 text-zinc-300 text-sm"
        />
        <button
          onClick={() => setDate(d => shiftDate(d, 1))}
          className="px-3 py-1 rounded border border-zinc-700 text-zinc-400 hover:text-zinc-100 hover:border-zinc-500 text-lg leading-none"
        >
          ›
        </button>
      </div>

      {error && (
        <div className="bg-red-950 border border-red-800 p-3 rounded">
          <p className="text-red-400 text-sm">Error: {error}</p>
        </div>
      )}

      {/* ── Conductas diarias ── */}
      {behaviors.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-widest">
              Conductas diarias
            </h2>
            <span className="text-xs text-zinc-600">
              {completedCount}/{behaviors.length}
            </span>
          </div>
          <div className="bg-zinc-800 rounded-lg border border-zinc-700 divide-y divide-zinc-700/50">
            {behaviors.map(b => (
              <label
                key={b.id}
                className="flex items-center gap-3 px-4 py-2.5 cursor-pointer group"
              >
                <input
                  type="checkbox"
                  checked={!!checked[b.id]}
                  onChange={() => setChecked(prev => ({ ...prev, [b.id]: !prev[b.id] }))}
                  className="w-4 h-4 accent-blue-400 shrink-0"
                />
                <span className={`text-sm select-none ${checked[b.id] ? 'line-through text-zinc-600' : 'text-zinc-300 group-hover:text-zinc-100'}`}>
                  {b.name}
                </span>
              </label>
            ))}
          </div>
        </section>
      )}

      {/* ── Grilla horaria ── */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-widest">
            Actividades
          </h2>
          {loading && <span className="text-xs text-zinc-600">Cargando...</span>}
        </div>

        <div className="rounded-lg border border-zinc-700 overflow-hidden">
          {GRID_HOURS.map(h => {
            const activity = activityByHour[h]
            const isActive = activeHour === h
            const sleep = activity && isSleep(activity.description)

            if (isActive) {
              return (
                <form
                  key={h}
                  onSubmit={handleCreate}
                  onKeyDown={handleKeyDown}
                  className="flex items-center gap-2 px-4 py-2 bg-zinc-800 border-b border-zinc-700 last:border-b-0"
                >
                  <span className="text-xs font-mono text-zinc-500 w-12 shrink-0">
                    {pad(h)}:00
                  </span>
                  <input
                    ref={descInputRef}
                    type="text"
                    value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    placeholder="¿qué hiciste?"
                    className="flex-1 bg-zinc-900 border border-zinc-600 rounded px-2 py-1 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-zinc-400"
                  />
                  <span className="text-zinc-600 text-xs">★</span>
                  <input
                    type="number" min="0" max="10"
                    value={form.enjoyment}
                    onChange={e => setForm(f => ({ ...f, enjoyment: Number(e.target.value) }))}
                    className="w-10 bg-zinc-900 border border-zinc-600 rounded px-1 py-1 text-xs text-zinc-100 text-center focus:outline-none focus:border-zinc-400"
                  />
                  <span className="text-zinc-600 text-xs">⚡</span>
                  <input
                    type="number" min="0" max="10"
                    value={form.importance}
                    onChange={e => setForm(f => ({ ...f, importance: Number(e.target.value) }))}
                    className="w-10 bg-zinc-900 border border-zinc-600 rounded px-1 py-1 text-xs text-zinc-100 text-center focus:outline-none focus:border-zinc-400"
                  />
                  <button
                    type="submit"
                    disabled={saving}
                    className="text-emerald-400 hover:text-emerald-300 text-sm px-1 disabled:opacity-40"
                    title="Guardar (Enter)"
                  >
                    ✓
                  </button>
                  <button
                    type="button"
                    onClick={closeInline}
                    className="text-zinc-600 hover:text-zinc-400 text-sm px-1"
                    title="Cancelar (Esc)"
                  >
                    ✕
                  </button>
                </form>
              )
            }

            if (activity) {
              return (
                <div
                  key={h}
                  className={`group flex items-center gap-3 px-4 py-2.5 border-b border-zinc-700/50 last:border-b-0 ${sleep ? 'bg-indigo-950/30' : 'bg-zinc-800'}`}
                >
                  <span className="text-xs font-mono text-zinc-500 w-12 shrink-0">
                    {pad(h)}:00
                  </span>
                  <span className="flex-1 text-sm text-zinc-100">
                    {sleep && <span className="mr-1.5">🌙</span>}
                    {activity.description}
                  </span>
                  <span className="text-zinc-600 text-xs">★{activity.enjoyment}</span>
                  <span className="text-zinc-600 text-xs ml-1">⚡{activity.importance}</span>
                  <button
                    onClick={() => handleDelete(activity.id)}
                    className="text-zinc-700 hover:text-red-400 text-sm px-1 opacity-0 group-hover:opacity-100 transition-opacity ml-1"
                    title="Eliminar"
                  >
                    ×
                  </button>
                </div>
              )
            }

            // empty slot
            return (
              <div
                key={h}
                onClick={() => openInline(h)}
                className="group flex items-center gap-3 px-4 py-2 bg-zinc-900 border-b border-zinc-800 last:border-b-0 cursor-pointer hover:bg-zinc-800/60 transition-colors"
              >
                <span className="text-xs font-mono text-zinc-700 w-12 shrink-0">
                  {pad(h)}:00
                </span>
                <span className="flex-1 text-xs text-zinc-800 group-hover:text-zinc-700 select-none tracking-widest">
                  · · · · · · · · · · · · ·
                </span>
                <span className="text-zinc-700 group-hover:text-zinc-500 text-xs px-1 transition-colors">
                  +
                </span>
              </div>
            )
          })}
        </div>
      </section>

    </div>
  )
}

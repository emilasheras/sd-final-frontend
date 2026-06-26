import { useEffect, useState, useCallback, useRef } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { fetchActivities, fetchBehaviors, createActivity, deleteActivity } from '../services/api.js'

const GRID_HOURS = Array.from({ length: 24 }, (_, i) => i)

const SLEEP_KEYWORDS = ['dormir', 'durmiendo', 'sleep', 'siesta', 'sueño', 'descanso']

function isSleep(description) {
  return SLEEP_KEYWORDS.some(kw => description.toLowerCase().includes(kw))
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

  const activitiesByHour = activities.reduce((acc, a) => {
    acc[a.hourSlot] = [...(acc[a.hourSlot] ?? []), a]
    return acc
  }, {})

  const filledHours = new Set(activities.map(a => a.hourSlot)).size
  const completedCount = Object.values(checked).filter(Boolean).length
  const allBehaviorsDone = behaviors.length > 0 && completedCount === behaviors.length

  return (
    <div className="flex-1 flex flex-col gap-4 min-h-0">

      {/* Date navigation + progress - fixed height */}
      <div className="flex items-center gap-3 shrink-0">
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
          className="bg-zinc-800 border border-zinc-700 rounded px-3 py-1.5 text-zinc-300"
        />
        <button
          onClick={() => setDate(d => shiftDate(d, 1))}
          className="px-3 py-1 rounded border border-zinc-700 text-zinc-400 hover:text-zinc-100 hover:border-zinc-500 text-lg leading-none"
        >
          ›
        </button>
        <span className={`ml-auto text-sm tabular-nums ${filledHours === 24 ? 'text-emerald-400' : 'text-zinc-500'}`}>
          {filledHours} / 24 hs
        </span>
      </div>

      {error && (
        <div className="bg-red-950 border border-red-800 p-3 rounded shrink-0">
          <p className="text-red-400">Error: {error}</p>
        </div>
      )}

      {/* Two-column layout - takes all remaining height */}
      <div className="flex-1 flex gap-5 min-h-0">

        {/* Left column: behaviors + WIP sections */}
        <div className="w-2/5 flex flex-col gap-4 overflow-y-auto pr-1">

          {/* Conductas diarias */}
          {behaviors.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-widest">
                  Conductas diarias
                </h2>
                <span className={`text-sm ${allBehaviorsDone ? 'text-emerald-400' : 'text-zinc-400'}`}>
                  {allBehaviorsDone ? '✓ todas' : `${completedCount}/${behaviors.length}`}
                </span>
              </div>
              <div className="bg-zinc-800 rounded-lg border border-zinc-700 divide-y divide-zinc-700/50">
                {behaviors.map(b => (
                  <label
                    key={b.id}
                    className="flex items-center gap-3 px-4 py-2 cursor-pointer group"
                  >
                    <input
                      type="checkbox"
                      checked={!!checked[b.id]}
                      onChange={() => setChecked(prev => ({ ...prev, [b.id]: !prev[b.id] }))}
                      className="w-4 h-4 accent-blue-400 shrink-0"
                    />
                    <span className={`text-base select-none ${checked[b.id] ? 'line-through text-zinc-600' : 'text-zinc-300 group-hover:text-zinc-100'}`}>
                      {b.name}
                    </span>
                  </label>
                ))}
              </div>
            </section>
          )}

          {/* Estado de ánimo (WIP) */}
          <section className="opacity-40 pointer-events-none select-none">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-widest">
                Estado de ánimo
              </h2>
              <span className="text-xs text-zinc-600 bg-zinc-800 border border-zinc-700 px-2 py-0.5 rounded">
                próximamente
              </span>
            </div>
            <div className="bg-zinc-800 rounded-lg border border-zinc-700 px-4 py-3">
              <div className="flex gap-4 justify-center">
                {['😔', '😐', '🙂', '😊', '😄'].map((emoji, i) => (
                  <button key={i} disabled className="text-2xl opacity-60">{emoji}</button>
                ))}
              </div>
            </div>
          </section>

          {/* Notas del día (WIP) */}
          <section className="opacity-40 pointer-events-none select-none">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-widest">
                Notas del día
              </h2>
              <span className="text-xs text-zinc-600 bg-zinc-800 border border-zinc-700 px-2 py-0.5 rounded">
                próximamente
              </span>
            </div>
            <div className="bg-zinc-800 rounded-lg border border-zinc-700">
              <textarea
                disabled
                placeholder="Reflexiones del día..."
                rows={3}
                className="w-full bg-transparent px-4 py-3 text-base text-zinc-700 placeholder-zinc-700 resize-none focus:outline-none cursor-not-allowed"
              />
            </div>
          </section>

        </div>

        {/* Right column: hour grid */}
        <div className="w-3/5 flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-3 shrink-0">
            <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-widest">
              Actividades
            </h2>
            {loading && <span className="text-sm text-zinc-600">Cargando...</span>}
          </div>

          <div className="flex-1 overflow-y-auto rounded-lg border border-zinc-700">
            {GRID_HOURS.map(h => {
              const hourActivities = activitiesByHour[h] ?? []
              const isActive = activeHour === h
              const hasActivities = hourActivities.length > 0

              return (
                <div key={h} className="group/hour border-b border-zinc-800 last:border-b-0">

                  {/* Existing activities */}
                  {hourActivities.map((activity, idx) => {
                    const sleep = isSleep(activity.description)
                    return (
                      <div
                        key={activity.id}
                        className={`group/row flex items-center gap-3 px-4 py-3 ${sleep ? 'bg-indigo-950/30' : 'bg-zinc-800'}`}
                      >
                        <span className="text-sm font-mono text-zinc-500 w-12 shrink-0">
                          {idx === 0 ? `${pad(h)}:00` : ''}
                        </span>
                        <span className="flex-1 text-base text-zinc-100">
                          {sleep && <span className="mr-1.5">🌙</span>}
                          {activity.description}
                        </span>
                        <span className="text-sm text-zinc-500">★{activity.enjoyment}</span>
                        <span className="text-sm text-zinc-500 ml-1">⚡{activity.importance}</span>
                        <button
                          onClick={() => handleDelete(activity.id)}
                          className="text-zinc-700 hover:text-red-400 text-base px-1 opacity-0 group-hover/row:opacity-100 transition-opacity ml-1"
                          title="Eliminar"
                        >
                          ×
                        </button>
                      </div>
                    )
                  })}

                  {/* Inline form */}
                  {isActive && (
                    <form
                      onSubmit={handleCreate}
                      onKeyDown={handleKeyDown}
                      className="flex items-center gap-2 px-4 py-3 bg-zinc-800"
                    >
                      <span className="text-sm font-mono text-zinc-500 w-12 shrink-0">
                        {pad(h)}:00
                      </span>
                      <input
                        ref={descInputRef}
                        type="text"
                        value={form.description}
                        onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                        placeholder="¿qué hiciste?"
                        className="flex-1 bg-zinc-900 border border-zinc-600 rounded px-2 py-1 text-base text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-zinc-400"
                      />
                      <span className="text-zinc-600 text-sm">★</span>
                      <input
                        type="number" min="0" max="10"
                        value={form.enjoyment}
                        onChange={e => setForm(f => ({ ...f, enjoyment: Number(e.target.value) }))}
                        className="w-10 bg-zinc-900 border border-zinc-600 rounded px-1 py-1 text-sm text-zinc-100 text-center focus:outline-none focus:border-zinc-400"
                      />
                      <span className="text-zinc-600 text-sm">⚡</span>
                      <input
                        type="number" min="0" max="10"
                        value={form.importance}
                        onChange={e => setForm(f => ({ ...f, importance: Number(e.target.value) }))}
                        className="w-10 bg-zinc-900 border border-zinc-600 rounded px-1 py-1 text-sm text-zinc-100 text-center focus:outline-none focus:border-zinc-400"
                      />
                      <button
                        type="submit"
                        disabled={saving}
                        className="text-emerald-400 hover:text-emerald-300 text-base px-1 disabled:opacity-40"
                        title="Guardar (Enter)"
                      >
                        ✓
                      </button>
                      <button
                        type="button"
                        onClick={closeInline}
                        className="text-zinc-600 hover:text-zinc-400 text-base px-1"
                        title="Cancelar (Esc)"
                      >
                        ✕
                      </button>
                    </form>
                  )}

                  {/* "agregar otra" - collapses to zero height when not hovered */}
                  {hasActivities && !isActive && (
                    <div className="overflow-hidden max-h-0 group-hover/hour:max-h-10 transition-all duration-150">
                      <div
                        onClick={() => openInline(h)}
                        className="flex items-center gap-3 px-4 py-1.5 bg-zinc-900/70 cursor-pointer"
                      >
                        <span className="w-12 shrink-0" />
                        <span className="flex-1 text-zinc-600 text-xs">+ agregar otra</span>
                        <span className="text-zinc-600 text-sm px-1">+</span>
                      </div>
                    </div>
                  )}

                  {/* Empty slot */}
                  {!hasActivities && !isActive && (
                    <div
                      onClick={() => openInline(h)}
                      className="flex items-center gap-3 px-4 py-3 bg-zinc-900 hover:bg-zinc-800/60 cursor-pointer transition-colors"
                    >
                      <span className="text-sm font-mono text-zinc-700 w-12 shrink-0">
                        {pad(h)}:00
                      </span>
                      <span className="flex-1 text-zinc-800 group-hover/hour:text-zinc-700 select-none tracking-widest text-sm">
                        · · · · · · · · · · · · ·
                      </span>
                      <span className="text-zinc-700 group-hover/hour:text-zinc-500 text-sm px-1 transition-colors">
                        +
                      </span>
                    </div>
                  )}

                </div>
              )
            })}
          </div>
        </div>

      </div>
    </div>
  )
}

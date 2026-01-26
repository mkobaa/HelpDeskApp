/* Notifications utility
 * - Provides API functions: fetchNotifications, markNotificationRead, markAllNotificationsRead
 * - Implements an SSE-like client using Fetch streaming so we can set Authorization headers
 * - Exports startSSE(onMessage, onOpen, onError) and stopSSE()
 */

let sseState = {
  controller: null,
  running: false,
  lastEventId: 0,
  reconnectDelay: 1000,
}

function getAuthToken() {
  try {
    const cookie = useCookie('auth_token')
    return cookie?.value ? decodeURIComponent(cookie.value) : null
  } catch (e) {
    if (typeof document !== 'undefined') {
      const m = document.cookie.match(/auth_token=([^;]+)/)
      return m ? decodeURIComponent(m[1]) : null
    }
    return null
  }
}

async function fetchJson(path, opts = {}) {
  const token = getAuthToken()
  const headers = Object.assign({ Accept: 'application/json' }, opts.headers || {})
  if (token) headers['Authorization'] = `Bearer ${token}`

  // build absolute URL to backend API to avoid frontend dev server 404
  let apiBase = null
  try {
    // try Nuxt runtime config (client/server)
    if (typeof useRuntimeConfig !== 'undefined') {
      const cfg = useRuntimeConfig()
      apiBase = (cfg?.public?.API_URL || cfg?.API_URL)
    }
  } catch (e) {}
  if (!apiBase) apiBase = typeof process !== 'undefined' ? process.env.API_URL : null
  if (!apiBase) apiBase = 'http://localhost:8000/api'

  const trimmedBase = apiBase.replace(/\/$/, '')
  const url = path.startsWith('/api') ? (trimmedBase + path.replace(/^\/api/, '')) : path

  const res = await fetch(url, Object.assign({ credentials: 'include', headers }, opts))
  const raw = await res.json().catch(() => null)
  if (!res.ok) throw raw || new Error('Request failed')
  return raw
}

export async function fetchNotifications() {
  return fetchJson('/api/notifications')
}

export async function markNotificationRead(id) {
  return fetchJson(`/api/notifications/${id}/read`, { method: 'POST' })
}

export async function markAllNotificationsRead() {
  return fetchJson('/api/notifications/read-all', { method: 'POST' })
}

function parseEventChunk(chunk, buffer) {
  buffer += chunk
  const events = []
  let idx
  while ((idx = buffer.indexOf('\n\n')) !== -1) {
    const raw = buffer.slice(0, idx)
    buffer = buffer.slice(idx + 2)
    const lines = raw.split(/\r?\n/)
    let event = { id: null, type: 'message', data: '' }
    for (const line of lines) {
      if (!line) continue
      if (line.startsWith(':')) continue // comment/heartbeat
      const [field, ...rest] = line.split(':')
      const value = rest.join(':').replace(/^ /, '')
      if (field === 'id') event.id = value
      else if (field === 'event') event.type = value
      else if (field === 'data') event.data += (event.data ? '\n' : '') + value
    }
    events.push(event)
  }
  return { events, buffer }
}

export function startSSE({ onMessage, onOpen, onError } = {}) {
  if (sseState.running) return
  sseState.running = true
  sseState.reconnectDelay = 1000

  const run = async () => {
    while (sseState.running) {
      const token = getAuthToken()
      sseState.controller = new AbortController()
      const headers = { Accept: 'text/event-stream' }
      if (token) headers['Authorization'] = `Bearer ${token}`
      if (sseState.lastEventId) headers['Last-Event-ID'] = String(sseState.lastEventId)

      try {
        // build full SSE URL (use same API_URL base)
        let apiBase = null
        try {
          if (typeof useRuntimeConfig !== 'undefined') {
            const cfg = useRuntimeConfig()
            apiBase = (cfg?.public?.API_URL || cfg?.API_URL)
          }
        } catch (e) {}
        if (!apiBase) apiBase = typeof process !== 'undefined' ? process.env.API_URL : null
        if (!apiBase) apiBase = 'http://localhost:8000/api'
        const sseUrl = apiBase.replace(/\/$/, '') + '/sse/notifications'

        const res = await fetch(sseUrl, {
          method: 'GET',
          headers,
          credentials: 'include',
          signal: sseState.controller.signal,
        })

        if (onOpen && typeof onOpen === 'function') onOpen()

        if (!res.ok || !res.body) throw new Error('SSE connection failed')

        const reader = res.body.getReader()
        const decoder = new TextDecoder('utf-8')
        let { value, done } = await reader.read()
        let buffer = ''
        while (!done && sseState.running) {
          buffer += decoder.decode(value || new Uint8Array(), { stream: true })
          const parts = buffer.split(/\n\n/)
          buffer = parts.pop() || ''
          for (const part of parts) {
            const lines = part.split(/\r?\n/)
            let evt = { id: null, type: 'message', data: '' }
            for (const line of lines) {
              if (!line) continue
              if (line.startsWith(':')) continue
              const [field, ...rest] = line.split(':')
              const valueLine = rest.join(':').replace(/^ /, '')
              if (field === 'id') evt.id = valueLine
              else if (field === 'event') evt.type = valueLine
              else if (field === 'data') evt.data += (evt.data ? '\n' : '') + valueLine
            }

            if (evt.id) sseState.lastEventId = Number(evt.id) || sseState.lastEventId

            if (evt.type === 'notification') {
              try {
                const payload = JSON.parse(evt.data)
                if (onMessage) onMessage(payload)
              } catch (e) {
                // ignore JSON parse errors
              }
            } else if (evt.type === 'error') {
              if (onError) onError(evt.data)
            }
          }

          ({ value, done } = await reader.read())
        }

        sseState.reconnectDelay = 1000
      } catch (err) {
        if (!sseState.running) break
        if (onError) onError(err)
        await new Promise(r => setTimeout(r, sseState.reconnectDelay))
        sseState.reconnectDelay = Math.min(30000, sseState.reconnectDelay * 2)
      } finally {
        try { sseState.controller?.abort() } catch {}
        sseState.controller = null
      }
    }
  }

  run()
}

export function stopSSE() {
  sseState.running = false
  try { sseState.controller?.abort() } catch {}
  sseState.controller = null
}

export default {
  fetchNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  startSSE,
  stopSSE,
}

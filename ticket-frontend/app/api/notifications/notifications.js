// Fallback polling fetch (kept for compatibility)
export const getNotifications = async () => {
  const token = useCookie('auth_token')
  let bearer = token.value || ''

  try {
    bearer = decodeURIComponent(bearer)
  } catch {}

  const response = await fetch('http://localhost:8000/api/notifications', {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${bearer}`
    }
  })

  const raw = await response.json()

  if (!response.ok) {
    throw raw
  }

  return raw.data || []
}

// SSE subscription helper for live notifications
export const subscribeNotifications = (onMessage, onError) => {
  const token = useCookie('auth_token')
  let bearer = token.value || ''
  try { bearer = decodeURIComponent(bearer) } catch {}

  const base = 'http://localhost:8000/api/sse/notifications'
  let es = null
  let stopped = false
  let reconnectDelay = 3000

  const connect = () => {
    if (stopped) return
    const url = bearer ? `${base}?token=${encodeURIComponent(bearer)}` : base
    es = new EventSource(url)

    const handleEvent = (evt) => {
      try {
        const data = JSON.parse(evt.data)
        onMessage && onMessage(data)
      } catch (e) {
        onMessage && onMessage(evt.data)
      }
    }

    // listen for both custom-named events and default message events
    es.addEventListener('notification', handleEvent)
    es.onmessage = handleEvent

    es.onerror = (err) => {
      onError && onError(err)
      try { es.close() } catch (e) {}
      if (!stopped) setTimeout(() => { connect() }, reconnectDelay)
    }
  }

  connect()

  return {
    close: () => {
      stopped = true
      try { es && es.close() } catch (e) {}
    }
  }
}

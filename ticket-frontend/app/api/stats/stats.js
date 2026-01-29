const extractCount = (raw, possibleKeys = []) => {
    if (raw == null) return 0
    if (typeof raw === 'number') return raw
    // direct numeric properties
    for (const k of possibleKeys) {
        if (raw && typeof raw[k] === 'number') return raw[k]
        if (raw && typeof raw[k] === 'string' && !Number.isNaN(Number(raw[k]))) return Number(raw[k])
    }
    // nested data object
    if (raw.data && typeof raw.data === 'object') {
        for (const k of possibleKeys) {
            if (typeof raw.data[k] === 'number') return raw.data[k]
            if (typeof raw.data[k] === 'string' && !Number.isNaN(Number(raw.data[k]))) return Number(raw.data[k])
        }
        // if data itself is numeric
        if (typeof raw.data === 'number') return raw.data
    }
    // fallback to numeric conversion
    const n = Number(raw)
    return Number.isNaN(n) ? 0 : n
}

export const getNumberOfUsers = async () => {
  const token = useCookie('auth_token')
  let bearer = token.value || ''
  try { bearer = decodeURIComponent(bearer) } catch {}

  const res = await fetch('http://localhost:8000/api/stats/number-of-users', {
    method: 'GET',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json', Authorization: `Bearer ${bearer}` }
  })
  const raw = await res.json()
  if (!res.ok) throw raw
    return extractCount(raw, ['number_of_users', 'number', 'total', 'count'])
}

export const getNumberOfCategories = async () => {
  const token = useCookie('auth_token')
  let bearer = token.value || ''
  try { bearer = decodeURIComponent(bearer) } catch {}

  const res = await fetch('http://localhost:8000/api/stats/number-of-categories', {
    method: 'GET',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json', Authorization: `Bearer ${bearer}` }
  })
  const raw = await res.json()
  if (!res.ok) throw raw
    return extractCount(raw, ['number_of_categories', 'number', 'total', 'count'])
}

export const getNumberOfActions = async (criteria = {}) => {
  const token = useCookie('auth_token')
  let bearer = token.value || ''
  try { bearer = decodeURIComponent(bearer) } catch {}

  const params = new URLSearchParams()
  if (criteria.status) params.append('status', criteria.status)
  if (criteria.priority) params.append('priority', criteria.priority)
  if (criteria.category_id) params.append('category_id', criteria.category_id)
  const qs = params.toString()
  let url = 'http://localhost:8000/api/stats/number-of-actions'
  if (qs) url += `?${qs}`

  const res = await fetch(url, {
    method: 'GET',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json', Authorization: `Bearer ${bearer}` }
  })
  const raw = await res.json()
  if (!res.ok) throw raw
    return extractCount(raw, ['number_of_actions', 'number', 'total', 'count'])
}
export const getOpenTickets = async (name = '') => {
    const token = useCookie('auth_token')
    let bearer = token.value || ''
    try {
        bearer = decodeURIComponent(bearer)
    } catch {
        // keep original if decoding fails
    }

    let url = 'http://localhost:8000/api/stats/open-tickets'
    if (name) {
        url += `?name=${encodeURIComponent(name)}`
    }

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${bearer}`
        }
    })

    const raw = await response.json()
    if (!response.ok) {
        throw raw
    }

    // Expecting { success: true, data: { open_tickets_count: 5 } }
    if (raw?.data?.open_tickets_count !== undefined) return raw.data.open_tickets_count
    return 0
}



export const getPendingTickets = async (name = '') => {
    const token = useCookie('auth_token')
    let bearer = token.value || ''
    try {
        bearer = decodeURIComponent(bearer)
    } catch {
        // keep original if decoding fails
    }

    let url = 'http://localhost:8000/api/stats/pending-tickets'
    if (name) {
        url += `?name=${encodeURIComponent(name)}`
    }

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${bearer}`
        }
    })

    const raw = await response.json()
    if (!response.ok) {
        throw raw
    }

    // Expecting { success: true, data: { pending_tickets_count: 3 } }
    if (raw?.data?.pending_tickets_count !== undefined) return raw.data.pending_tickets_count
    return 0
}


export const getClosedTickets = async (name = '') => {
    const token = useCookie('auth_token')
    let bearer = token.value || ''
    try {
        bearer = decodeURIComponent(bearer)
    } catch {
        // keep original if decoding fails
    }

    let url = 'http://localhost:8000/api/stats/closed-tickets'
    if (name) {
        url += `?name=${encodeURIComponent(name)}`
    }

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${bearer}`
        }
    })

    const raw = await response.json()
    if (!response.ok) {
        throw raw
    }

    // Expecting { success: true, data: { closed_tickets_count: 2 } }
    if (raw?.data?.closed_tickets_count !== undefined) return raw.data.closed_tickets_count
    return 0
}
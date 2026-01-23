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
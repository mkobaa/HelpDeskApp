export const assignTechnician = async (ticketId, technicianId) => {
    if (!ticketId) throw new Error('Ticket id is required')

    const token = useCookie('auth_token')
    let bearer = token.value || ''
    try {
        bearer = decodeURIComponent(bearer)
    } catch {
        // keep original if decoding fails
    }

    const url = `http://localhost:8000/api/tickets/${encodeURIComponent(ticketId)}/assign`

    const response = await fetch(url, {
        method: 'PATCH',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${bearer}`
        },
        body: JSON.stringify({
            technician_id: technicianId
        })
    })

    const raw = await response.json()
    if (!response.ok) {
        throw raw
    }

    if (raw?.data) return raw.data
    return raw
}

export const reassignTechnician = async (ticketId, technicianId) => {
    if (!ticketId) throw new Error('Ticket id is required')

    const token = useCookie('auth_token')
    let bearer = token.value || ''
    try {
        bearer = decodeURIComponent(bearer)
    } catch {
        // keep original if decoding fails
    }

    const url = `http://localhost:8000/api/tickets/${encodeURIComponent(ticketId)}/reassign`

    const response = await fetch(url, {
        method: 'PATCH',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${bearer}`
        },
        body: JSON.stringify({
                technician_id: technicianId
            })
    })

    const raw = await response.json()
    if (!response.ok) {
        throw raw
    }

    if (raw?.data) return raw.data
    return raw
}

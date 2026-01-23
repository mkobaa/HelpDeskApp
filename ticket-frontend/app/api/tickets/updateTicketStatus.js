export const updateTicketStatus = async (id, status) => {
    if (!id) throw new Error('Ticket id is required')
    if (!status) throw new Error('Status is required')
    const token = useCookie('auth_token')
    let bearer = token.value || ''
    try {
        bearer = decodeURIComponent(bearer)
    } catch {
        // keep original if decoding fails
    }
    const url = `http://localhost:8000/api/tickets/${encodeURIComponent(id)}/status`

    const response = await fetch(url, {
        method: 'PUT',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${bearer}`
        },
        body: JSON.stringify({ status })
    })
    const raw = await response.json()
    if (!response.ok) {
        throw raw
    }
    if (raw?.data) return raw.data
    return raw
}
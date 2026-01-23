export const getAssignedToMe = async () => {
	const token = useCookie('auth_token')
	let bearer = token.value || ''
	try { bearer = decodeURIComponent(bearer) } catch {}

	const url = 'http://localhost:8000/api/tickets/assigned-to-me'
	const res = await fetch(url, {
		method: 'GET',
		headers: {
			Accept: 'application/json',
			Authorization: `Bearer ${bearer}`
		}
	})

	const raw = await res.json()
	if (!res.ok) throw raw
	return raw.data ?? raw
}

export default getAssignedToMe

export const acceptOrRejectTicket = async (ticketId, accept = true) => {
    if (!ticketId) throw new Error('Ticket id is required')
    const token = useCookie('auth_token')
    let bearer = token.value || ''
    try { bearer = decodeURIComponent(bearer) } catch {}
    const url = `http://localhost:8000/api/tickets/${encodeURIComponent(ticketId)}/acceptance`
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${bearer}`
        },
        body: JSON.stringify({ accept })
    })
    const raw = await response.json()
    if (!response.ok) {
        throw raw
    }
    return raw.data ?? raw
}
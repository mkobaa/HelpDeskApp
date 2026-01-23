export const respondAssignment = async (ticketId, response) => {
  if (!ticketId) throw new Error('Ticket id is required')
  if (!response) throw new Error('Response is required')

  const token = useCookie('auth_token')
  let bearer = token.value || ''
  try { bearer = decodeURIComponent(bearer) } catch {}

  // backend route: POST /api/tickets/{ticket}/acceptance
  const url = `http://localhost:8000/api/tickets/${encodeURIComponent(ticketId)}/acceptance`

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${bearer}`
    },
    body: JSON.stringify({ response })
  })

  const raw = await res.json()
  if (!res.ok) throw raw
  return raw.data ?? raw
}

export default respondAssignment

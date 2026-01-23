export const updateTicket = async (id, payload = {}) => {
  if (!id) throw new Error('Ticket id is required')

  const token = useCookie('auth_token')
  let bearer = token.value || ''
  try {
    bearer = decodeURIComponent(bearer)
  } catch {
    // keep original if decoding fails
  }

  const url = `http://localhost:8000/api/tickets/${encodeURIComponent(id)}`

  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${bearer}`
    },
    body: JSON.stringify(payload)
  })

  const raw = await response.json()
  if (!response.ok) {
    throw raw
  }

  if (raw?.data) return raw.data
  return raw
}

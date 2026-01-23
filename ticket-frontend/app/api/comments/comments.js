export const getComments = async (ticketId) => {
  if (!ticketId) throw new Error('Ticket id is required')

  const token = useCookie('auth_token')
  let bearer = token.value || ''
  try {
    bearer = decodeURIComponent(bearer)
  } catch {}

  const url = `http://localhost:8000/api/tickets/${encodeURIComponent(ticketId)}/comments`

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${bearer}`
    }
  })

  const raw = await response.json()
  if (!response.ok) throw raw

  return raw.data ?? raw
}

export const addComment = async (ticketId, payload) => {
  if (!ticketId) throw new Error('Ticket id is required')
  if (!payload) throw new Error('Comment payload is required')

  const token = useCookie('auth_token')
  let bearer = token.value || ''
  try {
    bearer = decodeURIComponent(bearer)
  } catch {}

  const url = `http://localhost:8000/api/tickets/${encodeURIComponent(ticketId)}/comments`

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${bearer}`
    },
    body: JSON.stringify(payload)
  })

  const raw = await response.json()
  if (!response.ok) throw raw

  return raw.data ?? raw
}

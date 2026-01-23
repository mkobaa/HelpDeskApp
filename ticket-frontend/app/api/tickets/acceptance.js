export const isPending = async (ticketId) => {
  if (!ticketId) throw new Error('Ticket id is required')
  const token = useCookie('auth_token')
  let bearer = token.value || ''
  try { bearer = decodeURIComponent(bearer) } catch {}

  const url = `http://localhost:8000/api/tickets/${encodeURIComponent(ticketId)}/acceptance/is-pending`
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${bearer}`
    }
  })
  const raw = await res.json()
  if (!res.ok) throw raw
  return raw
}

export const accept = async (ticketId) => {
  if (!ticketId) throw new Error('Ticket id is required')
  const token = useCookie('auth_token')
  let bearer = token.value || ''
  try { bearer = decodeURIComponent(bearer) } catch {}

  const url = `http://localhost:8000/api/tickets/${encodeURIComponent(ticketId)}/accept`
  const res = await fetch(url, { method: 'POST', headers: { Accept: 'application/json', Authorization: `Bearer ${bearer}` } })
  const raw = await res.json()
  if (!res.ok) throw raw
  return raw
}

export const reject = async (ticketId) => {
  if (!ticketId) throw new Error('Ticket id is required')
  const token = useCookie('auth_token')
  let bearer = token.value || ''
  try { bearer = decodeURIComponent(bearer) } catch {}

  const url = `http://localhost:8000/api/tickets/${encodeURIComponent(ticketId)}/reject`
  const res = await fetch(url, { method: 'POST', headers: { Accept: 'application/json', Authorization: `Bearer ${bearer}` } })
  const raw = await res.json()
  if (!res.ok) throw raw
  return raw
}

export default { isPending, accept, reject }

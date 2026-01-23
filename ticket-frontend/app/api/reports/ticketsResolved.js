export const getTicketsResolved = async (criteria = {}) => {
  const token = useCookie('auth_token')
  let bearer = token.value || ''
  try { bearer = decodeURIComponent(bearer) } catch {}

  const params = new URLSearchParams()
  if (criteria.from) params.append('from', criteria.from)
  if (criteria.to) params.append('to', criteria.to)
  if (criteria.technician_id || criteria.technician) params.append('technician_id', criteria.technician_id ?? criteria.technician)
  if (criteria.priority) params.append('priority', criteria.priority)

  let url = 'http://localhost:8000/api/reports/tickets-resolved'
  const qs = params.toString()
  if (qs) url += `?${qs}`

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${bearer}`
    }
  })

  const raw = await response.json()
  if (!response.ok) throw raw
  return raw?.data ?? raw
}

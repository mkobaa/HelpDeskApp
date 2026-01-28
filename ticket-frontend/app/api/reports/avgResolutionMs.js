export const getAverageResolutionTime = async (criteria = {}) => {
  const token = useCookie('auth_token')
  let bearer = token.value || ''
  try {
    bearer = decodeURIComponent(bearer)
  } catch {}

  const params = new URLSearchParams()
  if (criteria.range) params.append('range', criteria.range)
  if (criteria.from) params.append('from', criteria.from)
  if (criteria.to) params.append('to', criteria.to)
  if (criteria.status) params.append('status', criteria.status)
  if (criteria.technician) params.append('technician', criteria.technician)

  const config = useRuntimeConfig()
  const API_BASE = config.public?.apiBase || 'http://localhost:8000'
  let url = `${API_BASE}/api/reports/average-resolution-time`
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

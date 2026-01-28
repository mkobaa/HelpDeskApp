export const getSolutionTimeTrends = async (criteria = {}) => {
  const token = useCookie('auth_token')
  let bearer = token.value || ''
  try { bearer = decodeURIComponent(bearer) } catch {}

  const params = new URLSearchParams()
  if (criteria.from) params.append('from', criteria.from)
  if (criteria.to) params.append('to', criteria.to)

  const config = useRuntimeConfig()
  const API_BASE = config.public?.apiBase || 'http://localhost:8000'
  let url = `${API_BASE}/api/reports/solution-time-trends`
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
  return { labels: raw.labels ?? raw.data?.labels ?? [], values: raw.values ?? raw.data?.values ?? [] }
}

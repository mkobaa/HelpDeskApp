export const getSurveys = async (criteria = {}) => {
  const token = useCookie('auth_token')
  let bearer = token.value || ''
  try {
    bearer = decodeURIComponent(bearer)
  } catch {}

  const params = new URLSearchParams()
  if (criteria.page) params.append('page', String(criteria.page))
  if (criteria.per_page) params.append('per_page', String(criteria.per_page))

  let url = 'http://localhost:8000/api/tickets/survey'
  const qs = params.toString()
  if (qs) url += `?${qs}`

  const res = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${bearer}`
    }
  })
  const raw = await res.json().catch(() => null)
  if (!res.ok) throw raw || new Error('Failed to fetch surveys')
  if (criteria._raw) return raw
  // normalize: support paginated shape { data: { data: [...], ...meta } }
  if (raw?.data?.data && Array.isArray(raw.data.data)) return raw.data.data
  if (Array.isArray(raw?.data)) return raw.data
  if (Array.isArray(raw)) return raw
  return []
}

export default getSurveys

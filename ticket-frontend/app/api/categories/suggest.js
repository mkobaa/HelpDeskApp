import { getCategories } from './categories'

export const suggestCategories = async (q) => {
  // If query is empty or short, return the full category list so the user can pick
  if (!q || String(q).length < 2) {
    try {
      return await getCategories('')
    } catch (e) {
      return []
    }
  }

  const token = useCookie('auth_token')
  let bearer = token.value || ''
  try {
    bearer = decodeURIComponent(bearer)
  } catch {
    // keep original if decoding fails
  }

  const url = `http://localhost:8000/api/categories/suggest?q=${encodeURIComponent(q)}`
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

  // Expecting { data: [ { id, name }, ... ] }
  if (Array.isArray(raw)) return raw
  if (Array.isArray(raw.data)) return raw.data
  if (Array.isArray(raw.categories)) return raw.categories
  return []
}

export default suggestCategories

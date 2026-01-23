export const updateCategory = async (id, { name, description, parent_category_id }) => {
  const token = useCookie('auth_token')
  let bearer = token.value || ''
  try {
    bearer = decodeURIComponent(bearer)
  } catch {
    // keep original if decoding fails
  }

  const response = await fetch(`http://localhost:8000/api/categories/${id}`, {
    method: 'PUT',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${bearer}`
    },
    body: JSON.stringify({ name, description, parent_category_id })
  })

  const raw = await response.json()
  if (!response.ok) {
    throw raw
  }

  return raw?.data || raw
}

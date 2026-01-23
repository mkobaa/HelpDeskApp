export const updateUser = async (id, { username, email, password, role, department }) => {
  const token = useCookie('auth_token')
  let bearer = token.value || ''
  try {
    bearer = decodeURIComponent(bearer)
  } catch {
    // keep original if decoding fails
  }

  const response = await fetch(`http://localhost:8000/api/users/${id}`, {
    method: 'PUT',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${bearer}`
    },
    body: JSON.stringify({ username, email, password, role, department })
  })

  const raw = await response.json()
  if (!response.ok) {
    throw raw
  }

  return raw?.data || raw
}

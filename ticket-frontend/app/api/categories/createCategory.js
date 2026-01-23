export const createCategory = async ({ name, description, parentId }) => {
  const token = useCookie('auth_token')
  let bearer = token.value || ''
  try {
    bearer = decodeURIComponent(bearer)
  } catch {
    // keep original if decoding fails
  }
  const role = useCookie('user_role').value
  const allowedRoles = ['user', 'technician', 'supervisor', 'admin']
  if (role && !allowedRoles.includes(role)) {
    throw new Error('Invalid role. Allowed roles: user, technician, supervisor, admin')
  }

  const response = await fetch('http://localhost:8000/api/categories', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${bearer}`
    },
    body: JSON.stringify({
        name,
        description,
        parent_category_id: parentId || null
    })
  })

  const data = await response.json()
  if (!response.ok) {
    throw data
  }

  return data
}

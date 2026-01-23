export const createUser = async ({ username, email, password, role, department }) => {
  const token = useCookie('auth_token')
  let bearer = token.value || ''
  try {
    bearer = decodeURIComponent(bearer)
  } catch {
    // keep original if decoding fails
  }

  const allowedRoles = ['user', 'technician', 'supervisor', 'admin']
  if (role && !allowedRoles.includes(role)) {
    throw new Error('Invalid role. Allowed roles: user, technician, supervisor, admin')
  }

  const response = await fetch('http://localhost:8000/api/users', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${bearer}`
    },
    body: JSON.stringify({
      username,
      email,
      password,
      role,
      department
    })
  })

  const data = await response.json()
  if (!response.ok) {
    throw data
  }

  return data
}

export const getProfile = async () => {
  const token = useCookie('auth_token')
  let bearer = token.value || ''

  try {
    bearer = decodeURIComponent(bearer)
  } catch {}

  const response = await fetch('http://localhost:8000/api/me', {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${bearer}`
    }
  })

  const raw = await response.json()

  if (!response.ok) {
    throw raw
  }

  return raw
}

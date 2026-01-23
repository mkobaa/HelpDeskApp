import { useCookie } from 'nuxt/app'

const getAuthToken = () => {
  const token = useCookie('auth_token')
  let bearer = token.value || ''
  try {
    bearer = decodeURIComponent(bearer)
  } catch {
    // keep original if decoding fails
  }
  return bearer
}

export const fetchNotifications = async () => {
  const bearer = getAuthToken()
  const res = await fetch('http://localhost:8000/api/notifications', {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${bearer}`
    }
  })

  if (!res.ok) {
    const err = await res.json()
    throw err
  }

  return res.json()
}

export const markNotificationRead = async (id) => {
  if (!id) throw new Error('Notification id is required')
  const bearer = getAuthToken()
  const res = await fetch(`http://localhost:8000/api/notifications/${id}/read`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${bearer}`
    }
  })

  const data = await res.json()
  if (!res.ok) {
    throw data
  }
  return data
}

export const markAllNotificationsRead = async () => {
  const bearer = getAuthToken()
  const res = await fetch('http://localhost:8000/api/notifications/read-all', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${bearer}`
    }
  })

  const data = await res.json()
  if (!res.ok) {
    throw data
  }
  return data
}

export const getUsers = async (criteria = {}) => {
    const token = useCookie('auth_token')
    let bearer = token.value || ''
    try {
        bearer = decodeURIComponent(bearer)
    } catch {
        // keep original if decoding fails
    }

    const params = new URLSearchParams()
    if (criteria.page) params.append('page', String(criteria.page))
    if (criteria.per_page) params.append('per_page', String(criteria.per_page))
    if (criteria.search) params.append('search', criteria.search)

    let url = 'http://localhost:8000/api/users'
    const queryString = params.toString()
    if (queryString) url += `?${queryString}`

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${bearer}`
        }
    })

    const raw = await response.json().catch(() => null)
    if (!response.ok) {
        throw raw
    }
    if (criteria._raw) return raw

    // Normalize to an array for the table component
    if (Array.isArray(raw)) return raw
    if (Array.isArray(raw.data)) return raw.data
    if (Array.isArray(raw.users)) return raw.users

    return []
}

export const getUser = async (id) => {
    const token = useCookie('auth_token')
    let bearer = token.value || ''
    try {
        bearer = decodeURIComponent(bearer)
    } catch {
        // keep original if decoding fails
    }

    const response = await fetch(`http://localhost:8000/api/users/${id}`, {
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

    return raw?.data || raw
}



export const getTechnicians = async () => {
    const token = useCookie('auth_token')
    let bearer = token.value || ''
    try {
        bearer = decodeURIComponent(bearer)
    } catch {
        // keep original if decoding fails
    }

    const response = await fetch('http://localhost:8000/api/users/technicians', {
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

    // Normalize to an array for the table component
    if (Array.isArray(raw)) return raw
    if (Array.isArray(raw.data)) return raw.data
    if (Array.isArray(raw.users)) return raw.users

    return []
}


export const getTechnician = async (id) => {
    const token = useCookie('auth_token')
    let bearer = token.value || ''
    try {
        bearer = decodeURIComponent(bearer)
    } catch {
        // keep original if decoding fails
    }

    const response = await fetch(`http://localhost:8000/api/users/technicians/${id}`, {
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

    return raw?.data || raw
}
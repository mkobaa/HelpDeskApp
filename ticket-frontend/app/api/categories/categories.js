export const getCategories = async (name = '') => {
    const token = useCookie('auth_token')
    let bearer = token.value || ''
    try {
        bearer = decodeURIComponent(bearer)
    } catch {
        // keep original if decoding fails
    }

    let url = 'http://localhost:8000/api/categories'
    if (name) {
        url += `?name=${encodeURIComponent(name)}`
    }

    const response = await fetch(url, {
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
    if (Array.isArray(raw.categories)) return raw.categories

    return []
}



export const getCategory = async (id) => {
    const token = useCookie('auth_token')
    let bearer = token.value || ''
    try {
        bearer = decodeURIComponent(bearer)
    } catch {
        // keep original if decoding fails
    }
    const response = await fetch(`http://localhost:8000/api/categories/${id}`, {
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



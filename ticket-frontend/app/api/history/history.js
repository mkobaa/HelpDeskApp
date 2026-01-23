export const getHistory = async (criteria = {}) => {
    const token = useCookie('auth_token')
    let bearer = token.value || ''
    try {
        bearer = decodeURIComponent(bearer)
    } catch {
        // keep original if decoding fails
    }

    const params = new URLSearchParams()
    if (criteria.status) params.append('status', criteria.status)
    if (criteria.priority) params.append('priority', criteria.priority)
    if (criteria.category_id) params.append('category_id', criteria.category_id)

    // Support legacy name parameter if passed as string, though unlikely given typescript usage elsewhere
    if (typeof criteria === 'string') {
        params.append('name', criteria)
    } else if (criteria.name) {
        params.append('name', criteria.name)
    }

    let url = 'http://localhost:8000/api/history/logs'
    const queryString = params.toString()
    if (queryString) {
        url += `?${queryString}`
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
    // Support paginated API: { data: { data: [...] } }
    if (raw?.data?.data && Array.isArray(raw.data.data)) return raw.data.data
    if (Array.isArray(raw)) return raw
    if (Array.isArray(raw.data)) return raw.data
    if (Array.isArray(raw.tickets)) return raw.tickets
    return []
}
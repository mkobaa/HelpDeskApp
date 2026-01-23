export const activateUser = async (userId) => {
	if (!userId) throw new Error('User id is required')
	const token = useCookie('auth_token')
	let bearer = token.value || ''
	try { bearer = decodeURIComponent(bearer) } catch {}

	const url = `http://localhost:8000/api/users/${encodeURIComponent(userId)}/activate`
	const res = await fetch(url, {
		method: 'PATCH',
		headers: {
			Accept: 'application/json',
			'Content-Type': 'application/json',
			Authorization: `Bearer ${bearer}`
		}
	})
	const raw = await res.json()
	if (!res.ok) throw raw
	return raw?.data ?? raw
}

export const deactivateUser = async (userId) => {
	if (!userId) throw new Error('User id is required')
	const token = useCookie('auth_token')
	let bearer = token.value || ''
	try { bearer = decodeURIComponent(bearer) } catch {}

	const url = `http://localhost:8000/api/users/${encodeURIComponent(userId)}/deactivate`
	const res = await fetch(url, {
		method: 'PATCH',
		headers: {
			Accept: 'application/json',
			'Content-Type': 'application/json',
			Authorization: `Bearer ${bearer}`
		}
	})
	const raw = await res.json()
	if (!res.ok) throw raw
	return raw?.data ?? raw
}

export const getAccountStatus = async (userId) => {
	if (!userId) throw new Error('User id is required')
	const token = useCookie('auth_token')
	let bearer = token.value || ''
	try { bearer = decodeURIComponent(bearer) } catch {}

	const url = `http://localhost:8000/api/users/${encodeURIComponent(userId)}/account-status`
	const res = await fetch(url, {
		method: 'GET',
		headers: {
			Accept: 'application/json',
			'Content-Type': 'application/json',
			Authorization: `Bearer ${bearer}`
		}
	})
	const raw = await res.json()
	if (!res.ok) throw raw
	return raw?.data ?? raw
}

export default { activateUser, deactivateUser, getAccountStatus }


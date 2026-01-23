export const login = async (email, password) => {
    const requestBody = { email, password }

    return $fetch('http://localhost:8000/api/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: requestBody
    })
}

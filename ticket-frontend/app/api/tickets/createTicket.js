export const createTicket = async ({ title, description, priority, status, category_id, submitter_id, assigned_to_id, attachments }) => {
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


  const formData = new FormData();
  formData.append('title', title);
  if (description) formData.append('description', description);
  formData.append('priority', priority);
  if (status) formData.append('status', status);
  if (category_id) formData.append('category_id', category_id);
  if (submitter_id) formData.append('submitter_id', submitter_id);
  if (assigned_to_id) formData.append('assigned_tech_id', assigned_to_id);
  if (attachments && attachments.length) {
    attachments.forEach(file => {
      formData.append('attachments[]', file);
    });
  }

  const response = await fetch('http://localhost:8000/api/tickets', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${bearer}`
      // Note: Do not set Content-Type, browser will set it with boundary
    },
    body: formData
  })

  const data = await response.json()
  if (!response.ok) {
    throw data
  }

  return data
}

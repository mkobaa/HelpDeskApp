import { b as useCookie } from './server.mjs';

const getUsers = async () => {
  const token = useCookie("auth_token");
  let bearer = token.value || "";
  try {
    bearer = decodeURIComponent(bearer);
  } catch {
  }
  const response = await fetch("http://localhost:8000/api/users", {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${bearer}`
    }
  });
  const raw = await response.json();
  if (!response.ok) {
    throw raw;
  }
  if (Array.isArray(raw)) return raw;
  if (Array.isArray(raw.data)) return raw.data;
  if (Array.isArray(raw.users)) return raw.users;
  return [];
};
const getUser = async (id) => {
  const token = useCookie("auth_token");
  let bearer = token.value || "";
  try {
    bearer = decodeURIComponent(bearer);
  } catch {
  }
  const response = await fetch(`http://localhost:8000/api/users/${id}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${bearer}`
    }
  });
  const raw = await response.json();
  if (!response.ok) {
    throw raw;
  }
  return raw?.data || raw;
};
const getTechnicians = async () => {
  const token = useCookie("auth_token");
  let bearer = token.value || "";
  try {
    bearer = decodeURIComponent(bearer);
  } catch {
  }
  const response = await fetch("http://localhost:8000/api/users/technicians", {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${bearer}`
    }
  });
  const raw = await response.json();
  if (!response.ok) {
    throw raw;
  }
  if (Array.isArray(raw)) return raw;
  if (Array.isArray(raw.data)) return raw.data;
  if (Array.isArray(raw.users)) return raw.users;
  return [];
};
const getTechnician = async (id) => {
  const token = useCookie("auth_token");
  let bearer = token.value || "";
  try {
    bearer = decodeURIComponent(bearer);
  } catch {
  }
  const response = await fetch(`http://localhost:8000/api/users/technicians/${id}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${bearer}`
    }
  });
  const raw = await response.json();
  if (!response.ok) {
    throw raw;
  }
  return raw?.data || raw;
};

export { getUsers as a, getTechnicians as b, getTechnician as c, getUser as g };
//# sourceMappingURL=users-DRTWlAv4.mjs.map

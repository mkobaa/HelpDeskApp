import { b as useCookie } from './server.mjs';

const getTickets = async (criteria = {}) => {
  const token = useCookie("auth_token");
  let bearer = token.value || "";
  try {
    bearer = decodeURIComponent(bearer);
  } catch {
  }
  const params = new URLSearchParams();
  if (criteria.status) params.append("status", criteria.status);
  if (criteria.priority) params.append("priority", criteria.priority);
  if (criteria.category_id) params.append("category_id", criteria.category_id);
  if (criteria.page) params.append("page", String(criteria.page));
  if (criteria.per_page) params.append("per_page", String(criteria.per_page));
  if (typeof criteria === "string") {
    params.append("name", criteria);
  } else if (criteria.name) {
    params.append("name", criteria.name);
  }
  let url = "http://localhost:8000/api/tickets";
  const queryString = params.toString();
  if (queryString) {
    url += `?${queryString}`;
  }
  const response = await fetch(url, {
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
  if (criteria._raw) return raw;
  if (raw?.data?.data && Array.isArray(raw.data.data)) return raw.data.data;
  if (Array.isArray(raw)) return raw;
  if (Array.isArray(raw.data)) return raw.data;
  if (Array.isArray(raw.tickets)) return raw.tickets;
  return [];
};
const getTicketById = async (id) => {
  if (!id) return null;
  const token = useCookie("auth_token");
  let bearer = token.value || "";
  try {
    bearer = decodeURIComponent(bearer);
  } catch {
  }
  const url = `http://localhost:8000/api/tickets/${encodeURIComponent(id)}`;
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${bearer}`
      }
    });
    const raw = await response.json();
    if (!response.ok) {
      console.error("getTicketById failed", raw);
      return null;
    }
    if (raw?.data) return raw.data;
    if (raw?.ticket) return raw.ticket;
    return raw ?? null;
  } catch (err) {
    console.error("getTicketById network error", err);
    return null;
  }
};
const getTechniciansWorkload = async () => {
  const token = useCookie("auth_token");
  let bearer = token.value || "";
  try {
    bearer = decodeURIComponent(bearer);
  } catch {
  }
  const url = "http://localhost:8000/api/technicians/workloads";
  const response = await fetch(url, {
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
  if (Array.isArray(raw?.data)) return raw.data;
  return [];
};
const getAssignedTickets = async (technicianId) => {
  const token = useCookie("auth_token");
  let bearer = token.value || "";
  try {
    bearer = decodeURIComponent(bearer);
  } catch {
  }
  const url = `http://localhost:8000/api/technicians/${encodeURIComponent(technicianId)}/assigned-tickets`;
  const response = await fetch(url, {
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
  if (Array.isArray(raw?.data?.data)) return raw.data.data;
  if (Array.isArray(raw?.data)) return raw.data;
  if (Array.isArray(raw?.tickets)) return raw.tickets;
  if (Array.isArray(raw)) return raw;
  return [];
};

export { getTickets as a, getAssignedTickets as b, getTechniciansWorkload as c, getTicketById as g };
//# sourceMappingURL=tickets-BxG6Zsyw.mjs.map

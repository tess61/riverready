// Fetch wrapper: JSON in/out, abort support, every failure normalised to
// { status, code, message, fields } so UI code handles one error shape.
const BASE = (import.meta.env.VITE_API_BASE || '/api').replace(/\/$/, '');

export class ApiError extends Error {
  constructor({ status = 0, code = 'NETWORK_ERROR', message = 'Something went wrong.', fields = {} }) {
    super(message);
    this.status = status;
    this.code = code;
    this.fields = fields;
  }
}

export async function request(path, { method = 'GET', body, signal } = {}) {
  let res;
  try {
    res = await fetch(BASE + path, {
      method,
      signal,
      headers: body !== undefined ? { 'Content-Type': 'application/json', Accept: 'application/json' } : { Accept: 'application/json' },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (e) {
    if (e.name === 'AbortError') throw e; // callers ignore aborts
    throw new ApiError({ message: 'Could not reach the server. Check your connection and try again.' });
  }
  if (res.status === 204) return null;
  let json = null;
  try { json = await res.json(); } catch { /* non-JSON body */ }
  if (!res.ok) {
    const e = json && json.error ? json.error : {};
    throw new ApiError({
      status: res.status,
      code: e.code || 'HTTP_ERROR',
      message: e.message || `Request failed (${res.status}).`,
      fields: e.fields || {},
    });
  }
  return json;
}

const enc = encodeURIComponent;
export const api = {
  searchStations: (search, signal, limit = 20) => request(`/stations?search=${enc(search)}&limit=${limit}`, { signal }),
  getStation: (ref, signal) => request(`/stations/${enc(ref)}`, { signal }),
  listLocations: (signal) => request('/locations', { signal }),
  getLocation: (id, signal) => request(`/locations/${enc(id)}`, { signal }),
  createLocation: (body) => request('/locations', { method: 'POST', body }),
  updateLocation: (id, body) => request(`/locations/${enc(id)}`, { method: 'PUT', body }),
  deleteLocation: (id) => request(`/locations/${enc(id)}`, { method: 'DELETE' }),
  getReadings: (measureId, hours, signal) => request(`/measures/${enc(measureId)}/readings?hours=${hours}`, { signal }),
  createAction: (locationId, body) => request(`/locations/${enc(locationId)}/actions`, { method: 'POST', body }),
  updateAction: (id, body) => request(`/actions/${enc(id)}`, { method: 'PUT', body }),
  deleteAction: (id) => request(`/actions/${enc(id)}`, { method: 'DELETE' }),
  getOverview: (id, signal) => request(`/locations/${enc(id)}/overview`, { signal }),
};

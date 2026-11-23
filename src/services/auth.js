import { API_BASE_URL, useMockData } from './api.js'

export async function register(data) {
  if (useMockData) {
    const user = { id: 'mock-id', name: data.name, email: data.email, role: 'LANDLORD' }
    localStorage.setItem('rentsetu-demo-user', JSON.stringify(user))
    return { user, token: 'mock-token' }
  }
  const resp = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  const json = await resp.json()
  if (!resp.ok) throw new Error(json.error?.message || 'Registration failed')
  return json.data
}

export async function login(data) {
  if (useMockData) {
    const user = { id: `demo-${data.role || 'LANDLORD'}`, name: data.email.split('@')[0], email: data.email, role: data.role || 'LANDLORD' }
    localStorage.setItem('rentsetu-demo-user', JSON.stringify(user))
    return { user, token: 'mock-token' }
  }
  const resp = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  const json = await resp.json()
  if (!resp.ok) throw new Error(json.error?.message || 'Login failed')
  return json.data
}

export async function getMe(token) {
  if (useMockData) return JSON.parse(localStorage.getItem('rentsetu-demo-user') || '{"id":"mock-id","name":"Demo User","role":"LANDLORD"}')
  const resp = await fetch(`${API_BASE_URL}/auth/me`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  })
  const json = await resp.json()
  if (!resp.ok) {
    const error = new Error(json.error?.message || 'Failed to fetch profile')
    error.status = resp.status
    throw error
  }
  return json.data
}

export async function changePassword(token, data) {
  if (useMockData) return { message: 'Password changed (mock)' }
  const resp = await fetch(`${API_BASE_URL}/auth/change-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  })
  const json = await resp.json()
  if (!resp.ok) throw new Error(json.error?.message || 'Password change failed')
  return json.data
}

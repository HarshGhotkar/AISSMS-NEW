export const API_URL = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000'

export function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('token')
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

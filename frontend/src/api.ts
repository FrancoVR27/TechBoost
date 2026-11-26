export const API_URL: string =
  import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

const TOKEN_KEY = 'techboost.token'
export const UNAUTHORIZED_EVENT = 'techboost:unauthorized'

export interface User {
  usuarioId: string
  nombre: string
  apellido: string
  correo: string
  rol: 'Admin' | 'Cliente'
  planId: number | null
  estado: 'activo' | 'suspendido' | 'prueba'
}

export interface Session {
  accessToken: string
  tokenType: 'Bearer'
  expiresIn: number
  user: User
}

export const tokenStore = {
  get(): string | null {
    try {
      return localStorage.getItem(TOKEN_KEY)
    } catch {
      return null
    }
  },
  set(token: string): void {
    try {
      localStorage.setItem(TOKEN_KEY, token)
    } catch {
      /* almacenamiento no disponible: la sesión durará solo esta pestaña */
    }
  },
  clear(): void {
    try {
      localStorage.removeItem(TOKEN_KEY)
    } catch {
      /* nada que limpiar */
    }
  },
}

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

function extractMessage(body: unknown, fallback: string): string {
  if (body && typeof body === 'object' && 'message' in body) {
    const message = (body as { message: unknown }).message
    if (typeof message === 'string') return message
    if (Array.isArray(message)) return message.join(', ')
  }
  return fallback
}

export async function apiFetch<T>(
  path: string,
  options: { method?: string; body?: unknown } = {},
): Promise<T> {
  const token = tokenStore.get()
  const headers: Record<string, string> = {}
  if (options.body !== undefined) headers['Content-Type'] = 'application/json'
  if (token) headers.Authorization = `Bearer ${token}`

  let response: Response
  try {
    response = await fetch(`${API_URL}${path}`, {
      method: options.method ?? 'GET',
      headers,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    })
  } catch {
    throw new ApiError('No se pudo conectar con el servidor', 0)
  }

  const data: unknown = await response.json().catch(() => null)

  if (!response.ok) {
    // Token vencido o revocado: se cierra la sesión local (no aplica al login fallido).
    if (response.status === 401 && token) {
      tokenStore.clear()
      window.dispatchEvent(new Event(UNAUTHORIZED_EVENT))
    }
    throw new ApiError(
      extractMessage(data, 'Ocurrió un error inesperado'),
      response.status,
    )
  }

  return data as T
}

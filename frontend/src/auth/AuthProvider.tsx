import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import {
  apiFetch,
  tokenStore,
  UNAUTHORIZED_EVENT,
  type Session,
  type User,
} from '../api.ts'
import { AuthContext } from './AuthContext.ts'
import type { AuthContextValue, RegisterData } from './AuthContext.ts'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  // Si hay token guardado, se espera a validarlo con /auth/me antes de mostrar nada.
  const [loading, setLoading] = useState<boolean>(() => tokenStore.get() !== null)

  useEffect(() => {
    if (!tokenStore.get()) return

    let cancelled = false
    apiFetch<User>('/auth/me')
      .then((me) => {
        if (!cancelled) setUser(me)
      })
      .catch(() => tokenStore.clear())
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    const onUnauthorized = () => setUser(null)
    window.addEventListener(UNAUTHORIZED_EVENT, onUnauthorized)
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, onUnauthorized)
  }, [])

  const startSession = useCallback((session: Session) => {
    tokenStore.set(session.accessToken)
    setUser(session.user)
  }, [])

  const login = useCallback(
    async (correo: string, contrasena: string) => {
      const session = await apiFetch<Session>('/auth/login', {
        method: 'POST',
        body: { correo, contrasena },
      })
      startSession(session)
    },
    [startSession],
  )

  const register = useCallback(
    async (data: RegisterData) => {
      const session = await apiFetch<Session>('/auth/register', {
        method: 'POST',
        body: data,
      })
      startSession(session)
    },
    [startSession],
  )

  const logout = useCallback(() => {
    tokenStore.clear()
    setUser(null)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({ user, loading, login, register, logout }),
    [user, loading, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

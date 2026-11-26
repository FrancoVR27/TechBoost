import { createContext } from 'react'
import type { User } from '../api.ts'

export interface RegisterData {
  nombre: string
  apellido: string
  correo: string
  contrasena: string
}

export interface AuthContextValue {
  user: User | null
  loading: boolean
  login: (correo: string, contrasena: string) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)

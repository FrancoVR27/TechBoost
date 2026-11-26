import { useState } from 'react'
import type { SyntheticEvent } from 'react'
import { ApiError } from '../api.ts'
import Brand from './Brand.tsx'
import { useAuth } from './useAuth.ts'
import './auth.css'

type Mode = 'login' | 'register'

const MODULES: { name: string; code: string; on: boolean }[] = [
  { name: 'Finanzas y flujo de caja', code: 'A1', on: true },
  { name: 'Costos por producto', code: 'A2', on: true },
  { name: 'Personal y destajo', code: 'A3', on: true },
  { name: 'Marketing e inteligencia de mercados', code: 'A4', on: true },
  { name: 'Monitoreo de maquinaria', code: 'P1', on: false },
  { name: 'Mantenimiento predictivo', code: 'P2', on: false },
]

export default function LoginPage() {
  const { login, register } = useAuth()
  const [mode, setMode] = useState<Mode>('login')
  const [nombre, setNombre] = useState('')
  const [apellido, setApellido] = useState('')
  const [correo, setCorreo] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [confirmacion, setConfirmacion] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const isRegister = mode === 'register'

  function switchMode() {
    setMode(isRegister ? 'login' : 'register')
    setError(null)
    setConfirmacion('')
  }

  async function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    if (isRegister) {
      if (contrasena.length < 8) {
        setError('La contraseña debe tener al menos 8 caracteres')
        return
      }
      if (contrasena !== confirmacion) {
        setError('Las contraseñas no coinciden')
        return
      }
    }

    setSubmitting(true)
    try {
      if (isRegister) await register({ nombre, apellido, correo, contrasena })
      else await login(correo, contrasena)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Error inesperado')
      setSubmitting(false)
    }
  }

  return (
    <>
      <header className="top">
        <div className="wrap">
          <Brand />
        </div>
      </header>

      <main className="hero tb-login">
        <div className="wrap">
          <div className="tb-pitch">
            <span className="eyebrow">Transformación inteligente de industrias</span>
            <h1>
              Tu negocio, armado <em>módulo a módulo.</em>
            </h1>
            <p className="lead">
              Registra tu operación, conoce el costo real de cada producto y decide con datos. Empiezas
              por el celular y creces hasta automatizar con inteligencia artificial.
            </p>
            <div className="tile-grid" aria-label="Módulos de la plataforma">
              {MODULES.map((m) => (
                <div key={m.code} className={m.on ? 'tile on' : 'tile soon'}>
                  <span className={m.code.startsWith('P') ? 'code p' : 'code'}>{m.code}</span>
                  <span>{m.name}</span>
                </div>
              ))}
            </div>
            <p className="tb-note">A = administrativo · P = productivo (próximamente)</p>
          </div>

          <section className="tb-card" aria-labelledby="tb-title">
            <h2 id="tb-title">{isRegister ? 'Crea tu cuenta' : 'Inicia sesión'}</h2>
            <p className="tb-sub">
              {isRegister
                ? 'Empieza gratis: registra tu negocio y mira tus números.'
                : 'Accede al panel de tu negocio.'}
            </p>

            <form onSubmit={handleSubmit} noValidate>
              {isRegister && (
                <div className="tb-row">
                  <label>
                    Nombre
                    <input className="in" value={nombre} onChange={(e) => setNombre(e.target.value)} autoComplete="given-name" required />
                  </label>
                  <label>
                    Apellido
                    <input className="in" value={apellido} onChange={(e) => setApellido(e.target.value)} autoComplete="family-name" required />
                  </label>
                </div>
              )}

              <label>
                Correo electrónico
                <input className="in" type="email" value={correo} onChange={(e) => setCorreo(e.target.value)} autoComplete="email" required />
              </label>

              <label>
                Contraseña
                <div className="tb-password">
                  <input
                    className="in"
                    type={showPassword ? 'text' : 'password'}
                    value={contrasena}
                    onChange={(e) => setContrasena(e.target.value)}
                    autoComplete={isRegister ? 'new-password' : 'current-password'}
                    required
                  />
                  <button type="button" className="tb-link" onClick={() => setShowPassword((v) => !v)} aria-pressed={showPassword}>
                    {showPassword ? 'Ocultar' : 'Mostrar'}
                  </button>
                </div>
              </label>

              {isRegister && (
                <label>
                  Repite la contraseña
                  <input
                    className="in"
                    type={showPassword ? 'text' : 'password'}
                    value={confirmacion}
                    onChange={(e) => setConfirmacion(e.target.value)}
                    autoComplete="new-password"
                    required
                  />
                </label>
              )}

              {error && (
                <p className="tb-error" role="alert">
                  {error}
                </p>
              )}

              <button type="submit" className="btn btn-accent" disabled={submitting}>
                {submitting ? 'Un momento…' : isRegister ? 'Crear cuenta' : 'Entrar'}
              </button>
            </form>

            <p className="tb-switch">
              {isRegister ? '¿Ya tienes cuenta?' : '¿Aún no tienes cuenta?'}{' '}
              <button type="button" className="tb-link" onClick={switchMode}>
                {isRegister ? 'Inicia sesión' : 'Regístrate gratis'}
              </button>
            </p>
          </section>
        </div>
      </main>

      <footer className="tb-foot">
        <div className="wrap">
          <span>
            <em>«Transformación inteligente de industrias»</em> · La Paz, Bolivia
          </span>
          <span>Proyecto de emprendimiento · UMSA · 2026</span>
        </div>
      </footer>
    </>
  )
}

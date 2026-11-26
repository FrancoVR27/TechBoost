import { AuthProvider } from './auth/AuthProvider.tsx'
import Brand from './auth/Brand.tsx'
import LoginPage from './auth/LoginPage.tsx'
import { useAuth } from './auth/useAuth.ts'
import './auth/auth.css'

const PANELS = [
  { code: 'A1', name: 'Finanzas y flujo de caja' },
  { code: 'A2', name: 'Costos por producto' },
  { code: 'A3', name: 'Personal y trabajo a destajo' },
  { code: 'A4', name: 'Marketing e inteligencia de mercados' },
]

function Shell() {
  const { user, loading, logout } = useAuth()

  if (loading) {
    return <p style={{ padding: 32 }}>Cargando…</p>
  }
  if (!user) {
    return <LoginPage />
  }

  // Panel provisional: aquí irán los módulos financiero, marketing/BI y RR.HH.
  return (
    <>
      <header className="top">
        <div className="wrap">
          <Brand />
          <div className="tb-who">
            <span>
              {user.nombre} {user.apellido}
            </span>
            <span className="mono">{user.rol}</span>
            <button type="button" className="btn btn-line btn-sm" onClick={logout}>
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      <section className="hero tb-dash">
        <div className="wrap">
          <span className="eyebrow">Panel de tu negocio</span>
          <h1>Hola, {user.nombre}.</h1>
          <p className="lead">Tu cuenta está en estado «{user.estado}». Pronto verás aquí tus módulos activos.</p>
        </div>
      </section>

      <main className="wrap tb-mods">
        <h2>Módulos</h2>
        <p className="lead">Estos serán los primeros paneles disponibles.</p>
        <div className="tile-grid">
          {PANELS.map((p) => (
            <div key={p.code} className="tile">
              <span className="code">{p.code}</span>
              <span>{p.name}</span>
              <span className="pill">Próximamente</span>
            </div>
          ))}
        </div>
      </main>
    </>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <Shell />
    </AuthProvider>
  )
}

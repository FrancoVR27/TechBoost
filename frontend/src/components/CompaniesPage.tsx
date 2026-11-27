import { useEffect, useState, type FormEvent } from 'react';
import { useAuth } from '../auth/useAuth';
import { apiFetch } from '../api';

export interface EmpresaItem {
  empresaId: string;
  clienteId: string;
  razonSocial: string;
  nit?: string | null;
  tamano: 'micro' | 'pequena' | 'mediana';
  rubro: string;
  departamento?: string | null;
  cantidadEmpleados?: number | null;
}

export function CompaniesPage({
  onSelectEmpresa,
}: {
  onSelectEmpresa: (empresa: EmpresaItem) => void;
}) {
  const { user } = useAuth();
  const [empresas, setEmpresas] = useState<EmpresaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [razonSocial, setRazonSocial] = useState('');
  const [nit, setNit] = useState('');
  const [tamano, setTamano] = useState<EmpresaItem['tamano']>('micro');
  const [rubro, setRubro] = useState('');
  const [departamento, setDepartamento] = useState('La Paz');
  const [cantidadEmpleados, setCantidadEmpleados] = useState('1');

  useEffect(() => {
    let active = true;
    async function cargarEmpresas() {
      try {
        setLoading(true);
        const data = await apiFetch<{ items: EmpresaItem[] }>('/empresas');
        if (active) setEmpresas(data.items ?? []);
      } catch (err: unknown) {
        if (active) setError(err instanceof Error ? err.message : 'Error al consultar empresas.');
      } finally {
        if (active) setLoading(false);
      }
    }
    void cargarEmpresas();
    return () => { active = false; };
  }, []);

  async function crearEmpresa(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    if (!razonSocial.trim() || !rubro.trim()) {
      setError('Completa la razón social y el rubro de tu empresa.');
      return;
    }
    setSaving(true);
    try {
      await apiFetch<EmpresaItem>('/empresas', {
        method: 'POST',
        body: {
          razonSocial: razonSocial.trim(),
          nit: nit.trim() || null,
          tamano,
          rubro: rubro.trim(),
          departamento: departamento.trim() || 'La Paz',
          cantidadEmpleados: Number(cantidadEmpleados),
        },
      });
      // El backend vincula cliente_id al usuario del token; el navegador no envía ese ID.
      window.location.hash = '#finanzas';
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'No se pudo registrar la empresa.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p style={{ padding: 32 }}>Cargando empresas…</p>;

  return (
    <section className="section" style={{ paddingTop: 40 }}>
      <div className="container">
        <div className="section-heading" style={{ backgroundColor: '#fff', color: '#0f172a', padding: '20px 24px', borderRadius: 12, border: '1px solid #e2e8f0' }}>
          <span className="eyebrow" style={{ color: '#ea5808' }}>GESTIÓN DE EMPRESAS</span>
          <h2 style={{ color: '#0f172a', marginTop: 4 }}>
            {user?.rol === 'Admin' ? 'Todas las empresas registradas' : 'Tu empresa'}
          </h2>
          <p style={{ color: '#475569', marginBottom: 0 }}>
            La empresa se vincula automáticamente a la cuenta con la que iniciaste sesión.
          </p>
        </div>

        {error && <p role="alert" style={{ color: 'crimson', padding: '12px 0' }}>{error}</p>}

        {user?.rol !== 'Admin' && empresas.length === 0 ? (
          <form onSubmit={crearEmpresa} style={{ display: 'grid', gap: 14, maxWidth: 720, marginTop: 20, padding: 24, border: '1px solid #e2e8f0', borderRadius: 12, background: '#fff' }}>
            <h3 style={{ margin: 0, color: '#0f2942' }}>Registra tu empresa para activar los paneles</h3>
            <p style={{ margin: 0, color: '#475569' }}>Tu cuenta todavía no tiene una empresa asociada. Completa estos datos una sola vez.</p>
            <label style={{ display: 'grid', gap: 6 }}>Razón social
              <input value={razonSocial} onChange={(event) => setRazonSocial(event.target.value)} maxLength={150} required />
            </label>
            <label style={{ display: 'grid', gap: 6 }}>NIT (opcional)
              <input value={nit} onChange={(event) => setNit(event.target.value)} maxLength={30} />
            </label>
            <label style={{ display: 'grid', gap: 6 }}>Tamaño
              <select value={tamano} onChange={(event) => setTamano(event.target.value as EmpresaItem['tamano'])}>
                <option value="micro">Microempresa</option>
                <option value="pequena">Pequeña</option>
                <option value="mediana">Mediana</option>
              </select>
            </label>
            <label style={{ display: 'grid', gap: 6 }}>Rubro o actividad
              <input value={rubro} onChange={(event) => setRubro(event.target.value)} maxLength={60} placeholder="Ej. metalmecánica, textil, alimentos" required />
            </label>
            <label style={{ display: 'grid', gap: 6 }}>Departamento
              <input value={departamento} onChange={(event) => setDepartamento(event.target.value)} maxLength={50} />
            </label>
            <label style={{ display: 'grid', gap: 6 }}>Cantidad de empleados
              <input type="number" min="1" step="1" value={cantidadEmpleados} onChange={(event) => setCantidadEmpleados(event.target.value)} required />
            </label>
            <button className="button button-primary" type="submit" disabled={saving}>
              {saving ? 'Registrando…' : 'Registrar empresa y abrir finanzas'}
            </button>
          </form>
        ) : (
          <div style={{ display: 'grid', gap: 12, marginTop: 20 }}>
            {empresas.map((empresa) => (
              <article key={empresa.empresaId} style={{ display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderRadius: 12, border: '1px solid #e2e8f0', background: '#fff' }}>
                <div>
                  <strong style={{ display: 'block', fontSize: 17, color: '#0f2942', marginBottom: 4 }}>{empresa.razonSocial}</strong>
                  <span style={{ fontSize: 14, color: '#1e3a5f' }}>
                    Rubro: {empresa.rubro} · Tamaño: {empresa.tamano} · {empresa.departamento ?? 'La Paz'}
                  </span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {user?.rol !== 'Admin' && <a className="button button-primary button-small" href="#finanzas">Abrir finanzas</a>}
                  <button type="button" className="button button-primary button-small" onClick={() => onSelectEmpresa(empresa)}>
                    IA y Chatbot
                  </button>
                </div>
              </article>
            ))}
            {empresas.length === 0 && <p>No hay empresas registradas.</p>}
          </div>
        )}
      </div>
    </section>
  );
}

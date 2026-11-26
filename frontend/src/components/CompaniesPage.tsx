import { useEffect, useState } from "react";
import { useAuth } from "../auth/useAuth";
import { apiFetch } from "../api";

export interface EmpresaItem {
  empresaId: string;
  clienteId: string;
  razonSocial: string;
  nit?: string | null;
  tamano: "micro" | "pequena" | "mediana";
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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function cargarEmpresas() {
      try {
        setLoading(true);
        const data = await apiFetch<{ items: EmpresaItem[] }>("/empresas");
        setEmpresas(data.items);
      } catch (err: unknown) {
        setError(
          err instanceof Error ? err.message : "Error al consultar empresas"
        );
      } finally {
        setLoading(false);
      }
    }
    cargarEmpresas();
  }, []);

  if (loading) return <p style={{ padding: 32 }}>Cargando empresas…</p>;
  if (error) return <p style={{ padding: 32, color: "crimson" }}>{error}</p>;

  return (
    <section className="section" style={{ paddingTop: 40 }}>
      <div className="container">
        <div className="container">
          <div
            className="section-heading"
            style={{
              backgroundColor: "#ffffff",
              color: "#0f172a",
              padding: "20px 24px",
              borderRadius: 12,
              border: "1px solid #e2e8f0",
            }}
          >
            <span className="eyebrow" style={{ color: "#ea580c" }}>
              GESTIÓN DE EMPRESAS
            </span>
            <h2 style={{ color: "#0f172a", marginTop: 4 }}>
              {user?.rol === "Admin"
                ? "Todas las empresas registradas"
                : "Mis empresas asignadas"}
            </h2>
            <p style={{ color: "#475569", marginBottom: 0 }}>
              Selecciona una empresa para abrir su panel de{" "}
              <strong style={{ color: "#0f172a" }}>IA Predictiva</strong> y{" "}
              <strong style={{ color: "#0f172a" }}>Chatbot</strong>.
            </p>
          </div>
        </div>

        <div style={{ display: "grid", gap: 12 }}>
          {empresas.map((emp) => (
            <div
              key={emp.empresaId}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "16px 20px",
                borderRadius: 12,
                border: "1px solid #e2e8f0",
                background: "#fff",
              }}
            >
              <div>
                <strong
                  style={{
                    display: "block",
                    fontSize: 17,
                    fontWeight: 700,
                    color: "#0f2942",
                    marginBottom: 4,
                  }}
                >
                  {emp.razonSocial}
                </strong>
                <div style={{ fontSize: 14, color: "#1e3a5f", fontWeight: 500 }}>
                  Rubro: {emp.rubro} · Tamaño: {emp.tamano} · {emp.departamento ?? "La Paz"}
                </div>
              </div>

              <button
                type="button"
                className="button button-primary button-small"
                onClick={() => onSelectEmpresa(emp)}
              >
                IA y Chatbot
              </button>
            </div>
          ))}

          {empresas.length === 0 && (
            <p>No hay empresas disponibles para tu usuario.</p>
          )}
        </div>
      </div>
    </section>
  );
}
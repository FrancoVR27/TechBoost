import { useEffect, useState } from "react";
import { API_URL, tokenStore } from "../api";

type TipoAnalisis =
  | "mantenimiento_predictivo"
  | "optimizacion_cadena_valor"
  | "costos_y_margenes"
  | "demanda_estacional"
  | "diagnostico_integral";

interface InformeIA {
  informe_id?: string;
  tipo_analisis: TipoAnalisis;
  resumen_ejecutivo: string;
  cuellos_de_botella: string[];
  predicciones_falla: Array<{
    objetivo: string;
    riesgo: string;
    ventana_estimada: string;
    motivo: string;
  }>;
  recomendaciones_accionables: string[];
  ahorro_estimado_bs: number;
  fecha_generacion?: string;
}

export function AiAndChatPanel({
  empresaId,
  onBack,
}: {
  empresaId: string;
  onBack: () => void;
}) {
  const apiUrl = API_URL;
  const authHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${tokenStore.get() ?? ""}`,
  };

  // Estado IA Predictiva
  const [tipoAnalisis, setTipoAnalisis] =
    useState<TipoAnalisis>("diagnostico_integral");
  const [generando, setGenerando] = useState(false);
  const [informeActual, setInformeActual] = useState<InformeIA | null>(null);
  const [historialInformes, setHistorialInformes] = useState<InformeIA[]>([]);

  // Estado Chatbot
  const [inputChat, setInputChat] = useState("");
  const [enviandoChat, setEnviandoChat] = useState(false);
  const [mensajes, setMensajes] = useState<
    Array<{ role: "user" | "model"; text: string }>
  >([
    {
      role: "model",
      text: "Hola, soy el asistente de TECH BOOST. Pregúntame sobre costos, stock, maquinaria, órdenes de producción o pagos a destajo de esta empresa.",
    },
  ]);

  useEffect(() => {
    async function cargarHistorial() {
      try {
        const res = await fetch(
          `${apiUrl}/empresas/${empresaId}/ia/informes`,
          { headers: authHeaders }
        );
        if (res.ok) {
          const data = await res.json();
          const lista = Array.isArray(data) ? data : data.informes ?? [];
          setHistorialInformes(lista);
          if (lista.length > 0) setInformeActual(lista[0]);
        }
      } catch {
        // Silencioso si aún no hay informes
      }
    }
    cargarHistorial();
  }, [empresaId]);

  async function ejecutarPrediccion() {
    try {
      setGenerando(true);
      const res = await fetch(`${apiUrl}/empresas/${empresaId}/ia/predecir`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({ tipo_analisis: tipoAnalisis }),
      });
      if (!res.ok) throw new Error("Error al generar predicción con IA");
      const nuevo: InformeIA = await res.json();
      setInformeActual(nuevo);
      setHistorialInformes((prev) => [nuevo, ...prev]);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setGenerando(false);
    }
  }

  async function enviarMensaje(e: React.FormEvent) {
    e.preventDefault();
    if (!inputChat.trim() || enviandoChat) return;

    const textoUsuario = inputChat.trim();
    const nuevoHistorial = [
      ...mensajes,
      { role: "user" as const, text: textoUsuario },
    ];
    setMensajes(nuevoHistorial);
    setInputChat("");
    setEnviandoChat(true);

    try {
      const res = await fetch(`${apiUrl}/empresas/${empresaId}/chat`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({
          mensaje: textoUsuario,
          historial: nuevoHistorial.slice(-8),
        }),
      });
      if (!res.ok) throw new Error("Error al consultar al chatbot");
      const data = await res.json();
      setMensajes((prev) => [
        ...prev,
        { role: "model", text: data.respuesta ?? "Sin respuesta" },
      ]);
    } catch (err: any) {
      setMensajes((prev) => [
        ...prev,
        { role: "model", text: `Error: ${err.message}` },
      ]);
    } finally {
      setEnviandoChat(false);
    }
  }

  return (
    <section className="section" style={{ paddingTop: 32 }}>
      <div className="container">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 24,
          }}
        >
          <div>
            <span className="eyebrow">PANEL INTELIGENTE</span>
            <h2>IA Predictiva y Chatbot · Empresa {empresaId.slice(0, 8)}</h2>
          </div>
          <button
            type="button"
            className="button button-outline button-small"
            onClick={onBack}
          >
            Volver a empresas
          </button>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
            gap: 24,
            alignItems: "start",
          }}
        >
          {/* COLUMNA IZQUIERDA: IA PREDICTIVA */}
          <div
            style={{
              padding: 20,
              borderRadius: 12,
              border: "1px solid #e2e8f0",
              background: "#fff",
            }}
          >
            <h3>IA Predictiva</h3>
            <p style={{ fontSize: 14, color: "#555" }}>
              Analiza producción, lecturas IoT, inventarios y movimientos de la
              empresa.
            </p>

            <div style={{ display: "flex", gap: 10, margin: "14px 0" }}>
              <select
                value={tipoAnalisis}
                onChange={(e) => setTipoAnalisis(e.target.value as TipoAnalisis)}
                style={{ flex: 1, padding: "8px 10px", borderRadius: 8 }}
              >
                <option value="diagnostico_integral">
                  Diagnóstico integral
                </option>
                <option value="mantenimiento_predictivo">
                  Mantenimiento predictivo
                </option>
                <option value="optimizacion_cadena_valor">
                  Optimización cadena de valor
                </option>
                <option value="costos_y_margenes">Costos y márgenes</option>
                <option value="demanda_estacional">Demanda estacional</option>
              </select>

              <button
                type="button"
                className="button button-primary button-small"
                onClick={ejecutarPrediccion}
                disabled={generando}
              >
                {generando ? "Analizando…" : "Generar"}
              </button>
            </div>

            {informeActual && (
              <div
                style={{
                  marginTop: 16,
                  padding: 14,
                  borderRadius: 10,
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                }}
              >
                <strong>Resumen ejecutivo</strong>
                <p style={{ fontSize: 14 }}>{informeActual.resumen_ejecutivo}</p>

                <p style={{ fontSize: 14 }}>
                  <strong>Ahorro estimado:</strong> Bs{" "}
                  {Number(informeActual.ahorro_estimado_bs || 0).toFixed(2)}
                </p>

                {informeActual.predicciones_falla?.length > 0 && (
                  <div style={{ marginTop: 10 }}>
                    <strong>Predicciones / Riesgos:</strong>
                    <ul style={{ paddingLeft: 18, fontSize: 14 }}>
                      {informeActual.predicciones_falla.map((p, i) => (
                        <li key={i}>
                          <strong>{p.objetivo}</strong> ({p.riesgo} ·{" "}
                          {p.ventana_estimada}): {p.motivo}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {informeActual.recomendaciones_accionables?.length > 0 && (
                  <div style={{ marginTop: 10 }}>
                    <strong>Recomendaciones:</strong>
                    <ul style={{ paddingLeft: 18, fontSize: 14 }}>
                      {informeActual.recomendaciones_accionables.map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {historialInformes.length > 0 && (
              <p style={{ fontSize: 12, color: "#64748b", marginTop: 12 }}>
                Informes guardados en BD: {historialInformes.length}
              </p>
            )}
          </div>

          {/* COLUMNA DERECHA: CHATBOT */}
          <div
            style={{
              padding: 20,
              borderRadius: 12,
              border: "1px solid #e2e8f0",
              background: "#fff",
              display: "flex",
              flexDirection: "column",
              minHeight: 420,
            }}
          >
            <h3>Chatbot de la empresa</h3>

            <div
              style={{
                flex: 1,
                overflowY: "auto",
                maxHeight: 300,
                display: "flex",
                flexDirection: "column",
                gap: 10,
                padding: "10px 0",
              }}
            >
              {mensajes.map((m, idx) => (
                <div
                  key={idx}
                  style={{
                    alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                    background: m.role === "user" ? "#ea580c" : "#f1f5f9",
                    color: m.role === "user" ? "#fff" : "#0f172a",
                    padding: "10px 14px",
                    borderRadius: 12,
                    maxWidth: "85%",
                    fontSize: 14,
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {m.text}
                </div>
              ))}
              {enviandoChat && (
                <span style={{ fontSize: 13, color: "#64748b" }}>
                  Escribiendo respuesta…
                </span>
              )}
            </div>

            <form
              onSubmit={enviarMensaje}
              style={{ display: "flex", gap: 8, marginTop: 12 }}
            >
              <input
                type="text"
                value={inputChat}
                onChange={(e) => setInputChat(e.target.value)}
                placeholder="Pregunta por insumos, costos, máquinas o destajo…"
                style={{
                  flex: 1,
                  padding: "10px 12px",
                  borderRadius: 8,
                  border: "1px solid #cbd5e1",
                }}
              />
              <button
                type="submit"
                className="button button-primary button-small"
                disabled={enviandoChat}
              >
                Enviar
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
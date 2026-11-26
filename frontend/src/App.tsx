import { useEffect, useState } from "react";
import { AuthProvider } from "./auth/AuthProvider";
import LoginPage from "./auth/LoginPage";
import Brand from "./auth/Brand";
import { useAuth } from "./auth/useAuth";
import "./auth/auth.css";
import { chainStages } from "./data/chainStages";
import { FinanceDemo } from "./components/FinanceDemo";
import { FinancePanel } from "./components/FinancePanel";
import { Icon } from "./components/Icon";
import "./App.css";


const productiveServices = [
  {
    title: "Análisis y digitalización de procesos",
    description: "Levantamos cómo trabaja el taller, qué etapas sigue y dónde se pierde tiempo o información. El empresario obtiene una visión clara de su operación.",
    result: "Procesos documentados y oportunidades de mejora.",
    status: "Punto de partida",
  },
  {
    title: "Optimización de la cadena de valor",
    description: "Identificamos esperas, reprocesos, cuellos de botella y actividades que no agregan valor para ordenar mejor el flujo de producción.",
    result: "Menos retrasos y mejor coordinación entre etapas.",
    status: "Punto de partida",
  },
  {
    title: "Control de materias primas y producción",
    description: "Relacionamos materiales, modelos, órdenes y etapas para comparar lo planificado con lo realmente consumido y producido.",
    result: "Mayor control de insumos, lotes y desperdicios.",
    status: "Base de gestión",
  },
  {
    title: "Monitoreo de maquinaria con IoT",
    description: "Sensores y dispositivos pueden registrar variables de operación para detectar condiciones anormales y advertir sobre posibles paradas.",
    result: "Más visibilidad sobre el estado de los equipos.",
    status: "V1 · según diagnóstico",
  },
  {
    title: "Mantenimiento predictivo con IA",
    description: "El análisis de datos de funcionamiento puede ayudar a reconocer patrones asociados a fallas y planificar intervenciones antes de una parada.",
    result: "Mantenimiento planificado y menos interrupciones imprevistas.",
    status: "Fase posterior",
  },
  {
    title: "Calidad y productividad",
    description: "Registramos defectos, reprocesos, tiempos y rendimiento. La visión artificial puede incorporarse cuando el proceso y los datos lo permitan.",
    result: "Indicadores para mejorar la calidad y la productividad.",
    status: "Análisis base · visión artificial posterior",
  },
];

const adminServices = [
  {
    title: "Finanzas y costos",
    description: "Organizamos ingresos, egresos, costos fijos y variables, costos por producto y flujo de caja para que el dueño sepa cuánto cuesta producir y cuánto queda.",
    result: "Decisiones de precio y planificación con datos.",
    status: "Módulo de este desarrollo",
  },
  {
    title: "Compras e inventarios",
    description: "Relacionamos el consumo de materiales con la producción y ayudamos a planificar reposiciones según existencias y necesidades.",
    result: "Menos compras urgentes y menos faltantes.",
    status: "Integración modular",
  },
  {
    title: "Marketing e inteligencia de mercados",
    description: "La plataforma puede organizar información de clientes, mercado potencial, competencia y canales de venta para orientar acciones comerciales.",
    result: "Mejor conocimiento del mercado y de las oportunidades.",
    status: "Módulo de otra área del equipo",
  },
  {
    title: "Gestión de personas y destajo",
    description: "Permite estructurar información del personal y relacionar las unidades producidas con los pagos acordados por trabajo a destajo.",
    result: "Mayor claridad sobre producción y pagos.",
    status: "Módulo de otra área del equipo",
  },
  {
    title: "Análisis de información empresarial",
    description: "Reúne datos de operación y administración en indicadores sencillos para revisar tendencias, costos y desempeño del negocio.",
    result: "Una visión integral para tomar decisiones.",
    status: "Integración progresiva",
  },
];

const riskItems = [
  ["Desperdicio de materia prima", "Comparar consumo previsto y real por modelo o lote para localizar dónde se pierde material."],
  ["Retrasos entre etapas", "Registrar tiempos y órdenes pendientes para reconocer acumulaciones y cuellos de botella."],
  ["Maquinaria detenida", "Documentar paradas y, cuando existan sensores compatibles, monitorear variables para anticipar fallas."],
  ["Defectos de fabricación", "Registrar defectos y reprocesos por etapa para identificar causas recurrentes."],
  ["Costos de mano de obra elevados", "Relacionar unidades, tiempos y pagos a destajo sin duplicar los importes en los costos."],
  ["Falta de materiales", "Comparar recetas, órdenes y existencias para anticipar necesidades de compra."],
  ["Mala planificación de pedidos", "Organizar órdenes y capacidad por etapa para programar lotes y fechas de entrega."],
];

function Header({ financeActive }: { financeActive: boolean }) {
  return (
    <header className="site-header">
      <div className="header-inner">
        <Brand />
        <nav className="main-nav" aria-label="Navegación principal">
          <a href="#inicio" className={!financeActive ? "nav-public" : ""}>Inicio</a>
          <a href="#empresa">Empresa</a>
          <a href="#servicios">Servicios</a>
          <a href="#cadena">Cadena de valor</a>
          <a href="#finanzas" className="nav-finance"><Icon name="lock" size={14} /> Finanzas</a>
        </nav>
        <a className="button button-small button-primary header-cta" href="#login">Iniciar sesión <Icon name="arrow" size={15} /></a>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="hero-section" id="inicio">
      <div className="hero-glow hero-glow-one" />
      <div className="hero-glow hero-glow-two" />
      <div className="container hero-layout">
        <div className="hero-copy">
          <span className="eyebrow eyebrow-light"><i /> TECNOLOGÍA PARA LA INDUSTRIA BOLIVIANA</span>
          <h1>Tu producción puede funcionar <em>mejor.</em></h1>
          <p className="hero-lead">Ayudamos a micro, pequeñas y medianas empresas productivas a ordenar sus procesos, reducir pérdidas y tomar decisiones con información clara.</p>
          <div className="hero-actions">
            <a className="button button-primary" href="#login">Iniciar sesión <Icon name="arrow" size={17} /></a>
            <a className="button button-ghost" href="#cadena">Conocer cómo trabajamos</a>
          </div>
          <div className="hero-proof">
            <span><Icon name="check" size={16} /> Procesos productivos</span>
            <span><Icon name="check" size={16} /> Gestión del negocio</span>
            <span><Icon name="check" size={16} /> Datos para decidir</span>
          </div>
        </div>
        <div className="hero-visual" aria-label="Esquema de transformación de un negocio productivo">
          <div className="visual-topline"><span className="live-dot" /> RUTA DE TRANSFORMACIÓN</div>
          <div className="visual-center">
            <div className="visual-orbit orbit-one" />
            <div className="visual-orbit orbit-two" />
            <div className="visual-core"><span className="core-symbol">TB</span><b>TECH BOOST</b><small>Una visión integral del negocio</small></div>
            <span className="orbit-node node-one"><Icon name="factory" /></span>
            <span className="orbit-node node-two"><Icon name="chart" /></span>
            <span className="orbit-node node-three"><Icon name="box" /></span>
          </div>
          <div className="visual-steps">
            <div><span>01</span><b>Comprender</b><small>Tu proceso actual</small></div>
            <div><span>02</span><b>Digitalizar</b><small>Datos y operaciones</small></div>
            <div><span>03</span><b>Mejorar</b><small>Decisiones con evidencia</small></div>
          </div>
          <p className="visual-caption">La tecnología se adapta al negocio; no al revés.</p>
        </div>
      </div>
      <div className="hero-bottom-line" />
    </section>
  );
}

function CompanySection() {
  return (
    <>
      <section className="section section-company" id="empresa">
        <div className="container">
          <div className="section-heading centered">
            <span className="eyebrow">QUIÉNES SOMOS</span>
            <h2>La tecnología debe resolver problemas reales de producción.</h2>
            <p>TECH BOOST es una empresa de base tecnológica del sector cuaternario. Integramos conocimiento, datos e inteligencia artificial para apoyar la transformación de negocios productivos.</p>
          </div>
          <div className="mission-grid">
            <article className="mission-card mission-card-dark">
              <span className="card-kicker">NUESTRA MISIÓN</span>
              <div className="mission-icon"><Icon name="factory" size={23} /></div>
              <h3>Desarrollar una plataforma de servicios para la transformación eficiente e inteligente de negocios.</h3>
            </article>
            <article className="mission-card mission-card-light">
              <span className="card-kicker">NUESTRA VISIÓN</span>
              <div className="mission-icon mission-icon-orange"><Icon name="trend" size={23} /></div>
              <h3>Ser la plataforma de referencia en Bolivia y Latinoamérica para la transformación eficiente e inteligente de negocios e industrias, y contribuir al desarrollo de la economía nacional.</h3>
            </article>
          </div>
          <div className="problem-solution">
            <div className="problem-block">
              <span className="eyebrow">EL PROBLEMA</span>
              <h3>Muchos negocios producen, pero no siempre conocen qué ocurre dentro de su proceso.</h3>
              <p>En talleres y pequeñas industrias es común llevar registros en cuadernos, comprar sin planificación, desconocer el costo por unidad y reaccionar cuando una máquina falla.</p>
              <ul className="check-list check-list-muted">
                <li>Desperdicio y consumo difícil de controlar.</li>
                <li>Retrasos, reprocesos y paradas imprevistas.</li>
                <li>Precios fijados sin conocer el costo real.</li>
                <li>Información dispersa para tomar decisiones.</li>
              </ul>
            </div>
            <div className="solution-block">
              <span className="eyebrow eyebrow-light">NUESTRA RESPUESTA</span>
              <h3>Conectamos la producción con la gestión del negocio.</h3>
              <p>Primero entendemos cómo trabaja cada empresa. Después proponemos una digitalización progresiva, acorde con sus necesidades, recursos y capacidad de adopción.</p>
              <ul className="check-list">
                <li>Procesos y cadena de valor documentados.</li>
                <li>Control de materiales, etapas y costos.</li>
                <li>Automatización y monitoreo cuando corresponde.</li>
                <li>Indicadores claros para decidir y mejorar.</li>
              </ul>
            </div>
          </div>
          <div className="value-strip">
            <div><span className="value-icon"><Icon name="shield" /></span><b>Accesible</b><small>Adopción gradual según el negocio.</small></div>
            <div><span className="value-icon"><Icon name="settings" /></span><b>Adaptable</b><small>Configuración según rubro y proceso.</small></div>
            <div><span className="value-icon"><Icon name="chart" /></span><b>Medible</b><small>Información para revisar resultados.</small></div>
            <div><span className="value-icon"><Icon name="leaf" /></span><b>Eficiente</b><small>Menos desperdicio y mejor uso de recursos.</small></div>
          </div>
        </div>
      </section>
      <section className="audience-band">
        <div className="container audience-inner">
          <div><span className="eyebrow eyebrow-light">A QUIÉNES ACOMPAÑAMOS</span><h2>Negocios que transforman materias primas en productos.</h2></div>
          <div className="audience-tags">
            <span>Talleres de calzado</span><span>Textiles y confecciones</span><span>Sastrerías</span><span>Metalmecánica</span><span>Alimentos y bebidas</span><span>Otros productores</span>
          </div>
        </div>
      </section>
    </>
  );
}

function ServiceCard({ item, index }: { item: { title: string; description: string; result: string; status: string }; index: number }) {
  return (
    <article className="service-card">
      <div className="service-card-top"><span className="service-number">{String(index + 1).padStart(2, "0")}</span><span className="service-status">{item.status}</span></div>
      <h3>{item.title}</h3>
      <p>{item.description}</p>
      <div className="service-result"><Icon name="check" size={16} /><span>{item.result}</span></div>
    </article>
  );
}

function ServicesSection() {
  return (
    <section className="section section-services" id="servicios">
      <div className="container">
        <div className="section-heading">
          <span className="eyebrow">QUÉ HACEMOS</span>
          <h2>Dos áreas de trabajo, una sola visión del negocio.</h2>
          <p>No ofrecemos herramientas aisladas. Relacionamos el funcionamiento de la planta con la administración para que la información sea útil en las decisiones diarias.</p>
        </div>
        <div className="service-group">
          <div className="service-group-heading">
            <div className="service-group-icon"><Icon name="factory" size={24} /></div>
            <div><span className="eyebrow">ÁREA A</span><h3>Optimización del sistema productivo</h3><p>Mejorar cómo se transforma la materia prima en un producto terminado.</p></div>
          </div>
          <div className="service-grid">
            {productiveServices.map((item, index) => <ServiceCard key={item.title} item={item} index={index} />)}
          </div>
        </div>
        <div className="service-group service-group-admin">
          <div className="service-group-heading">
            <div className="service-group-icon service-group-icon-orange"><Icon name="chart" size={24} /></div>
            <div><span className="eyebrow">ÁREA B</span><h3>Gestión administrativa del negocio</h3><p>Entender los recursos, el dinero y la información que sostienen la producción.</p></div>
          </div>
          <div className="service-grid service-grid-admin">
            {adminServices.map((item, index) => <ServiceCard key={item.title} item={item} index={index} />)}
          </div>
        </div>
        <div className="service-disclaimer"><Icon name="alert" size={18} /><p><strong>Implementación progresiva:</strong> los servicios se configuran según el diagnóstico y el alcance acordado. Algunas capacidades, como mantenimiento predictivo, visión artificial e integraciones especializadas, corresponden a fases posteriores; no se presentan como funcionalidades ya desplegadas.</p></div>
      </div>
    </section>
  );
}

function ChainSection() {
  const [selectedStage, setSelectedStage] = useState(0);
  const stage = chainStages[selectedStage];
  return (
    <section className="section section-chain" id="cadena">
      <div className="container">
        <div className="section-heading">
          <span className="eyebrow">MÓDULO · CADENA DE VALOR</span>
          <h2>Antes de automatizar, entendemos cómo produces.</h2>
          <p>La cadena de valor describe las actividades que convierten insumos en productos y los hacen llegar al cliente. TECH BOOST analiza cada etapa para encontrar pérdidas, esperas y oportunidades de mejora.</p>
        </div>
        <div className="chain-context">
          <div className="chain-context-icon"><Icon name="factory" size={24} /></div>
          <div><strong>Ejemplo de referencia: taller de calzado</strong><p>Las etapas pueden cambiar según el modelo, la maquinaria y la forma de trabajo de cada taller. No existe una secuencia única para todas las industrias.</p></div>
        </div>
        <div className="chain-flow" aria-label="Etapas de la cadena de valor de un taller de calzado">
          {chainStages.map((item, index) => (
            <button className={`chain-stage ${selectedStage === index ? "chain-stage-active" : ""}`} key={item.id} onClick={() => setSelectedStage(index)} type="button" aria-pressed={selectedStage === index}>
              <span className="chain-stage-number">{String(item.id).padStart(2, "0")}</span>
              <strong>{item.title}</strong>
              <small>{item.short}</small>
              {index < chainStages.length - 1 && <span className="chain-connector"><Icon name="arrow" size={14} /></span>}
            </button>
          ))}
        </div>
        <article className="stage-detail" aria-live="polite">
          <div className="stage-detail-heading">
            <div><span className="eyebrow">ETAPA {String(stage.id).padStart(2, "0")}</span><h3>{stage.title}</h3></div>
            <span className="stage-detail-badge">Análisis de proceso</span>
          </div>
          <p className="stage-description">{stage.description}</p>
          <div className="stage-detail-grid">
            <div><h4>Recursos e insumos</h4><ul>{stage.inputs.map((item) => <li key={item}>{item}</li>)}</ul></div>
            <div><h4>Resultado de la etapa</h4><p className="stage-output">{stage.output}</p></div>
            <div><h4>Problemas posibles</h4><ul className="risk-list">{stage.risks.map((item) => <li key={item}>{item}</li>)}</ul></div>
            <div><h4>Qué aporta TECH BOOST</h4><ul className="tech-list">{stage.contribution.map((item) => <li key={item}>{item}</li>)}</ul></div>
          </div>
          <div className="stage-pagination">
            <button type="button" className="button button-outline" disabled={selectedStage === 0} onClick={() => setSelectedStage((current) => current - 1)}>Anterior</button>
            <span>{selectedStage + 1} de {chainStages.length}</span>
            <button type="button" className="button button-primary" disabled={selectedStage === chainStages.length - 1} onClick={() => setSelectedStage((current) => current + 1)}>Siguiente <Icon name="arrow" size={15} /></button>
          </div>
        </article>
        <div className="risk-section">
          <div className="risk-heading"><span className="eyebrow">PUNTOS CRÍTICOS Y RIESGOS</span><h3>¿Dónde puede estar perdiendo dinero tu empresa?</h3><p>El diagnóstico busca reconocer los problemas que afectan el flujo de producción y relacionarlos con datos observables.</p></div>
          <div className="risk-grid">
            {riskItems.map(([title, detail], index) => <article className="risk-card" key={title}><span>{String(index + 1).padStart(2, "0")}</span><div><strong>{title}</strong><p>{detail}</p></div></article>)}
          </div>
        </div>
        <div className="chain-outcomes">
          <div><span className="eyebrow eyebrow-light">RESULTADOS DEL ANÁLISIS</span><h3>De observar el proceso a proponer mejoras medibles.</h3></div>
          <ul>
            <li><Icon name="check" /> Identificación de cuellos de botella.</li>
            <li><Icon name="check" /> Detección de actividades que generan pérdidas.</li>
            <li><Icon name="check" /> Optimización de tiempos y materiales.</li>
            <li><Icon name="check" /> Identificación de costos por etapa.</li>
            <li><Icon name="check" /> Recomendaciones de mejora priorizadas.</li>
          </ul>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-main">
        <div><Brand /><p>Automatización, inteligencia artificial y análisis de datos para modernizar negocios productivos.</p></div>
        <div className="footer-links"><span>EXPLORA</span><a href="#empresa">La empresa</a><a href="#servicios">Servicios</a><a href="#cadena">Cadena de valor</a><a href="#finanzas">Área financiera</a></div>
        <div className="footer-note"><span>ENFOQUE</span><p>La Paz, Bolivia<br />Micro, pequeñas y medianas empresas productivas.</p><a href="#login">Iniciar sesión <Icon name="arrow" size={14} /></a></div>
      </div>
      <div className="container footer-bottom"><span>TECH BOOST BOLIVIA</span><span>«Transformación inteligente de industrias»</span><span>Proyecto de emprendimiento · 2026</span></div>
    </footer>
  );
}

function FinanceAccessGate({ onDemo, onReal }: { onDemo: () => void; onReal: () => void }) {
  return (
    <main className="finance-gate">
      <div className="finance-gate-card">
        <div className="gate-lock"><Icon name="lock" size={27} /></div>
        <span className="eyebrow">ÁREA PRIVADA</span>
        <h1>Finanzas de tu empresa.</h1>
        <p>Has iniciado sesión. El panel financiero muestra únicamente la información asociada a tu cuenta. La validación de roles y permisos se mantiene en el servidor.</p>
        <div className="gate-status"><span className="status-dot" /><div><strong>Sesión autenticada</strong><small>Acceso protegido por el sistema de autenticación de TECH BOOST.</small></div></div>
        <button className="button button-primary button-wide" type="button" onClick={onReal}>Ver datos reales desde PostgreSQL <Icon name="arrow" size={16} /></button>
        <button className="button button-outline button-wide" type="button" onClick={onDemo}>Ver demostración con datos ficticios <Icon name="arrow" size={16} /></button>
        <a className="text-button gate-back" href="#inicio">Volver a la presentación pública</a>
      </div>
      <div className="gate-side-note"><Icon name="shield" size={18} /><span>El modo real consulta la base de datos con tu sesión; el modo demostración usa datos ficticios en memoria.</span></div>
    </main>
  );
}

function AppContent() {
  const { user, loading, logout } = useAuth();
  const [financeActive, setFinanceActive] = useState(window.location.hash === "#finanzas");
  const [loginActive, setLoginActive] = useState(window.location.hash === "#login");
  const [demoActive, setDemoActive] = useState(false);
  const [realActive, setRealActive] = useState(false);

  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;
      setFinanceActive(hash === "#finanzas");
      setLoginActive(hash === "#login");
      setDemoActive(false);
      setRealActive(false);
      if (hash && hash !== "#finanzas" && hash !== "#login") {
        window.setTimeout(() => {
          document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 80);
      } else if (!hash) {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    };
    window.addEventListener("hashchange", handleHash);
    if (window.location.hash && window.location.hash !== "#finanzas" && window.location.hash !== "#login") {
      const target = document.getElementById(window.location.hash.slice(1));
      if (target) window.setTimeout(() => target.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    }
    return () => window.removeEventListener("hashchange", handleHash);
  }, []);

  function exitFinance() {
    setFinanceActive(false);
    setLoginActive(false);
    setDemoActive(false);
    setRealActive(false);
    window.location.hash = "#inicio";
  }

  return (
    <>
      <Header financeActive={financeActive} />
      {financeActive && user && (
        <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 14, padding: "12px 5%", background: "#f4f6f8" }}>
          <span>{user.nombre} {user.apellido} · {user.rol}</span>
          <button type="button" className="button button-outline" onClick={logout}>Cerrar sesión</button>
        </div>
      )}
      {financeActive ? (
        loading ? <p style={{ padding: 32 }}>Verificando sesión…</p>
          : !user ? <LoginPage />
          : realActive ? <FinancePanel onExit={exitFinance} />
          : demoActive ? <FinanceDemo onExit={exitFinance} />
          : <FinanceAccessGate
              onReal={() => { setDemoActive(false); setRealActive(true); }}
              onDemo={() => { setRealActive(false); setDemoActive(true); }}
            />
      ) : loginActive ? (
        <main className="login-route">
          <LoginPage />
        </main>
      ) : (
        <>
          <Hero />
          <CompanySection />
          <ServicesSection />
          <ChainSection />
          <Footer />
        </>
      )}
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

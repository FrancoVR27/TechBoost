import { useEffect, useMemo, useState } from "react";
import { AuthProvider } from "./auth/AuthProvider";
import LoginPage from "./auth/LoginPage";
import Brand from "./auth/Brand";
import { useAuth } from "./auth/useAuth";
import "./auth/auth.css";
import { chainStages } from "./data/chainStages";
import { FinanceDemo } from "./components/FinanceDemo";
import { FinancePanel } from "./components/FinancePanel";
import { Icon } from "./components/Icon";
import { CompaniesPage } from "./components/CompaniesPage";
import { AiAndChatPanel } from "./components/AiAndChatPanel";
import PlanesCostosPanel from "./components/PlanesCostosPanel";
import TrabajadorForm from "./components/TrabajadorForm";
import MovimientoForm from "./components/MovimientoForm";
import DestajoPanel from "./components/DestajoPanel";
import MarketingPanel from "./components/MarketingPanel";
import {
  obtenerTrabajadores,
  obtenerHistorial,
} from "./services/trabajadores.service";
import type {
  Trabajador,
  Movimiento,
} from "./types/trabajador.types";
import "./App.css";

const productiveServices = [
  {
    title: "Análisis y digitalización de procesos",
    description: "Mapeamos tareas, responsables y datos que hoy se pierden.",
    result: "Procesos claros y mejoras priorizadas.",
    status: "Punto de partida",
  },
  {
    title: "Optimización de la cadena de valor",
    description: "Detectamos esperas, reprocesos y cuellos de botella.",
    result: "Un flujo de producción más ordenado.",
    status: "Punto de partida",
  },
  {
    title: "Control de materias primas y producción",
    description: "Comparamos materiales y producción planificados con los reales.",
    result: "Menos desperdicio y faltantes.",
    status: "Base de gestión",
  },
  {
    title: "Monitoreo de maquinaria con IoT",
    description: "Monitoreamos equipos con sensores compatibles cuando se necesitan.",
    result: "Alertas y visibilidad del estado de los equipos.",
    status: "V1 · según diagnóstico",
  },
  {
    title: "Mantenimiento predictivo con IA",
    description: "Analizamos patrones de fallas cuando existen datos suficientes.",
    result: "Mantenimiento planificado en fases posteriores.",
    status: "Fase posterior",
  },
  {
    title: "Calidad y productividad",
    description: "Seguimos defectos, reprocesos y tiempos por etapa.",
    result: "Indicadores de calidad y productividad.",
    status: "Análisis base · visión artificial posterior",
  },
];

const adminServices = [
  {
    title: "Finanzas y costos",
    description: "Ordenamos ingresos, egresos, costos y flujo de caja.",
    result: "Conocer el costo real y el margen.",
    status: "Módulo de este desarrollo",
  },
  {
    title: "Compras e inventarios",
    description: "Vinculamos existencias con el consumo de producción.",
    result: "Reposiciones más oportunas.",
    status: "Integración modular",
  },
  {
    title: "Marketing e inteligencia de mercados",
    description: "Organizamos clientes, competencia y oportunidades comerciales.",
    result: "Acciones de venta mejor enfocadas.",
    status: "Módulo de otra área del equipo",
  },
  {
    title: "Gestión de personas y destajo",
    description: "Relacionamos unidades producidas con los pagos acordados.",
    result: "Claridad sobre producción y pagos.",
    status: "Módulo de otra área del equipo",
  },
  {
    title: "Análisis de información empresarial",
    description: "Reunimos indicadores de operación y administración.",
    result: "Una visión integral para decidir.",
    status: "Integración progresiva",
  },
];

const riskItems = [
  ["Desperdicio de materia prima", "Comparamos consumo previsto y real por lote."],
  ["Retrasos entre etapas", "Ubicamos órdenes detenidas y cuellos de botella."],
  ["Maquinaria detenida", "Registramos paradas y monitoreamos equipos compatibles."],
  ["Defectos de fabricación", "Seguimos defectos y reprocesos por etapa."],
  ["Costos de mano de obra", "Relacionamos unidades producidas y pagos a destajo."],
  ["Falta de materiales", "Contrastamos existencias con las necesidades de producción."],
  ["Pedidos mal planificados", "Organizamos órdenes, capacidad y fechas de entrega."],
];

function Header({
  financeActive,
  loading,
  user,
  onLogout,
}: {
  financeActive: boolean;
  loading: boolean;
  user: { nombre: string; apellido: string; rol: string } | null;
  onLogout: () => void;
}) {
  const hash = window.location.hash;
  const activeHash = hash.startsWith("#ia-chat/") ? "#empresas" : hash || "#inicio";

  return (
    <header className="site-header">
      <div className="header-inner">
        <Brand />
        <nav className="main-nav" aria-label="Navegación principal">
          <a href="#inicio" className={activeHash === "#inicio" ? "nav-active" : undefined} aria-current={activeHash === "#inicio" ? "page" : undefined}>Inicio</a>
          <a href="#empresa" className={activeHash === "#empresa" ? "nav-active" : undefined} aria-current={activeHash === "#empresa" ? "page" : undefined}>Empresa</a>
          <a href="#transformacion" className={activeHash === "#transformacion" ? "nav-active" : undefined} aria-current={activeHash === "#transformacion" ? "page" : undefined}>Antes y después</a>
          <a href="#servicios" className={activeHash === "#servicios" ? "nav-active" : undefined} aria-current={activeHash === "#servicios" ? "page" : undefined}>Servicios</a>
          <a href="#cadena" className={activeHash === "#cadena" ? "nav-active" : undefined} aria-current={activeHash === "#cadena" ? "page" : undefined}>Cadena de valor</a>
          <a href="#empresas" className={activeHash === "#empresas" ? "nav-active" : undefined} aria-current={activeHash === "#empresas" ? "page" : undefined}>Empresas</a>
          <a href="#panel-empresarial" className={activeHash === "#panel-empresarial" ? "nav-active" : undefined} aria-current={activeHash === "#panel-empresarial" ? "page" : undefined}>Panel empresarial</a>
          <a href="#finanzas" className={`nav-finance ${financeActive ? "nav-active" : ""}`} aria-current={financeActive ? "page" : undefined}><Icon name="lock" size={14} /> Finanzas</a>
        </nav>
        <div className="header-actions">
          {loading ? (
            <span className="account-loading" role="status">Verificando cuenta…</span>
          ) : user ? (
            <>
              <div className="account-status" aria-label={`Cuenta activa: ${user.nombre} ${user.apellido}`}>
                <span className="account-status-dot" />
                <span className="account-status-copy">
                  <small>Cuenta activa</small>
                  <strong>{user.nombre} {user.apellido}</strong>
                </span>
              </div>
              <button className="header-logout" type="button" onClick={onLogout} title="Cerrar sesión">
                <span className="logout-full-label">Cerrar sesión</span>
                <span className="logout-compact-label" aria-hidden="true">Salir</span>
              </button>
            </>
          ) : (
            <a className="button button-small button-primary header-cta" href="#login">Iniciar sesión <Icon name="arrow" size={15} /></a>
          )}
        </div>
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
            <h2>Tecnología práctica para mejorar negocios productivos.</h2>
            <p>TECH BOOST digitaliza la producción y su gestión: diagnostica cada negocio, organiza sus datos e implementa herramientas para controlar y mejorar.</p>
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
              <h3>Ser lideres en Bolivia para la transformacion inteligente de Industrias. Y contribuir al Desarrollo economico</h3>
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
          <div className="company-transform-link">
            <a className="button button-primary" href="#transformacion">Ver el antes y después <Icon name="arrow" size={16} /></a>
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

function TransformationSection() {
  return (
    <section className="transformation-section" id="transformacion" aria-labelledby="transformation-title">
      <div className="container">
        <div className="section-heading centered transformation-heading">
          <span className="eyebrow eyebrow-light">DEL SECTOR SECUNDARIO AL CUATERNARIO</span>
          <h2 id="transformation-title">La PYME sigue fabricando. Ahora también decide con datos.</h2>
          <p>Una empresa manufacturera no deja de pertenecer al sector secundario. Al sumar software, análisis e inteligencia artificial, incorpora capacidades del sector cuaternario.</p>
        </div>
        <div className="transformation-grid">
          <article className="transformation-card">
            <div className="transformation-image">
              <img
                src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1400&q=85"
                alt="Operario trabajando con una pieza metálica en un taller"
                loading="lazy"
                decoding="async"
              />
              <span className="transformation-label">HOY · PRODUCCIÓN</span>
            </div>
            <div className="transformation-copy">
              <span className="transformation-sector">SECTOR SECUNDARIO</span>
              <h3>El oficio transforma materiales en productos.</h3>
              <ul>
                <li>Conocimiento del proceso en las personas.</li>
                <li>Registros dispersos y control manual.</li>
                <li>Problemas detectados cuando ya afectan la entrega.</li>
              </ul>
            </div>
          </article>
          <div className="transformation-bridge" aria-label="TECH BOOST conecta producción y datos">
            <span className="bridge-mark">TB</span>
            <Icon name="arrow" size={22} />
            <strong>TECH BOOST</strong>
            <small>diagnóstico · datos · tecnología</small>
          </div>
          <article className="transformation-card transformation-card-after">
            <div className="transformation-image">
              <img
                src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1400&q=85"
                alt="Profesional usando una computadora junto a maquinaria industrial"
                loading="lazy"
                decoding="async"
              />
              <span className="transformation-label">CON TECH BOOST · PRODUCCIÓN CONECTADA</span>
            </div>
            <div className="transformation-copy">
              <span className="transformation-sector">CAPACIDADES DEL SECTOR CUATERNARIO</span>
              <h3>Los datos ayudan a planificar y mejorar.</h3>
              <ul>
                <li>Procesos, materiales y costos organizados.</li>
                <li>Indicadores para anticipar y priorizar.</li>
                <li>IA e IoT cuando hay datos y aportan valor.</li>
              </ul>
            </div>
          </article>
        </div>
        <p className="transformation-note">La tecnología acompaña el trabajo productivo; no reemplaza el oficio. Imágenes ilustrativas de Unsplash, no de empresas identificadas.</p>
      </div>
    </section>
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
          <h2>Producción y gestión conectadas en una sola plataforma.</h2>
          <p>Registramos lo que ocurre, detectamos oportunidades y aplicamos mejoras con datos del negocio.</p>
        </div>
        <div className="service-group">
          <div className="service-group-heading">
            <div className="service-group-icon"><Icon name="factory" size={24} /></div>
            <div><span className="eyebrow">ÁREA A</span><h3>Optimización productiva</h3><p>Controlamos cómo se transforma el insumo en producto.</p></div>
          </div>
          <div className="service-grid">
            {productiveServices.map((item, index) => <ServiceCard key={item.title} item={item} index={index} />)}
          </div>
        </div>
        <div className="service-group service-group-admin">
          <div className="service-group-heading">
            <div className="service-group-icon service-group-icon-orange"><Icon name="chart" size={24} /></div>
            <div><span className="eyebrow">ÁREA B</span><h3>Gestión del negocio</h3><p>Ordenamos los recursos y datos que sostienen la producción.</p></div>
          </div>
          <div className="service-grid service-grid-admin">
            {adminServices.map((item, index) => <ServiceCard key={item.title} item={item} index={index} />)}
          </div>
        </div>
        <div className="service-disclaimer"><Icon name="alert" size={18} /><p><strong>Implementación por etapas:</strong> definimos el alcance según el diagnóstico. IA predictiva y visión artificial requieren datos suficientes y se incorporan en fases posteriores.</p></div>
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
          <h2>Primero entendemos cómo produces.</h2>
          <p>Mapeamos etapas, insumos y tiempos para ubicar pérdidas y decidir qué mejorar o digitalizar.</p>
        </div>
        <div className="chain-context">
          <div className="chain-context-icon"><Icon name="factory" size={24} /></div>
          <div><strong>Ejemplo: taller de calzado</strong><p>Adaptamos el análisis al producto y a la forma de trabajo de cada empresa.</p></div>
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
          <div className="risk-heading"><span className="eyebrow">PUNTOS CRÍTICOS</span><h3>¿Dónde se pierde tiempo o dinero?</h3><p>Buscamos causas observables para priorizar mejoras.</p></div>
          <div className="risk-grid">
            {riskItems.map(([title, detail], index) => <article className="risk-card" key={title}><span>{String(index + 1).padStart(2, "0")}</span><div><strong>{title}</strong><p>{detail}</p></div></article>)}
          </div>
        </div>
        <div className="chain-outcomes">
          <div><span className="eyebrow eyebrow-light">RESULTADOS</span><h3>Del diagnóstico a mejoras medibles.</h3></div>
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
  const [businessPanelActive, setBusinessPanelActive] = useState(window.location.hash === "#panel-empresarial");
  const [demoActive, setDemoActive] = useState(false);
  const [companiesActive, setCompaniesActive] = useState(window.location.hash === "#empresas");
  const [aiChatActive, setAiChatActive] = useState(window.location.hash.startsWith("#ia-chat/"));
  const aiEmpresaId = aiChatActive ? window.location.hash.replace("#ia-chat/", "") : null;
  const [realActive, setRealActive] = useState(false);

  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;
      const isBusinessPanel = hash === "#panel-empresarial";
      const isCompanies = hash === "#empresas";
      const isAiChat = hash.startsWith("#ia-chat/");

      setFinanceActive(hash === "#finanzas");
      setLoginActive(hash === "#login");
      setBusinessPanelActive(isBusinessPanel);
      setCompaniesActive(isCompanies);
      setAiChatActive(isAiChat);
      setDemoActive(false);
      setRealActive(false);

      if (hash && hash !== "#finanzas" && hash !== "#login" && !isBusinessPanel && !isCompanies && !isAiChat) {
        window.setTimeout(() => {
          document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 80);
      } else if (!hash || isBusinessPanel || isCompanies || isAiChat) {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    };

    window.addEventListener("hashchange", handleHash);

    const initialHash = window.location.hash;
    if (
      initialHash &&
      initialHash !== "#finanzas" &&
      initialHash !== "#login" &&
      initialHash !== "#panel-empresarial" &&
      initialHash !== "#empresas" &&
      !initialHash.startsWith("#ia-chat/")
    ) {
      const target = document.getElementById(initialHash.slice(1));
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
      <Header
        financeActive={financeActive}
        loading={loading}
        user={user}
        onLogout={logout}
      />
      {businessPanelActive ? (
        loading ? (
          <p style={{ padding: 32 }}>Verificando sesión…</p>
        ) : !user ? (
          <LoginPage />
        ) : (
          <BusinessDashboard />
        )
      ) : companiesActive ? (
        loading ? (
          <p style={{ padding: 32 }}>Verificando sesión…</p>
        ) : !user ? (
          <LoginPage />
        ) : (
          <CompaniesPage
            onSelectEmpresa={(emp) => {
              window.location.hash = `#ia-chat/${emp.empresaId}`;
            }}
          />
        )
      ) : aiChatActive && aiEmpresaId ? (
        loading ? (
          <p style={{ padding: 32 }}>Verificando sesión…</p>
        ) : !user ? (
          <LoginPage />
        ) : (
          <AiAndChatPanel
            empresaId={aiEmpresaId}
            onBack={() => {
              window.location.hash = "#empresas";
            }}
          />
        )
      ) : financeActive ? (
        loading ? (
          <p style={{ padding: 32 }}>Verificando sesión…</p>
        ) : !user ? (
          <LoginPage />
        ) : realActive ? (
          <FinancePanel onExit={exitFinance} />
        ) : demoActive ? (
          <FinanceDemo onExit={exitFinance} />
        ) : (
          <FinanceAccessGate
            onReal={() => {
              setDemoActive(false);
              setRealActive(true);
            }}
            onDemo={() => {
              setRealActive(false);
              setDemoActive(true);
            }}
          />
        )
      ) : loginActive ? (
        <main className="login-route">
          <LoginPage />
        </main>
      ) : (
        <>
          <Hero />
          <CompanySection />
          <TransformationSection />
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

type FiltroEstado = 'todos' | 'activos' | 'inactivos';

function BusinessDashboard() {
  const [trabajadores, setTrabajadores] = useState<Trabajador[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] =
    useState<FiltroEstado>('todos');

  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const [trabajadorSeleccionado, setTrabajadorSeleccionado] =
    useState<Trabajador | null>(null);

  const [historial, setHistorial] = useState<Movimiento[]>([]);
  const [cargandoHistorial, setCargandoHistorial] = useState(false);
  const [errorHistorial, setErrorHistorial] = useState('');

  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  const [trabajadorEditar, setTrabajadorEditar] =
    useState<Trabajador | null>(null);

  const [mostrarMovimiento, setMostrarMovimiento] = useState(false);

  const [trabajadorMovimiento, setTrabajadorMovimiento] =
    useState<Trabajador | null>(null);

  const [seccionActiva, setSeccionActiva] = useState<'recursos-humanos' | 'planes-costos' | 'marketing'>('recursos-humanos');


  async function cargarTrabajadores() {
    try {
      setCargando(true);
      setError('');

      const respuesta = await obtenerTrabajadores(100);

      setTrabajadores(respuesta.items);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudo cargar la lista de trabajadores.',
      );
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarTrabajadores();
  }, []);

  const trabajadoresFiltrados = useMemo(() => {
    return trabajadores.filter((trabajador) => {
      const texto = busqueda.toLowerCase().trim();

      const coincideBusqueda =
        trabajador.nombreCompleto.toLowerCase().includes(texto) ||
        (trabajador.cargo ?? '').toLowerCase().includes(texto);

      const coincideEstado =
        filtroEstado === 'todos' ||
        (filtroEstado === 'activos' && trabajador.activo === true) ||
        (filtroEstado === 'inactivos' && trabajador.activo !== true);

      return coincideBusqueda && coincideEstado;
    });
  }, [trabajadores, busqueda, filtroEstado]);

  const totalTrabajadores = trabajadores.length;

  const totalActivos = trabajadores.filter(
    (trabajador) => trabajador.activo === true,
  ).length;

  const totalInactivos = totalTrabajadores - totalActivos;

  async function abrirHistorial(trabajador: Trabajador) {
    setTrabajadorSeleccionado(trabajador);
    setHistorial([]);
    setErrorHistorial('');

    try {
      setCargandoHistorial(true);

      const respuesta = await obtenerHistorial(
        trabajador.trabajadorId,
      );

      setHistorial(respuesta);
    } catch (err) {
      setErrorHistorial(
        err instanceof Error
          ? err.message
          : 'No se pudo consultar el historial laboral.',
      );
    } finally {
      setCargandoHistorial(false);
    }
  }

  function cerrarHistorial() {
    setTrabajadorSeleccionado(null);
    setHistorial([]);
    setErrorHistorial('');
  }

  function formatoFecha(fecha: string) {
    if (!fecha) return '-';

    const partes = fecha.substring(0, 10).split('-');

    if (partes.length !== 3) return fecha;

    return `${partes[2]}/${partes[1]}/${partes[0]}`;
  }

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">TB</div>
          <div>
            <h2>TECH BOOST</h2>
            <span>Panel empresarial</span>
          </div>
        </div>

        <div className="sidebar-section">
          <span className="sidebar-label">GESTIÓN EMPRESARIAL</span>

          <button
            type="button"
            className={`sidebar-item ${seccionActiva === 'recursos-humanos' ? 'active' : ''}`}
            onClick={() => setSeccionActiva('recursos-humanos')}
          >
            <span className="sidebar-icon">▦</span>
            Recursos Humanos
          </button>

          <button
            type="button"
            className={`sidebar-item ${seccionActiva === 'marketing' ? 'active' : ''}`}
            onClick={() => setSeccionActiva('marketing')}
          >
            <span className="sidebar-icon">◈</span>
            Marketing
          </button>

          <button
            type="button"
            className={`sidebar-item ${seccionActiva === 'planes-costos' ? 'active' : ''}`}
            onClick={() => setSeccionActiva('planes-costos')}
          >
            <span className="sidebar-icon">▤</span>
            Planes y Costos
          </button>

        </div>

        <div className="sidebar-footer">
          <div className="user-avatar">A</div>
          <div>
            <strong>Administrador</strong>
            <span>Gestión empresarial</span>
          </div>
        </div>
      </aside>

      <main className="main-content">
        {seccionActiva === 'recursos-humanos' && (
          <>
        <header className="topbar">
          <div>
            <span className="breadcrumb">
              TECH BOOST / RECURSOS HUMANOS
            </span>
            <h1>Recursos Humanos</h1>
            <p>
              Administración y control del personal de la empresa.
            </p>
          </div>

          <button
            className="button-secondary"
            onClick={cargarTrabajadores}
            disabled={cargando}
          >
            ↻ Actualizar
          </button>
        </header>

        <section className="stats-grid">
          <article className="stat-card">
            <div className="stat-icon blue">♙</div>
            <div>
              <span>Total de trabajadores</span>
              <strong>{totalTrabajadores}</strong>
              <small>Personal registrado</small>
            </div>
          </article>

          <article className="stat-card">
            <div className="stat-icon green">✓</div>
            <div>
              <span>Trabajadores activos</span>
              <strong>{totalActivos}</strong>
              <small>Personal habilitado</small>
            </div>
          </article>

          <article className="stat-card">
            <div className="stat-icon orange">Ⅱ</div>
            <div>
              <span>Trabajadores inactivos</span>
              <strong>{totalInactivos}</strong>
              <small>Personal no habilitado</small>
            </div>
          </article>
        </section>

        <section className="content-card">
          <div className="section-heading">
            <div>
              <h2>Gestión de trabajadores</h2>
              <p>Consulta y administra el personal registrado.</p>
            </div>

            <button
              className="button-primary"
              onClick={() => {
                setTrabajadorEditar(null);
                setMostrarFormulario(true);
              }}
            >
              + Registrar trabajador
            </button>
          </div>

          <div className="toolbar">
            <div className="search-box">
              <span>⌕</span>
              <input
                type="text"
                placeholder="Buscar por nombre o cargo..."
                value={busqueda}
                onChange={(event) => setBusqueda(event.target.value)}
              />
            </div>

            <select
              value={filtroEstado}
              onChange={(event) =>
                setFiltroEstado(event.target.value as FiltroEstado)
              }
            >
              <option value="todos">Todos los estados</option>
              <option value="activos">Activos</option>
              <option value="inactivos">Inactivos</option>
            </select>
          </div>

          {cargando && (
            <div className="message-box">
              Cargando trabajadores...
            </div>
          )}

          {!cargando && error && (
            <div className="message-box error-message">
              <strong>No se pudo cargar la información.</strong>
              <span>{error}</span>
              <button onClick={cargarTrabajadores}>
                Intentar nuevamente
              </button>
            </div>
          )}

          {!cargando && !error && (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>TRABAJADOR</th>
                    <th>CARGO</th>
                    <th>MODALIDAD DE PAGO</th>
                    <th>TARIFA BASE</th>
                    <th>ESTADO</th>
                    <th>ACCIONES</th>
                  </tr>
                </thead>

                <tbody>
                  {trabajadoresFiltrados.map((trabajador) => (
                    <tr key={trabajador.trabajadorId}>
                      <td>
                        <div className="worker-cell">
                          <div className="worker-avatar">
                            {trabajador.nombreCompleto
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <div>
                            <strong>{trabajador.nombreCompleto}</strong>
                            <small>
                              {trabajador.trabajadorId.slice(0, 8)}
                            </small>
                          </div>
                        </div>
                      </td>

                      <td>{trabajador.cargo || 'Sin cargo'}</td>

                      <td>
                        {trabajador.modalidadPago}
                      </td>

                      <td>
                        Bs. {Number(trabajador.tarifaBaseBs).toFixed(2)}
                      </td>

                      <td>
                        <span
                          className={`status ${
                            trabajador.activo === true
                              ? 'status-active'
                              : 'status-inactive'
                          }`}
                        >
                          {trabajador.activo === true
                            ? 'Activo'
                            : 'Inactivo'}
                        </span>
                      </td>

                      <td>
                        <div className="action-buttons">
                          <button
                            className="table-action"
                            onClick={() => {
                              setTrabajadorEditar(trabajador);
                              setMostrarFormulario(true);
                            }}
                          >
                            Editar
                          </button>

                          <button
                            className="table-action"
                            onClick={() => abrirHistorial(trabajador)}
                          >
                            Historial
                          </button>

                          <button
                            className="table-action"
                            onClick={() => {
                              setTrabajadorMovimiento(trabajador);
                              setMostrarMovimiento(true);
                            }}
                          >
                            Movimiento
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {trabajadoresFiltrados.length === 0 && (
                    <tr>
                      <td colSpan={6} className="empty-table">
                        No se encontraron trabajadores.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          <div className="table-footer">
            Mostrando {trabajadoresFiltrados.length} de{' '}
            {totalTrabajadores} trabajadores
          </div>
        </section>

        <DestajoPanel trabajadores={trabajadores} />
          </>
        )}

        {seccionActiva === 'planes-costos' && <PlanesCostosPanel />}
        {seccionActiva === 'marketing' && <MarketingPanel />}

      </main>

      {trabajadorSeleccionado && (
        <div className="modal-overlay" onClick={cerrarHistorial}>
          <section
            className="modal-card"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <span className="breadcrumb">RECURSOS HUMANOS</span>
                <h2>Historial laboral</h2>
                <p>{trabajadorSeleccionado.nombreCompleto}</p>
              </div>

              <button
                className="close-button"
                onClick={cerrarHistorial}
              >
                ×
              </button>
            </div>

            {cargandoHistorial && (
              <div className="message-box">
                Consultando historial...
              </div>
            )}

            {!cargandoHistorial && errorHistorial && (
              <div className="message-box error-message">
                {errorHistorial}
              </div>
            )}

            {!cargandoHistorial &&
              !errorHistorial &&
              historial.length === 0 && (
                <div className="message-box">
                  Este trabajador todavía no tiene movimientos registrados.
                </div>
              )}

            {!cargandoHistorial &&
              !errorHistorial &&
              historial.length > 0 && (
                <div className="history-list">
                  {historial.map((movimiento) => (
                    <article
                      className="history-item"
                      key={movimiento.movimientoId}
                    >
                      <div className="history-dot" />

                      <div>
                        <strong>
                          {movimiento.tipoMovimiento.toUpperCase()}
                        </strong>

                        <span>
                          {formatoFecha(movimiento.fechaMovimiento)}
                        </span>

                        {movimiento.cargoAnterior && (
                          <p>
                            Cargo anterior: {movimiento.cargoAnterior}
                          </p>
                        )}

                        {movimiento.cargoNuevo && (
                          <p>
                            Cargo nuevo: {movimiento.cargoNuevo}
                          </p>
                        )}

                        {movimiento.motivo && (
                          <p>Motivo: {movimiento.motivo}</p>
                        )}

                        {movimiento.observaciones && (
                          <p>
                            Observaciones: {movimiento.observaciones}
                          </p>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              )}
          </section>
        </div>
      )}

      {/* Modal para registrar o editar trabajadores */}
      {mostrarFormulario && (
        <TrabajadorForm
          trabajador={trabajadorEditar}
          onCerrar={() => {
            setMostrarFormulario(false);
            setTrabajadorEditar(null);
          }}
          onGuardado={cargarTrabajadores}
        />
      )}

      {mostrarMovimiento && trabajadorMovimiento && (
        <MovimientoForm
          trabajador={trabajadorMovimiento}
          onCerrar={() => {
            setMostrarMovimiento(false);
            setTrabajadorMovimiento(null);
          }}
          onGuardado={cargarTrabajadores}
        />
      )}

    </div>
  );
}

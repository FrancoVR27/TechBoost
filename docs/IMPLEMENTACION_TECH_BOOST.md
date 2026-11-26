# Implementación TECH BOOST Bolivia

## 1. Alcance desarrollado

Esta entrega incorpora exclusivamente:

- Presentación pública de TECH BOOST.
- Servicios y propuesta de valor.
- Cadena de valor, con el taller de calzado como ejemplo adaptable.
- Interfaz financiera de demostración, con cálculos y registros en memoria.
- Contratos de integración para conectar el frontend con el backend existente.

No se desarrollaron los módulos de marketing, recursos humanos, chatbot ni administración general.

## 2. Auditoría del repositorio recibido

El ZIP `TechBoost-main.zip` contiene dos aplicaciones iniciales:

### Frontend

- React 19, TypeScript y Vite.
- La aplicación inicial era una pantalla de prueba que consultaba `GET /` en NestJS.
- No había rutas de negocio, componentes empresariales, autenticación ni conexión a Supabase.

### Backend

- NestJS 12.
- El único controlador de negocio encontrado era `GET /`, que devuelve `Hello World!`.
- No se encontraron módulos, controladores ni servicios financieros.
- No se encontraron guards de autenticación/autorización ni integración con Supabase/PostgreSQL.

### Base de datos

El archivo `scriptCreacionBd.sql` no estaba incluido en el ZIP recibido. Por ello no fue posible verificar columnas, claves foráneas, tipos, restricciones, políticas RLS ni nombres reales de campos.

**Consecuencia:** no se inventaron consultas SQL, migraciones, endpoints existentes ni persistencia financiera. El backend se dejó intacto hasta contar con el esquema real y la implementación de autenticación del equipo.

## 3. Presentación pública

La página pública contiene:

- Hero con nombre y eslogan «Transformación inteligente de industrias».
- Identidad cromática azul marino, naranja, blanco y gris.
- Misión y visión tomadas del documento conceptual.
- Problema y respuesta de TECH BOOST.
- Empresas objetivo del sector secundario.
- Servicios organizados en optimización productiva y gestión administrativa.
- Distinción visible entre capacidades base, integración modular y fases posteriores.
- Llamado a la acción para solicitar un diagnóstico.

El formulario de diagnóstico prepara una solicitud que el visitante puede copiar. No afirma haberla enviado: el backend recibido no contiene un endpoint ni una tabla de solicitudes.

## 4. Cadena de valor

Se incorporó un flujo interactivo de ocho etapas para el taller de calzado:

1. Recepción de materias primas.
2. Diseño y modelado.
3. Corte de materiales.
4. Aparado o ensamblado.
5. Armado.
6. Acabado y control de calidad.
7. Empaque y almacenamiento.
8. Distribución o entrega.

Cada etapa incluye descripción, insumos, resultado, riesgos y aportes potenciales de TECH BOOST. Se advierte que la secuencia puede variar según el rubro y la operación real.

También se presentan puntos críticos transversales y resultados esperados del análisis.

## 5. Área financiera

La ruta `#finanzas` muestra primero una barrera de acceso. El acceso real queda bloqueado hasta que el backend implemente autenticación y autorización verificables en servidor.

Para permitir revisar la experiencia de usuario se ofrece una **demostración separada con datos ficticios**. Esta demostración:

- No consulta datos de clientes.
- No escribe en Supabase ni PostgreSQL.
- No utiliza `localStorage`.
- Mantiene los registros creados en memoria durante la sesión.
- Reinicia los datos al recargar la aplicación.

Incluye:

- Indicadores de ingresos, egresos, resultado neto, costos de producción, margen y saldo de caja.
- Filtro mensual y filtros de movimientos.
- Registro de ventas, compras de insumos, gastos operativos y pagos a destajo.
- Clasificación manual de costos fijos y variables.
- Flujo de caja con saldo inicial, entradas, salidas y saldo final.
- Estimación editable del costo de un lote y costo unitario.
- Calculadora de punto de equilibrio con validación de contribución unitaria.
- Recomendaciones por reglas sencillas, identificadas como no basadas en IA.

### Límite de los cálculos

El costo por producto mostrado es una **estimación editable**. Para obtener un costo real, el backend debe consolidar consumos reales de recetas, órdenes de producción y ejecución de etapas, y tomar la mano de obra desde una sola fuente autorizada. No debe sumar nuevamente pagos a destajo si ya están incluidos en el costo de mano de obra de producción.

## 6. Contratos y seguridad pendientes

Los contratos propuestos se encuentran en `docs/CONTRATOS_API_PENDIENTES.md`. Son especificaciones de integración, no rutas ya implementadas.

Reglas obligatorias para el backend:

- Roles exactos: `Cliente` y `Admin`.
- El cliente debe quedar vinculado a una sola empresa.
- El servidor debe resolver la empresa a partir del usuario autenticado; no debe confiar en un `empresa_id` enviado por el navegador.
- Cada consulta y modificación financiera debe estar filtrada por la empresa autorizada.
- El rol `Admin` debe respetar los permisos que defina el proyecto.
- La autenticación y autorización deben comprobarse en servidor. Ocultar componentes en React no es una medida de seguridad.
- No exponer credenciales `service_role` de Supabase al frontend.

## 7. Clasificación de costos y migración SQL

No se creó ni ejecutó una migración SQL porque falta `scriptCreacionBd.sql`. Antes de definir dónde guardar la naturaleza fija/variable es necesario verificar si `registros_operativos` representa efectivamente los movimientos financieros y qué campo identifica su tipo.

La ampliación mínima prevista es almacenar la naturaleza del costo (`FIJO` o `VARIABLE`) para los movimientos que sean egresos. Las ventas no deben clasificarse como costos. La naturaleza debe ser editable y validada, no deducida exclusivamente del nombre del movimiento.

Una vez recibido el SQL se podrá preparar una migración idempotente con el nombre real de la tabla, tipo y restricciones compatibles con el esquema existente.

## 8. Archivos principales

- `frontend/src/App.tsx`: presentación pública, navegación, diagnóstico y control de acceso a finanzas.
- `frontend/src/App.css`: diseño y responsive.
- `frontend/src/index.css`: variables de identidad y estilos globales.
- `frontend/src/data/chainStages.ts`: datos del flujo de cadena de valor.
- `frontend/src/components/FinanceDemo.tsx`: interfaz financiera de demostración.
- `frontend/src/components/Icon.tsx`: iconografía SVG propia, sin dependencia externa.
- `frontend/public/techboost-logo.png`: logotipo original extraído del prototipo HTML anterior.
- `frontend/src/services/financeGateway.ts`: tipos y adaptador de datos ficticios en memoria.
- `docs/CONTRATOS_API_PENDIENTES.md`: contratos propuestos para backend.
- `docs/VALIDACION.md`: comprobaciones realizadas y limitaciones del entorno.
- `docs/IMPLEMENTACION_TECH_BOOST.md`: esta documentación.

## 9. Ejecución local

En una terminal:

```bash
cd frontend
npm ci
npm run dev
```

Para validar el frontend:

```bash
cd frontend
npm run build
```

El backend no recibió cambios en esta entrega. Para ejecutarlo se mantienen sus instrucciones originales en `backend/README.md`.

## 10. Siguiente paso para integrar datos reales

Se necesita incorporar al repositorio el `scriptCreacionBd.sql` y la implementación de autenticación/roles que el equipo esté desarrollando. Con esos elementos se puede sustituir el adaptador de demostración por el servicio HTTP real, añadir los controladores NestJS y construir una migración SQL compatible sin afectar las tablas o módulos de otros integrantes.

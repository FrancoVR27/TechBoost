-- Habilitar extensión para generación de UUIDs (PostgreSQL 13+ ya incluye gen_random_uuid() nativamente, pero por compatibilidad):
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. CATÁLOGO DE PLANES (Tabla de correspondencia simple)
-- ============================================================================
CREATE TABLE planes (
    plan_id INT PRIMARY KEY,
    nombre VARCHAR(50) UNIQUE NOT NULL,
    precio_mensual_bs DECIMAL(10, 2) NOT NULL DEFAULT 0.00
);

-- ============================================================================
-- 2. USUARIOS Y EMPRESAS (Relación estricta 1 a 1 entre Cliente y Empresa)
-- ============================================================================
CREATE TABLE usuarios (
    usuario_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    correo VARCHAR(150) UNIQUE NOT NULL,
    contrasena_hash VARCHAR(255) NOT NULL,
    rol VARCHAR(20) NOT NULL CHECK (rol IN ('Admin', 'Cliente')),
    plan_id INT REFERENCES planes(plan_id), -- NULL si es Admin; 1, 2, 3, etc. si es Cliente
    estado VARCHAR(20) NOT NULL DEFAULT 'activo' CHECK (estado IN ('activo', 'suspendido', 'prueba')),
    fecha_registro TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE empresas (
    empresa_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cliente_id UUID UNIQUE NOT NULL REFERENCES usuarios(usuario_id) ON DELETE CASCADE, -- 1 empresa por cliente
    razon_social VARCHAR(150) NOT NULL,
    nit VARCHAR(30),
    tamano VARCHAR(20) NOT NULL CHECK (tamano IN ('micro', 'pequena', 'mediana')),
    rubro VARCHAR(60) NOT NULL, -- Ej: 'calzado', 'textil', 'metalmecanica', 'alimentos', 'comercio'
    departamento VARCHAR(50) DEFAULT 'La Paz',
    cantidad_empleados INT DEFAULT 1,
    usa_facturacion_sin BOOLEAN DEFAULT FALSE,
    configuracion_erp_ia JSONB, -- Estructura de módulos/campos generada por la IA según el rubro
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 3. CADENA DE VALOR Y PRODUCCIÓN (Base para análisis de IA)
-- ============================================================================
CREATE TABLE etapas_cadena_valor (
    etapa_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id UUID NOT NULL REFERENCES empresas(empresa_id) ON DELETE CASCADE,
    nombre_etapa VARCHAR(100) NOT NULL, -- Ej: 'Recepción', 'Corte', 'Aparado', 'Armado', 'Empaque'
    tipo_actividad VARCHAR(20) NOT NULL DEFAULT 'primaria' CHECK (tipo_actividad IN ('primaria', 'soporte')),
    orden_secuencia INT NOT NULL,
    tiempo_estimado_min DECIMAL(8, 2),
    costo_mano_obra_estandar_bs DECIMAL(10, 2) DEFAULT 0.00,
    descripcion TEXT
);

CREATE TABLE productos (
    producto_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id UUID NOT NULL REFERENCES empresas(empresa_id) ON DELETE CASCADE,
    sku VARCHAR(50),
    nombre VARCHAR(120) NOT NULL,
    unidad_medida VARCHAR(30) NOT NULL, -- 'par', 'docena', 'prenda', 'kg', 'unidad'
    precio_venta_bs DECIMAL(10, 2) NOT NULL,
    costo_calculado_bs DECIMAL(10, 2),
    margen_ganancia_pct DECIMAL(5, 2)
);

CREATE TABLE ordenes_produccion (
    orden_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id UUID NOT NULL REFERENCES empresas(empresa_id) ON DELETE CASCADE,
    producto_id UUID NOT NULL REFERENCES productos(producto_id) ON DELETE RESTRICT,
    cantidad_planificada INT NOT NULL,
    cantidad_producida INT DEFAULT 0,
    cantidad_defectuosa INT DEFAULT 0, -- Para control de calidad / visión artificial
    estado VARCHAR(20) NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'en_proceso', 'completada', 'cancelada')),
    fecha_inicio TIMESTAMP WITH TIME ZONE,
    fecha_fin_estimada TIMESTAMP WITH TIME ZONE,
    fecha_fin_real TIMESTAMP WITH TIME ZONE
);

CREATE TABLE ejecucion_etapas_orden (
    ejecucion_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    orden_id UUID NOT NULL REFERENCES ordenes_produccion(orden_id) ON DELETE CASCADE,
    etapa_id UUID NOT NULL REFERENCES etapas_cadena_valor(etapa_id) ON DELETE RESTRICT,
    tiempo_real_min DECIMAL(8, 2),
    desperdicio_registrado DECIMAL(10, 2) DEFAULT 0.00,
    costo_real_etapa_bs DECIMAL(10, 2),
    observaciones TEXT,
    fecha_registro TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 4. MAQUINARIA, LECTORAS IOT Y MANTENIMIENTO PREDICTIVO
-- ============================================================================
CREATE TABLE maquinarias (
    maquina_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id UUID NOT NULL REFERENCES empresas(empresa_id) ON DELETE CASCADE,
    etapa_id UUID REFERENCES etapas_cadena_valor(etapa_id) ON DELETE SET NULL,
    nombre VARCHAR(100) NOT NULL,
    marca_modelo VARCHAR(100),
    anio_fabricacion INT,
    estado_operativo VARCHAR(30) NOT NULL DEFAULT 'operativa' CHECK (estado_operativo IN ('operativa', 'en_mantenimiento', 'parada_falla', 'inactiva')),
    horas_uso_acumuladas DECIMAL(10, 2) DEFAULT 0.00
);

CREATE TABLE dispositivos_iot (
    dispositivo_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    maquina_id UUID NOT NULL REFERENCES maquinarias(maquina_id) ON DELETE CASCADE,
    codigo_hardware VARCHAR(80) UNIQUE NOT NULL, -- MAC / Serial del sensor o gateway MQTT
    tipo_sensor VARCHAR(50) NOT NULL, -- 'temperatura', 'vibracion', 'corriente', 'camara_vision', 'multivariable'
    unidad_medida VARCHAR(20), -- '°C', 'mm/s', 'Amperios'
    umbral_alerta_min DECIMAL(10, 3),
    umbral_alerta_max DECIMAL(10, 3),
    estado_conexion VARCHAR(20) NOT NULL DEFAULT 'online' CHECK (estado_conexion IN ('online', 'offline', 'error'))
);

CREATE TABLE lecturas_iot (
    lectura_id BIGSERIAL PRIMARY KEY,
    dispositivo_id UUID NOT NULL REFERENCES dispositivos_iot(dispositivo_id) ON DELETE CASCADE,
    timestamp_lectura TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    valor_numerico DECIMAL(12, 4),
    payload_raw JSONB, -- Ej: {"temp": 68.4, "vib_x": 2.1, "rpm": 1400}
    es_anomalia BOOLEAN DEFAULT FALSE
);

CREATE TABLE historial_mantenimientos (
    mantenimiento_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    maquina_id UUID NOT NULL REFERENCES maquinarias(maquina_id) ON DELETE CASCADE,
    tipo VARCHAR(30) NOT NULL CHECK (tipo IN ('correctivo', 'preventivo', 'predictivo_ia')),
    descripcion_falla TEXT,
    costo_reparacion_bs DECIMAL(10, 2) DEFAULT 0.00,
    tiempo_parada_horas DECIMAL(6, 2) DEFAULT 0.00,
    fecha_inicio TIMESTAMP WITH TIME ZONE NOT NULL,
    fecha_fin TIMESTAMP WITH TIME ZONE
);

-- ============================================================================
-- 5. INVENTARIOS, RECETAS (COSTOS) Y REGISTROS OPERATIVOS (WHATSAPP / ERP)
-- ============================================================================
CREATE TABLE insumos (
    insumo_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id UUID NOT NULL REFERENCES empresas(empresa_id) ON DELETE CASCADE,
    nombre VARCHAR(100) NOT NULL,
    unidad_medida VARCHAR(20) NOT NULL, -- 'metros', 'kg', 'litros', 'unidades'
    stock_actual DECIMAL(12, 3) NOT NULL DEFAULT 0,
    stock_minimo_alerta DECIMAL(12, 3) NOT NULL DEFAULT 0,
    costo_unitario_promedio_bs DECIMAL(10, 2) NOT NULL DEFAULT 0.00
);

CREATE TABLE receta_producto_insumos (
    receta_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    producto_id UUID NOT NULL REFERENCES productos(producto_id) ON DELETE CASCADE,
    insumo_id UUID NOT NULL REFERENCES insumos(insumo_id) ON DELETE RESTRICT,
    cantidad_requerida DECIMAL(10, 4) NOT NULL,
    porcentaje_merma_estimada DECIMAL(5, 2) DEFAULT 0.00
);

CREATE TABLE registros_operativos (
    registro_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id UUID NOT NULL REFERENCES empresas(empresa_id) ON DELETE CASCADE,
    tipo_movimiento VARCHAR(30) NOT NULL CHECK (tipo_movimiento IN ('venta', 'compra_insumo', 'gasto_operativo', 'pago_destajo')),
    monto_bs DECIMAL(12, 2) NOT NULL,
    descripcion TEXT,
    canal_origen VARCHAR(30) NOT NULL DEFAULT 'web' CHECK (canal_origen IN ('web', 'whatsapp_audio', 'whatsapp_texto', 'whatsapp_foto', 'erp_sync')),
    datos_extraidos_ia JSONB,
    fecha_operacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 6. RECURSOS HUMANOS Y TRABAJO A DESTAJO
-- ============================================================================
CREATE TABLE trabajadores (
    trabajador_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id UUID NOT NULL REFERENCES empresas(empresa_id) ON DELETE CASCADE,
    nombre_completo VARCHAR(150) NOT NULL,
    cargo VARCHAR(80),
    modalidad_pago VARCHAR(20) NOT NULL CHECK (modalidad_pago IN ('sueldo_fijo', 'destajo', 'mixto')),
    tarifa_base_bs DECIMAL(10, 2) NOT NULL,
    activo BOOLEAN DEFAULT TRUE
);

CREATE TABLE registros_destajo (
    destajo_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trabajador_id UUID NOT NULL REFERENCES trabajadores(trabajador_id) ON DELETE CASCADE,
    orden_id UUID REFERENCES ordenes_produccion(orden_id) ON DELETE SET NULL,
    etapa_id UUID REFERENCES etapas_cadena_valor(etapa_id) ON DELETE SET NULL,
    cantidad_unidades_entregadas DECIMAL(10, 2) NOT NULL,
    monto_ganado_bs DECIMAL(10, 2) NOT NULL,
    pagado BOOLEAN DEFAULT FALSE,
    fecha_registro TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 7. INFORMES Y ANÁLISIS DETALLADOS GENERADOS POR IA
-- ============================================================================
CREATE TABLE informes_analisis_ia (
    informe_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id UUID NOT NULL REFERENCES empresas(empresa_id) ON DELETE CASCADE,
    tipo_analisis VARCHAR(50) NOT NULL CHECK (tipo_analisis IN (
        'optimizacion_cadena_valor',
        'mantenimiento_predictivo',
        'costos_y_margenes',
        'demanda_estacional',
        'diagnostico_integral'
    )),
    periodo_analizado VARCHAR(50),
    resumen_ejecutivo TEXT NOT NULL,
    cuellos_de_botella JSONB,
    predicciones_falla JSONB,
    recomendaciones_accionables JSONB,
    ahorro_estimado_bs DECIMAL(12, 2),
    modelo_ia_utilizado VARCHAR(60),
    fecha_generacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 8. ÍNDICES PARA RENDIMIENTO (Series de tiempo IoT y consultas por empresa)
-- ============================================================================
CREATE INDEX idx_lecturas_iot_dispositivo_fecha ON lecturas_iot (dispositivo_id, timestamp_lectura DESC);
CREATE INDEX idx_etapas_empresa ON etapas_cadena_valor (empresa_id, orden_secuencia);
CREATE INDEX idx_ordenes_empresa_estado ON ordenes_produccion (empresa_id, estado);
CREATE INDEX idx_registros_op_empresa_fecha ON registros_operativos (empresa_id, fecha_operacion DESC);

-- ============================================================================
-- 9. DATOS INICIALES (Catálogo de correspondencia de Planes según el proyecto)
-- ============================================================================
INSERT INTO planes (plan_id, nombre, precio_mensual_bs) VALUES
    (1, 'free', 0.00),
    (2, 'monitoreo', 700.00),
    (3, 'predictivo_ia', 2200.00),
    (4, 'automatizacion_full', 0.00); -- Cotización por proyecto desde Bs 12.000
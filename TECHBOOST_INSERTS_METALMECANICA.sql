/* ============================================================================
   TECH BOOST - DATOS INICIALES PARA EMPRESA METALMECANICA
   Base: scriptCreacionBd.sql del proyecto TechBoost.

   IMPORTANTE:
   1. Cambia v_correo_cliente por el correo de TU cuenta registrada en usuarios.
   2. Ejecuta el archivo completo en Supabase > SQL Editor.
   3. El script no crea usuarios ni modifica contrasenas.
   4. Los registros son datos DEMOSTRATIVOS para el taller metalmecanico.
   5. Se puede volver a ejecutar: evita duplicar la mayoria de los registros.
   ============================================================================ */

DO $$
DECLARE
    v_correo_cliente TEXT := 'bricollo@gmail.com';
    v_cliente_id UUID;
    v_empresa_id UUID;
BEGIN
    /* 1. Encontrar el usuario propietario de esta empresa. */
    SELECT u.usuario_id
      INTO v_cliente_id
      FROM usuarios u
     WHERE LOWER(u.correo) = LOWER(v_correo_cliente)
       AND u.rol = 'Cliente'
     LIMIT 1;

    IF v_cliente_id IS NULL THEN
        RAISE EXCEPTION 'No se encontro un usuario Cliente con ese correo. Revisa v_correo_cliente y la tabla usuarios.';
    END IF;

    /* 2. Crear la empresa o reutilizarla si ya es metalmecanica. */
    SELECT e.empresa_id
      INTO v_empresa_id
      FROM empresas e
     WHERE e.cliente_id = v_cliente_id
     LIMIT 1;

    IF v_empresa_id IS NOT NULL THEN
        IF NOT EXISTS (
            SELECT 1
              FROM empresas e
             WHERE e.empresa_id = v_empresa_id
               AND LOWER(e.rubro) IN ('metalmecanica', 'metalmecánica')
        ) THEN
            RAISE EXCEPTION 'Tu usuario ya tiene una empresa registrada con otro rubro. No se modifico para proteger los datos existentes.';
        END IF;
    ELSE
        INSERT INTO empresas (
            cliente_id,
            razon_social,
            nit,
            tamano,
            rubro,
            departamento,
            cantidad_empleados,
            usa_facturacion_sin,
            configuracion_erp_ia
        ) VALUES (
            v_cliente_id,
            'Taller Metalmecanico Andino',
            NULL,
            'micro',
            'metalmecanica',
            'La Paz',
            4,
            FALSE,
            '{
              "rubro": "metalmecanica",
              "cadena_valor": [
                "Diseno y trazado",
                "Corte",
                "Perforado y mecanizado",
                "Soldadura y armado",
                "Esmerilado y acabado",
                "Pintura anticorrosiva",
                "Inspeccion y despacho"
              ],
              "modulos": ["recursos_humanos", "costos_producto", "produccion", "inventario", "maquinaria_iot"]
            }'::jsonb
        )
        RETURNING empresa_id INTO v_empresa_id;
    END IF;

    /* 3. Etapas de la cadena de valor metalmecanica. */
    INSERT INTO etapas_cadena_valor (
        empresa_id, nombre_etapa, tipo_actividad,
        orden_secuencia, tiempo_estimado_min,
        costo_mano_obra_estandar_bs, descripcion
    )
    SELECT v_empresa_id, x.nombre, 'primaria', x.orden,
           x.tiempo, x.costo, x.descripcion
      FROM (VALUES
        ('Diseno y trazado', 1, 25.00::NUMERIC, 18.00::NUMERIC, 'Medicion, marcado y preparacion de planos de fabricacion.'),
        ('Corte', 2, 35.00::NUMERIC, 22.00::NUMERIC, 'Corte de planchas y perfiles metalicos segun medidas.'),
        ('Perforado y mecanizado', 3, 30.00::NUMERIC, 24.00::NUMERIC, 'Perforado, torneado y ajuste dimensional de piezas.'),
        ('Soldadura y armado', 4, 50.00::NUMERIC, 35.00::NUMERIC, 'Union de piezas mediante soldadura y armado de estructuras.'),
        ('Esmerilado y acabado', 5, 25.00::NUMERIC, 18.00::NUMERIC, 'Desbaste, limpieza de cordones y preparacion de superficies.'),
        ('Pintura anticorrosiva', 6, 30.00::NUMERIC, 16.00::NUMERIC, 'Aplicacion de pintura protectora y acabado.'),
        ('Inspeccion y despacho', 7, 15.00::NUMERIC, 12.00::NUMERIC, 'Verificacion de medidas, acabado y preparacion para entrega.')
      ) AS x(nombre, orden, tiempo, costo, descripcion)
     WHERE NOT EXISTS (
        SELECT 1 FROM etapas_cadena_valor e
         WHERE e.empresa_id = v_empresa_id
           AND e.nombre_etapa = x.nombre
     );

    /* 4. Productos demostrativos de la empresa. */
    INSERT INTO productos (
        empresa_id, sku, nombre, unidad_medida, precio_venta_bs,
        costo_calculado_bs, margen_ganancia_pct,
        costo_mano_obra_bs, otros_costos_bs
    )
    SELECT v_empresa_id, x.sku, x.nombre, 'unidad', x.precio,
           NULL, NULL, x.mano_obra, x.otros_costos
      FROM (VALUES
        ('MET-001', 'Soporte metalico para motor', 580.00::NUMERIC, 65.00::NUMERIC, 18.00::NUMERIC),
        ('MET-002', 'Puerta metalica reforzada', 1250.00::NUMERIC, 140.00::NUMERIC, 35.00::NUMERIC),
        ('MET-003', 'Estanteria industrial de cuatro niveles', 1800.00::NUMERIC, 210.00::NUMERIC, 60.00::NUMERIC)
      ) AS x(sku, nombre, precio, mano_obra, otros_costos)
     WHERE NOT EXISTS (
        SELECT 1 FROM productos p
         WHERE p.empresa_id = v_empresa_id AND p.sku = x.sku
     );

    /* 5. Insumos y existencias iniciales. */
    INSERT INTO insumos (
        empresa_id, nombre, unidad_medida,
        stock_actual, stock_minimo_alerta, costo_unitario_promedio_bs
    )
    SELECT v_empresa_id, x.nombre, x.unidad,
           x.stock, x.minimo, x.costo
      FROM (VALUES
        ('Plancha de acero A36', 'm2', 120.000::NUMERIC, 20.000::NUMERIC, 95.00::NUMERIC),
        ('Tubo cuadrado 40x40', 'm', 200.000::NUMERIC, 30.000::NUMERIC, 42.00::NUMERIC),
        ('Electrodo E6013', 'kg', 50.000::NUMERIC, 10.000::NUMERIC, 38.00::NUMERIC),
        ('Disco de corte 7 pulgadas', 'unidad', 60.000::NUMERIC, 10.000::NUMERIC, 12.00::NUMERIC),
        ('Pintura anticorrosiva', 'litro', 80.000::NUMERIC, 15.000::NUMERIC, 45.00::NUMERIC),
        ('Pernos y tuercas M12', 'unidad', 300.000::NUMERIC, 50.000::NUMERIC, 2.50::NUMERIC)
      ) AS x(nombre, unidad, stock, minimo, costo)
     WHERE NOT EXISTS (
        SELECT 1 FROM insumos i
         WHERE i.empresa_id = v_empresa_id AND i.nombre = x.nombre
     );

    /* 6. Recetas de insumos por producto (cantidades por unidad producida). */
    INSERT INTO receta_producto_insumos (
        producto_id, insumo_id, cantidad_requerida, porcentaje_merma_estimada
    )
    SELECT p.producto_id, i.insumo_id, x.cantidad, x.merma
      FROM (VALUES
        ('MET-001', 'Plancha de acero A36', 0.75::NUMERIC, 4.00::NUMERIC),
        ('MET-001', 'Tubo cuadrado 40x40', 2.00::NUMERIC, 3.00::NUMERIC),
        ('MET-001', 'Electrodo E6013', 0.35::NUMERIC, 2.00::NUMERIC),
        ('MET-001', 'Disco de corte 7 pulgadas', 0.50::NUMERIC, 0.00::NUMERIC),
        ('MET-001', 'Pintura anticorrosiva', 0.35::NUMERIC, 3.00::NUMERIC),
        ('MET-001', 'Pernos y tuercas M12', 4.00::NUMERIC, 0.00::NUMERIC),
        ('MET-002', 'Plancha de acero A36', 1.60::NUMERIC, 5.00::NUMERIC),
        ('MET-002', 'Tubo cuadrado 40x40', 5.00::NUMERIC, 3.00::NUMERIC),
        ('MET-002', 'Electrodo E6013', 0.80::NUMERIC, 2.00::NUMERIC),
        ('MET-002', 'Disco de corte 7 pulgadas', 0.70::NUMERIC, 0.00::NUMERIC),
        ('MET-002', 'Pintura anticorrosiva', 0.80::NUMERIC, 3.00::NUMERIC),
        ('MET-002', 'Pernos y tuercas M12', 6.00::NUMERIC, 0.00::NUMERIC),
        ('MET-003', 'Plancha de acero A36', 2.00::NUMERIC, 4.00::NUMERIC),
        ('MET-003', 'Tubo cuadrado 40x40', 12.00::NUMERIC, 3.00::NUMERIC),
        ('MET-003', 'Electrodo E6013', 1.20::NUMERIC, 2.00::NUMERIC),
        ('MET-003', 'Disco de corte 7 pulgadas', 1.00::NUMERIC, 0.00::NUMERIC),
        ('MET-003', 'Pintura anticorrosiva', 1.40::NUMERIC, 3.00::NUMERIC),
        ('MET-003', 'Pernos y tuercas M12', 24.00::NUMERIC, 0.00::NUMERIC)
      ) AS x(sku, insumo_nombre, cantidad, merma)
      JOIN productos p
        ON p.empresa_id = v_empresa_id AND p.sku = x.sku
      JOIN insumos i
        ON i.empresa_id = v_empresa_id AND i.nombre = x.insumo_nombre
     WHERE NOT EXISTS (
        SELECT 1 FROM receta_producto_insumos r
         WHERE r.producto_id = p.producto_id
           AND r.insumo_id = i.insumo_id
     );

    /* 7. Maquinaria vinculada a sus etapas. */
    INSERT INTO maquinarias (
        empresa_id, etapa_id, nombre, marca_modelo,
        anio_fabricacion, estado_operativo, horas_uso_acumuladas
    )
    SELECT v_empresa_id, e.etapa_id, x.nombre, x.modelo,
           x.anio, 'operativa', x.horas
      FROM (VALUES
        ('Cortadora plasma CNC', 'Corte', 'CNC generica', 2022, 850.00::NUMERIC),
        ('Torno industrial', 'Perforado y mecanizado', 'Torno paralelo', 2021, 1250.00::NUMERIC),
        ('Taladro de banco', 'Perforado y mecanizado', 'Taladro industrial', 2023, 420.00::NUMERIC),
        ('Soldadora MIG', 'Soldadura y armado', 'Equipo MIG 250A', 2022, 780.00::NUMERIC),
        ('Esmeril industrial', 'Esmerilado y acabado', 'Esmeril de banco', 2023, 310.00::NUMERIC)
      ) AS x(nombre, etapa, modelo, anio, horas)
      LEFT JOIN etapas_cadena_valor e
        ON e.empresa_id = v_empresa_id AND e.nombre_etapa = x.etapa
     WHERE NOT EXISTS (
        SELECT 1 FROM maquinarias m
         WHERE m.empresa_id = v_empresa_id AND m.nombre = x.nombre
     );

    /* 8. Sensores demostrativos para monitoreo de maquinaria. */
    INSERT INTO dispositivos_iot (
        maquina_id, codigo_hardware, tipo_sensor, unidad_medida,
        umbral_alerta_min, umbral_alerta_max, estado_conexion
    )
    SELECT m.maquina_id, x.codigo, x.tipo, x.unidad,
           x.minimo, x.maximo, 'online'
      FROM (VALUES
        ('Torno industrial', 'MTL-BRY-TORNO-TEMP-001', 'temperatura', '°C', 10.000::NUMERIC, 75.000::NUMERIC),
        ('Torno industrial', 'MTL-BRY-TORNO-VIB-001', 'vibracion', 'mm/s', 0.000::NUMERIC, 4.500::NUMERIC),
        ('Soldadora MIG', 'MTL-BRY-SOLD-TEMP-001', 'temperatura', '°C', 10.000::NUMERIC, 85.000::NUMERIC),
        ('Cortadora plasma CNC', 'MTL-BRY-CORTE-CORR-001', 'corriente', 'A', 1.000::NUMERIC, 35.000::NUMERIC)
      ) AS x(maquina, codigo, tipo, unidad, minimo, maximo)
      JOIN maquinarias m
        ON m.empresa_id = v_empresa_id AND m.nombre = x.maquina
    ON CONFLICT (codigo_hardware) DO NOTHING;

    /* 9. Trabajadores de ejemplo para la empresa metalmecanica.
       Si ya existen trabajadores con esos nombres, no se duplican. */
    INSERT INTO trabajadores (
        empresa_id, nombre_completo, cargo,
        modalidad_pago, tarifa_base_bs, activo
    )
    SELECT v_empresa_id, x.nombre, x.cargo, x.modalidad, x.tarifa, TRUE
      FROM (VALUES
        ('Carlos Mamani', 'Soldador', 'destajo', 28.00::NUMERIC),
        ('Miguel Quispe', 'Operador de torno', 'sueldo_fijo', 3200.00::NUMERIC),
        ('Jose Choque', 'Cortador metalico', 'mixto', 2500.00::NUMERIC),
        ('Pedro Condori', 'Armador de estructuras', 'destajo', 24.00::NUMERIC)
      ) AS x(nombre, cargo, modalidad, tarifa)
     WHERE NOT EXISTS (
        SELECT 1 FROM trabajadores t
         WHERE t.empresa_id = v_empresa_id
           AND LOWER(t.nombre_completo) = LOWER(x.nombre)
     );

    /* 10. Orden de produccion demostrativa. */
    INSERT INTO ordenes_produccion (
        empresa_id, producto_id, cantidad_planificada,
        cantidad_producida, cantidad_defectuosa, estado,
        fecha_inicio, fecha_fin_estimada
    )
    SELECT v_empresa_id, p.producto_id, 10, 6, 1, 'en_proceso',
           CURRENT_TIMESTAMP - INTERVAL '2 days',
           CURRENT_TIMESTAMP + INTERVAL '3 days'
      FROM productos p
     WHERE p.empresa_id = v_empresa_id
       AND p.sku = 'MET-001'
       AND NOT EXISTS (
           SELECT 1 FROM ordenes_produccion o
            WHERE o.empresa_id = v_empresa_id
              AND o.producto_id = p.producto_id
              AND o.estado = 'en_proceso'
       );

    /* 11. Registros de trabajo a destajo vinculados a la orden de produccion. */
    INSERT INTO registros_destajo (
        trabajador_id, orden_id, etapa_id,
        cantidad_unidades_entregadas, monto_ganado_bs, pagado, fecha_registro,
        fecha_trabajo, descripcion_trabajo, tarifa_unitaria_bs, fecha_pago
    )
    SELECT t.trabajador_id, o.orden_id, e.etapa_id,
           6.00::NUMERIC,
           6.00::NUMERIC * t.tarifa_base_bs,
           FALSE,
           CURRENT_TIMESTAMP - INTERVAL '1 day',
           CURRENT_DATE - 1,
           'Fabricacion de soportes metalicos para motor',
           t.tarifa_base_bs,
           NULL
      FROM trabajadores t
      JOIN ordenes_produccion o
        ON o.empresa_id = v_empresa_id AND o.estado = 'en_proceso'
      JOIN productos p
        ON p.producto_id = o.producto_id AND p.sku = 'MET-001'
      JOIN etapas_cadena_valor e
        ON e.empresa_id = v_empresa_id AND e.nombre_etapa = 'Soldadura y armado'
     WHERE t.empresa_id = v_empresa_id
       AND t.nombre_completo IN ('Carlos Mamani', 'Pedro Condori')
       AND t.modalidad_pago IN ('destajo', 'mixto')
       AND NOT EXISTS (
           SELECT 1 FROM registros_destajo rd
            WHERE rd.trabajador_id = t.trabajador_id
              AND rd.orden_id = o.orden_id
              AND rd.etapa_id = e.etapa_id
       );

    /* 12. Registros operativos demostrativos de compras y gastos.
       Se marca cada insercion con datos_extraidos_ia.seed para evitar duplicados. */
    INSERT INTO registros_operativos (
        empresa_id, tipo_movimiento, monto_bs, descripcion,
        canal_origen, datos_extraidos_ia, fecha_operacion
    )
    SELECT v_empresa_id, x.tipo, x.monto, x.descripcion,
           'web', jsonb_build_object('seed', 'metalmecanica-demo-v1', 'item', x.item),
           CURRENT_TIMESTAMP - x.antiguedad
      FROM (VALUES
        ('compra_insumo', 11400.00::NUMERIC, 'Compra demostrativa de planchas de acero A36', 'compra-acero', INTERVAL '5 days'),
        ('compra_insumo', 8400.00::NUMERIC, 'Compra demostrativa de tubos cuadrados 40x40', 'compra-tubos', INTERVAL '4 days'),
        ('compra_insumo', 1900.00::NUMERIC, 'Compra demostrativa de electrodos y discos de corte', 'compra-soldadura-corte', INTERVAL '3 days'),
        ('gasto_operativo', 650.00::NUMERIC, 'Gasto demostrativo de energia y servicios del taller', 'gasto-servicios', INTERVAL '2 days')
      ) AS x(tipo, monto, descripcion, item, antiguedad)
     WHERE NOT EXISTS (
        SELECT 1 FROM registros_operativos r
         WHERE r.empresa_id = v_empresa_id
           AND r.datos_extraidos_ia ->> 'seed' = 'metalmecanica-demo-v1'
           AND r.datos_extraidos_ia ->> 'item' = x.item
     );

    RAISE NOTICE 'Datos metalmecanicos insertados/verificados. empresa_id=%', v_empresa_id;
END $$;

/* Verificacion resumida: debe mostrar la empresa metalmecanica y sus conteos. */
SELECT
    e.razon_social,
    e.rubro,
    e.tamano,
    (SELECT COUNT(*) FROM etapas_cadena_valor ec WHERE ec.empresa_id = e.empresa_id) AS etapas,
    (SELECT COUNT(*) FROM productos p WHERE p.empresa_id = e.empresa_id) AS productos,
    (SELECT COUNT(*) FROM insumos i WHERE i.empresa_id = e.empresa_id) AS insumos,
    (SELECT COUNT(*) FROM maquinarias m WHERE m.empresa_id = e.empresa_id) AS maquinarias,
    (SELECT COUNT(*) FROM dispositivos_iot d JOIN maquinarias m ON m.maquina_id = d.maquina_id WHERE m.empresa_id = e.empresa_id) AS sensores_iot,
    (SELECT COUNT(*) FROM receta_producto_insumos r JOIN productos p ON p.producto_id = r.producto_id WHERE p.empresa_id = e.empresa_id) AS lineas_receta,
    (SELECT COUNT(*) FROM trabajadores t WHERE t.empresa_id = e.empresa_id) AS trabajadores,
    (SELECT COUNT(*) FROM ordenes_produccion o WHERE o.empresa_id = e.empresa_id) AS ordenes_produccion,
    (SELECT COUNT(*) FROM registros_destajo rd JOIN trabajadores t ON t.trabajador_id = rd.trabajador_id WHERE t.empresa_id = e.empresa_id) AS registros_destajo,
    (SELECT COUNT(*) FROM registros_operativos ro WHERE ro.empresa_id = e.empresa_id) AS registros_operativos
FROM empresas e
WHERE e.cliente_id = (
    SELECT u.usuario_id FROM usuarios u
    WHERE LOWER(u.correo) = LOWER('bricollo@gmail.com')
      AND u.rol = 'Cliente'
    LIMIT 1
);

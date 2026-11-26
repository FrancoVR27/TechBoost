# Contratos de API propuestos — TECH BOOST

> **Estado:** propuesta de integración. Ninguna de las rutas de este documento existe todavía en el backend recibido. El backend actual únicamente expone `GET /`.

Los nombres y payloads deben ajustarse al esquema real de PostgreSQL y a las convenciones que adopte el equipo. No se deben implementar hasta revisar `scriptCreacionBd.sql`.

## 1. Solicitud pública de diagnóstico

### `POST /api/public/diagnostic-requests`

Acceso público, con validación de entrada y protección contra abuso.

Payload conceptual:

```json
{
  "name": "Nombre del solicitante",
  "businessName": "Taller de calzado",
  "industry": "Calzado",
  "city": "La Paz",
  "mainNeed": "Conocer el costo real de producción"
}
```

Respuesta esperada: identificador de solicitud y estado de recepción. El backend debe persistirla antes de responder éxito. El frontend actual solo prepara y permite copiar el mensaje porque esta ruta no existe.

## 2. Resumen financiero

### `GET /api/finance/overview?period=YYYY-MM`

Requiere usuario autenticado y rol autorizado.

Respuesta conceptual:

```json
{
  "currency": "BOB",
  "period": "2026-11",
  "income": 0,
  "expenses": 0,
  "netResult": 0,
  "productionCosts": 0,
  "netMargin": 0,
  "openingBalance": 0,
  "closingBalance": 0
}
```

Los importes deben calcularse en servidor a partir de movimientos autorizados de la empresa.

## 3. Movimientos financieros

### `GET /api/finance/movements?from=YYYY-MM-DD&to=YYYY-MM-DD&type=&nature=`

Devuelve únicamente movimientos de la empresa a la que pertenece el usuario `Cliente`, con filtros validados.

### `POST /api/finance/movements`

Payload conceptual:

```json
{
  "date": "2026-11-25",
  "description": "Compra de cuero",
  "type": "compra_insumos",
  "amount": 780,
  "costNature": "VARIABLE"
}
```

Valores de `type` usados por la interfaz:

- `venta`
- `compra_insumos`
- `gasto_operativo`
- `pago_destajo`

Valores de `costNature`:

- `FIJO`
- `VARIABLE`
- `null` para ventas u operaciones que no sean costos.

La naturaleza debe validarse en el servidor. No debe suponerse que todos los gastos operativos son fijos ni que todas las compras son variables sin revisión del uso real.

## 4. Costo por producto

### `GET /api/finance/products/:productId/cost?quantity=N`

Requiere autorización sobre la empresa y el producto solicitado.

El servidor debe consultar las relaciones existentes entre `productos`, `insumos`, `receta_producto_insumos`, `ordenes_produccion` y `ejecucion_etapas_orden`, además de los registros de mano de obra pertinentes.

Respuesta conceptual:

```json
{
  "productId": "id",
  "quantity": 12,
  "costBasis": "ACTUAL",
  "materialsCost": 0,
  "laborCost": 0,
  "otherVariableCost": 0,
  "fixedCostAllocation": 0,
  "totalBatchCost": 0,
  "unitCost": 0,
  "salePrice": 0,
  "estimatedUnitProfit": 0,
  "marginPercent": 0
}
```

`costBasis` debe distinguir `ACTUAL` de `ESTIMATED`. No presentar valores estimados como reales.

### Regla para evitar doble conteo

El backend debe decidir una fuente de verdad para la mano de obra del lote. Si `registros_destajo` ya alimenta el costo de mano de obra, no se debe volver a sumar ese mismo importe desde `registros_operativos` o desde una ejecución de etapa.

## 5. Flujo de caja

### `GET /api/finance/cash-flow?period=YYYY-MM`

Devuelve saldo inicial, ingresos, egresos y saldo final del periodo. El flujo de caja debe basarse en movimientos monetarios y no confundirse con utilidad contable.

El saldo inicial debe proceder del cierre del periodo anterior o de un saldo de apertura configurado y auditado. No debe ser un número arbitrario enviado por el frontend para reportes oficiales.

## 6. Seguridad y autorización

1. Validar firma, expiración, emisor y audiencia del JWT de Supabase en el backend.
2. Obtener el usuario autenticado desde el token validado.
3. Resolver su rol y la empresa vinculada desde la base de datos.
4. Para `Cliente`, aplicar obligatoriamente el filtro de su única empresa en cada lectura y escritura.
5. Para `Admin`, aplicar las políticas administrativas definidas por el equipo; no conceder acceso global implícito.
6. Rechazar cualquier intento de seleccionar una empresa ajena mediante parámetros o cuerpo de la petición.
7. Validar montos positivos, fechas, tipos y naturaleza del costo en DTOs o esquemas de validación del servidor.
8. Auditar modificaciones financieras relevantes.
9. No incluir la clave `service_role` de Supabase en el bundle frontend.

## 7. Datos necesarios para cerrar la integración

- `scriptCreacionBd.sql` completo.
- Implementación actual de autenticación Supabase.
- Definición real de los roles `Cliente` y `Admin`.
- Política de permisos administrativos.
- Nombres exactos de las columnas de importes, fechas y tipos de movimientos.
- Reglas actuales para registrar mano de obra y destajo.

# Integración financiera con PostgreSQL

El área financiera usa la arquitectura existente: NestJS + TypeORM en el backend y un
`FinanceGateway` en el frontend. La autenticaciónglobal (`AuthGuard`/`RolesGuard`) no se
modificó: todos los endpoints financieros quedan protegidos por defecto.

## Endpoints

| Método | Ruta | Descripción |
| --- | --- | --- |
| GET | `/finance/movements?period=YYYY-MM&type=&nature=&limit=` | Movimientos del periodo de la empresa asociada al usuario. |
| POST | `/finance/movements` | Registra un movimiento en `registros_operativos`. |
| GET | `/finance/destajos?period=YYYY-MM` | Destajos desde `registros_destajo`. |
| PATCH | `/finance/destajos/:id/pay` | Marca un destajo como pagado; idempotente, no crea movimientos. |
| GET | `/finance/costs?period=YYYY-MM` | Costos registrados y estimados, separados. |
| GET | `/finance/report?period=YYYY-MM&openingBalance=` | Reporte completo del periodo. |

Cuerpo de `POST /finance/movements`:

```json
{
  "date": "2026-11-25",
  "description": "Compra de cuero",
  "type": "compra_insumos",
  "amount": 780.5,
  "nature": "variable"
}
```

Tipos permitidos para registro: `venta`, `compra_insumos`, `gasto_operativo`. El tipo
`pago_destajo` se consulta desde `registros_destajo`; la API lo rechaza en `POST` y el
formulario real no lo ofrece para evitar duplicar pagos.

## Tablas utilizadas

Solo tablas presentes en `scriptCreacionBd.sql`:
`registros_operativos`, `empresas`, `registros_destajo`, `trabajadores`, `insumos`,
`receta_producto_insumos`, `etapas_cadena_valor` y `productos`.

La clasificación fijo/variable se guarda en el campo JSONB existente
`datos_extraidos_ia.finance`, porque el esquema no tiene una columna dedicada. No se
crearon tablas, columnas ni relaciones nuevas.

## Limitaciones

- Todos los importes están expresados en bolivianos (Bs).
- No existe saldo inicial en la base de datos: el modo real no solicita ni muestra un saldo inventado.
- Los costos estimados (recetas, etapas, insumos y productos) no se suman a los costos
  registrados.
- `registros_destajo` no se agrega al flujo de caja: ese flujo usa únicamente
  `registros_operativos`.
- El modo demostración sigue disponible con datos ficticios en memoria y no escribe en
  PostgreSQL.
- No se implementaron RLS ni aislamiento empresarial adicional.

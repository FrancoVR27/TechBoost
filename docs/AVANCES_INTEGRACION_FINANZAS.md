# Avances de integración financiera

## 2026-11-26

1. Actualizado `origin/main` mediante `git fetch origin` y aplicado el fast-forward de
   `feature/techboost-frontend` hasta `338cdc0`. No se modificó `main`.
2. Revisado `scriptCreacionBd.sql` y las entidades TypeORM existentes para usar solo
   tablas y columnas reales.
3. Implementado el módulo backend `finance`:
   - tipos y utilidades de cálculo;
   - servicio con consultas por empresa del usuario autenticado;
   - controlador con endpoints `/finance/movements`, `/finance/destajos`,
     `/finance/costs` y `/finance/report`;
   - registro del módulo en `app.module.ts`.
4. Implementado `HttpFinanceGateway` como implementación HTTP de `FinanceGateway`, sin
   datos ficticios, y `FinancePanel` para consultar datos reales.
5. Conservados `FinanceDemo`, `financeGateway.ts` y `financeCalculations.ts`.
6. Agregado pago idempotente de destajos (`PATCH /finance/destajos/:id/pay`) sin crear movimientos.
7. Eliminado el saldo inicial del modo real para no mostrar importes inventados.
8. Documentados endpoints, campos y limitaciones en `INTEGRACION_FINANZAS.md`.
9. Conectado a PostgreSQL de Supabase en modo solo lectura: 17/17 tablas y columnas financieras verificadas.
10. Cubiertas con pruebas unitarias la escritura en `registros_operativos`, el pago idempotente
    de destajos, costos registrados/estimados, mano de obra sin duplicación, punto de equilibrio,
    flujo de caja sin saldo inventado y datos vacíos.
11. Validado el frontend en Microsoft Edge headless: login real, panel real con token, estados
    vacíos, modo demostración independiente y error visible al caer la API.
12. Persistencia de escrituras reales no comprobada: no se crearon movimientos ni pagos en
    Supabase. La persistencia queda cubierta por pruebas unitarias de repositorio simulado.

Estado: implementación y validación disponible completadas dentro de los límites autorizados.
No se han creado datos de prueba en Supabase.

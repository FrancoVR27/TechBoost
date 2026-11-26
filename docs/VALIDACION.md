# Validación de la entrega

## Comprobaciones realizadas

| Comprobación | Resultado |
|---|---|
| Análisis sintáctico de archivos TypeScript/TSX | Correcto |
| Verificación estática TypeScript con declaraciones temporales mínimas de React | Correcta |
| Análisis sintáctico del CSS | 329 reglas procesadas, 0 errores |
| Estructura del HTML de entrada | Correcta: idioma español, título, viewport y root de React |
| Etapas de cadena de valor | 8 etapas definidas |
| Pruebas de cálculo financiero | Correctas |
| Archivos del backend comparados con el ZIP original | 64 archivos, 0 modificados |

## Casos de cálculo verificados

Con los ocho movimientos ficticios del taller:

- Ingresos: Bs 3.230.
- Egresos: Bs 3.600.
- Resultado neto: Bs -370.
- Costos fijos: Bs 1.960.
- Costos variables: Bs 1.640.
- Costos de producción de demostración: Bs 1.640.

Con un lote de 12 pares:

- Materiales: Bs 780.
- Mano de obra: Bs 360.
- Otros costos variables: Bs 120.
- Asignación de costos fijos: Bs 100.
- Costo total del lote: Bs 1.360.
- Costo unitario estimado: Bs 113,33.
- Ganancia estimada por unidad a Bs 165: Bs 51,67.
- Ganancia estimada del lote: Bs 620.
- Margen estimado: 31,3 %.

Punto de equilibrio con costos fijos de Bs 1.960, precio de Bs 165 y costo variable unitario de Bs 105:

- Contribución por unidad: Bs 60.
- Punto de equilibrio: 33 unidades.
- Ventas necesarias aproximadas: Bs 5.445.

También se verificó que, cuando el precio de venta no supera el costo variable unitario, el cálculo de punto de equilibrio devuelve un resultado no disponible y no divide entre cero.

## Limitación del entorno de validación

No se pudo completar `npm ci` porque el entorno de ejecución no logró resolver el registro de paquetes npm (`EAI_AGAIN`). Por tanto, no fue posible ejecutar el build oficial de Vite ni las pruebas del backend en este entorno.

La comprobación TypeScript se realizó con declaraciones temporales mínimas para React, porque las dependencias no pudieron instalarse. Esto ayuda a detectar errores de sintaxis y tipos del código propio, pero **no sustituye** la compilación completa con las dependencias reales.

En el equipo de desarrollo, ejecutar:

```bash
cd frontend
npm ci
npm run build
```

Si la compilación muestra errores, deben corregirse antes de integrar o publicar.

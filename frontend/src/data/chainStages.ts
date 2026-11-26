export interface ChainStage {
  id: number;
  title: string;
  short: string;
  description: string;
  inputs: string[];
  output: string;
  risks: string[];
  contribution: string[];
}

export const chainStages: ChainStage[] = [
  {
    id: 1,
    title: "Recepción de materias primas",
    short: "Recibir y verificar",
    description: "Verificamos cantidad y estado de los insumos antes de registrarlos.",
    inputs: ["Cuero y telas", "Suelas y plantillas", "Hilos, adhesivos y herrajes", "Orden de compra"],
    output: "Materiales recibidos, verificados y registrados.",
    risks: ["Faltantes o materiales defectuosos", "Compras urgentes por falta de stock", "Diferencias entre lo comprado y lo recibido"],
    contribution: ["Registro de entradas y proveedores", "Control de existencias y alertas de reposición", "Comparación entre consumo previsto y real"],
  },
  {
    id: 2,
    title: "Diseño y modelado",
    short: "Definir el modelo",
    description: "Definimos modelo, tallas y patrones para preparar el corte.",
    inputs: ["Diseño o muestra", "Patrones y hormas", "Tallas y especificaciones del cliente"],
    output: "Modelo y patrones listos para producción.",
    risks: ["Errores de talla o patrón", "Cambios no comunicados", "Repetición del trabajo por falta de especificaciones"],
    contribution: ["Ficha digital del producto", "Receta de materiales por modelo y talla", "Registro de cambios y versiones"],
  },
  {
    id: 3,
    title: "Corte de materiales",
    short: "Cortar las piezas",
    description: "Cortamos y clasificamos piezas según patrón, modelo y talla.",
    inputs: ["Cuero o tela", "Patrones", "Herramientas o máquinas de corte"],
    output: "Piezas cortadas y clasificadas por modelo y talla.",
    risks: ["Desperdicio por mala distribución", "Piezas con medidas incorrectas", "Retrasos por falta de material"],
    contribution: ["Registro del consumo por lote", "Comparación de consumo esperado y real", "Indicadores de desperdicio para proponer mejoras"],
  },
  {
    id: 4,
    title: "Aparado o ensamblado",
    short: "Unir las piezas",
    description: "Unimos las piezas para formar la parte superior del calzado.",
    inputs: ["Piezas cortadas", "Hilo y adhesivos", "Máquinas de coser y herramientas", "Mano de obra"],
    output: "Capellada o conjunto superior ensamblado.",
    risks: ["Defectos de costura", "Acumulación de trabajo entre operaciones", "Retribución a destajo sin registro claro"],
    contribution: ["Seguimiento de órdenes y etapas", "Registro de unidades y tiempos", "Vinculación controlada con registros de destajo"],
  },
  {
    id: 5,
    title: "Armado",
    short: "Dar forma al calzado",
    description: "Montamos la capellada en la horma y unimos plantilla y suela.",
    inputs: ["Capellada", "Hormas", "Plantillas y suelas", "Adhesivos y equipos"],
    output: "Calzado armado y con su forma final.",
    risks: ["Esperas por disponibilidad de hormas o suelas", "Paradas de maquinaria", "Uniones deficientes"],
    contribution: ["Planificación de materiales y órdenes", "Registro de paradas y causas", "Monitoreo IoT cuando el proyecto y la maquinaria lo permitan"],
  },
  {
    id: 6,
    title: "Acabado y control de calidad",
    short: "Revisar y terminar",
    description: "Revisamos y terminamos cada par antes de empacarlo.",
    inputs: ["Calzado armado", "Productos de acabado", "Lista de criterios de calidad"],
    output: "Pares aprobados o separados para corrección.",
    risks: ["Defectos detectados demasiado tarde", "Reprocesos", "Criterios de revisión diferentes entre operarios"],
    contribution: ["Registro de defectos y reprocesos", "Indicadores de calidad por lote o etapa", "Visión artificial como capacidad de fase posterior"],
  },
  {
    id: 7,
    title: "Empaque y almacenamiento",
    short: "Preparar el pedido",
    description: "Etiquetamos y almacenamos el producto para facilitar su despacho.",
    inputs: ["Pares aprobados", "Cajas y etiquetas", "Espacio de almacenamiento"],
    output: "Producto terminado identificado y listo para despacho.",
    risks: ["Errores de talla o modelo en el empaque", "Pérdida de trazabilidad", "Acumulación de producto terminado"],
    contribution: ["Registro de producto terminado", "Control de lotes y existencias", "Alertas de pedidos pendientes"],
  },
  {
    id: 8,
    title: "Distribución o entrega",
    short: "Entregar al cliente",
    description: "Preparamos el pedido y confirmamos su entrega al cliente.",
    inputs: ["Pedido confirmado", "Producto terminado", "Datos de entrega"],
    output: "Pedido entregado y movimiento de venta registrado.",
    risks: ["Entregas fuera de plazo", "Diferencias entre pedido y despacho", "Falta de información sobre ventas y cobros"],
    contribution: ["Seguimiento de pedidos y entregas", "Registro de ventas y cobros", "Información para planificar la siguiente producción"],
  },
];

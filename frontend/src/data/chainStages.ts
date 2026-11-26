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
    description:
      "Se reciben cuero, telas, suelas, pegamentos, hilos y otros insumos. Antes de almacenarlos se verifica cantidad, estado y correspondencia con el pedido.",
    inputs: ["Cuero y telas", "Suelas y plantillas", "Hilos, adhesivos y herrajes", "Orden de compra"],
    output: "Materiales recibidos, verificados y registrados.",
    risks: ["Faltantes o materiales defectuosos", "Compras urgentes por falta de stock", "Diferencias entre lo comprado y lo recibido"],
    contribution: ["Registro de entradas y proveedores", "Control de existencias y alertas de reposición", "Comparación entre consumo previsto y real"],
  },
  {
    id: 2,
    title: "Diseño y modelado",
    short: "Definir el modelo",
    description:
      "Se define el diseño del calzado, las tallas, las piezas y los patrones que guiarán el corte. La preparación cambia según el modelo y el tipo de pedido.",
    inputs: ["Diseño o muestra", "Patrones y hormas", "Tallas y especificaciones del cliente"],
    output: "Modelo y patrones listos para producción.",
    risks: ["Errores de talla o patrón", "Cambios no comunicados", "Repetición del trabajo por falta de especificaciones"],
    contribution: ["Ficha digital del producto", "Receta de materiales por modelo y talla", "Registro de cambios y versiones"],
  },
  {
    id: 3,
    title: "Corte de materiales",
    short: "Cortar las piezas",
    description:
      "Se trazan y cortan las piezas de cuero, tela u otros materiales siguiendo los patrones. El aprovechamiento depende de la distribución de las piezas y del estado del material.",
    inputs: ["Cuero o tela", "Patrones", "Herramientas o máquinas de corte"],
    output: "Piezas cortadas y clasificadas por modelo y talla.",
    risks: ["Desperdicio por mala distribución", "Piezas con medidas incorrectas", "Retrasos por falta de material"],
    contribution: ["Registro del consumo por lote", "Comparación de consumo esperado y real", "Indicadores de desperdicio para proponer mejoras"],
  },
  {
    id: 4,
    title: "Aparado o ensamblado",
    short: "Unir las piezas",
    description:
      "Las piezas cortadas se cosen o unen para formar la parte superior del calzado. En talleres pequeños esta etapa puede organizarse por persona, operación o pago a destajo.",
    inputs: ["Piezas cortadas", "Hilo y adhesivos", "Máquinas de coser y herramientas", "Mano de obra"],
    output: "Capellada o conjunto superior ensamblado.",
    risks: ["Defectos de costura", "Acumulación de trabajo entre operaciones", "Retribución a destajo sin registro claro"],
    contribution: ["Seguimiento de órdenes y etapas", "Registro de unidades y tiempos", "Vinculación controlada con registros de destajo"],
  },
  {
    id: 5,
    title: "Armado",
    short: "Dar forma al calzado",
    description:
      "La parte superior se monta sobre la horma y se une a la plantilla y a la suela, de acuerdo con el tipo de calzado y el método utilizado por el taller.",
    inputs: ["Capellada", "Hormas", "Plantillas y suelas", "Adhesivos y equipos"],
    output: "Calzado armado y con su forma final.",
    risks: ["Esperas por disponibilidad de hormas o suelas", "Paradas de maquinaria", "Uniones deficientes"],
    contribution: ["Planificación de materiales y órdenes", "Registro de paradas y causas", "Monitoreo IoT cuando el proyecto y la maquinaria lo permitan"],
  },
  {
    id: 6,
    title: "Acabado y control de calidad",
    short: "Revisar y terminar",
    description:
      "Se limpian, retocan y revisan los pares terminados. Se comprueba que el producto cumpla las especificaciones antes de pasar al empaque.",
    inputs: ["Calzado armado", "Productos de acabado", "Lista de criterios de calidad"],
    output: "Pares aprobados o separados para corrección.",
    risks: ["Defectos detectados demasiado tarde", "Reprocesos", "Criterios de revisión diferentes entre operarios"],
    contribution: ["Registro de defectos y reprocesos", "Indicadores de calidad por lote o etapa", "Visión artificial como capacidad de fase posterior"],
  },
  {
    id: 7,
    title: "Empaque y almacenamiento",
    short: "Preparar el pedido",
    description:
      "Los pares aprobados se etiquetan, empacan y almacenan de forma ordenada para mantener la trazabilidad del lote y facilitar su despacho.",
    inputs: ["Pares aprobados", "Cajas y etiquetas", "Espacio de almacenamiento"],
    output: "Producto terminado identificado y listo para despacho.",
    risks: ["Errores de talla o modelo en el empaque", "Pérdida de trazabilidad", "Acumulación de producto terminado"],
    contribution: ["Registro de producto terminado", "Control de lotes y existencias", "Alertas de pedidos pendientes"],
  },
  {
    id: 8,
    title: "Distribución o entrega",
    short: "Entregar al cliente",
    description:
      "Se prepara la salida del pedido y se confirma la cantidad entregada. La distribución puede ser directa al cliente, a una tienda o a otro canal acordado.",
    inputs: ["Pedido confirmado", "Producto terminado", "Datos de entrega"],
    output: "Pedido entregado y movimiento de venta registrado.",
    risks: ["Entregas fuera de plazo", "Diferencias entre pedido y despacho", "Falta de información sobre ventas y cobros"],
    contribution: ["Seguimiento de pedidos y entregas", "Registro de ventas y cobros", "Información para planificar la siguiente producción"],
  },
];

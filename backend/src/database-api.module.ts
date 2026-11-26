import { Module } from '@nestjs/common';
import { DispositivosIotModule } from './dispositivos-iot/dispositivos-iot.module.js';
import { EjecucionEtapasOrdenModule } from './ejecucion-etapas-orden/ejecucion-etapas-orden.module.js';
import { EmpresasModule } from './empresas/empresas.module.js';
import { EtapasCadenaValorModule } from './etapas-cadena-valor/etapas-cadena-valor.module.js';
import { HistorialMantenimientosModule } from './historial-mantenimientos/historial-mantenimientos.module.js';
import { InformesAnalisisIaModule } from './informes-analisis-ia/informes-analisis-ia.module.js';
import { InsumosModule } from './insumos/insumos.module.js';
import { LecturasIotModule } from './lecturas-iot/lecturas-iot.module.js';
import { MaquinariasModule } from './maquinarias/maquinarias.module.js';
import { OrdenesProduccionModule } from './ordenes-produccion/ordenes-produccion.module.js';
import { PlanesModule } from './planes/planes.module.js';
import { ProductosModule } from './productos/productos.module.js';
import { RecetasProductoInsumosModule } from './receta-producto-insumos/recetas-producto-insumos.module.js';
import { RegistrosDestajoModule } from './registros-destajo/registros-destajo.module.js';
import { RegistrosOperativosModule } from './registros-operativos/registros-operativos.module.js';
import { TrabajadoresModule } from './trabajadores/trabajadores.module.js';
import { UsuariosModule } from './usuarios/usuarios.module.js';
import { CostosProductosModule } from './costos-productos/costos-productos.module.js';

@Module({
  imports: [
    PlanesModule,
    UsuariosModule,
    EmpresasModule,
    EtapasCadenaValorModule,
    ProductosModule,
    OrdenesProduccionModule,
    EjecucionEtapasOrdenModule,
    MaquinariasModule,
    DispositivosIotModule,
    LecturasIotModule,
    HistorialMantenimientosModule,
    InsumosModule,
    RecetasProductoInsumosModule,
    RegistrosOperativosModule,
    TrabajadoresModule,
    RegistrosDestajoModule,
    InformesAnalisisIaModule,
    CostosProductosModule,
  ],
})
export class DatabaseApiModule {}

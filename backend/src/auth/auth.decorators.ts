import { SetMetadata } from '@nestjs/common';
import type { Rol } from './auth.types.js';

export const IS_PUBLIC_KEY = 'auth:isPublic';
export const ROLES_KEY = 'auth:roles';
export const ADMIN_WRITES_KEY = 'auth:adminWrites';

/** La ruta no exige token (login, registro, health). */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

/** Solo los roles indicados pueden usar la ruta o el controlador. */
export const Roles = (...roles: Rol[]) => SetMetadata(ROLES_KEY, roles);

/** Cualquier usuario autenticado puede leer (GET); solo Admin escribe. */
export const AdminWrites = () => SetMetadata(ADMIN_WRITES_KEY, true);

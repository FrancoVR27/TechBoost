import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  ADMIN_WRITES_KEY,
  IS_PUBLIC_KEY,
  ROLES_KEY,
} from './auth.decorators.js';
import type { AuthenticatedRequest, Rol } from './auth.types.js';

/** Se ejecuta después de AuthGuard: aplica @Roles() y @AdminWrites(). */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const targets = [context.getHandler(), context.getClass()];
    if (this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, targets)) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const rol = request.user?.rol;

    const roles = this.reflector.getAllAndOverride<Rol[]>(ROLES_KEY, targets);
    if (roles?.length && (!rol || !roles.includes(rol as Rol))) {
      throw new ForbiddenException('No tienes permiso para esta acción');
    }

    const adminWrites = this.reflector.getAllAndOverride<boolean>(
      ADMIN_WRITES_KEY,
      targets,
    );
    if (adminWrites && request.method !== 'GET' && rol !== 'Admin') {
      throw new ForbiddenException('Solo un administrador puede modificar esto');
    }

    return true;
  }
}
